"use client";

import dynamic from "next/dynamic";
import type { WarpletConfig } from "@/lib/gameConfig";
import type { WarpletAnimState } from "@/hooks/useGameState";
import { WarpletExplosion } from "./WarpletExplosion";

const WarpletCanvas = dynamic(
  () => import("./warplet-3d/WarpletCanvas").then((m) => m.WarpletCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 animate-pulse rounded-full bg-white/10" />
    ),
  }
);

interface WarpletProps {
  config: WarpletConfig;
  visible: boolean;
  animState: WarpletAnimState;
  isTarget?: boolean;
}

export function Warplet({
  config,
  visible,
  animState,
  isTarget = false,
}: WarpletProps) {
  const show3d =
    visible && animState !== "gone" && animState !== "explode";
  const showExplosion = animState === "explode";

  return (
    <div
      className={`warplet-layer pointer-events-none absolute inset-0 z-20 ${
        isTarget ? "warplet-target" : ""
      }`}
      data-warplet-active={isTarget ? "true" : undefined}
    >
      {show3d && (
        <WarpletCanvas variant={config.variant} visible={visible} animState={animState} />
      )}
      {showExplosion && <WarpletExplosion variant={config.variant} />}
      {config.type !== "common" && animState === "active" && (
        <span
          className={`absolute right-1 top-0 z-30 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase ${
            config.type === "legendary"
              ? "bg-yellow-400 text-black shadow-md"
              : "bg-purple-600 text-white"
          }`}
        >
          {config.type}
        </span>
      )}
    </div>
  );
}
