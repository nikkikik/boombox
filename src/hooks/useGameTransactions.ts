"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import { appChain } from "@/config/wagmi";

export type GameTxAction =
  | "startGame"
  | "submitResult"
  | "cashOut"
  | "nextLevel"
  | "dailyCheckIn"
  | null;

export type RefetchBoomBalance = () => Promise<unknown>;

const CASH_OUT_GAS = BigInt(400_000);
const SUBMIT_RESULT_GAS = BigInt(250_000);
const NEXT_LEVEL_GAS = BigInt(200_000);
const START_GAME_GAS = BigInt(200_000);
const DAILY_CHECKIN_GAS = BigInt(300_000);

function shortRevertMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { shortMessage?: string; message?: string };
    const msg = e.shortMessage ?? e.message;
    if (msg) return msg.length > 120 ? `${msg.slice(0, 117)}…` : msg;
  }
  return "Transaction failed";
}

export function useGameTransactions(options?: {
  refetchBalance?: RefetchBoomBalance;
  refetchAfterDailyCheckIn?: () => Promise<unknown>;
}) {
  const { address: walletAddress, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const { writeContractAsync, isPending: wagmiPending, error } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<GameTxAction>(null);
  const [lastTxError, setLastTxError] = useState<string | null>(null);
  const refetchBalance = options?.refetchBalance;
  const refetchAfterDailyCheckIn = options?.refetchAfterDailyCheckIn;

  const isPending = wagmiPending;

  const waitReceipt = useCallback(
    async (hash: `0x${string}`) => {
      if (!publicClient) return;
      await publicClient.waitForTransactionReceipt({ hash });
    },
    [publicClient]
  );

  const refetchBalanceAfterMint = useCallback(async () => {
    if (!refetchBalance) return;
    await refetchBalance();
    await new Promise((r) => setTimeout(r, 1200));
    await refetchBalance();
  }, [refetchBalance]);

  const runWrite = useCallback(
    async (
      action: GameTxAction,
      fn: () => Promise<`0x${string}` | undefined>
    ): Promise<{ ok: boolean; hash?: string; error?: string }> => {
      if (!isConnected || !walletAddress) return { ok: false };
      if (chain?.id !== undefined && chain.id !== appChain.id) return { ok: false };
      setPendingAction(action);
      setLastTxError(null);
      try {
        const hash = await fn();
        if (!hash) return { ok: false };
        await waitReceipt(hash);

        if (action === "cashOut" && refetchBalance) {
          await refetchBalanceAfterMint();
        }
        if (action === "dailyCheckIn") {
          if (refetchAfterDailyCheckIn) await refetchAfterDailyCheckIn();
          if (refetchBalance) await refetchBalanceAfterMint();
        }

        return { ok: true, hash };
      } catch (err) {
        const message = shortRevertMessage(err);
        setLastTxError(message);
        return { ok: false, error: message };
      } finally {
        setPendingAction(null);
      }
    },
    [
      isConnected,
      walletAddress,
      chain?.id,
      waitReceipt,
      refetchBalanceAfterMint,
      refetchBalance,
      refetchAfterDailyCheckIn,
    ]
  );

  const writeOpts = useCallback(
    () => ({
      address: GAME_CONTRACT_ADDRESS,
      abi: boomboxGameAbi,
      account: walletAddress,
      chainId: appChain.id,
    }),
    [walletAddress]
  );

  const startGame = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("startGame", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "startGame",
        gas: START_GAME_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  /** Close a stale Playing run before startGame */
  const forfeitRun = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("submitResult", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "submitResult",
        args: [false, BigInt(0)],
        gas: SUBMIT_RESULT_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  const submitResult = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (!isOnChainEnabled || !walletAddress) return { ok: false };
      return runWrite("submitResult", () =>
        writeContractAsync({
          ...writeOpts(),
          functionName: "submitResult",
          args: [won, rewardWei],
          gas: SUBMIT_RESULT_GAS,
        })
      );
    },
    [runWrite, writeContractAsync, writeOpts, walletAddress]
  );

  const cashOutMint = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("cashOut", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "cashOut",
        gas: CASH_OUT_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  /** Win on current level → submitResult → cashOut (two txs, matches mainnet contract) */
  const cashOut = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (!won) return forfeitRun();
      const submit = await submitResult(true, rewardWei);
      if (!submit.ok) return submit;
      return cashOutMint();
    },
    [forfeitRun, submitResult, cashOutMint]
  );

  const nextLevelAdvance = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("nextLevel", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "nextLevel",
        gas: NEXT_LEVEL_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  /** Win on current level → submitResult → nextLevel (two txs, matches mainnet contract) */
  const nextLevel = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (!won) return forfeitRun();
      const submit = await submitResult(true, rewardWei);
      if (!submit.ok) return submit;
      return nextLevelAdvance();
    },
    [forfeitRun, submitResult, nextLevelAdvance]
  );

  const dailyCheckIn = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("dailyCheckIn", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "dailyCheckIn",
        gas: DAILY_CHECKIN_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  return {
    startGame,
    forfeitRun,
    submitResult,
    cashOut,
    nextLevel,
    dailyCheckIn,
    isPending,
    pendingAction,
    error: error ?? (lastTxError ? new Error(lastTxError) : null),
    isMockMode: false,
    isConnected,
    isOnChain: isOnChainEnabled,
    walletAddress,
  };
}
