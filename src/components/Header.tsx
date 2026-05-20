"use client";

import { motion } from "framer-motion";
import type { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { WalletButton } from "./WalletButton";

interface HeaderProps {
  daily: ReturnType<typeof useDailyCheckIn>;
}

export function Header({ daily }: HeaderProps) {
  const showMeta =
    daily.showSuccess ||
    daily.isOnCooldown ||
    daily.isWrongChain ||
    daily.lastCheckInAt > BigInt(0);

  return (
    <header className="relative z-20 w-full px-3 pt-3">
      <motion.div
        className="mx-auto flex w-full max-w-md flex-col items-center gap-2"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-4">
          <button type="button" className="header-btn-size btn-boombox uppercase text-white">
            BOOMBOX
          </button>

          <div className="flex min-w-[120px] flex-col items-center gap-0.5">
            {!daily.hideButton ? (
              <motion.button
                type="button"
                disabled={!daily.canClaim || daily.isPending}
                onClick={() => void daily.claim()}
                className={`header-btn-size relative ${
                  daily.showSuccess
                    ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/50"
                    : daily.canClaim
                      ? "bg-green-500 text-white shadow-md shadow-green-500/40 hover:bg-green-600"
                      : daily.isWrongChain
                        ? "cursor-not-allowed bg-amber-900/80 text-amber-100"
                        : "cursor-not-allowed bg-gray-500 text-white opacity-50"
                }`}
                animate={daily.showSuccess ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <span className="truncate px-0.5 text-[10px] sm:text-xs">
                  {daily.buttonLabel}
                </span>
              </motion.button>
            ) : (
              <div className="header-btn-size flex items-center justify-center rounded-full border border-amber-500/40 bg-slate-700/90 px-2 text-center text-[10px] font-semibold text-amber-100">
                {daily.waitLabel ?? daily.buttonLabel}
              </div>
            )}
            {showMeta && (
              <p className="max-w-[150px] text-center text-[9px] leading-tight text-slate-400">
                {daily.isWrongChain ? (
                  daily.buttonLabel
                ) : daily.showSuccess ? (
                  <>Claimed · {daily.lastCheckInLabel}</>
                ) : daily.isOnCooldown ? (
                  <>
                    {daily.waitLabel}
                    <br />
                    <span className="text-slate-500">
                      last: {daily.lastCheckInLabel}
                    </span>
                  </>
                ) : (
                  <>last: {daily.lastCheckInLabel}</>
                )}
              </p>
            )}
          </div>

          <div className="header-btn-size relative z-30 overflow-visible p-0">
            <WalletButton headerSize />
          </div>
        </div>
      </motion.div>
    </header>
  );
}
