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
  | "cashOut"
  | "nextLevel"
  | "dailyCheckIn"
  | null;

export type RefetchBoomBalance = () => Promise<unknown>;

/** Gas headroom for cashOut(bool,uint256) + mint */
const CASH_OUT_GAS = BigInt(400_000);
const NEXT_LEVEL_GAS = BigInt(350_000);
const START_GAME_GAS = BigInt(200_000);
const DAILY_CHECKIN_GAS = BigInt(300_000);

export function useGameTransactions(options?: {
  refetchBalance?: RefetchBoomBalance;
  refetchAfterDailyCheckIn?: () => Promise<unknown>;
}) {
  const { address: walletAddress, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const { writeContractAsync, isPending: wagmiPending, error } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<GameTxAction>(null);
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
    ): Promise<{ ok: boolean; hash?: string }> => {
      if (!isConnected || !walletAddress) return { ok: false };
      if (chain?.id !== undefined && chain.id !== appChain.id) return { ok: false };
      setPendingAction(action);
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
      } catch {
        return { ok: false };
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

  const forfeitRun = useCallback(async () => {
    if (!isOnChainEnabled || !walletAddress) return { ok: false };
    return runWrite("nextLevel", () =>
      writeContractAsync({
        ...writeOpts(),
        functionName: "nextLevel",
        args: [false, BigInt(0)],
        gas: NEXT_LEVEL_GAS,
      })
    );
  }, [runWrite, writeContractAsync, writeOpts, walletAddress]);

  /**
   * cashOut(bool won, uint256 reward) on GAME_CONTRACT.
   * Mint goes to msg.sender === connected wallet (explicit account below).
   */
  const cashOut = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (!isOnChainEnabled || !walletAddress) return { ok: false };
      return runWrite("cashOut", () =>
        writeContractAsync({
          ...writeOpts(),
          functionName: "cashOut",
          args: [won, rewardWei],
          gas: CASH_OUT_GAS,
        })
      );
    },
    [runWrite, writeContractAsync, writeOpts, walletAddress]
  );

  const nextLevel = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (!isOnChainEnabled || !walletAddress) return { ok: false };
      return runWrite("nextLevel", () =>
        writeContractAsync({
          ...writeOpts(),
          functionName: "nextLevel",
          args: [won, rewardWei],
          gas: NEXT_LEVEL_GAS,
        })
      );
    },
    [runWrite, writeContractAsync, writeOpts, walletAddress]
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
    cashOut,
    nextLevel,
    dailyCheckIn,
    isPending,
    pendingAction,
    error,
    isMockMode: false,
    isConnected,
    isOnChain: isOnChainEnabled,
    walletAddress,
  };
}
