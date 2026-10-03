'use client';
import { useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Detail } from '@/data/types';
import type { CursorState, Shot } from '@/state/store';
import { useExperience } from '@/state/store';
import { inspect, setCursor } from '@/state/actions';
import { audio } from '@/audio/audio';
import { damp } from '@/utils/math';

interface PropProps {
  detail: Detail;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Camera override while this prop is selected. */
  shot?: Shot;
  /** How far the object lifts when hovered. Set 0 for wall-mounted things. */
  lift?: number;
  cursor?: CursorState;
  children: ReactNode;
  onSelect?: () => void;
}

/**
 * Prop — anything in the world that can be inspected.
 *
 * Hover and selection are the same animation at different amplitudes, so a
 * keyboard user cycling with [ and ] sees exactly what a mouse user sees.
 */
export function Prop({
  detail,
  position,
  rotation,
  shot,
  lift = 0.045,
  cursor = 'inspect',
  children,
  onSelect,
}: PropProps): JSX.Element {
  const group = useRef<THREE.Group>(null);
  const selectedId = useExperience((s) => s.detail?.id ?? null);
  const hovered = useRef(false);
  const amount = useRef(0);

  useFrame((state, dt) => {
    if (!group.current) return;
    const active = hovered.current || selectedId === detail.id;
    amount.current = damp(amount.current, active ? 1 : 0, 10, Math.min(dt, 0.05));
    group.current.position.set(position[0], position[1] + amount.current * lift, position[2]);
    group.current.scale.setScalar(1 + amount.current * 0.012);
    group.current.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
      if (!mat) return;
      const apply = (m: THREE.MeshStandardMaterial): void => {
        if (m.emissiveIntensity !== undefined && m.userData.reactive) {
          m.emissiveIntensity = 0.15 + amount.current * 0.85;
        }
      };
      if (Array.isArray(mat)) mat.forEach(apply);
      else apply(mat as THREE.MeshStandardMaterial);
    });
  });

  const onOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    hovered.current = true;
    setCursor(cursor);
    audio.blip(1900, 0.02, 'square', 0.03);
  };
  const onOut = (): void => {
    hovered.current = false;
    setCursor('default');
  };
  const onClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    inspect(detail, shot ?? null);
    onSelect?.();
  };

  return (
    <group ref={group} position={position} rotation={rotation} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {children}
    </group>
  );
}
