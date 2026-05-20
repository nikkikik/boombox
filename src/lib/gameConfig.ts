import type { WarpletVariant } from "@/components/warplet-sprites/types";

export const GRID_ROWS = 2;
export const GRID_COLS = 3;
export const TOTAL_HOLES = GRID_ROWS * GRID_COLS;

/** Шанс успешного удара: индекс 0 = уровень 1; уровень 8+ → последнее значение (20%) */
export const LEVEL_CHANCES = [100, 80, 70, 60, 50, 40, 30, 20] as const;

export const MIN_LEVEL_CHANCE = LEVEL_CHANCES[LEVEL_CHANCES.length - 1];

export const INITIAL_MULTIPLIER = 1;
export const MULTIPLIER_STEP = 0.42;
export const BASE_HIT_POINTS = 10;

export const STAGE_NAMES = [
  "COSMIC RUSH",
  "NEBULA STORM",
  "VOID CHASE",
  "SUPERNOVA",
  "BLACK HOLE",
  "PULSAR RUN",
  "QUASAR EDGE",
  "DEEP VOID",
] as const;

export function getLevelChance(level: number): number {
  if (level < 1) return 0;
  if (level > LEVEL_CHANCES.length) return MIN_LEVEL_CHANCE;
  return LEVEL_CHANCES[level - 1];
}

export function getStageName(level: number): string {
  if (level < 1) return "—";
  const idx = Math.min(level - 1, STAGE_NAMES.length - 1);
  return STAGE_NAMES[idx] ?? `COSMIC ${level}`;
}

export type WarpletType = "common" | "rare" | "legendary";

export interface WarpletConfig {
  type: WarpletType;
  variant: WarpletVariant;
  label: string;
  pointBonus: number;
  spawnWeight: number;
}

export const WARPLET_TYPES: WarpletConfig[] = [
  {
    type: "common",
    variant: "gnasher-grey",
    label: "Warplet #852086",
    pointBonus: 1,
    spawnWeight: 20,
  },
  {
    type: "common",
    variant: "gnasher-purple",
    label: "Warplet #1432012",
    pointBonus: 1,
    spawnWeight: 18,
  },
  {
    type: "common",
    variant: "gnasher-brown",
    label: "Warplet #771204",
    pointBonus: 1.1,
    spawnWeight: 14,
  },
  {
    type: "common",
    variant: "sleepy-shirt",
    label: "Warplet #902441",
    pointBonus: 1.1,
    spawnWeight: 12,
  },
  {
    type: "rare",
    variant: "sleepy-office",
    label: "Warplet #225686",
    pointBonus: 2.5,
    spawnWeight: 14,
  },
  {
    type: "rare",
    variant: "overalls-blue",
    label: "Warplet #533336",
    pointBonus: 2.5,
    spawnWeight: 12,
  },
  {
    type: "rare",
    variant: "hood-shadow",
    label: "Warplet #661890",
    pointBonus: 2.2,
    spawnWeight: 10,
  },
  {
    type: "legendary",
    variant: "grin-gold",
    label: "Warplet #1432012 ★",
    pointBonus: 5,
    spawnWeight: 5,
  },
];

export function pickWarpletType(): WarpletConfig {
  const total = WARPLET_TYPES.reduce((s, w) => s + w.spawnWeight, 0);
  let roll = Math.random() * total;
  for (const w of WARPLET_TYPES) {
    roll -= w.spawnWeight;
    if (roll <= 0) return w;
  }
  return WARPLET_TYPES[0];
}
