import { formatEther } from "viem";
import type { GamePhase } from "@/hooks/useGameState";
import { INITIAL_MULTIPLIER, MULTIPLIER_STEP, getLevelChance } from "@/lib/gameConfig";

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

export function getTimeUntilCheckIn(lastCheckInAt: bigint): string {
  if (lastCheckInAt === BigInt(0)) return "";
  const cooldown = 24 * 60 * 60;
  const next = Number(lastCheckInAt) + cooldown;
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, next - now);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function hitChanceForChainLevel(level: number): number {
  return getLevelChance(level);
}
