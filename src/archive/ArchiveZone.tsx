'use client';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, ServerBays, Pipes, HangingLamp, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { panelTexture } from '@/utils/textures';
import { Prop } from '@/inventory/Prop';
import { credentials } from '@/data/archive';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { audio } from '@/audio/audio';
import { setCursor } from '@/state/actions';
import { damp } from '@/utils/math';

const DRAWERS = [0, 1, 2, 3];

/**
 * CHAPTER 07 — THE ARCHIVE.
 * Four drawers in a steel cabinet. A drawer slides on a damped curve and its
 * records stand up inside it; nothing is a card wall.
 */
export function ArchiveZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(credentials, active);
  const [ox, , oz] = origin;
  const [open, setOpen] = useState<number | null>(0);
  const groups = useRef<(THREE.Group | null)[]>([]);

  const faces = useMemo(
    () =>
      DRAWERS.map((d) =>
        panelTexture(
          `drawer:${d}`,
          [credentials.filter((c) => c.drawer === d).map((c) => c.issuer).join(' · ')],
          { heading: `DRAWER ${String.fromCharCode(65 + d)}`, w: 512, h: 128 },
        ),
      ),
    [],
  );

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    groups.current.forEach((g, i) => {
      if (!g) return;
      g.position.z = damp(g.position.z, open === i ? 0.52 : 0, 7, step);
    });
  });

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={2} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />

      {/* Cabinet */}
      <mesh material={kit.darkMetal} position={[ox, 0.62, oz - 0.9]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.4, 0.8]} />
      </mesh>

      {DRAWERS.map((d) => {
        const y = 1.52 - d * 0.55;
        const records = credentials.filter((c) => c.drawer === d);
        return (
          <group
            key={d}
            ref={(el) => {
              groups.current[d] = el;
            }}
            position={[ox, y, oz - 0.52]}
          >
            <mesh
              material={kit.metal}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open === d ? null : d);
                audio.clack();
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setCursor('open');
              }}
              onPointerOut={() => setCursor('default')}
            >
              <boxGeometry args={[2.0, 0.5, 0.7]} />
            </mesh>
            <mesh position={[0, 0, 0.353]}>
              <planeGeometry args={[1.8, 0.4]} />
              <meshStandardMaterial map={faces[d]} emissiveMap={faces[d]} emissive={0xffffff} emissiveIntensity={1.2} />
            </mesh>
            <mesh material={kit.trim} position={[0, -0.16, 0.37]}>
              <boxGeometry args={[0.5, 0.04, 0.05]} />
            </mesh>

            {/* Records standing in the drawer */}
            {records.map((c, i) => (
              <Prop
                key={c.id}
                detail={c}
                position={[-0.68 + i * 0.46, 0.3, -0.02]}
                rotation={[-0.22, 0, 0]}
                cursor="read"
                lift={0.04}
                shot={{ pos: [ox - 0.68 + i * 0.46, y + 0.6, oz + 0.6], look: [ox - 0.68 + i * 0.46, y + 0.25, oz - 0.5] }}
              >
                <mesh castShadow receiveShadow>
                  <planeGeometry args={[0.4, 0.5]} />
                  <meshStandardMaterial color={0xc7bfae} roughness={0.96} side={THREE.DoubleSide} />
                </mesh>
              </Prop>
            ))}
          </group>
        );
      })}
    </group>
  );
}
