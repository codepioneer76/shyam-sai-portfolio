'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { concreteTexture, roughnessTexture } from '@/utils/textures';

/**
 * Shared material kit — one instance for the entire facility.
 * Built lazily on first render (it needs `document` for the canvas textures) and
 * reused by every zone, so the renderer compiles each program once.
 */
let KIT: Kit | null = null;

function buildKit() {
    const concrete = concreteTexture(512, 4);
    const rough = roughnessTexture(512, 4);
    const shell = new THREE.MeshStandardMaterial({
      color: 0x0e1116,
      map: concrete,
      roughnessMap: rough,
      roughness: 1,
      metalness: 0.02,
      side: THREE.BackSide,
    });
    const floor = new THREE.MeshStandardMaterial({
      color: 0x0b0d11,
      roughnessMap: roughnessTexture(512, 8),
      roughness: 0.62,
      metalness: 0.22,
    });
    const metal = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.44, metalness: 0.85, roughnessMap: rough });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.8, metalness: 0.5 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.3, metalness: 1 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.95 });
  return { shell, floor, metal, darkMetal, trim, rubber };
}

export type Kit = ReturnType<typeof buildKit>;

export function useKit(): Kit {
  return useMemo(() => {
    if (!KIT) KIT = buildKit();
    return KIT;
  }, []);
}

/** The room shell. Every zone sits inside one of these. */
export function Room({ origin, width = 9, depth = 16 }: { origin: [number, number, number]; width?: number; depth?: number }): JSX.Element {
  const kit = useKit();
  return (
    <group position={origin}>
      <mesh material={kit.shell} position={[0, 1.5, -3]} receiveShadow>
        <boxGeometry args={[width, 4.2, depth]} />
      </mesh>
      <mesh material={kit.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.599, -3]} receiveShadow>
        <planeGeometry args={[width, depth]} />
      </mesh>
    </group>
  );
}

/** Server bays: silhouette and depth, plus the only cold light source in the room. */
export function ServerBays({ origin, count = 6 }: { origin: [number, number, number]; count?: number }): JSX.Element {
  const kit = useKit();
  const leds = useMemo(
    () =>
      Array.from({ length: count * 9 }, (_, i) => ({
        on: Math.random() > 0.35,
        warm: Math.random() > 0.8,
        blink: Math.random() > 0.6 ? 0.4 + Math.random() * 2.2 : 0,
        i,
      })),
    [count],
  );
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child) => {
      const b = child.userData.blink as number | undefined;
      if (b) child.visible = Math.sin(t * b + (child.userData.i as number)) > -0.2;
    });
  });

  return (
    <group position={origin}>
      {Array.from({ length: count }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <mesh key={i} material={kit.darkMetal} position={[side * 3.1, 0.5, -3.2 - Math.floor(i / 2) * 1.9]} castShadow>
            <boxGeometry args={[0.9, 2.2, 0.7]} />
          </mesh>
        );
      })}
      <group ref={group}>
        {leds.map((l) => {
          const rack = Math.floor(l.i / 9);
          const k = l.i % 9;
          const side = rack % 2 === 0 ? -1 : 1;
          return (
            <mesh
              key={l.i}
              position={[side * 3.1 - side * 0.46, 0.1 + k * 0.2, -3.2 - Math.floor(rack / 2) * 1.9 + 0.2]}
              rotation={[0, (-side * Math.PI) / 2, 0]}
              userData={{ blink: l.blink, i: l.i }}
            >
              <planeGeometry args={[0.035, 0.012]} />
              <meshBasicMaterial color={l.on ? (l.warm ? 0xffa95c : 0x35e0a1) : 0x14312a} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Ceiling pipes — horizon lines that give the fog something to describe. */
export function Pipes({ origin }: { origin: [number, number, number] }): JSX.Element {
  const kit = useKit();
  return (
    <group position={origin}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={kit.darkMetal} rotation={[Math.PI / 2, 0, 0]} position={[-1.4 + i * 1.3, 3.05 - i * 0.12, -3]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 15, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** The practical. It drifts a few millimetres so the room never feels frozen. */
export function HangingLamp({ origin }: { origin: [number, number, number] }): JSX.Element {
  const kit = useKit();
  const group = useRef<THREE.Group>(null);
  const bulb = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.z = Math.sin(t * 0.21) * 0.006;
    if (bulb.current) bulb.current.color.setRGB(1, 0.84 + Math.sin(t * 7.3) * 0.01, 0.66);
  });

  return (
    <group ref={group} position={[origin[0], 2.55, origin[2] - 0.15]}>
      <mesh material={kit.rubber} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.9, 6]} />
      </mesh>
      <mesh material={kit.metal}>
        <coneGeometry args={[0.26, 0.26, 20, 1, true]} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshBasicMaterial ref={bulb} color={0xffd9a8} />
      </mesh>
    </group>
  );
}

/** Work table. Used by several chapters as the surface things sit on. */
export function Table({ origin, width = 2.6, depth = 1.5 }: { origin: [number, number, number]; width?: number; depth?: number }): JSX.Element {
  const kit = useKit();
  return (
    <group position={origin}>
      <mesh material={kit.metal} position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.07, depth]} />
      </mesh>
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
        <mesh key={i} material={kit.metal} position={[sx * (width / 2 - 0.1), 0.08, sz * (depth / 2 - 0.1)]} castShadow>
          <boxGeometry args={[0.07, 1.36, 0.07]} />
        </mesh>
      ))}
    </group>
  );
}
