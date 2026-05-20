"use client";

import { motion } from "framer-motion";

interface MissFeedbackProps {
  trigger: number;
  holeIndex: number;
}

/** Анимация промаха: удар молотком, вспышка, надпись MISS */
export function MissFeedback({ trigger, holeIndex }: MissFeedbackProps) {
  const uid = `${holeIndex}-${trigger}`;
  if (trigger === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-visible rounded-full">
      {/* Красная вспышка по краю лунки */}
      <motion.div
        key={`flash-${trigger}`}
        className="absolute inset-0 rounded-full border-4 border-red-400/80"
        initial={{ scale: 0.85, opacity: 0.9 }}
        animate={{ scale: 1.15, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Пыль / звёздочки промаха */}
      {[
        { x: -18, y: -8, rot: -20 },
        { x: 20, y: 4, rot: 15 },
        { x: -8, y: 22, rot: 45 },
        { x: 14, y: -18, rot: -35 },
      ].map((p, i) => (
        <motion.span
          key={`dust-${trigger}-${i}`}
          className="absolute left-1/2 top-1/2 text-lg font-black text-slate-300"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0.3,
            rotate: p.rot,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          ✦
        </motion.span>
      ))}

      {/* Молоток — удар в пустоту и отскок */}
      <motion.div
        key={`hammer-${trigger}`}
        className="absolute left-1/2 top-[12%] -translate-x-1/2"
        initial={{ scale: 1.3, rotate: -50, y: -20, opacity: 1 }}
        animate={{
          scale: [1.3, 1.1, 0.9],
          rotate: [-50, -15, 25],
          y: [-20, 4, -6],
          opacity: [1, 1, 0.6],
        }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 56 56"
          className="drop-shadow-[0_0_10px_rgba(255,80,80,0.7)]"
        >
          <defs>
            <linearGradient id={`missHead-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff6eb4" />
              <stop offset="100%" stopColor="#c44d4d" />
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
              fill={`url(#missHead-${uid})`}
              stroke="#fff"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </motion.div>

      {/* MISS! */}
      <motion.div
        key={`label-${trigger}`}
        className="absolute inset-x-0 top-[38%] flex justify-center"
        initial={{ scale: 0.3, opacity: 0, y: 8 }}
        animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 0], y: [8, -4, -18] }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <span
          className="font-display text-xl font-black uppercase tracking-wider text-red-400"
          style={{
            textShadow:
              "0 0 12px rgba(255,60,60,0.9), 0 2px 0 #000, 2px 2px 0 rgba(0,0,0,0.8)",
          }}
        >
          Miss!
        </span>
      </motion.div>

      {/* Clang lines */}
      <motion.svg
        key={`clang-${trigger}`}
        className="absolute left-1/2 top-[28%] -translate-x-1/2"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.4] }}
        transition={{ duration: 0.35 }}
      >
        <line x1="28" y1="8" x2="28" y2="20" stroke="#ffaa88" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="16" x2="20" y2="24" stroke="#ffaa88" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="16" x2="36" y2="24" stroke="#ffaa88" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="28" x2="18" y2="28" stroke="#ffaa88" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="28" x2="38" y2="28" stroke="#ffaa88" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    </div>
  );
}
