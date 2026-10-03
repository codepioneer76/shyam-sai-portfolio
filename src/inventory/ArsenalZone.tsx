'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, ServerBays, Pipes, HangingLamp, Table, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { caseLinerTexture, itemLabelTexture } from '@/utils/textures';
import { arsenal, type ArsenalItem } from '@/data/arsenal';
import { useExperience } from '@/state/store';
import { closeCase, inspect, openCase, setCursor } from '@/state/actions';
import { audio } from '@/audio/audio';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { clamp, damp, easeOutBack, easeInOutCubic } from '@/utils/math';

const CASE = { W: 1.52, D: 1.02, H: 0.13 };
const FRAME_GEO = new THREE.BoxGeometry(1, 1, 1);

interface Slot {
  item: ArsenalItem;
  x: number;
  z: number;
  w: number;
  d: number;
}

/** Slot packing: 6 x 3 grid, items claim 1 or 2 columns. Computed once. */
function packSlots(): Slot[] {
  const m = 0.05;
  const gw = (CASE.W - 0.08 - m * 2) / 6;
  const gh = (CASE.D - 0.08 - m * 2) / 3;
  const x0 = -(CASE.W - 0.08) / 2 + m;
  const z0 = -(CASE.D - 0.08) / 2 + m;
  let col = 0;
  let row = 0;
  return arsenal.map((item) => {
    if (col + item.span[0] > 6) {
      col = 0;
      row += 1;
    }
    const slot: Slot = {
      item,
      x: x0 + col * gw + (gw * item.span[0]) / 2,
      z: z0 + row * gh + (gh * item.span[1]) / 2,
      w: gw * item.span[0] - 0.018,
      d: gh * item.span[1] - 0.018,
    };
    col += item.span[0];
    return slot;
  });
}

