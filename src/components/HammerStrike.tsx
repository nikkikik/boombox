"use client";

import { motion } from "framer-motion";

interface HammerStrikeProps {
  trigger: number;
}

/** Удар молотком по варплету — только при попадании */
export function HammerStrike({ trigger }: HammerStrikeProps) {
  if (trigger === 0) return null;

  return (
    <motion.div
      key={trigger}
      className="pointer-events-none absolute left-1/2 top-[18%] z-50 -translate-x-1/2"
      initial={{ scale: 1.4, rotate: -40, opacity: 1, y: -8 }}
      animate={{ scale: 0.5, rotate: 10, opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: "easeIn" }}
    >
      <svg
        width="88"
        height="88"
        viewBox="0 0 56 56"
        className="drop-shadow-[0_0_16px_rgba(255,110,180,0.9)]"
      >
        <defs>
          <linearGradient id="strikeHead" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6eb4" />
            <stop offset="100%" stopColor="#ff9f43" />
          </linearGradient>
        </defs>
        <g transform="rotate(-25 28 28)">
          <rect x="24" y="22" width="8" height="26" rx="3" fill="#5c3a1a" />
          <rect
            x="10"
            y="6"
            width="36"
            height="22"
            rx="6"
            fill="url(#strikeHead)"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </g>
      </svg>
    </motion.div>
  );
}
