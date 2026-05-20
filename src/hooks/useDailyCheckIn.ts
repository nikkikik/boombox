"use client";

import { useCallback, useEffect, useState } from "react";
import type { useBoomboxReads } from "./useBoomboxReads";
import type { useGameTransactions } from "./useGameTransactions";
import {
  DAILY_CHECKIN_COOLDOWN_SEC,
  formatLastCheckInAt,
  formatWaitForHours,
  getSecondsUntilCheckIn,
  isCheckInCooldownActive,
} from "@/lib/onchainGame";

type ChainReads = ReturnType<typeof useBoomboxReads>;
type GameTx = ReturnType<typeof useGameTransactions>;

export function useDailyCheckIn(chain: ChainReads, tx: GameTx) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [, tick] = useState(0);

  const lastCheckInAt = chain.player?.lastCheckInAt ?? BigInt(0);
  const onCooldown = isCheckInCooldownActive(lastCheckInAt);
  const secondsUntil = getSecondsUntilCheckIn(lastCheckInAt);
  const canClaim =
    chain.isOnChain &&
    chain.isConnected &&
    !!chain.address &&
    !chain.isWrongChain &&
    !chain.isPlayerLoading &&
    !onCooldown;

  const waitLabel = formatWaitForHours(lastCheckInAt);
  const lastCheckInLabel = formatLastCheckInAt(lastCheckInAt);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 2200);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    if (!chain.isOnChain || canClaim) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [chain.isOnChain, canClaim]);

  const claim = useCallback(async () => {
    if (!canClaim || tx.isPending || !chain.address) return false;

    const { ok } = await tx.dailyCheckIn();
    if (!ok) return false;

    setShowSuccess(true);
    await chain.refetchAll();
    return true;
  }, [canClaim, tx, chain]);

  const buttonLabel = (() => {
    if (showSuccess) return "Claimed!";
    if (tx.isPending) return "Claiming…";
    if (chain.isPlayerLoading) return "…";
    if (!chain.isConnected) return "Daily Check-in";
    if (chain.isWrongChain) return chain.switchNetworkMessage;
    if (canClaim) return "Daily Check-in";
    if (onCooldown && waitLabel) return waitLabel;
    return "Daily Check-in";
  })();

  return {
    canClaim,
    isOnCooldown: onCooldown,
    claim,
    showSuccess,
    isPending: tx.pendingAction === "dailyCheckIn",
    buttonLabel,
    waitLabel,
    lastCheckInAt,
    lastCheckInLabel,
    secondsUntilCheckIn: secondsUntil,
    cooldownHours: DAILY_CHECKIN_COOLDOWN_SEC / 3600,
    isOnChain: chain.isOnChain,
    isWrongChain: chain.isWrongChain,
    hideButton: onCooldown && !showSuccess && !tx.isPending,
  };
}