/** CHAPTER 03 — ARSENAL. The case is a real object: latches, hinge, liner, contents. */
export function ArsenalZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  const caseOpen = useExperience((s) => s.caseOpen);
  const reduced = useExperience((s) => s.reducedMotion);
  const selectedId = useExperience((s) => s.detail?.id ?? null);
  const slots = useMemo(packSlots, []);
  const liner = useMemo(caseLinerTexture, []);

  useChapterDetails(arsenal, active);

  const hinge = useRef<THREE.Group>(null);
  const latchA = useRef<THREE.Group>(null);
  const latchB = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  const frame = useRef<THREE.LineSegments>(null);
  const items = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);
  const hovered = useRef<string | null>(null);

  useEffect(() => {
    if (!caseOpen) return;
    audio.clack();
    audio.latch(0);
    audio.latch(1);
    window.setTimeout(() => audio.lid(), 420);
  }, [caseOpen]);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    // Authored open curve: resistance, release, overshoot, settle.
    const target = caseOpen ? 1 : 0;
    t.current = reduced ? target : damp(t.current, target, caseOpen ? 3.4 : 4.2, step);
    const k = clamp(t.current, 0, 1);
    const angle = k < 0.18 ? (k * 0.06) / 0.18 : 0.06 + easeOutBack((k - 0.18) / 0.82, 1.1) * (1.32 - 0.06);

    if (hinge.current) hinge.current.rotation.x = -clamp(angle, 0, 1.34);
    const latchAngle = -easeInOutCubic(clamp(k * 2.4, 0, 1)) * 0.95;
    if (latchA.current) latchA.current.rotation.x = latchAngle;
    if (latchB.current) latchB.current.rotation.x = latchAngle;
    if (light.current) light.current.intensity = Math.max(0, (k - 0.25) / 0.75) * 9;
    if (strip.current) strip.current.color.setRGB(0.3 * k + 0.04, 0.92 * k + 0.06, 0.78 * k + 0.06);

    // Items rise into their slots on a stagger once the lid is clear.
    slots.forEach((slot, i) => {
      const g = items.current[i];
      if (!g) return;
      const delay = 0.35 + i * 0.035;
      const local = clamp((k - delay) / 0.35, 0, 1);
      const active2 = hovered.current === slot.item.id || selectedId === slot.item.id;
      const lift = active2 ? 0.045 : 0;
      g.position.y = CASE.H + 0.022 - 0.09 * (1 - easeOutBack(local, 1.2)) + lift;
      g.scale.setScalar(0.96 + 0.04 * local);
      g.visible = k > 0.2;
      const mat = (g.children[0] as THREE.Mesh | undefined)?.material as THREE.Material[] | undefined;
      if (Array.isArray(mat)) {
        const top = mat[2] as THREE.MeshStandardMaterial;
        top.emissiveIntensity = damp(top.emissiveIntensity, active2 ? 1.9 : 0.25, 10, step);
      }
      g.rotation.z = active2 ? Math.sin(state.clock.elapsedTime * 1.6) * 0.02 : 0;
    });

    // Selection frame stays glued to the selected object.
    if (frame.current) {
      const idx = slots.findIndex((s) => s.item.id === (hovered.current ?? selectedId));
      const mat = frame.current.material as THREE.LineBasicMaterial;
      if (idx >= 0 && caseOpen) {
        const slot = slots[idx];
        frame.current.position.set(slot.x, CASE.H + 0.05, slot.z);
        frame.current.scale.set(slot.w + 0.02, 0.09, slot.d + 0.02);
        mat.opacity = damp(mat.opacity, 0.85, 8, step);
      } else {
        mat.opacity = damp(mat.opacity, 0, 8, step);
      }
    }
  });

  const [ox, , oz] = origin;

  const onCaseClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    if (!caseOpen) openCase();
    else closeCase();
  };

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />
      <Table origin={[ox, 0, oz]} />

      <group position={[ox, 0.795, oz]}>
        {/* Base */}
        <mesh
          material={kit.metal}
          position={[0, CASE.H / 2, 0]}
          castShadow
          receiveShadow
          onClick={onCaseClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setCursor(caseOpen ? 'interact' : 'open');
          }}
          onPointerOut={() => setCursor('default')}
        >
          <boxGeometry args={[CASE.W, CASE.H, CASE.D]} />
        </mesh>

        {/* Slot liner */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CASE.H - 0.005, 0]} receiveShadow>
          <planeGeometry args={[CASE.W - 0.08, CASE.D - 0.08]} />
          <meshStandardMaterial map={liner} roughness={0.95} metalness={0} />
        </mesh>

        {/* Corner bumpers + handle */}
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
          <mesh key={i} material={kit.trim} position={[sx * (CASE.W / 2 - 0.045), CASE.H / 2, sz * (CASE.D / 2 - 0.045)]} castShadow>
            <boxGeometry args={[0.09, 0.055, 0.09]} />
          </mesh>
        ))}
        <mesh material={kit.trim} rotation={[Math.PI / 2, 0, 0]} position={[0, CASE.H / 2, CASE.D / 2 + 0.02]}>
          <torusGeometry args={[0.13, 0.016, 8, 20, Math.PI]} />
        </mesh>

        {/* Latches — they move before the lid does. That beat is the whole trick. */}
        {([-1, 1] as const).map((sx, i) => (
          <group key={i} ref={i === 0 ? latchA : latchB} position={[sx * 0.44, CASE.H + 0.005, CASE.D / 2 + 0.008]}>
            <mesh material={kit.trim} castShadow>
              <boxGeometry args={[0.12, 0.05, 0.035]} />
            </mesh>
            <mesh position={[0, 0.03, 0.012]}>
              <boxGeometry args={[0.07, 0.075, 0.02]} />
              <meshStandardMaterial color={0x6e7681} roughness={0.25} metalness={1} />
            </mesh>
          </group>
        ))}

        {/* Lid, hinged at the back edge */}
        <group ref={hinge} position={[0, CASE.H, -CASE.D / 2]}>
          <mesh material={kit.metal} position={[0, 0.0375, CASE.D / 2]} castShadow receiveShadow onClick={onCaseClick}>
            <boxGeometry args={[CASE.W, 0.075, CASE.D]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.001, CASE.D / 2]}>
            <planeGeometry args={[CASE.W - 0.1, CASE.D - 0.1]} />
            <meshStandardMaterial color={0x0c0f13} roughness={0.98} />
          </mesh>
          <mesh position={[0, -0.008, CASE.D - 0.12]}>
            <boxGeometry args={[CASE.W - 0.3, 0.012, 0.03]} />
            <meshBasicMaterial ref={strip} color={0x0a1512} />
          </mesh>
        </group>

        <pointLight ref={light} position={[0, 0.23, 0]} intensity={0} distance={2.2} decay={2} color={0xbff3de} />

        {/* Contents */}
        {slots.map((slot, i) => (
          <group
            key={slot.item.id}
            ref={(el) => {
              items.current[i] = el;
            }}
            position={[slot.x, CASE.H + 0.022, slot.z]}
            visible={false}
            onPointerOver={(e) => {
              e.stopPropagation();
              hovered.current = slot.item.id;
              setCursor('inspect');
              audio.blip(1900, 0.02, 'square', 0.03);
              inspect(slot.item);
            }}
            onPointerOut={() => {
              if (hovered.current === slot.item.id) hovered.current = null;
              setCursor('default');
            }}
            onClick={(e) => {
              e.stopPropagation();
              inspect(slot.item);
            }}
          >
            <ItemMesh item={slot.item} w={slot.w} d={slot.d} />
          </group>
        ))}

        <lineSegments ref={frame}>
          <edgesGeometry args={[FRAME_GEO]} />
          <lineBasicMaterial color={0x35e0a1} transparent opacity={0} />
        </lineSegments>
      </group>
    </group>
  );
}

function ItemMesh({ item, w, d }: { item: ArsenalItem; w: number; d: number }): JSX.Element {
  const label = useMemo(() => itemLabelTexture(item), [item]);
  const h = item.kind === 'vial' ? 0.062 : item.kind === 'disk' ? 0.028 : 0.05;
  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.5, metalness: 0.75 });
    const top = new THREE.MeshStandardMaterial({
      map: label,
      emissiveMap: label,
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
      roughness: 0.72,
      metalness: 0.15,
    });
    return [side, side, top, side, side, side];
  }, [label]);

  return (
    <>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {item.kind === 'vial' && (
        <mesh position={[0, h / 2 + 0.002, d * 0.36]}>
          <boxGeometry args={[w * 0.5, 0.006, d * 0.06]} />
          <meshBasicMaterial color={0xffa95c} transparent opacity={0.85} />
        </mesh>
      )}
    </>
  );
}
