import type { WarpletVariant } from "@/components/warplet-sprites/types";

export interface VariantStyle {
  body: string;
  accent: string;
  glow?: boolean;
}

/** Three BOOM warplet colors — grey, purple, gold */
export const VARIANT_STYLES: Record<WarpletVariant, VariantStyle> = {
  grey: { body: "#8a8a92", accent: "#6e6e78" },
  purple: { body: "#a855f7", accent: "#7c3aed" },
  gold: { body: "#fbbf24", accent: "#d97706", glow: true },
};
