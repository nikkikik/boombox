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
    <div className="pointer-events-none absolute inset-0 z-10 h-[120%] w-full -translate-y-3">
      <Canvas
        camera={{ position: [0, 0.05, 2.4], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[2, 4, 3]} intensity={0.9} color="#ffffff" />
          <directionalLight position={[-2, 1, 2]} intensity={0.25} color="#aaccff" />
          <pointLight position={[0, -0.8, 0.6]} intensity={1.4} color="#a855f7" distance={3} />
          <pointLight position={[0.5, 0.2, 0.8]} intensity={0.5} color="#6366f1" distance={2.5} />
          <WarpletFigure variant={variant} visible={visible} animState={animState} />
        </Suspense>
      </Canvas>
    </div>
  );
}
