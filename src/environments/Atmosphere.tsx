'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/state/store';
import { chapterByIndex } from '@/data/chapters';
import { damp } from '@/utils/math';

interface Props {
  count: number;
}

/**
 * Dust — one GPU draw call for the entire facility.
 * Particles are lit only where they are near the practical light, which is what
 * makes the beam read as volume instead of as a sprite haze.
 */
export function Dust({ count }: Props): JSX.Element {
  const chapter = useExperience((s) => s.chapter);
  const phase = useExperience((s) => s.phase);
  const lowEffects = useExperience((s) => s.lowEffects);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3.6 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seed[i] = Math.random() * 6.28;
      scale[i] = Math.random() * 0.6 + 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPix: { value: typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 0 },
      uLamp: { value: new THREE.Vector3(0, 2.45, 0) },
    }),
    [],
  );

  useFrame((state, dt) => {
    const c = chapterByIndex(chapter);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uLamp.value.set(c.origin[0], 2.45, c.origin[2] - 0.15);
    const target = phase === 'boot' ? 0.35 : lowEffects ? 0.45 : 0.95;
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, target, 1.2, Math.min(dt, 0.05));
    if (groupRef.current) groupRef.current.position.z = c.origin[2];
  });

  return (
    <points ref={groupRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aSeed, aScale;
          uniform float uTime, uPix;
          uniform vec3 uLamp;
          varying float vGlow;
          void main(){
            vec3 p = position;
            p.x += sin(uTime * .13 + aSeed) * .34;
            p.y += sin(uTime * .09 + aSeed * 1.7) * .22;
            p.z += cos(uTime * .11 + aSeed * .6) * .3;
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            vec3 wp = (modelMatrix * vec4(p, 1.)).xyz;
            vGlow = smoothstep(3.2, 0.35, length(wp - uLamp));
            gl_PointSize = aScale * uPix * (1.9 + vGlow * 3.4) * (6.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`}
        fragmentShader={`
          varying float vGlow;
          uniform float uOpacity;
          void main(){
            vec2 c = gl_PointCoord - .5;
            float a = smoothstep(.5, .05, length(c)) * (0.05 + vGlow * 0.65) * uOpacity;
            gl_FragColor = vec4(mix(vec3(.55,.62,.72), vec3(1.,.78,.55), vGlow) * a, a);
          }`}
      />
    </points>
  );
}

/** The light shaft under the practical. Additive cone, animated noise, no raymarching. */
export function LightShaft({ position }: { position: [number, number, number] }): JSX.Element {
  const lowEffects = useExperience((s) => s.lowEffects);
  const phase = useExperience((s) => s.phase);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), []);

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    const target = phase === 'boot' ? 0.1 : lowEffects ? 0 : 0.38;
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, target, 1.1, Math.min(dt, 0.05));
  });

  return (
    <mesh position={position} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[1.25, 2.6, 26, 1, true]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }'}
        fragmentShader={`
          varying vec2 vUv; uniform float uTime, uOpacity;
          float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
          void main(){
            float top = smoothstep(0.0, 0.85, vUv.y);
            float edge = pow(sin(vUv.x * 3.14159), 1.6);
            float n = h(floor(vUv * vec2(28., 10.) + vec2(uTime * .35, uTime * .12))) * .35 + .65;
            float a = top * edge * n * uOpacity;
            gl_FragColor = vec4(vec3(1.0, .70, .42) * a, a);
          }`}
      />
    </mesh>
  );
}
