"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StatsBar } from "./StatsBar";
import { ActionButtons } from "./ActionButtons";
import { MultiplierBadge } from "./MultiplierBadge";
import type { GamePhase } from "@/hooks/useGameState";

interface BottomPanelProps {
  phase: GamePhase;
  level: number;
  multiplier: number;
  hitChance: number;
  boomBalance: number;
  isBalanceLoading?: boolean;
  isWrongChain?: boolean;
  appChainName?: string;
  roundPoints: number;
  statusText: string;
  lastResult: string | null;
  cashOutPreview: number;
  showStartButton: boolean;
  showChoice: boolean;
  isTxPending: boolean;
  pendingAction?: string | null;
  isMockMode: boolean;
  isConnected: boolean;
  onStartGame: () => void;
  onCashOut: () => void;
  onNextLevel: () => void;
}

export function BottomPanel({
  phase,
  level,
  multiplier,
  hitChance,
  boomBalance,
  isBalanceLoading,
  isWrongChain,
  appChainName,
  roundPoints,
  statusText,
  lastResult,
  cashOutPreview,
  showStartButton,
  showChoice,
  isTxPending,
  pendingAction,
  isMockMode,
  isConnected,
  onStartGame,
  onCashOut,
  onNextLevel,
}: BottomPanelProps) {
  return (
    <motion.div
      className="relative mx-3 mt-4 rounded-3xl panel-glass px-3 pb-4 pt-6 shadow-2xl"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
    >
      <MultiplierBadge multiplier={multiplier} />

      <StatsBar
        level={level}
        hitChance={hitChance}
        boomBalance={boomBalance}
        isBalanceLoading={isBalanceLoading}
        isWrongChain={isWrongChain}
        appChainName={appChainName}
      />

      <p className="mt-3 border-t border-white/10 py-2 text-center text-[11px] text-slate-300">
        {statusText}
      </p>

      <AnimatePresence mode="wait">
        {lastResult && (
          <motion.p
            key={lastResult}
            className="mb-1 text-center text-xs font-medium text-amber-200/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {lastResult}
          </motion.p>
        )}
      </AnimatePresence>

      <ActionButtons
        phase={phase}
        level={level}
        chance={hitChance}
        cashOutPreview={cashOutPreview}
        multiplier={multiplier}
        showStartButton={showStartButton}
        showChoice={showChoice}
        isTxPending={isTxPending}
        pendingAction={pendingAction}
        isMockMode={isMockMode}
        isConnected={isConnected}
        onStartGame={onStartGame}
        onCashOut={onCashOut}
        onNextLevel={onNextLevel}
      />
    </motion.div>
  );
}
