"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { WalletButton } from "./WalletButton";

interface HeaderProps {
  daily: ReturnType<typeof useDailyCheckIn>;
}

function dailyShortLabel(daily: ReturnType<typeof useDailyCheckIn>): string {
  if (daily.showSuccess) return "Done";
  if (daily.isPending) return "…";
  if (daily.isWrongChain) return "Network";
  if (daily.canClaim) return "Daily";
  if (daily.isOnCooldown && daily.waitLabel) {
    return daily.waitLabel.replace("Wait ", "");
  }
  return "Daily";
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
        className="mx-auto w-full max-w-md"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="grid grid-cols-3 gap-2">
          <div className="btn-app btn-app-muted flex items-center justify-center gap-1.5 px-2">
            <Image
              src="/miniapp-icon.png"
              alt="Boombox"
              width={18}
              height={18}
              unoptimized
              className="rounded-md"
            />
            <span className="truncate">Boombox</span>
          </div>

          {!daily.hideButton ? (
            <motion.button
              type="button"
              disabled={!daily.canClaim || daily.isPending}
              onClick={() => void daily.claim()}
              className={
                daily.showSuccess
                  ? "btn-app btn-app-daily btn-app-daily-done"
                  : daily.canClaim || daily.isPending
                    ? "btn-app btn-app-daily"
                    : "btn-app"
              }
              animate={daily.showSuccess ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="truncate">{dailyShortLabel(daily)}</span>
            </motion.button>
          ) : (
            <div className="btn-app btn-app-daily-cooldown">
              <span className="truncate">{daily.waitLabel ?? dailyShortLabel(daily)}</span>
            </div>
          )}

          <WalletButton />
        </div>

        {showMeta && (
          <p className="mt-1.5 text-center text-[9px] leading-tight text-slate-500">
            {daily.isWrongChain
              ? daily.buttonLabel
              : daily.showSuccess
                ? `Claimed · ${daily.lastCheckInLabel}`
                : daily.isOnCooldown
                  ? `Next in ${daily.waitLabel ?? "—"} · last ${daily.lastCheckInLabel}`
                  : `Last check-in ${daily.lastCheckInLabel}`}
          </p>
        )}
      </motion.div>
    </header>
  );
}
