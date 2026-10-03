'use client';
import { useMemo, useRef } from 'react';
import { Physics, RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { setCursor } from '@/state/actions';
import { audio } from '@/audio/audio';

/**
 * ScatteredPapers — the one place rigid-body simulation earns its cost.
 *
 * The case lid and the archive drawers are authored curves on purpose: a solved
 * hinge behaves differently every run, which reads as instability rather than
 * weight. Loose paper is the opposite case — it should never land the same way
 * twice, and nudging a sheet across a steel table is only convincing if mass,
 * friction and angular damping are actually solved.
 *
 * The simulation is mounted with its zone and paused the moment the chapter is
 * not the active one, so it costs nothing anywhere else in the facility.
 */
export function ScatteredPapers({
  origin,
  active,
  count = 5,
}: {
  origin: [number, number, number];
  active: boolean;
  count?: number;
}): JSX.Element {
  const [ox, , oz] = origin;

  const sheets = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        pos: [ox - 0.9 + Math.random() * 1.8, 0.92 + i * 0.012, oz - 0.45 + Math.random() * 0.4] as [number, number, number],
        rot: [-Math.PI / 2 + (Math.random() - 0.5) * 0.08, 0, Math.random() * Math.PI] as [number, number, number],
        tone: 0.78 + Math.random() * 0.16,
      })),
    [count, ox, oz],
  );

  return (
    <Physics gravity={[0, -9.81, 0]} paused={!active} timeStep="vary">
      {/* The table top the sheets rest on, and a lip so nothing slides to the floor. */}
      <RigidBody type="fixed" colliders={false} position={[ox, 0, oz]}>
        <CuboidCollider args={[1.5, 0.035, 0.85]} position={[0, 0.795, 0]} friction={0.9} />
        <CuboidCollider args={[1.5, 0.06, 0.02]} position={[0, 0.86, 0.86]} />
        <CuboidCollider args={[1.5, 0.06, 0.02]} position={[0, 0.86, -0.86]} />
        <CuboidCollider args={[0.02, 0.06, 0.86]} position={[1.51, 0.86, 0]} />
        <CuboidCollider args={[0.02, 0.06, 0.86]} position={[-1.51, 0.86, 0]} />
      </RigidBody>

      {sheets.map((s) => (
        <Sheet key={s.key} position={s.pos} rotation={s.rot} tone={s.tone} />
      ))}
    </Physics>
  );
}

function Sheet({
  position,
  rotation,
  tone,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  tone: number;
}): JSX.Element {
  const body = useRef<RapierRigidBody>(null);
  const colour = useMemo(() => new THREE.Color(tone, tone * 0.97, tone * 0.88), [tone]);

  /** Paper is light, drags hard and stops fast — high damping, low restitution. */
  return (
    <RigidBody
      ref={body}
      position={position}
      rotation={rotation}
      colliders={false}
      mass={0.012}
      friction={0.85}
      restitution={0.02}
      linearDamping={1.8}
      angularDamping={3.2}
    >
      <CuboidCollider args={[0.105, 0.0012, 0.148]} />
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setCursor('interact');
        }}
        onPointerOut={() => setCursor('default')}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // A flick, not a launch: enough to slide and rotate, not to fly.
          body.current?.applyImpulse({ x: (Math.random() - 0.5) * 0.004, y: 0.0016, z: (Math.random() - 0.5) * 0.004 }, true);
          body.current?.applyTorqueImpulse({ x: 0, y: (Math.random() - 0.5) * 0.00015, z: 0 }, true);
          audio.blip(2600, 0.05, 'triangle', 0.03);
        }}
      >
        <boxGeometry args={[0.21, 0.0024, 0.296]} />
        <meshStandardMaterial color={colour} roughness={0.97} metalness={0} />
      </mesh>
    </RigidBody>
  );
}
