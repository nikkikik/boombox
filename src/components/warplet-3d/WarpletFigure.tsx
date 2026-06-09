"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WarpletVariant } from "@/components/warplet-sprites/types";
import type { WarpletAnimState } from "@/hooks/useGameState";
import { VARIANT_STYLES } from "./variantStyles";

interface WarpletFigureProps {
  variant: WarpletVariant;
  visible: boolean;
  animState: WarpletAnimState;
}

const HEAD_SPIKES: [number, number, number, number][] = [
  [-0.08, 0.48, 0.05, 0.14],
  [0.08, 0.5, 0.02, 0.16],
  [0, 0.52, -0.08, 0.15],
  [-0.22, 0.38, -0.05, 0.11],
  [0.22, 0.38, -0.05, 0.11],
  [-0.14, 0.44, -0.18, 0.1],
  [0.14, 0.44, -0.18, 0.1],
];

export function WarpletFigure({ variant, visible, animState }: WarpletFigureProps) {
  const group = useRef<THREE.Group>(null);
  const style = VARIANT_STYLES[variant];

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const isGone = animState === "gone" || !visible;
    let targetY = -1.2;
    let targetScale = 0.12;
    let targetRotX = 0.35;

    if (!isGone && animState === "active") {
      targetY = 0.28;
      targetScale = 1.05;
      targetRotX = -0.08;
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 10 * delta);
      g.position.z = THREE.MathUtils.lerp(g.position.z, 0, 10 * delta);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 10 * delta);
    }

    if (animState === "vibrate") {
      g.position.x = Math.sin(Date.now() * 0.04) * 0.04;
    }

    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 9 * delta);
    const s = THREE.MathUtils.lerp(g.scale.x, targetScale, 10 * delta);
    g.scale.setScalar(Math.max(0.01, s));
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRotX, 7 * delta);
  });

  if (animState === "gone" && !visible) return null;
  if (animState === "explode") return null;

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {style.glow && (
        <pointLight position={[0, 0.2, 0.4]} intensity={1.2} color="#ffd700" distance={2.5} />
      )}

      {/* Body — round pebbled grey like logo */}
      <mesh castShadow position={[0, 0, 0]} scale={[1, 0.92, 0.95]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={style.body}
          roughness={0.72}
          metalness={0.05}
          emissive={style.glow ? "#886600" : style.accent}
          emissiveIntensity={style.glow ? 0.35 : 0.08}
        />
      </mesh>

      {/* Head spikes / ridges */}
      {HEAD_SPIKES.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s}>
          <coneGeometry args={[0.08, 0.18, 6]} />
          <meshStandardMaterial color={style.accent} roughness={0.8} />
        </mesh>
      ))}

      <LogoEye position={[-0.19, 0.18, 0.4]} />
      <LogoEye position={[0.19, 0.18, 0.4]} />

      <LogoGrinMouth />

      {/* Paws on hole edge */}
      <mesh position={[-0.52, -0.12, 0.28]} scale={[0.28, 0.22, 0.2]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={style.body} roughness={0.75} />
      </mesh>
      <mesh position={[0.52, -0.12, 0.28]} scale={[0.28, 0.22, 0.2]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={style.body} roughness={0.75} />
      </mesh>
      <mesh position={[-0.18, -0.48, 0.22]} scale={[0.22, 0.16, 0.18]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.accent} roughness={0.75} />
      </mesh>
      <mesh position={[0.18, -0.48, 0.22]} scale={[0.22, 0.16, 0.18]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.accent} roughness={0.75} />
      </mesh>
    </group>
  );
}

function LogoEye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>
      <mesh position={[0.04, 0.04, 0.1]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function LogoGrinMouth() {
  const upperCount = 10;
  const lowerCount = 6;
  const mouthZ = 0.41;

  const upperTeeth = Array.from({ length: upperCount }, (_, i) => {
    const t = i / (upperCount - 1);
    const angle = Math.PI * 0.15 + t * Math.PI * 0.7;
    return {
      x: Math.cos(angle) * 0.22,
      y: Math.sin(angle) * 0.06 + 0.05,
      rotZ: angle - Math.PI / 2,
    };
  });

  const lowerTeeth = Array.from({ length: lowerCount }, (_, i) => {
    const t = i / (lowerCount - 1);
    const angle = Math.PI * 0.4 + t * Math.PI * 0.2;
    return {
      x: Math.cos(angle) * 0.12,
      y: -Math.sin(angle) * 0.04 - 0.09,
      rotZ: angle + Math.PI / 2,
    };
  });

  return (
    <group position={[0, -0.1, mouthZ]}>
      <mesh position={[0, -0.02, -0.01]} scale={[1.05, 0.5, 0.18]}>
        <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#1a0810" roughness={0.9} />
      </mesh>
      {upperTeeth.map((t, i) => (
        <mesh
          key={`u-${i}`}
          position={[t.x, t.y, 0.03]}
          rotation={[0, 0, t.rotZ + Math.PI / 2]}
          scale={[0.048, 0.085, 0.022]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.25} />
        </mesh>
      ))}
      {lowerTeeth.map((t, i) => (
        <mesh
          key={`l-${i}`}
          position={[t.x, t.y, 0.03]}
          rotation={[0, 0, t.rotZ - Math.PI / 2]}
          scale={[0.042, 0.075, 0.022]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
