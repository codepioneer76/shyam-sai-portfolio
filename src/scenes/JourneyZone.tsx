'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, Pipes, useKit } from '@/environments/Facility';
import { Prop } from '@/inventory/Prop';
import { journey } from '@/data/journey';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { useExperience } from '@/state/store';

/**
 * CHAPTER 06 — THE JOURNEY.
 * A corridor of fourteen markers receding into fog. Lights come up in sequence
 * from the near end, so progression is read as depth rather than as a timeline.
 */
export function JourneyZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(journey, active);
  const [ox, , oz] = origin;
  const phase = useExperience((s) => s.phase);
  const lights = useRef<(THREE.PointLight | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    lights.current.forEach((l, i) => {
      if (!l) return;
      const wave = phase === 'boot' ? 0 : Math.max(0, Math.sin(t * 0.35 - i * 0.42) * 0.5 + 0.5);
      l.intensity = 1.6 + wave * 11;
    });
  });

  return (
    <group>
      <Room origin={origin} depth={22} width={5} />
      <Pipes origin={origin} />

      {journey.map((j, i) => {
        const z = oz + 1.2 - i * 1.05;
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <group key={j.id}>
            <Prop
              detail={j}
              position={[ox + side * 1.5, 0.35, z]}
              rotation={[0, side * -0.5, 0]}
              cursor="read"
              lift={0.03}
              shot={{ pos: [ox + side * 0.7, 1.1, z + 1.1], look: [ox + side * 1.5, 0.6, z] }}
            >
              <mesh material={kit.metal} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.9, 0.16]} />
              </mesh>
              <mesh position={[0, 0.18, 0.085]}>
                <planeGeometry args={[0.38, 0.3]} />
                <meshStandardMaterial
                  color={0x0d1a16}
                  emissive={i < 9 ? 0x35e0a1 : 0xffa95c}
                  emissiveIntensity={0.25}
                  userData={{ reactive: true }}
                />
              </mesh>
            </Prop>
            <pointLight
              ref={(el) => {
                lights.current[i] = el;
              }}
              position={[ox + side * 1.2, 1.5, z]}
              intensity={0}
              distance={3.4}
              decay={2}
              color={i < 9 ? 0x9fe8c8 : 0xffc089}
            />
          </group>
        );
      })}
    </group>
  );
}
