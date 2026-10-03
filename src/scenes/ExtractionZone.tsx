'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, Pipes, useKit } from '@/environments/Facility';
import { Prop } from '@/inventory/Prop';
import { profile } from '@/data/profile';
import { contact } from '@/data/contact';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import type { Detail } from '@/data/types';

const channels: Detail[] = [
  { id: 'ex-email', name: 'EMAIL', kicker: 'CHANNEL 01', body: contact.email ?? 'Not yet published. Add it in /src/data/profile.ts and this plaque fills itself in.' },
  { id: 'ex-linkedin', name: 'LINKEDIN', kicker: 'CHANNEL 02', body: contact.linkedin ?? 'Not yet published. Add it in /src/data/profile.ts and this plaque fills itself in.' },
  { id: 'ex-github', name: 'GITHUB', kicker: 'CHANNEL 03', body: contact.github ?? 'Not yet published. Add it in /src/data/profile.ts and this plaque fills itself in.' },
  { id: 'ex-resume', name: 'RESUME', kicker: 'CHANNEL 04', body: contact.resume ?? 'Not yet published. Add it in /src/data/profile.ts and this plaque fills itself in.' },
];

/**
 * CHAPTER 09 — EXTRACTION.
 * The room empties out: no server bays, no practical, one cold rectangle of
 * light at the end of the corridor. Contact lives on the door, not in a footer.
 */
export function ExtractionZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(channels, active);
  const [ox, , oz] = origin;
  const glow = useRef<THREE.PointLight>(null);
  const door = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glow.current) glow.current.intensity = 42 + Math.sin(t * 0.7) * 3;
    if (door.current) door.current.opacity = 0.9 + Math.sin(t * 1.3) * 0.05;
  });

  return (
    <group>
      <Room origin={origin} depth={18} width={6} />
      <Pipes origin={origin} />

      {/* Doorway */}
      <mesh material={kit.darkMetal} position={[ox, 1.1, oz - 5.2]} castShadow>
        <boxGeometry args={[3.2, 3.4, 0.3]} />
      </mesh>
      <mesh position={[ox, 0.85, oz - 5.03]}>
        <planeGeometry args={[1.25, 2.5]} />
        <meshBasicMaterial ref={door} color={0xdfeaff} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={glow} position={[ox, 1.0, oz - 4.6]} intensity={42} distance={11} decay={1.7} color={0xdfeaff} />

      {/* Contact plaques, bolted either side of the door */}
      {channels.map((ch, i) => {
        const side = i < 2 ? -1 : 1;
        const row = i % 2;
        return (
          <Prop
            key={ch.id}
            detail={ch}
            position={[ox + side * 1.15, 1.35 - row * 0.62, oz - 5.0]}
            cursor="read"
            lift={0}
            shot={{ pos: [ox + side * 0.6, 1.35 - row * 0.62, oz - 3.6], look: [ox + side * 1.15, 1.35 - row * 0.62, oz - 5.0] }}
          >
            <mesh material={kit.metal} castShadow>
              <boxGeometry args={[0.72, 0.4, 0.06]} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[0.64, 0.32]} />
              <meshStandardMaterial
                color={0x0d1216}
                emissive={0x35e0a1}
                emissiveIntensity={0.2}
                userData={{ reactive: true }}
              />
            </mesh>
          </Prop>
        );
      })}

      {/* Threshold plate */}
      <mesh material={kit.metal} position={[ox, -0.56, oz - 4.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.0]} />
      </mesh>
    </group>
  );
}
