"use client";

import Image from "next/image";

interface StatsBarProps {
  level: number;
  hitChance: number;
  boomBalance: number;
  isBalanceLoading?: boolean;
  isWrongChain?: boolean;
  appChainName?: string;
}

export function StatsBar({
  level,
  hitChance,
  boomBalance,
  isBalanceLoading,
  isWrongChain,
  appChainName,
}: StatsBarProps) {
  return (
    <div className="mt-2 grid grid-cols-3 divide-x divide-white/15 text-center">
      <div className="px-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Stage
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-100">
          {level > 0 ? level : "—"}
        </p>
      </div>
      <div className="px-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Hit chance
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-100">
          {level > 0 ? `${hitChance}%` : "—"}
        </p>
      </div>
      <div className="px-1 py-1">
        <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Image
            src="/boom-token.png"
            alt=""
            width={14}
            height={14}
            unoptimized
            className="rounded-sm"
          />
          $BOOM
        </p>
        <p
          className="mt-0.5 text-sm font-semibold text-slate-100"
          title={
            isWrongChain
              ? `Switch wallet to ${appChainName ?? "Base Mainnet"}`
              : "BOOM game token (minted via Daily Check-in / Cash out)"
          }
        >
          {isBalanceLoading
            ? "…"
            : boomBalance.toLocaleString("en-US", {
                maximumFractionDigits: boomBalance >= 1000 ? 0 : 2,
              })}
        </p>
        {isWrongChain && (
          <p className="text-[9px] text-slate-400">Switch to {appChainName}</p>
        )}
      </div>
    </div>
  );
}
