"use client";

import { motion } from "framer-motion";
import { getLevelChance } from "@/lib/gameConfig";
import { SaveOnBase } from "./SaveOnBase";
import type { GamePhase } from "@/hooks/useGameState";

interface ActionButtonsProps {
  phase: GamePhase;
  level: number;
  chance: number;
  cashOutPreview: number;
  totalPoints: number;
  multiplier: number;
  showStartButton: boolean;
  showChoice: boolean;
  isTxPending: boolean;
  isMockMode: boolean;
  isConnected: boolean;
  onStartGame: () => void;
  onCashOut: () => void;
  onNextLevel: () => void;
  onSaveStatus: (message: string) => void;
}

export function ActionButtons({
  phase,
  level,
  chance,
  cashOutPreview,
  totalPoints,
  multiplier,
  showStartButton,
  showChoice,
  isTxPending,
  isMockMode,
  isConnected,
  onStartGame,
  onCashOut,
  onNextLevel,
  onSaveStatus,
}: ActionButtonsProps) {
  if (showStartButton) {
    return (
      <div className="mt-3 space-y-2">
        <motion.button
          type="button"
          disabled={isTxPending || !isConnected}
          onClick={onStartGame}
          className="btn-play min-h-[56px] w-full px-4 py-3 text-sm font-black uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-45"
          whileTap={isConnected && !isTxPending ? { scale: 0.97 } : {}}
        >
          {isTxPending
            ? "Confirm in wallet…"
            : !isConnected
              ? "Connect wallet to start"
              : "Start game"}
          {!isTxPending && isConnected && (
            <span className="mt-1 block text-[10px] font-semibold normal-case opacity-80">
              {isMockMode ? "Mock startGame tx (Base)" : "startGame on Base"}
            </span>
          )}
        </motion.button>
        {phase === "GAME_OVER" && (
          <p className="text-center text-[10px] text-red-300/90">
            Game over — progress lost. Pay again for Level 1.
          </p>
        )}
        <SaveOnBase totalPoints={totalPoints} onStatus={onSaveStatus} />
      </div>
    );
  }

  if (showChoice) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <motion.button
            type="button"
            disabled={isTxPending}
            onClick={onNextLevel}
            className="btn-play min-h-[52px] flex-[1.6] px-2 py-3 text-[10px] leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
            whileTap={!isTxPending ? { scale: 0.97 } : {}}
          >
            Next level
            <br />
            <span className="font-semibold opacity-80">
              Lv {level + 1} • {getLevelChance(level + 1)}% chance
            </span>
          </motion.button>

          <motion.button
            type="button"
            disabled={isTxPending || cashOutPreview <= 0}
            onClick={onCashOut}
            className="btn-cashout min-h-[52px] flex-1 px-2 py-3 text-[10px] leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
            whileTap={cashOutPreview > 0 && !isTxPending ? { scale: 0.97 } : {}}
          >
            {isTxPending ? "Claiming…" : "Cash out"}
            <br />
            <span className="font-semibold opacity-80">
              {cashOutPreview.toFixed(0)} $BOOM
            </span>
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          {isMockMode ? "Mock cashOut tx" : "cashOut"} — run resets after claim
        </p>
        <SaveOnBase totalPoints={totalPoints} onStatus={onSaveStatus} />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="rounded-xl border border-white/10 bg-black/25 py-3 text-center text-xs text-slate-400">
        One hammer strike this level — hit a Warplet!
      </p>
      <SaveOnBase totalPoints={totalPoints} onStatus={onSaveStatus} />
    </div>
  );
}
