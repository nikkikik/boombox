"use client";

import { motion } from "framer-motion";
import { useWalletPicker } from "@/contexts/WalletPickerContext";
import { getLevelChance } from "@/lib/gameConfig";
import type { GamePhase } from "@/hooks/useGameState";

interface ActionButtonsProps {
  phase: GamePhase;
  level: number;
  chance: number;
  cashOutPreview: number;
  multiplier: number;
  showStartButton: boolean;
  showChoice: boolean;
  isTxPending: boolean;
  pendingAction?: string | null;
  isConnected: boolean;
  isWrongChain?: boolean;
  switchNetworkMessage?: string;
  onStartGame: () => void;
  onCashOut: () => void;
  onNextLevel: () => void;
}

export function ActionButtons({
  phase,
  level,
  chance,
  cashOutPreview,
  multiplier,
  showStartButton,
  showChoice,
  isTxPending,
  pendingAction,
  isConnected,
  isWrongChain,
  switchNetworkMessage,
  onStartGame,
  onCashOut,
  onNextLevel,
}: ActionButtonsProps) {
  const { openWalletPicker } = useWalletPicker();

  const txLabel = (() => {
    if (!isTxPending) return null;
    switch (pendingAction) {
      case "cashOut":
        return "Claiming on Base…";
      case "nextLevel":
        return "Next level on Base…";
      case "startGame":
        return "Confirm in wallet…";
      default:
        return "Confirm in wallet…";
    }
  })();

  const txBlocked = isWrongChain;
  const needsWallet = !isConnected;

  if (showStartButton) {
    return (
      <div className="mt-3 space-y-2">
        {isWrongChain && isConnected && (
          <p className="text-center text-xs font-medium text-amber-300">
            {switchNetworkMessage ?? "Switch to Base Mainnet to play"}
          </p>
        )}
        <motion.button
          type="button"
          disabled={isTxPending || txBlocked}
          onClick={() => {
            if (needsWallet) {
              openWalletPicker();
              return;
            }
            onStartGame();
          }}
          className="btn-app btn-app-primary flex-col gap-0.5 py-2.5"
          whileTap={!txBlocked && !isTxPending ? { scale: 0.97 } : {}}
        >
          <span className="font-display">
            {isTxPending
              ? (txLabel ?? "Confirm in wallet…")
              : isWrongChain
                ? "Wrong network"
                : !isConnected
                  ? "Connect wallet"
                  : "Start game"}
          </span>
          {!isTxPending && isConnected && !isWrongChain && (
            <span className="text-[10px] font-medium normal-case text-[#3d2a0a]/75">
              Pay & play on Base
            </span>
          )}
        </motion.button>
        {phase === "GAME_OVER" && (
          <p className="text-center text-[10px] text-red-300/90">
            Game over — progress lost. Pay again for Level 1.
          </p>
        )}
      </div>
    );
  }

  if (showChoice) {
    return (
      <div className="mt-3 space-y-2">
        {isWrongChain && isConnected && (
          <p className="text-center text-xs font-medium text-amber-300">
            {switchNetworkMessage ?? "Switch to Base Mainnet to play"}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            type="button"
            disabled={isTxPending || txBlocked}
            onClick={onNextLevel}
            className="btn-app min-h-12 flex-col gap-0.5 py-2 normal-case tracking-normal"
            whileTap={!isTxPending ? { scale: 0.98 } : {}}
          >
            <span>{isTxPending ? (txLabel ?? "Next level…") : "Next level"}</span>
            <span className="text-[9px] font-normal text-slate-400">
              Lv {level + 1} · {getLevelChance(level + 1)}%
            </span>
          </motion.button>

          <motion.button
            type="button"
            disabled={isTxPending || txBlocked || cashOutPreview <= 0}
            onClick={onCashOut}
            className="btn-app min-h-12 flex-col gap-0.5 py-2 normal-case tracking-normal"
            whileTap={cashOutPreview > 0 && !isTxPending ? { scale: 0.98 } : {}}
          >
            <span>{isTxPending ? (txLabel ?? "Claiming…") : "Cash out"}</span>
            <span className="text-[9px] font-normal text-slate-400">
              {cashOutPreview.toFixed(0)} $BOOM
            </span>
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          cashOut(won, reward) on Base
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="rounded-xl border border-white/10 bg-black/25 py-3 text-center text-xs text-slate-400">
        Wait for a glowing Warplet, then tap it — one strike this level
      </p>
    </div>
  );
}
