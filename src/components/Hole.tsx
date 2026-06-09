"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Warplet } from "./Warplet";
import { HammerStrike } from "./HammerStrike";
import { MissFeedback } from "./MissFeedback";
import { HoleCosmicBg } from "./HoleCosmicBg";
import type { ActiveWarplet } from "@/hooks/useGameState";

interface HoleProps {
  index: number;
  warplet?: ActiveWarplet;
  onWhack: (index: number) => Promise<"hit" | "miss" | "noop">;
  disabled: boolean;
  isResolving?: boolean;
}

export function Hole({
  index,
  warplet,
  onWhack,
  disabled,
  isResolving,
}: HoleProps) {
  const [strike, setStrike] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const lastTapAt = useRef(0);

  const hasTarget = warplet?.visible && warplet.animState === "active";

  const runWhack = async () => {
    if (disabled || isResolving) return;
    const now = Date.now();
    if (now - lastTapAt.current < 400) return;
    lastTapAt.current = now;

    const result = await onWhack(index);
    if (result === "hit") {
      setStrike((s) => s + 1);
    }
    if (result === "miss") {
      setMissCount((s) => s + 1);
    }
  };

  return (
    <motion.button
      type="button"
      disabled={disabled || isResolving}
      onClick={() => void runWhack()}
      className={`game-hole group relative aspect-square w-full touch-manipulation overflow-visible disabled:cursor-not-allowed ${
        hasTarget ? "has-warplet-target" : ""
      } ${isResolving ? "opacity-80" : ""}`}
      whileTap={disabled || isResolving ? {} : { scale: 0.96 }}
      aria-label={
        hasTarget
          ? `Whack Warplet in hole ${index + 1}`
          : `Hole ${index + 1}, wait for Warplet`
      }
    >
      {/* Pit — clips warplet below the rim */}
      <div className="hole-pit absolute inset-0 overflow-hidden rounded-full">
        <HoleCosmicBg holeIndex={index} />
        <div className="warplet-slot">
          {warplet && (
            <Warplet
              key={warplet.spawnId}
              config={warplet.config}
              visible={warplet.visible}
              animState={warplet.animState}
            />
          )}
          <MissFeedback trigger={missCount} holeIndex={index} />
          <HammerStrike trigger={strike} />
        </div>
      </div>

      {/* Front rim — hides lower body, reads as “emerging from hole” */}
      <div className="hole-rim pointer-events-none absolute inset-0 z-20 rounded-full" />

      {/* Outer glow ring */}
      <div
        className={`pointer-events-none absolute inset-0 z-[21] rounded-full border-[3px] transition-shadow ${
          hasTarget
            ? "border-purple-400/90 shadow-[0_0_20px_rgba(168,85,247,0.65)]"
            : "border-purple-500/60 shadow-[0_0_14px_rgba(168,85,247,0.35)]"
        }`}
      />

      {isResolving && (
        <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center rounded-full bg-black/40">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-purple-300" />
        </div>
      )}
    </motion.button>
  );
}
