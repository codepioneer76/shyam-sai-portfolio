'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useKit } from '@/environments/Facility';
import { rng, range } from '@/utils/random';

/**
 * Clutter — the set dressing that turns a lit box into a place.
 *
 * A survival-horror frame reads as space because of three distances: something
 * close and dark at the edge of frame, the subject in the pool of light, and
 * shapes receding into fog behind it. This module supplies the first and third.
 *
 * Everything is instanced or shares the facility material kit, so the entire
 * dressing pass for a zone costs a handful of draw calls.
 */

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10);

interface ZoneProps {
  origin: [number, number, number];
  seed: number;
}

/** Midground and background: crates, shelving, drums, wall vents, floor grates. */
export function Dressing({ origin, seed }: ZoneProps): JSX.Element {
  const kit = useKit();
  const [ox, , oz] = origin;

  const crates = useMemo(() => {
    const r = rng(seed * 977 + 13);
    return Array.from({ length: 14 }, () => {
      const side = r() > 0.5 ? 1 : -1;
      const w = range(r, 0.45, 0.9);
      return {
        pos: [ox + side * range(r, 2.1, 3.6), -0.6 + w / 2, oz + range(r, -7.5, 2.2)] as [number, number, number],
        scale: [w, w * range(r, 0.6, 1.05), w * range(r, 0.8, 1.2)] as [number, number, number],
        rot: range(r, -0.5, 0.5),
        stacked: r() > 0.68,
      };
    });
  }, [ox, oz, seed]);

  const drums = useMemo(() => {
    const r = rng(seed * 311 + 7);
    return Array.from({ length: 5 }, () => ({
      pos: [ox + (r() > 0.5 ? 1 : -1) * range(r, 2.4, 3.7), -0.6 + 0.42, oz + range(r, -8, 1.5)] as [number, number, number],
      tilt: range(r, -0.05, 0.05),
    }));
  }, [ox, oz, seed]);

  const debris = useMemo(() => {
    const r = rng(seed * 613 + 3);
    return Array.from({ length: 22 }, () => ({
      pos: [ox + range(r, -3.4, 3.4), -0.594, oz + range(r, -8, 2.6)] as [number, number, number],
      scale: range(r, 0.04, 0.16),
      rot: range(r, 0, Math.PI),
    }));
  }, [ox, oz, seed]);

  // Crates and debris are instanced: one draw call each, whatever the count.
  const crateRef = useRef<THREE.InstancedMesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();

    if (crateRef.current) {
      crates.forEach((c, i) => {
        q.setFromEuler(new THREE.Euler(0, c.rot, 0));
        v.set(c.pos[0], c.pos[1], c.pos[2]);
        sc.set(c.scale[0], c.scale[1], c.scale[2]);
        crateRef.current!.setMatrixAt(i, m.compose(v, q, sc));
      });
      crates.forEach((c, i) => {
        // stacked second box, or a degenerate scale when this crate is unstacked
        const idx = crates.length + i;
        q.setFromEuler(new THREE.Euler(0, c.rot + 0.3, 0));
        v.set(c.pos[0], c.pos[1] + c.scale[1] * 0.86, c.pos[2]);
        sc.set(c.scale[0] * 0.82, c.scale[1] * 0.72, c.scale[2] * 0.82);
        if (!c.stacked) sc.set(0, 0, 0);
        crateRef.current!.setMatrixAt(idx, m.compose(v, q, sc));
      });
      crateRef.current.instanceMatrix.needsUpdate = true;
    }

    if (debrisRef.current) {
      debris.forEach((d, i) => {
        q.setFromEuler(new THREE.Euler(0, d.rot, 0));
        v.set(d.pos[0], d.pos[1], d.pos[2]);
        sc.set(d.scale, d.scale * 0.22, d.scale * 0.7);
        debrisRef.current!.setMatrixAt(i, m.compose(v, q, sc));
      });
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [crates, debris]);

  return (
    <group>
      <instancedMesh
        ref={crateRef}
        args={[boxGeo, kit.darkMetal, crates.length * 2]}
        castShadow
        receiveShadow
        frustumCulled={false}
      />

      {/* Drums */}
      {drums.map((d, i) => (
        <mesh
          key={`d${i}`}
          geometry={cylGeo}
          material={kit.metal}
          position={d.pos}
          rotation={[d.tilt, 0, 0]}
          scale={[0.28, 0.84, 0.28]}
          castShadow
          receiveShadow
        />
      ))}

      {/* Floor debris — small, dark, only visible where light lands */}
      <instancedMesh ref={debrisRef} args={[boxGeo, kit.rubber, debris.length]} receiveShadow frustumCulled={false} />

      {/* Wall vents and conduit — flat detail that gives the walls scale */}
      {[-1, 1].map((side) => (
        <group key={`w${side}`}>
          <mesh material={kit.darkMetal} position={[side * 4.42, 1.65, oz - 2.6]} rotation={[0, (-side * Math.PI) / 2, 0]} castShadow>
            <boxGeometry args={[1.1, 0.6, 0.1]} />
          </mesh>
          <mesh material={kit.metal} position={[side * 4.4, 0.6, oz - 5.2]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <boxGeometry args={[0.08, 2.4, 0.08]} />
          </mesh>
          <mesh material={kit.metal} position={[side * 4.36, 2.2, oz + 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 13, 8]} />
          </mesh>
        </group>
      ))}

      {/* Floor grate: a strip of hard shadow the practical can rake across */}
      <mesh material={kit.trim} position={[ox, -0.586, oz - 3.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 2.2]} />
      </mesh>
    </group>
  );
}

/**
 * Foreground — dark shapes near the lens.
 * Never lit, never interactive, deliberately out of the play area. They exist
 * purely so the frame has something in front of the subject.
 */
export function Foreground({ origin, seed }: ZoneProps): JSX.Element {
  const kit = useKit();
  const [ox, , oz] = origin;
  const cable = useRef<THREE.Mesh>(null);
  const r = useMemo(() => rng(seed * 101 + 29), [seed]);
  const offsets = useMemo(() => ({ x: range(r, 1.4, 2.2), z: range(r, 3.4, 4.4) }), [r]);

  useFrame((state) => {
    // The hanging cable sways barely enough to notice. That is the point.
    if (cable.current) cable.current.rotation.z = 0.06 + Math.sin(state.clock.elapsedTime * 0.37) * 0.012;
  });

  return (
    <group>
      {/* Pipe crossing the top of frame */}
      <mesh material={kit.darkMetal} position={[ox, 2.45, oz + offsets.z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 9, 10]} />
      </mesh>
      {/* Column at the edge of frame */}
      <mesh material={kit.darkMetal} position={[ox - offsets.x, 1.1, oz + offsets.z - 0.4]} castShadow>
        <boxGeometry args={[0.34, 3.6, 0.34]} />
      </mesh>
      {/* Slack cable hanging into the shot */}
      <mesh ref={cable} material={kit.rubber} position={[ox + offsets.x * 0.9, 1.75, oz + offsets.z - 0.2]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.016, 0.016, 2.2, 6]} />
      </mesh>
    </group>
  );
}

