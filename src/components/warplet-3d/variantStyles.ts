import type { WarpletVariant } from "@/components/warplet-sprites/types";

export interface VariantStyle {
  body: string;
  grin: boolean;
  sleepy: boolean;
  sweater?: string;
  hood?: string;
  overalls?: string;
  tie?: boolean;
  cigarette?: boolean;
  shirt?: string;
  glow?: boolean;
}

export const VARIANT_STYLES: Record<WarpletVariant, VariantStyle> = {
  "gnasher-grey": { body: "#b0b0b0", grin: true, sleepy: false },
  "gnasher-purple": { body: "#8b6fd4", grin: true, sleepy: false },
  "gnasher-brown": { body: "#c4a070", grin: true, sleepy: false, sweater: "#5c3a20" },
  "hood-shadow": { body: "#a89078", grin: false, sleepy: false, hood: "#1a1a22" },
  "sleepy-shirt": { body: "#a88868", grin: false, sleepy: true, shirt: "#f0f0f0" },
  "sleepy-office": {
    body: "#7a8a52",
    grin: false,
    sleepy: true,
    shirt: "#4a4a4a",
    tie: true,
    cigarette: true,
  },
  "overalls-blue": { body: "#3a5080", grin: false, sleepy: false, overalls: "#4a9eff" },
  "grin-gold": { body: "#e8c040", grin: true, sleepy: false, glow: true },
};
