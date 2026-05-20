"use client";

import { motion } from "framer-motion";

interface StageInfoProps {
  stageName: string;
  chance: number;
  multiplier: number;
}

export function StageInfo({ stageName, chance, multiplier }: StageInfoProps) {
  return (
    <motion.div
      className="mx-4 mt-3 rounded-2xl panel-glass px-4 py-3 text-center"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
        Next Stage
      </p>
      <h2 className="font-display text-lg font-bold text-glow text-white">
        NEXT STAGE: {stageName}
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Chance {chance}% | Multiplier {multiplier.toFixed(2)}x
      </p>
    </motion.div>
  );
}
