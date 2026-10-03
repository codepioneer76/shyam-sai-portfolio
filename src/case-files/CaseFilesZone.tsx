'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, ServerBays, Pipes, HangingLamp, Table, useKit } from '@/environments/Facility';
import { LightShaft } from '@/environments/Atmosphere';
import { dossierTexture } from '@/utils/textures';
import { Prop } from '@/inventory/Prop';
import { caseFiles } from '@/data/caseFiles';
import { useChapterDetails } from '@/hooks/useChapterDetails';
import { openCaseFile } from '@/state/actions';
import { useExperience } from '@/state/store';
import { damp } from '@/utils/math';
import { ScatteredPapers } from '@/physics/ScatteredPapers';

/** CHAPTER 04 — CASE FILES. Two dossiers on an examination table under a work lamp. */
export function CaseFilesZone({ origin, active }: { origin: [number, number, number]; active: boolean }): JSX.Element {
  const kit = useKit();
  useChapterDetails(caseFiles, active);
  const [ox, , oz] = origin;
  const open = useExperience((s) => s.openCaseFile);

  const covers = useMemo(
    () => caseFiles.map((c) => dossierTexture(c.id, c.code, c.title, c.state)),
    [],
  );
  const groups = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    groups.current.forEach((g, i) => {
      if (!g) return;
      const isOpen = open === caseFiles[i].id;
      // Selected dossier rises off the table and squares up to the camera.
      g.position.y = damp(g.position.y, isOpen ? 0.98 : 0.83, 6, step);
      g.rotation.z = damp(g.rotation.z, isOpen ? 0 : i === 0 ? -0.12 : 0.16, 6, step);
      g.rotation.x = damp(g.rotation.x, isOpen ? -Math.PI / 2.6 : -Math.PI / 2, 6, step);
    });
  });

  return (
    <group>
      <Room origin={origin} />
      <ServerBays origin={origin} count={2} />
      <Pipes origin={origin} />
      <HangingLamp origin={origin} />
      <LightShaft position={[ox, 1.25, oz - 0.15]} />
      <Table origin={[ox, 0, oz]} width={3.0} depth={1.7} />

      {caseFiles.map((c, i) => (
        <group
          key={c.id}
          ref={(el) => {
            groups.current[i] = el;
          }}
          position={[ox + (i === 0 ? -0.62 : 0.62), 0.83, oz + 0.02]}
          rotation={[-Math.PI / 2, 0, i === 0 ? -0.12 : 0.16]}
        >
          <Prop
            detail={c}
            position={[0, 0, 0]}
            cursor="read"
            lift={0.015}
            onSelect={() => openCaseFile(c.id)}
            shot={{
              pos: [ox + (i === 0 ? -0.62 : 0.62), 1.42, oz + 1.05],
              look: [ox + (i === 0 ? -0.62 : 0.62), 0.88, oz],
            }}
          >
            <mesh castShadow receiveShadow>
              <planeGeometry args={[0.56, 0.76]} />
              <meshStandardMaterial map={covers[i]} roughness={0.94} side={THREE.DoubleSide} />
            </mesh>
            {/* paper edge, so the dossier has thickness from a raking angle */}
            <mesh position={[0, 0, -0.006]}>
              <boxGeometry args={[0.55, 0.75, 0.012]} />
              <meshStandardMaterial color={0xd9d2c2} roughness={1} />
            </mesh>
          </Prop>
        </group>
      ))}

      {/* Loose working papers — simulated, because paper should never settle twice the same way */}
      <ScatteredPapers origin={[ox, 0, oz + 0.45]} active={active} />

      {/* Evidence lamp: a second, colder practical aimed at the table */}
      <mesh material={kit.metal} position={[ox + 1.25, 1.06, oz - 0.42]} rotation={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 0.16, 12, 1, true]} />
      </mesh>
      <pointLight position={[ox + 1.2, 1.0, oz - 0.3]} intensity={9} distance={3.4} decay={2} color={0xdfe9ff} />
    </group>
  );
}
