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
      className={`game-hole group relative aspect-square w-full touch-manipulation overflow-visible rounded-full border-[3px] border-[#3d3560] bg-[#0a0814] shadow-[0_0_12px_rgba(100,80,200,0.15),inset_0_4px_12px_rgba(0,0,0,0.8)] disabled:cursor-not-allowed ${
        hasTarget ? "has-warplet-target ring-2 ring-amber-400/70 ring-offset-1 ring-offset-[#0a0814]" : ""
      } ${isResolving ? "opacity-80" : ""}`}
      whileTap={disabled || isResolving ? {} : { scale: 0.94 }}
      aria-label={
        hasTarget
          ? `Whack Warplet in hole ${index + 1}`
          : `Hole ${index + 1}, wait for Warplet`
      }
    >
      <motion.div
        key={`shake-${missCount}`}
        className="pointer-events-none absolute inset-0 overflow-visible rounded-full"
        initial={{ x: 0, rotate: 0 }}
        animate={
          missCount > 0
            ? {
                x: [0, -10, 10, -8, 8, -4, 4, 0],
                rotate: [0, -3, 3, -2, 2, 0],
              }
            : { x: 0, rotate: 0 }
        }
        transition={{ duration: 0.42, ease: "easeInOut" }}
      >
        <HoleCosmicBg holeIndex={index} />
        {warplet && (
          <Warplet
            config={warplet.config}
            visible={warplet.visible}
            animState={warplet.animState}
            isTarget={hasTarget}
          />
        )}
        <MissFeedback trigger={missCount} holeIndex={index} />
        <HammerStrike trigger={strike} />
        {hasTarget && (
          <span className="pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[7px] font-black uppercase text-black">
            Hit!
          </span>
        )}
        {isResolving && (
          <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center rounded-full bg-black/40">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-amber-300" />
          </div>
        )}
      </motion.div>
    </motion.button>
  );
}
