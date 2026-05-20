"use client";

import { useCallback, useEffect, useState } from "react";
import type { useBoomboxReads } from "./useBoomboxReads";
import type { useGameTransactions } from "./useGameTransactions";
import {
  DAILY_CHECKIN_COOLDOWN_SEC,
  formatCheckInCountdown,
  getSecondsUntilCheckIn,
} from "@/lib/onchainGame";

type ChainReads = ReturnType<typeof useBoomboxReads>;
type GameTx = ReturnType<typeof useGameTransactions>;

function storageKey(address: string) {
  return `boom-daily-checkin-${address.toLowerCase()}`;
}

function readStoredCheckIn(address: string | undefined): bigint {
  if (!address || typeof window === "undefined") return BigInt(0);
  try {
    const raw = sessionStorage.getItem(storageKey(address));
    if (!raw) return BigInt(0);
    return BigInt(raw);
  } catch {
    return BigInt(0);
  }
}

function writeStoredCheckIn(address: string, timestamp: bigint) {
  try {
    sessionStorage.setItem(storageKey(address), timestamp.toString());
  } catch {
    /* ignore quota */
  }
}

export function useDailyCheckIn(chain: ChainReads, tx: GameTx) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [, tick] = useState(0);
  const [localLastCheckInAt, setLocalLastCheckInAt] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (!chain.address) return;
    setLocalLastCheckInAt(readStoredCheckIn(chain.address));
  }, [chain.address]);

  const chainLastCheckInAt = chain.player?.lastCheckInAt ?? BigInt(0);
  const effectiveLastCheckInAt =
    chainLastCheckInAt > localLastCheckInAt
      ? chainLastCheckInAt
      : localLastCheckInAt;

  const secondsUntilCheckIn = getSecondsUntilCheckIn(effectiveLastCheckInAt);
  const canClaimByTime = secondsUntilCheckIn === 0;

  const canClaim =
    chain.isOnChain &&
    chain.isConnected &&
    !chain.isPlayerLoading &&
    canClaimByTime;

  const countdownLabel = formatCheckInCountdown(effectiveLastCheckInAt);

  useEffect(() => {
    if (chainLastCheckInAt > localLastCheckInAt && chain.address) {
      setLocalLastCheckInAt(chainLastCheckInAt);
      writeStoredCheckIn(chain.address, chainLastCheckInAt);
    }
  }, [chainLastCheckInAt, localLastCheckInAt, chain.address]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 2200);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    if (!chain.isOnChain || canClaim) return;
    const id = setInterval(() => {
      tick((n) => n + 1);
      if (getSecondsUntilCheckIn(effectiveLastCheckInAt) === 0) {
        void chain.refetchAll();
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [chain, canClaim, effectiveLastCheckInAt]);

  useEffect(() => {
    if (!chain.isOnChain || canClaim) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [chain.isOnChain, canClaim]);

  const claim = useCallback(async () => {
    if (!canClaim || tx.isPending || !chain.address) return false;
    if (!chain.isOnChain) return false;

    const { ok } = await tx.dailyCheckIn();
    if (!ok) return false;

    const now = BigInt(Math.floor(Date.now() / 1000));
    setLocalLastCheckInAt(now);
    writeStoredCheckIn(chain.address, now);
    setShowSuccess(true);

    await new Promise((r) => setTimeout(r, 800));
    await chain.refetchAll();
    return true;
  }, [canClaim, tx, chain]);

  const buttonLabel = (() => {
    if (showSuccess) return "Claimed!";
    if (chain.isPlayerLoading) return "…";
    if (!chain.isConnected) return "Daily Check-in";
    if (!chain.isOnChain) return "No contract (env)";
    if (canClaim) return "Daily Check-in";
    if (countdownLabel) return countdownLabel;
    return `Next in ${Math.ceil(DAILY_CHECKIN_COOLDOWN_SEC / 3600)}h`;
  })();

  const isOnCooldown =
    chain.isOnChain && chain.isConnected && !canClaim && secondsUntilCheckIn > 0;

  return {
    canClaim,
    isOnCooldown,
    claim,
    showSuccess,
    isPending: tx.pendingAction === "dailyCheckIn",
    buttonLabel,
    countdownLabel,
    lastCheckInAt: effectiveLastCheckInAt,
    secondsUntilCheckIn,
    isOnChain: chain.isOnChain,
  };
}
