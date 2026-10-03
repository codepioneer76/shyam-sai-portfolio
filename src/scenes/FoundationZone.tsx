'use client';
import { useMemo } from 'react';
import { Prop } from '@/inventory/Prop';
import { Room, ServerBays, Pipes, HangingLamp, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { panelTexture } from '@/utils/textures';
import { foundation } from '@/data/foundation';
import { useChapterDetails } from '@/hooks/useChapterDetails';

/** CHAPTER 02 — FOUNDATION. Five core modules seated in a rack. */
export function FoundationZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(foundation, active);
  const [ox, , oz] = origin;

  const plates = useMemo(
    () =>
      foundation.map((f) =>
        panelTexture(`found:${f.id}`, [f.kicker], { heading: f.name.split(' ')[0], w: 512, h: 128 }),
      ),
    [],
  );

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={2} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />

      {/* Rack chassis */}
      <mesh material={kit.darkMetal} position={[ox, 0.85, oz - 0.6]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 2.0, 0.62]} />
      </mesh>
      <mesh material={kit.metal} position={[ox, -0.5, oz - 0.6]} castShadow>
        <boxGeometry args={[2.4, 0.2, 0.7]} />
      </mesh>

      {foundation.map((f, i) => (
        <Prop
          key={f.id}
          detail={f}
          position={[ox, 1.62 - i * 0.34, oz - 0.28]}
          cursor="inspect"
          lift={0}
          shot={{ pos: [ox, 1.62 - i * 0.34 + 0.1, oz + 1.5], look: [ox, 1.62 - i * 0.34, oz - 0.3] }}
        >
          {/* Module body slides slightly proud of the rack when active */}
          <mesh material={kit.metal} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.28, 0.5]} />
          </mesh>
          <mesh position={[0, 0, 0.252]}>
            <planeGeometry args={[1.86, 0.22]} />
            <meshStandardMaterial
              map={plates[i]}
              emissiveMap={plates[i]}
              emissive={0xffffff}
              emissiveIntensity={0.8}
              userData={{ reactive: true }}
            />
          </mesh>
        </Prop>
      ))}
    </group>
  );
}
