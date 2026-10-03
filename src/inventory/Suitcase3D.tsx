'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { arsenal, type ArsenalItem } from '@/data/arsenal';
import { actions, useStore, type CaseStage } from '@/state/store';
import { chime } from '@/audio/ambience';
import { releaseLatch } from './caseMachine';
import { shell, panel, roundedBlock, stitchLine } from './geometry';
import { leather, velvet, objectLabel, nameplate, contactShadow } from './caseTextures';

export type Tier = 'high' | 'mid' | 'low';

/* ------------------------------------------------------------------ dimensions */
const W = 2.4; // width
const D = 1.6; // depth
const R = 0.14; // corner radius
const BASE_H = 0.46;
const LID_H = 0.2;
const WALL = 0.07;
const FLOOR = 0.075;
const LID_MAX = 1.92; // ~110°, resting against its own hinges

/* ------------------------------------------------------------------ materials */

interface Kit {
  leather: THREE.MeshStandardMaterial;
  darkLeather: THREE.MeshStandardMaterial;
  velvet: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshStandardMaterial;
  brassDull: THREE.MeshStandardMaterial;
  stitch: THREE.LineDashedMaterial;
  plate: THREE.MeshStandardMaterial;
  shadow: THREE.MeshBasicMaterial;
  disposables: { dispose: () => void }[];
}

function useKit(tier: Tier): Kit {
  const kit = useMemo<Kit>(() => {
    const size = tier === 'high' ? 1024 : tier === 'mid' ? 512 : 256;
    const lt = leather(size);
    lt.map.repeat.set(1.3, 1.3);
    lt.bump.repeat.set(1.3, 1.3);
    lt.rough.repeat.set(1.3, 1.3);
    const vt = velvet(Math.min(512, size));
    vt.repeat.set(1.5, 1.5);
    const np = nameplate();
    const cs = contactShadow();

    const leatherMat = new THREE.MeshStandardMaterial({
      map: lt.map,
      bumpMap: lt.bump,
      bumpScale: 0.6,
      roughnessMap: lt.rough,
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 0.45,
    });
    const darkLeather = leatherMat.clone();
    darkLeather.color = new THREE.Color('#6e5a52');
    const velvetMat = new THREE.MeshPhysicalMaterial({
      map: vt,
      roughness: 0.96,
      color: new THREE.Color('#8a5a60'),
      sheen: 0.4,
      sheenColor: new THREE.Color('#6e2230'),
      sheenRoughness: 0.6,
      envMapIntensity: 0.2,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: '#b8914a',
      metalness: 1,
      roughness: 0.32,
      envMapIntensity: 1.6,
      emissive: new THREE.Color('#c9a45c'),
      emissiveIntensity: 0,
    });
    const brassDull = new THREE.MeshStandardMaterial({ color: '#8a6e3a', metalness: 1, roughness: 0.5, envMapIntensity: 1.1 });
    const stitch = new THREE.LineDashedMaterial({ color: '#cdb48a', dashSize: 0.028, gapSize: 0.02, transparent: true, opacity: 0.75 });
    const plate = new THREE.MeshStandardMaterial({ map: np, metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2 });
    const shadow = new THREE.MeshBasicMaterial({ map: cs, transparent: true, depthWrite: false, opacity: 0.85 });

    return {
      leather: leatherMat,
      darkLeather,
      velvet: velvetMat,
      brass,
      brassDull,
      stitch,
      plate,
      shadow,
      disposables: [lt.map, lt.bump, lt.rough, vt, np, cs, leatherMat, darkLeather, velvetMat, brass, brassDull, stitch, plate, shadow],
    };
  }, [tier]);

  useEffect(() => () => kit.disposables.forEach((d) => d.dispose()), [kit]);
  return kit;
}

/* ------------------------------------------------------------------ scene setup */

/** Environment reflections from a generated room, then turned right down: this is a candlelit case, not a showroom. */
function Environment(): null {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.28;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      room.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
    };
  }, [gl, scene]);
  return null;
}

