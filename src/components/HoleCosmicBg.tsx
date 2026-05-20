"use client";

import { motion } from "framer-motion";

/** Уникальный космический вид внутри каждой лунки (планета + звёзды) */
const HOLE_SKIES = [
  {
    nebula: "rgba(88, 40, 160, 0.55)",
    planet: "radial-gradient(circle at 32% 28%, #9b7fd4 0%, #5a3d8a 35%, #2a1848 65%, transparent 72%)",
    ring: "rgba(180, 120, 255, 0.25)",
  },
  {
    nebula: "rgba(40, 100, 200, 0.5)",
    planet: "radial-gradient(circle at 40% 35%, #6ec8e8 0%, #2a6a9e 40%, #0f2840 70%, transparent 75%)",
    ring: "rgba(100, 200, 255, 0.2)",
  },
  {
    nebula: "rgba(200, 80, 120, 0.45)",
    planet: "radial-gradient(circle at 35% 30%, #f0a0c0 0%, #c45a80 38%, #4a1830 68%, transparent 74%)",
    ring: "rgba(255, 150, 200, 0.22)",
  },
  {
    nebula: "rgba(60, 160, 100, 0.4)",
    planet: "radial-gradient(circle at 38% 32%, #8ed4a8 0%, #3a8a58 42%, #143828 70%, transparent 76%)",
    ring: "rgba(120, 255, 180, 0.2)",
  },
  {
    nebula: "rgba(220, 140, 60, 0.4)",
    planet: "radial-gradient(circle at 30% 28%, #f0d080 0%, #c87820 35%, #6a4010 65%, transparent 72%)",
    ring: "rgba(255, 200, 100, 0.25)",
  },
  {
    nebula: "rgba(80, 60, 180, 0.5)",
    planet: "radial-gradient(circle at 42% 34%, #a8b8ff 0%, #4858b0 40%, #1a2050 68%, transparent 74%)",
    ring: "rgba(150, 170, 255, 0.22)",
  },
] as const;

const STARS = [
  { x: "12%", y: "18%", s: 1.5 },
  { x: "78%", y: "22%", s: 2 },
  { x: "45%", y: "12%", s: 1 },
  { x: "88%", y: "55%", s: 1.5 },
  { x: "22%", y: "72%", s: 2 },
  { x: "65%", y: "80%", s: 1 },
  { x: "35%", y: "48%", s: 1 },
  { x: "92%", y: "38%", s: 1 },
];

interface HoleCosmicBgProps {
  holeIndex: number;
}

export function HoleCosmicBg({ holeIndex }: HoleCosmicBgProps) {
  const sky = HOLE_SKIES[holeIndex % HOLE_SKIES.length];

  return (
    <div
      className="absolute inset-1.5 z-0 overflow-hidden rounded-full"
      style={{
        background: `
          radial-gradient(ellipse 90% 80% at 50% 120%, ${sky.nebula} 0%, transparent 55%),
          radial-gradient(ellipse 70% 60% at 80% 10%, rgba(60, 120, 220, 0.35) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 10% 90%, rgba(140, 50, 180, 0.3) 0%, transparent 45%),
          linear-gradient(165deg, #0a0618 0%, #050510 40%, #020208 100%)
        `,
        boxShadow: "inset 0 8px 20px rgba(0,0,0,0.85), inset 0 -2px 8px rgba(80,120,255,0.08)",
      }}
    >
      {STARS.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.s,
            height: star.s,
          }}
          animate={{ opacity: [0.2, 0.95, 0.2] }}
          transition={{
            duration: 1.2 + (i % 3) * 0.4,
            repeat: Infinity,
            delay: (holeIndex + i) * 0.15,
          }}
        />
      ))}

      {/* Планета в глубине лунки */}
      <motion.div
        className="absolute left-1/2 top-[58%] h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: sky.planet,
          boxShadow: `0 0 20px ${sky.ring}, inset -4px -8px 12px rgba(0,0,0,0.5)`,
        }}
        animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4 + holeIndex * 0.3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Кольцо / атмосфера */}
      <div
        className="pointer-events-none absolute left-1/2 top-[58%] h-[62%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          border: `1px solid ${sky.ring}`,
          transform: "translate(-50%, -50%) rotateX(72deg)",
        }}
      />

      {/* Туманность */}
      <motion.div
        className="absolute -right-[20%] -top-[15%] h-[50%] w-[50%] rounded-full opacity-50 blur-md"
        style={{ background: sky.nebula }}
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}
