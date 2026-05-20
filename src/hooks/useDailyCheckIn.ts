"use client";

import { useCallback, useEffect, useState } from "react";
import type { useBoomboxReads } from "./useBoomboxReads";
import type { useGameTransactions } from "./useGameTransactions";
import { getTimeUntilCheckIn } from "@/lib/onchainGame";

type ChainReads = ReturnType<typeof useBoomboxReads>;
type GameTx = ReturnType<typeof useGameTransactions>;

export function useDailyCheckIn(chain: ChainReads, tx: GameTx) {
  const [justClaimed, setJustClaimed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canClaimOnChain =
    chain.isOnChain && chain.isConnected && chain.canDailyCheckIn;
  const canClaim = chain.isOnChain ? canClaimOnChain && !justClaimed : false;

  const resetLabel =
    chain.isOnChain && chain.player && !chain.canDailyCheckIn
      ? getTimeUntilCheckIn(chain.player.lastCheckInAt)
      : "";

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 2200);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    if (chain.canDailyCheckIn) setJustClaimed(false);
  }, [chain.canDailyCheckIn]);

  const claim = useCallback(async () => {
    if (!canClaim || tx.isPending) return false;
    if (!chain.isOnChain) return false;

    const { ok } = await tx.dailyCheckIn();
    if (!ok) return false;

    setJustClaimed(true);
    setShowSuccess(true);
    await chain.refetchAll();
    return true;
  }, [canClaim, tx, chain]);

  const buttonLabel = (() => {
    if (showSuccess || (justClaimed && !chain.canDailyCheckIn)) return "Claimed!";
    if (!chain.isConnected) return "Daily Check-in";
    if (!chain.isOnChain) return "No contract";
    if (canClaim) return "Daily Check-in";
    if (resetLabel) return resetLabel;
    return "Claimed";
  })();

  return {
    canClaim: canClaim && chain.isConnected,
    claim,
    showSuccess,
    isPending: tx.pendingAction === "dailyCheckIn",
    buttonLabel,
    isOnChain: chain.isOnChain,
  };
}
