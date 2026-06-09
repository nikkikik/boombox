"use client";

import { motion } from "framer-motion";
import type { WarpletConfig } from "@/lib/gameConfig";
import type { WarpletAnimState } from "@/hooks/useGameState";
import { WarpletExplosion } from "./WarpletExplosion";
import {
  WARPLET_IMAGE_PATHS,
} from "./warplet-sprites/types";

interface WarpletProps {
  config: WarpletConfig;
  visible: boolean;
  animState: WarpletAnimState;
}

/** Fully hidden below the pit mask */
const EMERGE_START_Y = "92%";
/** Resting pose — paws on rim */
const EMERGE_REST_Y = "12%";

const riseSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 17,
  mass: 0.9,
};

const sinkEase = {
  duration: 0.42,
  ease: [0.55, 0, 0.85, 0.35] as [number, number, number, number],
};

export function Warplet({
  config,
  visible,
  animState,
}: WarpletProps) {
  const showSprite =
    visible && animState !== "gone" && animState !== "explode";
  const showExplosion = animState === "explode";
  const isUp = animState === "active" || animState === "vibrate";
  const isRetreat = animState === "retreat";
  const isVibrate = animState === "vibrate";

  return (
    <>
      {showSprite && (
        <div className="warplet-emerge-anchor">
          <motion.div
            className="warplet-emerge-motion"
            initial={{ y: EMERGE_START_Y, opacity: 0, scale: 0.82 }}
            animate={{
              y: isUp ? EMERGE_REST_Y : EMERGE_START_Y,
              opacity: isRetreat ? 0 : 1,
              scale: isUp ? 1 : 0.86,
              x: isVibrate ? [0, -3, 3, -2, 2, 0] : 0,
            }}
            transition={{
              y: isRetreat ? sinkEase : riseSpring,
              opacity: isRetreat
                ? { duration: 0.28, ease: "easeIn" }
                : { duration: 0.32, ease: "easeOut", delay: 0.04 },
              scale: isRetreat
                ? { duration: 0.35, ease: "easeIn" }
                : { ...riseSpring, delay: 0.02 },
              x: isVibrate
                ? { duration: 0.32, repeat: Infinity }
                : { duration: 0.15 },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={config.variant}
              src={WARPLET_IMAGE_PATHS[config.variant]}
              alt={config.label}
              draggable={false}
              className="warplet-sprite select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </div>
      )}

      {showExplosion && (
        <div className="absolute inset-0 z-[15]">
          <WarpletExplosion variant={config.variant} />
        </div>
      )}
    </>
  );
}
