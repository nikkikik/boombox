"use client";

import { motion } from "framer-motion";
import { GRID_COLS, GRID_ROWS } from "@/lib/gameConfig";
import type { ActiveWarplet, GamePhase } from "@/hooks/useGameState";
import { Hole } from "./Hole";

interface GameBoardProps {
  stageName: string;
  level: number;
  chance: number;
  multiplier: number;
  phase: GamePhase;
  activeWarplets: ActiveWarplet[];
  onWhack: (index: number) => Promise<"hit" | "miss" | "noop">;
  disabled: boolean;
  isWhackPending?: boolean;
}

export function GameBoard({
  stageName,
  level,
  chance,
  multiplier,
  phase,
  activeWarplets,
  onWhack,
  disabled,
  isWhackPending = false,
}: GameBoardProps) {
  const holes = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => i);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[380px] px-3"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
    >
      <div className="panel-glass mb-0 rounded-t-3xl border-b-0 px-4 py-3 text-center">
        <h2 className="font-display text-sm font-black uppercase tracking-wide text-white sm:text-base">
          {level > 0 ? stageName : "Boombox Cosmic Rush"}
        </h2>
        <p className="mt-0.5 text-xs text-slate-300">
          {level > 0 ? (
            <>
              STAGE: {level} · HIT CHANCE: {chance}% · {multiplier.toFixed(2)}x
            </>
          ) : (
            <>Pay-to-play · One hit per level</>
          )}
        </p>
        {phase === "GAME_OVER" && (
          <p className="mt-1 text-xs font-bold uppercase text-red-400">Game over</p>
        )}
        {phase === "CHOOSING_REWARD" && (
          <p className="mt-1 text-xs font-bold uppercase text-amber-300">
            Choose: cash out or next level
          </p>
        )}
      </div>

      <motion.div
        className="relative rounded-b-3xl border border-[#6b4d35]/80 p-3 pt-4 shadow-2xl sm:p-4"
        style={{
          background:
            "linear-gradient(165deg, #2a2848 0%, #1a1838 30%, #12102a 60%, #0c0818 100%)",
          boxShadow:
            "0 16px 48px rgba(40,30,80,0.5), inset 0 2px 0 rgba(150,140,220,0.15), 0 0 30px rgba(80,60,160,0.2)",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="game-board-holes grid gap-2.5 overflow-visible sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          }}
        >
          {holes.map((index) => {
            const warplet = activeWarplets.find((w) => w.holeIndex === index);
            return (
              <Hole
                key={index}
                index={index}
                warplet={warplet}
                onWhack={onWhack}
                disabled={disabled}
                isResolving={isWhackPending}
              />
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
