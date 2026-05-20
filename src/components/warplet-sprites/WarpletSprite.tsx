"use client";

import Image from "next/image";
import type { WarpletVariant } from "./types";
import { WARPLET_IMAGE_PATHS } from "./types";

interface WarpletSpriteProps {
  variant: WarpletVariant;
  className?: string;
  alt?: string;
}

export function WarpletSprite({
  variant,
  className = "h-[76px] w-[76px]",
  alt = "Warplet",
}: WarpletSpriteProps) {
  const src = WARPLET_IMAGE_PATHS[variant];

  return (
    <Image
      src={src}
      alt={alt}
      width={120}
      height={120}
      unoptimized
      className={`${className} object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]`}
      style={{ imageRendering: "auto" }}
    />
  );
}
