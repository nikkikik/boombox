"use client";

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
        <p className="mt-0.5 text-sm font-black text-amber-200">
          {level > 0 ? level : "—"}
        </p>
      </div>
      <div className="px-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Hit chance
        </p>
        <p className="mt-0.5 text-sm font-black text-cyan-300">
          {level > 0 ? `${hitChance}%` : "—"}
        </p>
      </div>
      <div className="px-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          $BOOM balance
        </p>
        <p
          className="mt-0.5 text-sm font-black text-emerald-300"
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
          <p className="text-[9px] text-amber-300/90">Switch to {appChainName}</p>
        )}
      </div>
    </div>
  );
}
