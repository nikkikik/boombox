import type { WarpletVariant } from "@/components/warplet-sprites/types";

export const GRID_ROWS = 2;
export const GRID_COLS = 3;
export const TOTAL_HOLES = GRID_ROWS * GRID_COLS;

/** How often a new warplet tries to spawn (ms) */
export const SPAWN_INTERVAL_MS = 2400;
/** How long a warplet stays up before sinking back (ms) */
export const WARPLET_VISIBLE_MS = 1900;
/** Max warplets on the board at once — keeps the grid from flooding */
export const MAX_ACTIVE_WARPLETS = 3;

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
    variant: "grey",
    label: "Grey Warplet",
    pointBonus: 1,
    spawnWeight: 34,
  },
  {
    type: "rare",
    variant: "purple",
    label: "Purple Warplet",
    pointBonus: 2.5,
    spawnWeight: 33,
  },
  {
    type: "legendary",
    variant: "gold",
    label: "Gold Warplet",
    pointBonus: 5,
    spawnWeight: 33,
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
