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

export function WarpletFigure({ variant, visible, animState }: WarpletFigureProps) {
  const group = useRef<THREE.Group>(null);
  const style = VARIANT_STYLES[variant];
  const isExplode = animState === "explode";

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const isGone = animState === "gone" || !visible;

    let targetY = -1.35;
    let targetScale = 0.15;
    let targetRotX = 0.45;

    if (!isGone && animState === "active") {
      targetY = 0.2;
      targetScale = 1;
      targetRotX = -0.05;
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 10 * delta);
      g.position.z = THREE.MathUtils.lerp(g.position.z, 0, 10 * delta);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 10 * delta);
    }

    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 9 * delta);
    const s = THREE.MathUtils.lerp(g.scale.x, targetScale, 10 * delta);
    g.scale.setScalar(Math.max(0.01, s));
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRotX, 7 * delta);
  });

  if (animState === "gone" && !visible) return null;
  if (isExplode) return null;

  return (
    <group ref={group} position={[0, -1.35, 0]}>
      {style.glow && (
        <pointLight position={[0, 0.3, 0.5]} intensity={0.8} color="#ffd700" distance={2} />
      )}

      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.52, 28, 28]} />
        <meshStandardMaterial
          color={style.body}
          roughness={0.45}
          metalness={style.glow ? 0.35 : 0.08}
          emissive={style.glow ? "#886600" : "#000000"}
          emissiveIntensity={style.glow ? 0.25 : 0}
        />
      </mesh>

      {style.sweater && (
        <mesh position={[0, -0.08, 0.38]} scale={[1.05, 0.55, 0.7]}>
          <sphereGeometry args={[0.48, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={style.sweater} roughness={0.8} />
        </mesh>
      )}

      {style.overalls && (
        <mesh position={[0, -0.15, 0.42]}>
          <boxGeometry args={[0.75, 0.55, 0.35]} />
          <meshStandardMaterial color={style.overalls} roughness={0.6} />
        </mesh>
      )}

      {style.shirt && (
        <mesh position={[0, -0.05, 0.4]} scale={[0.95, 0.5, 0.65]}>
          <sphereGeometry args={[0.45, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={style.shirt} roughness={0.7} />
        </mesh>
      )}

      {style.hood && (
        <mesh position={[0, 0.35, 0.05]} scale={[1.15, 0.9, 1]}>
          <sphereGeometry args={[0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial color={style.hood} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Eye position={[-0.2, 0.22, 0.42]} sleepy={style.sleepy} />
      <Eye position={[0.2, 0.22, 0.42]} sleepy={style.sleepy} />

      {style.grin ? <GrinMouth /> : <SimpleMouth sleepy={style.sleepy} />}

      {style.tie && (
        <mesh position={[0, -0.05, 0.48]}>
          <boxGeometry args={[0.08, 0.35, 0.05]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      )}

      {style.cigarette && (
        <group position={[0.35, 0.05, 0.45]} rotation={[0, 0, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
            <meshStandardMaterial color="#eee" />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#ff6622" emissive="#ff4400" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      <mesh position={[-0.55, -0.05, 0.15]} scale={0.22}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.body} />
      </mesh>
      <mesh position={[0.55, -0.05, 0.15]} scale={0.22}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.body} />
      </mesh>
      <mesh position={[-0.2, -0.52, 0.2]} scale={[0.2, 0.14, 0.18]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.body} />
      </mesh>
      <mesh position={[0.2, -0.52, 0.2]} scale={[0.2, 0.14, 0.18]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={style.body} />
      </mesh>
    </group>
  );
}

function Eye({
  position,
  sleepy,
}: {
  position: [number, number, number];
  sleepy: boolean;
}) {
  if (sleepy) {
    return (
      <group position={position}>
        <mesh rotation={[0, 0, 0.15]}>
          <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

/** Рот как на PNG: верхний ряд зубов по всей дуге, нижние — по центру */
function GrinMouth() {
  const upperCount = 12;
  const lowerCount = 7;
  const mouthZ = 0.43;

  const upperTeeth = Array.from({ length: upperCount }, (_, i) => {
    const t = i / (upperCount - 1);
    const angle = Math.PI * 0.12 + t * Math.PI * 0.76;
    return {
      x: Math.cos(angle) * 0.24,
      y: Math.sin(angle) * 0.07 + 0.06,
      rotZ: angle - Math.PI / 2,
    };
  });

  const lowerTeeth = Array.from({ length: lowerCount }, (_, i) => {
    const t = i / (lowerCount - 1);
    const angle = Math.PI * 0.38 + t * Math.PI * 0.24;
    return {
      x: Math.cos(angle) * 0.14,
      y: -Math.sin(angle) * 0.05 - 0.1,
      rotZ: angle + Math.PI / 2,
    };
  });

  return (
    <group position={[0, -0.12, mouthZ]}>
      <mesh position={[0, -0.02, -0.01]} scale={[1.05, 0.55, 0.2]}>
        <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2a0810" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.1, 0.02]} scale={[0.85, 0.35, 0.15]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#d45a7a" roughness={0.6} />
      </mesh>
      {upperTeeth.map((t, i) => (
        <mesh
          key={`u-${i}`}
          position={[t.x, t.y, 0.03]}
          rotation={[0, 0, t.rotZ + Math.PI / 2]}
          scale={[0.05, 0.09, 0.025]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
        </mesh>
      ))}
      {lowerTeeth.map((t, i) => (
        <mesh
          key={`l-${i}`}
          position={[t.x, t.y, 0.03]}
          rotation={[0, 0, t.rotZ - Math.PI / 2]}
          scale={[0.045, 0.08, 0.025]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function SimpleMouth({ sleepy }: { sleepy: boolean }) {
  return (
    <mesh position={[0, sleepy ? -0.08 : -0.12, 0.42]} rotation={[sleepy ? 0.1 : 0, 0, 0]}>
      <boxGeometry args={[0.18, 0.03, 0.04]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}
