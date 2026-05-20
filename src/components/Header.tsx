"use client";

import { motion } from "framer-motion";
import type { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { WalletButton } from "./WalletButton";

interface HeaderProps {
  daily: ReturnType<typeof useDailyCheckIn>;
}

export function Header({ daily }: HeaderProps) {
  return (
    <header className="relative z-20 w-full px-3 pt-3">
      <motion.div
        className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-2 sm:gap-4"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button type="button" className="header-btn-size btn-boombox uppercase text-white">
          BOOMBOX
        </button>

        <motion.button
          type="button"
          disabled={!daily.canClaim || daily.isPending || daily.buttonLabel === "…"}
          onClick={() => void daily.claim()}
          className={`header-btn-size relative ${
            daily.showSuccess
              ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/50"
              : daily.canClaim
                ? "bg-green-500 text-white shadow-md shadow-green-500/40 hover:bg-green-600"
                : daily.isOnCooldown
                  ? "cursor-not-allowed bg-slate-600 text-amber-100 opacity-90"
                  : "cursor-not-allowed bg-gray-500 text-white opacity-50"
          }`}
          animate={daily.showSuccess ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          aria-label={
            daily.canClaim ? "Claim daily 100 BOOM" : "Daily reward claimed"
          }
        >
          <span className="truncate px-0.5">
            {daily.isPending ? "Claiming…" : daily.buttonLabel}
          </span>
        </motion.button>

        <div className="header-btn-size relative z-30 overflow-visible p-0">
          <WalletButton headerSize />
        </div>
      </motion.div>
    </header>
  );
}
