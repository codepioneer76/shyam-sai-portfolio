'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, ServerBays, Pipes, HangingLamp, Table, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { panelTexture } from '@/utils/textures';
import { Prop } from '@/inventory/Prop';
import { systemNotes } from '@/data/systemNotes';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { checkpoint, setCursor, setOverlay } from '@/state/actions';
import { audio } from '@/audio/audio';
import { damp } from '@/utils/math';

/**
 * CHAPTER 08 — THE SYSTEM.
 * Engineering positions on a panel wall, the archive terminal (grounded RAG),
 * and the mechanical logger: an original save-point machine, not a copy of one.
 */
export function SystemZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(systemNotes, active);
  const [ox, , oz] = origin;

  const plates = useMemo(
    () => systemNotes.map((s) => panelTexture(`sys:${s.id}`, [s.kicker], { heading: s.name.split(' ')[0], w: 512, h: 128 })),
    [],
  );
  const terminal = useMemo(
    () =>
      panelTexture(
        'ask-terminal',
        ['ASK THE SYSTEM', '', 'Queries are answered only from', 'indexed portfolio records.', '', '> _'],
        { heading: 'ARCHIVE TERMINAL' },
      ),
    [],
  );

  const keys = useRef<THREE.Group>(null);
  const strike = useRef(0);

  useFrame((state, dt) => {
    // Typebar idles; it strikes when the logger is used.
    if (keys.current) {
      strike.current = damp(strike.current, 0, 6, Math.min(dt, 0.05));
      keys.current.rotation.x = -strike.current * 0.5 + Math.sin(state.clock.elapsedTime * 0.6) * 0.004;
    }
  });

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={4} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />
      <Table origin={[ox + 1.5, 0, oz - 0.2]} width={1.4} depth={1.0} />

      {/* Position panels */}
      {systemNotes.map((s, i) => (
        <Prop
          key={s.id}
          detail={s}
          position={[ox - 1.6 + (i % 3) * 1.1, 1.72 - Math.floor(i / 3) * 0.62, oz - 2.0]}
          cursor="read"
          lift={0}
          shot={{
            pos: [ox - 1.6 + (i % 3) * 1.1, 1.72 - Math.floor(i / 3) * 0.62, oz - 0.6],
            look: [ox - 1.6 + (i % 3) * 1.1, 1.72 - Math.floor(i / 3) * 0.62, oz - 2.0],
          }}
        >
          <mesh material={kit.darkMetal} castShadow>
            <boxGeometry args={[1.0, 0.52, 0.08]} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.92, 0.44]} />
            <meshStandardMaterial
              map={plates[i]}
              emissiveMap={plates[i]}
              emissive={0xffffff}
              emissiveIntensity={0.9}
              userData={{ reactive: true }}
            />
          </mesh>
        </Prop>
      ))}

      {/* Archive terminal — opens the grounded query interface */}
      <group
        position={[ox - 1.4, 1.1, oz - 0.4]}
        rotation={[0, 0.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setOverlay('ask');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setCursor('interact');
        }}
        onPointerOut={() => setCursor('default')}
      >
        <mesh material={kit.darkMetal} castShadow>
          <boxGeometry args={[1.0, 0.72, 0.14]} />
        </mesh>
        <mesh position={[0, 0, 0.075]}>
          <planeGeometry args={[0.9, 0.62]} />
          <meshStandardMaterial map={terminal} emissiveMap={terminal} emissive={0xffffff} emissiveIntensity={2.6} />
        </mesh>
        <mesh material={kit.metal} position={[0, -0.44, 0]} castShadow>
          <boxGeometry args={[0.36, 0.16, 0.3]} />
        </mesh>
      </group>

      {/* Mechanical logger — the save point */}
      <group
        position={[ox + 1.5, 0.83, oz - 0.2]}
        onClick={(e) => {
          e.stopPropagation();
          strike.current = 1;
          checkpoint('PROGRESS LOGGED — ARCHIVE UPDATED');
          audio.typeKey();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setCursor('interact');
        }}
        onPointerOut={() => setCursor('default')}
      >
        <mesh material={kit.metal} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.12, 0.36]} />
        </mesh>
        <group ref={keys} position={[0, 0.06, 0.02]}>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} material={kit.trim} position={[-0.2 + (i % 6) * 0.08, 0.02 + Math.floor(i / 6) * 0.02, 0.08 - Math.floor(i / 6) * 0.07]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 10]} />
            </mesh>
          ))}
        </group>
        <mesh material={kit.darkMetal} position={[0, 0.16, -0.12]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.44, 0.2, 0.03]} />
        </mesh>
        <mesh position={[0, 0.2, -0.11]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshBasicMaterial color={0xe9e2d2} />
        </mesh>
      </group>
    </group>
  );
}
