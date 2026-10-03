'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Prop } from '@/inventory/Prop';
import { Room, ServerBays, Pipes, HangingLamp, Table, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { panelTexture } from '@/utils/textures';
import { profile } from '@/data/profile';
import type { Detail } from '@/data/types';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { setOverlay } from '@/state/actions';

const details: Detail[] = [
  {
    id: 'subject-identity',
    name: profile.name,
    kicker: 'PERSONNEL RECORD',
    body: `${profile.classification}. ${profile.positioning} ${profile.degree} at ${profile.institution}, ${profile.years}.`,
    facts: [
      { label: 'CLASSIFICATION', value: profile.classification },
      { label: 'INSTITUTION', value: profile.institution },
      { label: 'PERIOD', value: profile.years },
      { label: 'LOCATION', value: profile.location },
      { label: 'STATUS', value: profile.status },
    ],
  },
  {
    id: 'subject-focus',
    name: 'CURRENT DIRECTION',
    kicker: 'RESEARCH VECTOR',
    body: profile.focus.join(' · '),
    facts: profile.narrative.map((n, i) => ({ label: `STAGE ${i + 1}`, value: n })),
  },
  {
    id: 'subject-map',
    name: 'FACILITY MAP',
    kicker: 'NAVIGATION',
    body: 'Nine zones, one corridor. Open the map to move between them directly.',
  },
];

/** CHAPTER 01 — SUBJECT. Identity is discovered on a terminal, not announced in a hero. */
export function SubjectZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(details, active);

  const screen = useMemo(
    () =>
      panelTexture(
        'subject',
        [
          `NAME        ${profile.name}`,
          `CLASS       ${profile.classification}`,
          `PROGRAMME   B.TECH CSE`,
          `PERIOD      ${profile.years}`,
          `STATUS      ${profile.status}`,
          '',
          'ACCESS      GRANTED',
        ],
        { heading: 'PERSONNEL // 001' },
      ),
    [],
  );

  const [ox, , oz] = origin;

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={4} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />
      <Table origin={[ox, 0, oz]} />

      {/* Terminal: the identity record */}
      <Prop
        detail={details[0]}
        position={[ox - 0.35, 0.8, oz - 0.15]}
        rotation={[0, 0.22, 0]}
        cursor="read"
        lift={0.02}
        shot={{ pos: [ox - 0.35, 1.28, oz + 1.15], look: [ox - 0.35, 1.05, oz - 0.15] }}
      >
        <mesh material={kit.darkMetal} position={[0, 0.24, -0.06]} castShadow>
          <boxGeometry args={[0.86, 0.56, 0.12]} />
        </mesh>
        <mesh position={[0, 0.25, 0.008]}>
          <planeGeometry args={[0.78, 0.48]} />
          <meshStandardMaterial
            map={screen}
            emissiveMap={screen}
            emissive={0xffffff}
            emissiveIntensity={2.4}
            toneMapped
            userData={{ reactive: true }}
          />
        </mesh>
        <mesh material={kit.metal} position={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.22]} />
        </mesh>
      </Prop>

      {/* Direction card, pinned to the table */}
      <Prop
        detail={details[1]}
        position={[ox + 0.72, 0.8, oz + 0.28]}
        rotation={[-Math.PI / 2, 0, -0.18]}
        cursor="read"
        lift={0.03}
      >
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.42, 0.3]} />
          <meshStandardMaterial color={0xc7bfae} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </Prop>

      {/* Physical facility map — opens the navigation overlay */}
      <Prop
        detail={details[2]}
        position={[ox - 1.0, 0.8, oz + 0.34]}
        rotation={[-Math.PI / 2, 0, 0.1]}
        cursor="navigate"
        lift={0.03}
        onSelect={() => setOverlay('map')}
      >
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.56, 0.4]} />
          <meshStandardMaterial color={0x9aa08d} roughness={0.98} side={THREE.DoubleSide} />
        </mesh>
      </Prop>
    </group>
  );
}
