"use client";

interface MultiplierBadgeProps {
  multiplier: number;
}

export function MultiplierBadge({ multiplier }: MultiplierBadgeProps) {
  return (
    <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
      <span className="btn-app inline-flex w-auto min-w-[4.5rem] px-4 py-1 text-[11px]">
        {multiplier.toFixed(2)}x
      </span>
    </div>
  );
}