/** Camera: a slow approach while closed, a steeper lean-in once the lid is up. */
function CameraRig({ stage, reduced }: { stage: CaseStage; reduced: boolean }): null {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.2, 0));
  const wantPos = useMemo(() => new THREE.Vector3(), []);
  const wantLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const open = stage === 'open';
    wantPos.set(open ? 0 : 0.35, open ? 4.25 : 2.35, open ? 2.05 : 4.35);
    wantLook.set(0, open ? 0.05 : 0.28, open ? 0.12 : 0);
    if (!reduced) {
      // barely-there drift and parallax — the camera breathes, it does not float
      const t = state.clock.elapsedTime;
      wantPos.x += Math.sin(t * 0.21) * 0.04 + pointer.x * 0.18;
      wantPos.y += Math.cos(t * 0.17) * 0.025 + pointer.y * 0.08;
    }
    const k = reduced ? 1 : 1 - Math.exp(-(open ? 1.6 : 2.2) * Math.min(dt, 0.05));
    camera.position.lerp(wantPos, k);
    look.current.lerp(wantLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

/* ------------------------------------------------------------------ the case */

interface CaseProps {
  tier: Tier;
  reduced: boolean;
  active: boolean;
}

/**
 * Frame-rate governor. Watches the first seconds of real rendering: if the
 * machine is struggling it first drops the pixel ratio, and if that is not
 * enough it hands the room back to the drawn case. The object must never be the
 * reason the rest of the castle stutters.
 */
function Governor({ onStruggling }: { onStruggling: () => void }): null {
  const setDpr = useThree((s) => s.setDpr);
  const samples = useRef<number[]>([]);
  const step = useRef<0 | 1 | 2>(0);

  useFrame((_, dt) => {
    if (step.current === 2) return;
    samples.current.push(dt);
    if (samples.current.length < 45) return;
    const avg = samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
    samples.current = [];
    const fps = 1 / avg;
    if (fps >= 40) {
      step.current = 2; // healthy: stop measuring
    } else if (step.current === 0) {
      step.current = 1;
      setDpr(1);
    } else {
      step.current = 2;
      if (fps < 20) onStruggling();
    }
  });
  return null;
}

function TravellingCase({ tier, reduced, active }: CaseProps): JSX.Element {
  const kit = useKit(tier);
  const stage = useStore((s) => s.caseStage);
  const latchL = useStore((s) => s.latchL);
  const latchR = useStore((s) => s.latchR);
  const segs = tier === 'low' ? 4 : tier === 'mid' ? 8 : 12;

  const geo = useMemo(() => {
    const g = {
      baseWalls: shell(W, D, R, WALL, BASE_H, segs),
      baseFloor: panel(W - 0.02, D - 0.02, R, FLOOR, segs),
      lidWalls: shell(W, D, R, WALL, LID_H, segs),
      lidTop: panel(W - 0.02, D - 0.02, R, 0.06, segs),
      liner: new THREE.PlaneGeometry(W - WALL * 2 - 0.02, D - WALL * 2 - 0.02),
      corner: roundedBlock(0.24, 0.13, 0.24, 0.03),
      latchPlate: roundedBlock(0.22, 0.13, 0.04, 0.012),
      hasp: roundedBlock(0.15, 0.2, 0.03, 0.01),
      catch: roundedBlock(0.18, 0.07, 0.03, 0.01),
      knob: new THREE.SphereGeometry(0.026, 12, 10),
      hingeBarrel: new THREE.CylinderGeometry(0.034, 0.034, 0.24, 14),
      hingeLeaf: roundedBlock(0.22, 0.1, 0.012, 0.004),
      handle: new THREE.TorusGeometry(0.21, 0.036, 12, 28, Math.PI),
      mount: roundedBlock(0.08, 0.09, 0.05, 0.012),
      divider: new THREE.BoxGeometry(1, 1, 1),
      plate: new THREE.PlaneGeometry(0.62, 0.155),
      shadow: new THREE.PlaneGeometry(W * 1.9, D * 2.1),
    };
    return g;
  }, [segs]);

  const stitches = useMemo(
    () => [
      stitchLine(W + 0.004, D + 0.004, R, BASE_H - 0.045, kit.stitch),
      stitchLine(W - 0.14, D - 0.14, R * 0.7, LID_H + 0.013, kit.stitch),
    ],
    [kit.stitch],
  );

  // per-latch brass so each can glint independently on hover
  const latchMats = useMemo(() => [kit.brass.clone(), kit.brass.clone()], [kit.brass]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      stitches.forEach((l) => l.geometry.dispose());
      latchMats.forEach((m) => m.dispose());
    },
    [geo, stitches, latchMats],
  );

  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const hasps = useRef<(THREE.Group | null)[]>([]);
  const interior = useRef<THREE.PointLight>(null);
  const candle = useRef<THREE.PointLight>(null);

  // lid spring and sound sync
  const lidS = useRef({ v: 0, vel: 0 });
  const haspS = useRef([0, 0]);
  const hover = useRef<[boolean, boolean]>([false, false]);
  const arrive = useRef(reduced ? 1 : 0);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;

    // STEP 1 — the case settles into the scene the first time it is seen
    if (active) arrive.current = reduced ? 1 : Math.min(1, arrive.current + dt * 0.55);
    const a = 1 - Math.pow(1 - arrive.current, 3);
    if (root.current) {
      root.current.position.y = (1 - a) * -0.35;
      root.current.rotation.y = 0.32 * (1 - a) + 0.1;
    }

    // STEP 2 — latches: a stiff spring so they snap, with a small overshoot
    [latchL, latchR].forEach((released, i) => {
      const target = released ? 1.18 : 0;
      haspS.current[i] = reduced ? target : haspS.current[i] + (target - haspS.current[i]) * Math.min(1, dt * 16);
      const h = hasps.current[i];
      if (h) {
        const lift = hover.current[i] && !released ? 0.08 : 0;
        h.rotation.x = haspS.current[i] + lift;
      }
      latchMats[i].emissiveIntensity = hover.current[i] && !released ? 0.35 + Math.sin(t * 6) * 0.08 : 0;
    });

    // STEP 3 — the lid: heavy, slightly under-damped, so it overshoots once and settles
    const target = stage === 'open' ? 1 : 0;
    const s = lidS.current;
    const prev = s.v;
    const prevVel = s.vel;
    if (reduced) {
      s.v = target;
      s.vel = 0;
    } else {
      const k = target === 1 ? 24 : 58;
      const c = target === 1 ? 7.4 : 13;
      s.vel += (-k * (s.v - target) - c * s.vel) * dt;
      s.v += s.vel * dt;
    }
    if (lid.current) lid.current.rotation.x = -Math.max(0, Math.min(1.04, s.v)) * LID_MAX;

    // sound follows the mechanism, not the click
    if (target === 1) {
      if (prev < 0.03 && s.v >= 0.03) chime('hinge');
      if (prev < 0.42 && s.v >= 0.42) chime('leather');
      if (prevVel > 0 && s.vel <= 0 && s.v > 0.8) chime('thud');
    } else if (prev > 0.03 && s.v <= 0.03) {
      chime('thud');
    }

    // STEP 5 — warm light falls into the case as it opens
    if (interior.current) interior.current.intensity = Math.max(0, Math.min(1, s.v)) * 14;
    if (candle.current) {
      const f = Math.sin(t * 7.1) * 0.5 + Math.sin(t * 13.3 + 1.7) * 0.3 + Math.sin(t * 2.3) * 0.2;
      candle.current.intensity = 34 + f * (reduced ? 0 : 3.2);
    }
  });

  const setHover = (i: 0 | 1, v: boolean): void => {
    hover.current[i] = v;
    document.body.style.cursor = v ? 'pointer' : '';
  };

  const latchX = 0.62;
  const open = stage === 'open';

  return (
    <>
      {/* lighting — a candle to the left, a gold rim behind, warmth from inside */}
      <hemisphereLight args={['#ffd9a8', '#140606', 0.35]} />
      <pointLight
        ref={candle}
        position={[-2.4, 2.3, 1.9]}
        color="#ffb56b"
        intensity={34}
        distance={14}
        decay={2}
        castShadow={tier !== 'low'}
        shadow-mapSize-width={tier === 'high' ? 1024 : 512}
        shadow-mapSize-height={tier === 'high' ? 1024 : 512}
        shadow-bias={-0.0015}
      />
      <pointLight position={[2.8, 1.8, -2.2]} color="#c9a45c" intensity={9} distance={10} decay={2} />

      <group ref={root}>
        {/* contact shadow + a real shadow catcher */}
        <mesh geometry={geo.shadow} material={kit.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.05]} />
        {tier !== 'low' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
            <planeGeometry args={[8, 6]} />
            <shadowMaterial transparent opacity={0.45} />
          </mesh>
        )}

        {/* ------------------------------------------------ BASE */}
        <mesh geometry={geo.baseWalls} material={kit.leather} castShadow receiveShadow />
        <mesh geometry={geo.baseFloor} material={kit.darkLeather} receiveShadow />
        <mesh geometry={geo.liner} material={kit.velvet} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR + 0.013, 0]} receiveShadow />
        {stitches.map((l, i) => i === 0 && <primitive key={i} object={l} />)}

        {/* brass corners, bottom four */}
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
          <mesh key={`bc${i}`} geometry={geo.corner} material={kit.brassDull} position={[sx * (W / 2 - 0.08), 0.055, sz * (D / 2 - 0.08)]} castShadow />
        ))}

        {/* handle on the front face */}
        <group position={[0, BASE_H - 0.17, D / 2 + 0.03]}>
          <mesh geometry={geo.mount} material={kit.brassDull} position={[-0.21, 0.02, 0.01]} />
          <mesh geometry={geo.mount} material={kit.brassDull} position={[0.21, 0.02, 0.01]} />
          <mesh geometry={geo.handle} material={kit.leather} rotation={[-0.35, 0, Math.PI]} position={[0, 0.02, 0.05]} castShadow />
        </group>

        {/* latches: plate on the base, hasp that swings out, catch on the lid */}
        {[-1, 1].map((sx, i) => (
          <group key={`latch${i}`} position={[sx * latchX, BASE_H - 0.085, D / 2 + 0.022]}>
            <mesh geometry={geo.latchPlate} material={kit.brassDull} castShadow />
            <group
              ref={(el) => {
                hasps.current[i] = el;
              }}
              position={[0, -0.04, 0.03]}
            >
              <mesh
                geometry={geo.hasp}
                material={latchMats[i]}
                position={[0, 0.1, 0]}
                castShadow
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation();
                  setHover(i as 0 | 1, true);
                }}
                onPointerOut={() => setHover(i as 0 | 1, false)}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  releaseLatch(i === 0 ? 'L' : 'R');
                }}
              />
              <mesh geometry={geo.knob} material={kit.brass} position={[0, 0.16, 0.022]} />
            </group>
          </group>
        ))}

        {/* hinges on the back edge */}
        {[-0.72, 0.72].map((x) => (
          <group key={`h${x}`} position={[x, BASE_H, -D / 2 - 0.018]}>
            <mesh geometry={geo.hingeBarrel} material={kit.brassDull} rotation={[0, 0, Math.PI / 2]} castShadow />
            <mesh geometry={geo.hingeLeaf} material={kit.brassDull} position={[0, -0.06, 0.012]} />
          </group>
        ))}

        {/* ------------------------------------------------ CONTENTS */}
        <Contents kit={kit} open={open} />

        <pointLight ref={interior} position={[0, 0.95, 0.25]} color="#ffc98a" intensity={0} distance={2.6} decay={2} />

        {/* ------------------------------------------------ LID, pivoting on the back edge */}
        <group ref={lid} position={[0, BASE_H, -D / 2]}>
          <group position={[0, 0, D / 2]}>
            <mesh geometry={geo.lidWalls} material={kit.leather} castShadow receiveShadow />
            <mesh geometry={geo.lidTop} material={kit.leather} position={[0, LID_H - 0.06, 0]} castShadow receiveShadow />
            {/* velvet lining visible when the lid is up */}
            <mesh geometry={geo.liner} material={kit.velvet} rotation={[Math.PI / 2, 0, 0]} position={[0, LID_H - 0.076, 0]} />
            {/* engraved plate inside the lid */}
            <mesh geometry={geo.plate} material={kit.plate} rotation={[Math.PI / 2, 0, 0]} position={[0, LID_H - 0.079, 0.35]} />
            <primitive object={stitches[1]} />
            {/* top corners */}
            {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
              <mesh key={`tc${i}`} geometry={geo.corner} material={kit.brassDull} position={[sx * (W / 2 - 0.08), LID_H - 0.04, sz * (D / 2 - 0.08)]} castShadow />
            ))}
            {/* catches the hasps hook over */}
            {[-1, 1].map((sx) => (
              <mesh key={`c${sx}`} geometry={geo.catch} material={kit.brassDull} position={[sx * latchX, 0.055, D / 2 + 0.018]} />
            ))}
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ contents */

