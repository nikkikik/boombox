"use client";

import { motion } from "framer-motion";
import { VARIANT_STYLES } from "./warplet-3d/variantStyles";
import type { WarpletVariant } from "./warplet-sprites/types";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  angle: (i / 22) * Math.PI * 2,
  dist: 36 + (i % 5) * 14,
  size: 5 + (i % 4) * 3,
}));

interface WarpletExplosionProps {
  variant: WarpletVariant;
}

export function WarpletExplosion({ variant }: WarpletExplosionProps) {
  const color = VARIANT_STYLES[variant].body;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-visible">
      <motion.div
        className="absolute h-20 w-20 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}cc 0%, #ff6eb488 35%, #ffd70044 55%, transparent 72%)`,
          boxShadow: `0 0 40px ${color}, 0 0 60px #ff6eb4`,
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
      <motion.div
        className="absolute h-10 w-10 rounded-full bg-white"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? "#ffd700" : p.id % 3 === 1 ? color : "#ff6eb4",
            boxShadow: `0 0 8px ${color}`,
          }}
          initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 16,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ))}
      <motion.span
        className="absolute text-3xl font-black tracking-tight text-yellow-300"
        style={{
          textShadow: "0 0 12px #ff6eb4, 0 2px 0 #000",
        }}
        initial={{ scale: 0, opacity: 1, rotate: -8 }}
        animate={{ scale: 1.6, opacity: 0, y: -40, rotate: 4 }}
        transition={{ duration: 0.5 }}
      >
        POW!
      </motion.span>
      <motion.span
        className="absolute text-lg font-bold text-white/90"
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        💥
      </motion.span>
    </div>
  );
}
