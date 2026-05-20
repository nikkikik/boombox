"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { WarpletVariant } from "@/components/warplet-sprites/types";
import type { WarpletAnimState } from "@/hooks/useGameState";
import { WarpletFigure } from "./WarpletFigure";

interface WarpletCanvasProps {
  variant: WarpletVariant;
  visible: boolean;
  animState: WarpletAnimState;
}

export function WarpletCanvas({ variant, visible, animState }: WarpletCanvasProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 h-[115%] w-full -translate-y-2">
      <Canvas
        camera={{ position: [0, 0.15, 2.6], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
          <directionalLight position={[-2, 2, 2]} intensity={0.35} color="#aaccff" />
          <WarpletFigure variant={variant} visible={visible} animState={animState} />
        </Suspense>
      </Canvas>
    </div>
  );
}
