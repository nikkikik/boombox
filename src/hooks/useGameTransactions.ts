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
  | "whack"
  | "cashOut"
  | "nextLevel"
  | "dailyCheckIn"
  | null;

export function useGameTransactions() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: wagmiPending, error } = useWriteContract();
  const [mockPending, setMockPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<GameTxAction>(null);

  const isPending = wagmiPending || mockPending;

  const waitReceipt = useCallback(
    async (hash: `0x${string}`) => {
      if (!publicClient) return;
      await publicClient.waitForTransactionReceipt({ hash });
    },
    [publicClient]
  );

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
        return { ok: true, hash };
      } catch {
        return { ok: false };
      } finally {
        setPendingAction(null);
      }
    },
    [isConnected, waitReceipt]
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

  const whack = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("whack", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "whack",
        })
      );
    }
    return { ok: false };
  }, [runWrite, writeContractAsync]);

  const cashOut = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("cashOut", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "cashOut",
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
  }, [runWrite, writeContractAsync]);

  const nextLevel = useCallback(async () => {
    if (isOnChainEnabled) {
      return runWrite("nextLevel", () =>
        writeContractAsync({
          address: GAME_CONTRACT_ADDRESS,
          abi: boomboxGameAbi,
          functionName: "nextLevel",
        })
      );
    }
    return { ok: true };
  }, [runWrite, writeContractAsync]);

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
    whack,
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
