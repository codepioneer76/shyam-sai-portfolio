'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, ServerBays, Pipes, Table, useKit } from '@/environments/Facility';
import { Prop } from '@/inventory/Prop';
import { panelTexture } from '@/utils/textures';
import { experiments } from '@/data/lab';
import { useChapterDetails } from '@/hooks/useChapterDetails';

/**
 * CHAPTER 05 — THE LAB.
 * The centrepiece is an embedding cloud: 1,200 GPU points arranged in three
 * clusters with a queried point pulling its neighbours. It illustrates the one
 * experiment that actually exists here — grounded retrieval — and nothing else.
 */
export function LabZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(experiments, active);
  const [ox, , oz] = origin;

  const cloud = useMemo(() => {
    const N = 1200;
    const pos = new Float32Array(N * 3);
    const cluster = new Float32Array(N);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const c = i % 3;
      const cx = [-0.55, 0.1, 0.6][c];
      const cy = [0.15, -0.25, 0.3][c];
      const r = Math.pow(Math.random(), 0.6) * 0.42;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = cx + r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = cy + r * Math.sin(b) * Math.sin(a) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(b) * 0.5;
      cluster[i] = c;
      seed[i] = Math.random() * 6.28;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aCluster', new THREE.BufferAttribute(cluster, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const points = useRef<THREE.Points>(null);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (points.current) points.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.35;
  });

  const board = useMemo(
    () =>
      panelTexture(
        'lab-board',
        [
          'CORPUS       assembled from /src/data',
          'PASSAGES     built at request time',
          'SCORING      tf x inverse document weight',
          'GROUNDING    answers cite source records',
          '',
          'EXPERIMENTS  1 logged',
        ],
        { heading: 'INFERENCE BENCH' },
      ),
    [],
  );

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={6} />
      <Pipes origin={origin} />
      <Table origin={[ox, 0, oz]} width={3.2} depth={1.4} />

      {/* Embedding cloud, suspended over the bench */}
      <points ref={points} position={[ox, 1.55, oz - 0.5]} geometry={cloud} frustumCulled={false}>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            attribute float aCluster, aSeed;
            uniform float uTime;
            varying float vC;
            varying float vPulse;
            void main(){
              vC = aCluster;
              vec3 p = position;
              p += 0.02 * vec3(sin(uTime*.7+aSeed), cos(uTime*.6+aSeed*1.3), sin(uTime*.5+aSeed*.7));
              // a query sweeps the space; nearby points brighten as they are retrieved
              float q = sin(uTime * .35) * .6;
              vPulse = smoothstep(.42, 0.0, abs(p.x - q));
              vec4 mv = modelViewMatrix * vec4(p, 1.);
              gl_PointSize = (2.0 + vPulse * 5.0) * (3.2 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }`}
          fragmentShader={`
            varying float vC; varying float vPulse;
            void main(){
              float d = length(gl_PointCoord - .5);
              float a = smoothstep(.5, .05, d) * (.20 + vPulse * .8);
              vec3 base = vC < .5 ? vec3(.21,.88,.63) : (vC < 1.5 ? vec3(.42,.66,.85) : vec3(1.,.66,.35));
              gl_FragColor = vec4(base * a, a);
            }`}
        />
      </points>

      {/* Bench board */}
      <mesh material={kit.darkMetal} position={[ox, 1.72, oz - 2.2]} castShadow>
        <boxGeometry args={[2.4, 1.2, 0.1]} />
      </mesh>
      <mesh position={[ox, 1.72, oz - 2.14]}>
        <planeGeometry args={[2.2, 1.05]} />
        <meshStandardMaterial map={board} emissiveMap={board} emissive={0xffffff} emissiveIntensity={2.0} />
      </mesh>

      {experiments.map((e, i) => (
        <Prop
          key={e.id}
          detail={e}
          position={[ox - 0.9 + i * 0.8, 0.82, oz + 0.3]}
          cursor="read"
          shot={{ pos: [ox - 0.9 + i * 0.8, 1.24, oz + 1.2], look: [ox - 0.9 + i * 0.8, 0.85, oz + 0.2] }}
        >
          <mesh material={kit.metal} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.06, 0.3]} />
          </mesh>
          <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.4, 0.24]} />
            <meshStandardMaterial color={0x0d1a16} emissive={0x35e0a1} emissiveIntensity={1.1} userData={{ reactive: true }} />
          </mesh>
        </Prop>
      ))}
    </group>
  );
}