const COLS = 4;
const ROWS = 4;
const IN_W = W - WALL * 2 - 0.08;
const IN_D = D - WALL * 2 - 0.08;
const CELL_W = IN_W / COLS;
const CELL_D = IN_D / ROWS;

function Contents({ kit, open }: { kit: Kit; open: boolean }): JSX.Element {
  const dividers = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    for (let c = 1; c < COLS; c++) list.push({ pos: [-IN_W / 2 + c * CELL_W, FLOOR + 0.06, 0], scale: [0.016, 0.1, IN_D] });
    for (let r = 1; r < ROWS; r++) list.push({ pos: [0, FLOOR + 0.06, -IN_D / 2 + r * CELL_D], scale: [IN_W, 0.1, 0.016] });
    return list;
  }, []);

  return (
    <group>
      {dividers.map((d, i) => (
        <mesh key={i} material={kit.velvet} position={d.pos} scale={d.scale} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      {arsenal.slice(0, COLS * ROWS).map((item, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = -IN_W / 2 + CELL_W * (col + 0.5);
        const z = -IN_D / 2 + CELL_D * (row + 0.5);
        return <Artifact key={item.id} item={item} kit={kit} position={[x, FLOOR + 0.014, z]} index={i} open={open} />;
      })}
    </group>
  );
}

const COVER: Record<ArsenalItem['kind'], string> = {
  volume: '#3a0d12',
  ledger: '#2a1810',
  dossier: '#8a7148',
  blueprint: '#2a3036',
  manuscript: '#d8c39a',
};

function Artifact({
  item,
  kit,
  position,
  index,
  open,
}: {
  item: ArsenalItem;
  kit: Kit;
  position: [number, number, number];
  index: number;
  open: boolean;
}): JSX.Element {
  const selected = useStore((s) => s.artifact?.id === item.id);
  const w = CELL_W * 0.84;
  const d = CELL_D * 0.8;
  const h = item.kind === 'ledger' ? 0.12 : item.kind === 'volume' ? 0.09 : item.kind === 'manuscript' ? 0.1 : 0.035;

  const res = useMemo(() => {
    const label = objectLabel(item, w, item.kind === 'manuscript' ? d * 0.5 : d);
    const cover = new THREE.MeshStandardMaterial({ color: COVER[item.kind], roughness: 0.85, envMapIntensity: 0.4 });
    const pages = new THREE.MeshStandardMaterial({ color: '#e4d4b0', roughness: 0.95 });
    const top = new THREE.MeshStandardMaterial({ map: label, roughness: 0.9, envMapIntensity: 0.3 });
    const seal = new THREE.MeshStandardMaterial({ color: '#8B1E2D', roughness: 0.45, metalness: 0.1 });
    // box face order: +x, -x, +y, -y, +z, -z
    const faces =
      item.kind === 'volume' || item.kind === 'ledger'
        ? [pages, cover, top, cover, pages, pages]
        : [cover, cover, top, cover, cover, cover];
    const body = new THREE.BoxGeometry(item.kind === 'manuscript' ? w : w, item.kind === 'manuscript' ? 0.012 : h, item.kind === 'manuscript' ? d * 0.5 : d);
    const roll = new THREE.CylinderGeometry(0.05, 0.05, w * 0.92, 18);
    const sealGeo = new THREE.CylinderGeometry(0.03, 0.032, 0.012, 16);
    return { label, cover, pages, top, seal, faces, body, roll, sealGeo };
  }, [item, w, d, h]);

  useEffect(
    () => () => {
      [res.label, res.cover, res.pages, res.top, res.seal, res.body, res.roll, res.sealGeo].forEach((x) => x.dispose());
    },
    [res],
  );

  const g = useRef<THREE.Group>(null);
  const hover = useRef(false);
  const lift = useRef(0);
  const reveal = useRef(0);
  const openedAt = useRef<number | null>(null);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    // STEP 6 — objects settle into view in a stagger, only once the lid is clear of them
    if (open && openedAt.current === null) openedAt.current = t;
    if (!open) openedAt.current = null;
    const due = openedAt.current !== null && t - openedAt.current > 0.55 + index * 0.035;
    reveal.current += ((due ? 1 : 0) - reveal.current) * Math.min(1, dt * 5);
    const active = hover.current || selected;
    lift.current += ((active && open ? 1 : 0) - lift.current) * Math.min(1, dt * 12);
    if (g.current) {
      g.current.position.y = position[1] + 0.004 + lift.current * 0.07 - (1 - reveal.current) * 0.05;
      g.current.rotation.z = lift.current * 0.04;
      g.current.rotation.x = -lift.current * 0.05;
    }
  });

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (!open) return;
      e.stopPropagation();
      hover.current = true;
      document.body.style.cursor = 'pointer';
      chime('paper');
    },
    onPointerOut: () => {
      hover.current = false;
      document.body.style.cursor = '';
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!open) return;
      e.stopPropagation();
      actions.setArtifact(item);
      chime('folder');
    },
  };

  if (item.kind === 'manuscript') {
    // a rolled manuscript sealed in wax, with its label tag lying in front of it
    return (
      <group ref={g} position={position} {...handlers}>
        <mesh geometry={res.roll} material={res.pages} rotation={[0, 0, Math.PI / 2]} position={[0, 0.052, -d * 0.24]} castShadow />
        <mesh geometry={res.sealGeo} material={res.seal} rotation={[Math.PI / 2, 0, 0]} position={[0.06, 0.052, -d * 0.24 + 0.052]} />
        <mesh geometry={res.body} material={res.faces} position={[0, 0.006, d * 0.2]} castShadow receiveShadow />
      </group>
    );
  }

  return (
    <group ref={g} position={position} {...handlers}>
      <mesh geometry={res.body} material={res.faces} position={[0, h / 2, 0]} castShadow receiveShadow />
    </group>
  );
}

/* ------------------------------------------------------------------ canvas */

export default function Suitcase3D({ tier, reduced, active, onStruggling }: CaseProps & { onStruggling: () => void }): JSX.Element {
  const stage = useStore((s) => s.caseStage);
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows={tier !== 'low'}
      dpr={tier === 'high' ? [1, 1.75] : tier === 'mid' ? [1, 1.5] : [1, 1.25]}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, position: [0.35, 2.35, 4.35], near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden
    >
      <Environment />
      <Governor onStruggling={onStruggling} />
      <CameraRig stage={stage} reduced={reduced} />
      <TravellingCase tier={tier} reduced={reduced} active={active} />
    </Canvas>
  );
}
