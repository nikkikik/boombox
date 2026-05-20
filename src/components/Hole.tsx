"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Warplet } from "./Warplet";
import { HammerStrike } from "./HammerStrike";
import { MissFeedback } from "./MissFeedback";
import { HoleCosmicBg } from "./HoleCosmicBg";
import { HAMMER_CURSOR, HAMMER_CURSOR_DISABLED } from "@/lib/hammerCursor";
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

  const hasTarget = warplet?.visible && warplet.animState === "active";

  const handleClick = async () => {
    if (disabled || isResolving) return;
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
      onClick={() => void handleClick()}
      className={`game-hole group relative aspect-square w-full overflow-visible rounded-full border-[3px] border-[#3d3560] bg-[#0a0814] shadow-[0_0_12px_rgba(100,80,200,0.15),inset_0_4px_12px_rgba(0,0,0,0.8)] disabled:cursor-not-allowed ${
        hasTarget ? "has-warplet-target" : ""
      } ${isResolving ? "opacity-80" : ""}`}
      style={{ cursor: disabled || isResolving ? HAMMER_CURSOR_DISABLED : HAMMER_CURSOR }}
      whileTap={disabled || isResolving ? {} : { scale: 0.94 }}
    >
      <motion.div
        key={`shake-${missCount}`}
        className="absolute inset-0 overflow-visible rounded-full"
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
        {isResolving && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center rounded-full bg-black/40">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-amber-300" />
          </div>
        )}
      </motion.div>
    </motion.button>
  );
}
