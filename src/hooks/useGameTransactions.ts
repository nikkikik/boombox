"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { encodeFunctionData, numberToHex } from "viem";
import {
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import { appChain } from "@/config/wagmi";
import { CHAIN_STATUS } from "@/lib/onchainGame";

export type GameTxAction =
  | "startGame"
  | "cashOut"
  | "nextLevel"
  | "dailyCheckIn"
  | null;

export type RefetchBoomBalance = () => Promise<unknown>;

const CASH_OUT_GAS = BigInt(400_000);
const NEXT_LEVEL_GAS = BigInt(350_000);
const START_GAME_GAS = BigInt(200_000);
const DAILY_CHECKIN_GAS = BigInt(300_000);
const BATCH_POLL_MS = 1500;
const BATCH_MAX_POLLS = 40;

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
  const { address: walletAddress, isConnected, status, chain } = useAccount();
  const walletReady = isConnected && status === "connected" && !!walletAddress;
  const publicClient = usePublicClient({ chainId: appChain.id });
  const { data: walletClient } = useWalletClient({ chainId: appChain.id });
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
      if (!walletReady || !walletAddress) return { ok: false };
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
      walletReady,
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

  /** Close stale Playing run (v2: nextLevel(false, 0)) */
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

  const resetAndStartSequential = useCallback(async () => {
    const close = await forfeitRun();
    if (!close.ok) return close;
    return startGame();
  }, [forfeitRun, startGame]);

  const waitForBatchCalls = useCallback(
    async (batchId: string) => {
      if (!walletClient) return false;
      for (let i = 0; i < BATCH_MAX_POLLS; i++) {
        try {
          const status = (await walletClient.request({
            method: "wallet_getCallsStatus",
            params: [batchId],
          })) as { status?: number | string };
          const code =
            typeof status?.status === "number"
              ? status.status
              : Number.parseInt(String(status?.status ?? ""), 10);
          if (code === 200 || status?.status === "CONFIRMED") return true;
          if (code >= 400 && !Number.isNaN(code)) return false;
        } catch {
          /* wallet may not expose getCallsStatus yet */
        }
        await new Promise((r) => setTimeout(r, BATCH_POLL_MS));
      }
      return true;
    },
    [walletClient]
  );

  /**
   * One wallet prompt when possible: batch reset + startGame if stale Playing on chain.
   * Falls back to single startGame when Idle/GameOver (or after contract v3 deploy).
   */
  const startGameFresh = useCallback(
    async (playerStatus?: number) => {
      if (!isOnChainEnabled || !walletAddress) return { ok: false };

      if (publicClient) {
        try {
          await publicClient.simulateContract({
            address: GAME_CONTRACT_ADDRESS,
            abi: boomboxGameAbi,
            functionName: "startGame",
            account: walletAddress,
          });
          return startGame();
        } catch {
          /* stale Playing on chain — batch or sequential reset below */
        }
      }

      const needsReset =
        playerStatus === CHAIN_STATUS.Playing ||
        playerStatus === CHAIN_STATUS.Choosing;

      if (!needsReset) {
        return startGame();
      }

      if (!walletClient) {
        return resetAndStartSequential();
      }

      setPendingAction("startGame");
      setLastTxError(null);
      try {
        const resetData = encodeFunctionData({
          abi: boomboxGameAbi,
          functionName: "nextLevel",
          args: [false, BigInt(0)],
        });
        const startData = encodeFunctionData({
          abi: boomboxGameAbi,
          functionName: "startGame",
        });

        const batch = (await (
          walletClient as {
            request: (args: {
              method: "wallet_sendCalls";
              params: [
                {
                  version: string;
                  from: `0x${string}`;
                  chainId: `0x${string}`;
                  calls: { to: `0x${string}`; data: `0x${string}` }[];
                },
              ];
            }) => Promise<{ id?: string }>;
          }
        ).request({
          method: "wallet_sendCalls",
          params: [
            {
              version: "2.0.0",
              from: walletAddress,
              chainId: numberToHex(appChain.id),
              calls: [
                { to: GAME_CONTRACT_ADDRESS, data: resetData },
                { to: GAME_CONTRACT_ADDRESS, data: startData },
              ],
            },
          ],
        })) as { id?: string };

        const batchId = batch?.id;
        if (!batchId) {
          throw new Error("wallet_sendCalls unavailable");
        }

        const batchOk = await waitForBatchCalls(batchId);
        if (!batchOk) {
          return { ok: false, error: "Batch start failed" };
        }

        return { ok: true, hash: batchId };
      } catch {
        return resetAndStartSequential();
      } finally {
        setPendingAction(null);
      }
    },
    [
      walletAddress,
      walletClient,
      publicClient,
      startGame,
      resetAndStartSequential,
      waitForBatchCalls,
    ]
  );

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
    startGameFresh,
    forfeitRun,
    cashOut,
    nextLevel,
    dailyCheckIn,
    isPending,
    pendingAction,
    error: error ?? (lastTxError ? new Error(lastTxError) : null),
    isConnected: walletReady,
    isOnChain: isOnChainEnabled,
    walletAddress,
  };
}
