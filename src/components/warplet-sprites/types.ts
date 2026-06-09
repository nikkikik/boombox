export type WarpletVariant = "grey" | "purple" | "gold";

/** Dedicated PNG per color — CSS filters don't tint grey sprites reliably */
export const WARPLET_IMAGE_PATHS: Record<WarpletVariant, string> = {
  grey: "/warplets/warplet-grey.png",
  purple: "/warplets/warplet-purple.png",
  gold: "/warplets/warplet-gold.png",
};

export const WARPLET_VARIANT_FILTERS: Record<WarpletVariant, string> = {
  grey: "none",
  purple: "none",
  gold: "none",
};
