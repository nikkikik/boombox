"use client";

import { motion } from "framer-motion";

const STARS = [
  { x: "15%", y: "20%", s: 1.2 },
  { x: "82%", y: "25%", s: 1.5 },
  { x: "48%", y: "14%", s: 1 },
  { x: "75%", y: "68%", s: 1.2 },
  { x: "25%", y: "75%", s: 1.4 },
  { x: "60%", y: "55%", s: 1 },
];

interface HoleCosmicBgProps {
  holeIndex: number;
}

/** Dark crater interior with purple rim glow — matches app logo */
export function HoleCosmicBg({ holeIndex }: HoleCosmicBgProps) {
  const hueShift = holeIndex % 3;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden rounded-full"
      style={{
        background: `
          radial-gradient(circle at 50% 85%, rgba(168, 85, 247, ${0.35 + hueShift * 0.05}) 0%, transparent 45%),
          radial-gradient(circle at 50% 100%, rgba(60, 30, 90, 0.6) 0%, transparent 55%),
          radial-gradient(circle at 30% 20%, rgba(40, 60, 120, 0.15) 0%, transparent 40%),
          linear-gradient(180deg, #12101a 0%, #08060e 45%, #030208 100%)
        `,
        boxShadow:
          "inset 0 10px 24px rgba(0,0,0,0.9), inset 0 -4px 16px rgba(168,85,247,0.15)",
      }}
    >
      {STARS.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/80"
          style={{ left: star.x, top: star.y, width: star.s, height: star.s }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{
            duration: 1.5 + (i % 3) * 0.3,
            repeat: Infinity,
            delay: (holeIndex + i) * 0.12,
          }}
        />
      ))}

      {/* Rocky crater lip */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 68%, transparent 42%, rgba(30,25,40,0.8) 58%, rgba(15,12,22,0.95) 72%, transparent 78%)",
        }}
      />

      {/* Purple rim glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: "inset 0 0 18px rgba(168,85,247,0.35), inset 0 0 6px rgba(196,130,255,0.2)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5 + holeIndex * 0.2, repeat: Infinity }}
      />
    </div>
  );
}
