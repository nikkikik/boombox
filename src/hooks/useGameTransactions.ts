"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  GAME_CONTRACT_ADDRESS,
  boomboxGameAbi,
  isOnChainEnabled,
} from "@/config/gameContract";
import { mockCashOutTx, mockStartGameTx } from "@/lib/gameTransactions";

export type GameTxAction =
  | "startGame"
  | "cashOut"
  | "nextLevel"
  | "dailyCheckIn"
  | null;

export type RefetchBoomBalance = () => Promise<unknown>;

export function useGameTransactions(options?: {
  refetchBalance?: RefetchBoomBalance;
  refetchAfterDailyCheckIn?: () => Promise<unknown>;
}) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: wagmiPending, error } = useWriteContract();
  const [mockPending, setMockPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<GameTxAction>(null);
  const refetchBalance = options?.refetchBalance;
  const refetchAfterDailyCheckIn = options?.refetchAfterDailyCheckIn;

  const isPending = wagmiPending || mockPending;

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
      if (!isConnected) return { ok: false };
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
      waitReceipt,
      refetchBalanceAfterMint,
      refetchBalance,
      refetchAfterDailyCheckIn,
    ]
  );

  const startGame = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("startGame", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "startGame",
        })
      );
    }
    setMockPending(true);
    try {
      const { hash } = await mockStartGameTx();
      return { ok: true, hash };
    } catch {
      return { ok: false };
    } finally {
      setMockPending(false);
    }
  }, [runWrite, writeContractAsync]);

  const forfeitRun = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("nextLevel", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "nextLevel",
          args: [false, BigInt(0)],
        })
      );
    }
    return { ok: true };
  }, [runWrite, writeContractAsync]);

  /** Single tx: cashOut(bool won, uint256 reward) — mints on success. */
  const cashOut = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (isOnChainEnabled) {
        return runWrite("cashOut", () =>
          writeContractAsync({
            address: GAME_CONTRACT_ADDRESS,
            abi: boomboxGameAbi,
            functionName: "cashOut",
            args: [won, rewardWei],
          })
        );
      }
      setMockPending(true);
      try {
        const { hash } = await mockCashOutTx(0);
        return { ok: true, hash };
      } catch {
        return { ok: false };
      } finally {
        setMockPending(false);
      }
    },
    [runWrite, writeContractAsync]
  );

  /** Single tx: nextLevel(bool won, uint256 reward) — no submitResult. */
  const nextLevel = useCallback(
    async (won: boolean, rewardWei: bigint) => {
      if (isOnChainEnabled) {
        return runWrite("nextLevel", () =>
          writeContractAsync({
            address: GAME_CONTRACT_ADDRESS,
            abi: boomboxGameAbi,
            functionName: "nextLevel",
            args: [won, rewardWei],
          })
        );
      }
      return { ok: true };
    },
    [runWrite, writeContractAsync]
  );

  const dailyCheckIn = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("dailyCheckIn", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "dailyCheckIn",
        })
      );
    }
    return { ok: false };
  }, [runWrite, writeContractAsync]);

  return {
    startGame,
    forfeitRun,
    cashOut,
    nextLevel,
    dailyCheckIn,
    isPending,
    pendingAction,
    error,
    isMockMode: !isOnChainEnabled,
    isConnected,
    isOnChain: isOnChainEnabled,
  };
}
