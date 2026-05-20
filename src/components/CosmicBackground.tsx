"use client";

import { motion } from "framer-motion";

const STARS = Array.from({ length: 140 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 5) % 100}%`,
  top: `${(i * 19 + 3) % 100}%`,
  size: (i % 4) === 0 ? 2 : (i % 3) + 1,
  delay: (i % 7) * 0.3,
}));

const PLANETS = [
  {
    className: "absolute -left-12 top-[12%] h-32 w-32",
    bg: "radial-gradient(circle at 35% 30%, #b8a0e8 0%, #6a48a8 40%, #2a1848 70%, transparent 75%)",
    glow: "rgba(160, 120, 255, 0.35)",
    duration: 90,
  },
  {
    className: "absolute -right-10 top-[8%] h-24 w-24",
    bg: "radial-gradient(circle at 40% 35%, #7ec8e8 0%, #2a6a9e 50%, transparent 72%)",
    glow: "rgba(80, 180, 255, 0.3)",
    duration: 70,
  },
  {
    className: "absolute -bottom-10 -right-6 h-40 w-40",
    bg: "radial-gradient(circle at 35% 35%, #e8c878 0%, #a86818 35%, #4a3010 62%, transparent 72%)",
    glow: "rgba(220, 160, 60, 0.35)",
    duration: 0,
  },
  {
    className: "absolute bottom-[18%] -left-8 h-20 w-20 opacity-80",
    bg: "radial-gradient(circle at 38% 32%, #f0a0c0 0%, #8a4060 55%, transparent 72%)",
    glow: "rgba(255, 120, 180, 0.25)",
    duration: 50,
  },
  {
    className: "absolute right-[15%] top-[42%] h-14 w-14 opacity-60",
    bg: "radial-gradient(circle at 40% 38%, #c8e8d0 0%, #408858 55%, transparent 70%)",
    glow: "rgba(100, 220, 150, 0.2)",
    duration: 40,
  },
];

export function CosmicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030208]">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 15% 40%, rgba(120, 60, 200, 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 85% 25%, rgba(60, 180, 120, 0.35) 0%, transparent 50%),
            radial-gradient(ellipse 50% 35% at 70% 85%, rgba(40, 100, 220, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 30% 25% at 50% 60%, rgba(180, 50, 150, 0.25) 0%, transparent 45%),
            linear-gradient(180deg, #030308 0%, #0a0520 35%, #050818 70%, #020205 100%)
          `,
        }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {STARS.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{
            duration: 1.5 + (star.id % 4),
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      <motion.div
        className="absolute left-[20%] top-[25%] h-48 w-48 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,180,255,0.45) 0%, rgba(100,80,180,0.15) 45%, transparent 70%)",
          filter: "blur(3px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      {PLANETS.map((p, i) => (
        <motion.div
          key={i}
          className={`${p.className} rounded-full`}
          style={{
            background: p.bg,
            boxShadow: `0 0 50px ${p.glow}`,
          }}
          animate={
            p.duration > 0
              ? { y: [0, -6, 0], rotate: [0, 8, 0] }
              : { y: [0, -4, 0] }
          }
          transition={{
            duration: p.duration || 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
