import { formatEther, parseEther } from "viem";
import type { GamePhase } from "@/hooks/useGameState";
import { getLevelChance, INITIAL_MULTIPLIER, MULTIPLIER_STEP } from "@/lib/gameConfig";

export const BASE_ROUND_REWARD_BOOM = BigInt(100);
export const WEI_PER_BOOM = parseEther("1");
export const DAILY_CHECKIN_COOLDOWN_SEC = 24 * 60 * 60;

/** On-chain GameStatus enum */
export const CHAIN_STATUS = {
  Idle: 0,
  Playing: 1,
  Choosing: 2,
  GameOver: 3,
} as const;

export type ChainPlayerState = {
  status: number;
  level: number;
  potentialReward: bigint;
  lastCheckInAt: bigint;
  nonce: bigint;
};

export function chainStatusToPhase(status: number): GamePhase {
  switch (status) {
    case CHAIN_STATUS.Playing:
      return "PLAYING";
    case CHAIN_STATUS.Choosing:
      return "CHOOSING_REWARD";
    case CHAIN_STATUS.GameOver:
      return "GAME_OVER";
    case CHAIN_STATUS.Idle:
    default:
      return "WAITING_FOR_TX";
  }
}

export function boomWeiToNumber(wei: bigint): number {
  return Number.parseFloat(formatEther(wei));
}

export function boomNumberToWei(amount: number): bigint {
  return parseEther(amount.toFixed(0));
}

/** Matches contract: 100 * 10^18 * 2^(level-1) */
export function rewardWeiForLevel(level: number): bigint {
  if (level < 1) return BigInt(0);
  return (BASE_ROUND_REWARD_BOOM * WEI_PER_BOOM) << BigInt(level - 1);
}

export function rewardBoomForLevel(level: number): number {
  return Number(rewardWeiForLevel(level) / WEI_PER_BOOM);
}

export function multiplierForLevel(level: number): number {
  if (level < 1) return INITIAL_MULTIPLIER;
  return Number((INITIAL_MULTIPLIER + (level - 1) * MULTIPLIER_STEP).toFixed(2));
}

export function parsePlayerTuple(
  raw: readonly [number, number, bigint, bigint, bigint] | undefined
): ChainPlayerState | null {
  if (!raw) return null;
  return {
    status: raw[0],
    level: raw[1],
    potentialReward: raw[2],
    lastCheckInAt: raw[3],
    nonce: raw[4],
  };
}

/** Seconds until next daily check-in (0 = available now). */
export function getSecondsUntilCheckIn(lastCheckInAt: bigint): number {
  if (lastCheckInAt === BigInt(0)) return 0;
  const next = Number(lastCheckInAt) + DAILY_CHECKIN_COOLDOWN_SEC;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, next - now);
}

export function isCheckInOnCooldown(lastCheckInAt: bigint): boolean {
  return getSecondsUntilCheckIn(lastCheckInAt) > 0;
}

/** Human-readable countdown until next check-in. */
export function formatCheckInCountdown(lastCheckInAt: bigint): string {
  const diff = getSecondsUntilCheckIn(lastCheckInAt);
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** @deprecated Use formatCheckInCountdown */
export function getTimeUntilCheckIn(lastCheckInAt: bigint): string {
  return formatCheckInCountdown(lastCheckInAt);
}

export function hitChanceForChainLevel(level: number): number {
  return getLevelChance(level);
}
