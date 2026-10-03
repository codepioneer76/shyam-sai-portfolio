'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { chapterByIndex } from '@/data/chapters';
import { useExperience } from '@/state/store';
import { damp } from '@/utils/math';

const UP = new THREE.Vector3(0, 0.35, 0);

/**
 * LightingRig — one travelling rig for the whole facility.
 *
 * A single shadow-casting spot (the practical), a warm/cold rim pair, and a
 * cursor inspection light. Everything else in the world is emissive geometry.
 * Moving one rig instead of lighting nine rooms keeps the shadow cost flat.
 */
export function LightingRig({ shadows, shadowMapSize }: { shadows: boolean; shadowMapSize: number }): JSX.Element {
  const { scene, camera } = useThree();
  const chapter = useExperience((s) => s.chapter);
  const phase = useExperience((s) => s.phase);
  const lowEffects = useExperience((s) => s.lowEffects);
  const caseOpen = useExperience((s) => s.caseOpen);

  const key = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const rimA = useRef<THREE.PointLight>(null);
  const rimB = useRef<THREE.PointLight>(null);
  const cursor = useRef<THREE.PointLight>(null);
  const amb = useRef<THREE.HemisphereLight>(null);
  const flicker = useRef(0);
  const ray = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.9));
  const hit = useRef(new THREE.Vector3());
  // Scratch objects: a 60fps loop should not allocate.
  const scratchColor = useRef(new THREE.Color());
  const scratchVec = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const c = chapterByIndex(chapter);
    const step = Math.min(dt, 0.05);
    const lit = phase !== 'boot';
    // Standby: not black. One failing practical and the rim glow are already on,
    // so the boot text sits over a room the visitor can just about make out.
    const standby = 0.06;
    const [ox, , oz] = c.origin;

    // fog follows the room
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = damp(scene.fog.density, lit ? c.mood.fog : 0.095, 1.4, step);
    }

    if (key.current && target.current) {
      key.current.position.set(ox, 2.45, oz - 0.15);
      target.current.position.set(ox, 0.75, oz + 0.05);
      // Ballast flicker only in the first seconds after power-up. It is a beat, not a loop.
      // Ballast flicker on power-up, then an occasional stutter so the room never settles fully.
      const t = state.clock.elapsedTime;
      flicker.current =
        phase === 'entering'
          ? Math.sin(t * 37) * c.mood.intensity * 0.16
          : Math.max(0, Math.sin(t * 0.31) - 0.985) * -c.mood.intensity * 14;
      key.current.intensity = damp(key.current.intensity, lit ? c.mood.intensity + flicker.current : c.mood.intensity * standby, 1.6, step);
      key.current.color.lerp(scratchColor.current.setHex(c.mood.key), 0.05);
    }
    if (rimA.current) {
      rimA.current.position.set(ox - 2.4, 1.4, oz - 2.2);
      rimA.current.intensity = damp(rimA.current.intensity, lit ? 14 : 2.2, 1.4, step);
      rimA.current.color.lerp(scratchColor.current.setHex(c.mood.rim), 0.05);
    }
    if (rimB.current) {
      rimB.current.position.set(ox + 2.6, 1.9, oz - 3.4);
      rimB.current.intensity = damp(rimB.current.intensity, lit ? 9 : 1.4, 1.4, step);
    }
    if (amb.current) amb.current.intensity = damp(amb.current.intensity, lit ? 0.42 : 0.06, 1.4, step);

    // Cursor inspection light: a soft pool that follows the pointer across the floor plane.
    if (cursor.current) {
      const wanted = lowEffects || !lit ? 0 : caseOpen ? 3.5 : 6.5;
      cursor.current.intensity = damp(cursor.current.intensity, wanted, 4, step);
      if (wanted > 0.01) {
        ray.current.setFromCamera(state.pointer, camera);
        plane.current.constant = -(caseOpen ? 0.95 : 0.9);
        if (ray.current.ray.intersectPlane(plane.current, hit.current)) {
          scratchVec.current.copy(hit.current).add(UP);
          cursor.current.position.lerp(scratchVec.current, 0.12);
        }
      }
    }
  });

  return (
    <>
      <hemisphereLight ref={amb} args={[0x223040, 0x05070a, 0]} />
      <spotLight
        ref={key}
        intensity={0}
        distance={13}
        angle={Math.PI * 0.3}
        penumbra={0.55}
        decay={1.4}
        castShadow={shadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.0012}
        shadow-camera-near={0.4}
        shadow-camera-far={8}
      />
      <object3D ref={target} />
      <pointLight ref={rimA} intensity={0} distance={9} decay={2} color={0x5fe8c0} />
      <pointLight ref={rimB} intensity={0} distance={10} decay={2} color={0x3e7ca8} />
      <pointLight ref={cursor} intensity={0} distance={2.6} decay={2.2} color={0xffe0bb} />
    </>
  );
}
