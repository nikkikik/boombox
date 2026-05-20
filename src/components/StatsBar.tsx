"use client";

interface StatsBarProps {
  level: number;
  hitChance: number;
  boomBalance: number;
}

export function StatsBar({ level, hitChance, boomBalance }: StatsBarProps) {
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
        <p className="mt-0.5 text-sm font-black text-emerald-300">
          {boomBalance.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    </div>
  );
}
