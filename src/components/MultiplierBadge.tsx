"use client";

import { motion } from "framer-motion";

interface MultiplierBadgeProps {
  multiplier: number;
}

export function MultiplierBadge({ multiplier }: MultiplierBadgeProps) {
  return (
    <motion.div
      className="absolute -top-4 left-1/2 z-10 -translate-x-1/2"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      <span
        className="inline-block rounded-full px-5 py-1 text-sm font-black tracking-wider text-[#1a2a10] shadow-lg"
        style={{
          background: "linear-gradient(180deg, #9ae65a 0%, #7ed321 50%, #5cb318 100%)",
          border: "2px solid rgba(255,255,255,0.35)",
          boxShadow: "0 0 20px rgba(126, 211, 33, 0.5)",
        }}
      >
        {multiplier.toFixed(2)}X
      </span>
    </motion.div>
  );
}