/**
 * Background monitors — dead screens with one still refreshing.
 * Emissive above the bloom threshold, so they read as the only light sources
 * back there rather than as grey rectangles.
 */
export function DeadScreens({ origin, seed }: ZoneProps): JSX.Element {
  const kit = useKit();
  const [ox, , oz] = origin;
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  const screens = useMemo(() => {
    const r = rng(seed * 71 + 17);
    return Array.from({ length: 4 }, (_, i) => ({
      pos: [ox + range(r, -3.2, 3.2), range(r, 0.9, 1.9), oz - range(r, 4.5, 7.6)] as [number, number, number],
      yaw: range(r, -0.6, 0.6),
      alive: i === 0 || r() > 0.65,
      rate: range(r, 0.6, 3.4),
    }));
  }, [ox, oz, seed]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    screens.forEach((s, i) => {
      const m = mats.current[i];
      if (!m) return;
      // Alive screens breathe; dead ones occasionally cough a frame of signal.
      m.emissiveIntensity = s.alive
        ? 1.4 + Math.sin(t * s.rate) * 0.25
        : Math.max(0, Math.sin(t * 0.21 + i) - 0.992) * 260;
    });
  });

  return (
    <group>
      {screens.map((s, i) => (
        <group key={i} position={s.pos} rotation={[0, s.yaw, 0]}>
          <mesh material={kit.darkMetal} castShadow>
            <boxGeometry args={[0.62, 0.46, 0.1]} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <planeGeometry args={[0.54, 0.38]} />
            <meshStandardMaterial
              ref={(el) => {
                mats.current[i] = el;
              }}
              color={0x04100c}
              emissive={s.alive ? 0x2fd39a : 0x9fd8ff}
              emissiveIntensity={0}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A failing wall light. One per zone, deep in the background, slow and irregular. */
export function EmergencyLamp({ origin, seed }: ZoneProps): JSX.Element {
  const kit = useKit();
  const [ox, , oz] = origin;
  const light = useRef<THREE.PointLight>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const side = seed % 2 === 0 ? -1 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Two out-of-phase sines plus a hard cut: reads as a failing ballast, not a strobe.
    const f = Math.max(0, Math.sin(t * 1.7) * 0.5 + 0.5) * (Math.sin(t * 11.3) > -0.7 ? 1 : 0.15);
    if (light.current) light.current.intensity = 2 + f * 7;
    if (mat.current) mat.current.opacity = 0.35 + f * 0.65;
  });

  return (
    <group position={[ox + side * 4.2, 2.35, oz - 6.2]}>
      <mesh material={kit.darkMetal} castShadow>
        <boxGeometry args={[0.16, 0.26, 0.5]} />
      </mesh>
      <mesh position={[-side * 0.09, 0, 0]} rotation={[0, (-side * Math.PI) / 2, 0]}>
        <planeGeometry args={[0.4, 0.18]} />
        <meshBasicMaterial ref={mat} color={0xff8a4a} transparent opacity={0.5} />
      </mesh>
      <pointLight ref={light} intensity={0} distance={6} decay={2} color={0xff8a4a} />
    </group>
  );
}
