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
          className="btn-play min-h-[56px] w-full px-4 py-3 text-sm font-black uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-45"
          whileTap={!txBlocked && !isTxPending ? { scale: 0.97 } : {}}
        >
          {isTxPending
            ? (txLabel ?? "Confirm in wallet…")
            : isWrongChain
              ? "Wrong network"
              : !isConnected
                ? "Connect wallet to start"
                : "Start game"}
          {!isTxPending && isConnected && (
            <span className="mt-1 block text-[10px] font-semibold normal-case opacity-80">
              startGame on Base
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
        <div className="flex gap-2">
          <motion.button
            type="button"
            disabled={isTxPending || txBlocked}
            onClick={onNextLevel}
            className="btn-play min-h-[52px] flex-[1.6] px-2 py-3 text-[10px] leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
            whileTap={!isTxPending ? { scale: 0.97 } : {}}
          >
            {isTxPending ? (txLabel ?? "Next level…") : "Next level"}
            <br />
            <span className="font-semibold opacity-80">
              Lv {level + 1} • {getLevelChance(level + 1)}% chance
            </span>
          </motion.button>

          <motion.button
            type="button"
            disabled={isTxPending || txBlocked || cashOutPreview <= 0}
            onClick={onCashOut}
            className="btn-cashout min-h-[52px] flex-1 px-2 py-3 text-[10px] leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
            whileTap={cashOutPreview > 0 && !isTxPending ? { scale: 0.97 } : {}}
          >
            {isTxPending ? (txLabel ?? "Claiming…") : "Cash out"}
            <br />
            <span className="font-semibold opacity-80">
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
