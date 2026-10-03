'use client';
import { Suspense, useMemo } from 'react';
import { chapters } from '@/data/chapters';
import { useExperience } from '@/state/store';
import type { QualityProfile } from '@/utils/quality';
import { CameraRig } from '@/camera/CameraRig';
import { LightingRig } from '@/environments/Lighting';
import { PostStack } from '@/shaders/PostStack';
import { Dust } from '@/environments/Atmosphere';
import { Dressing, Foreground, DeadScreens, EmergencyLamp } from '@/environments/Clutter';
import { SubjectZone } from '@/scenes/SubjectZone';
import { FoundationZone } from '@/scenes/FoundationZone';
import { ArsenalZone } from '@/inventory/ArsenalZone';
import { CaseFilesZone } from '@/case-files/CaseFilesZone';
import { LabZone } from '@/scenes/LabZone';
import { JourneyZone } from '@/scenes/JourneyZone';
import { ArchiveZone } from '@/archive/ArchiveZone';
import { SystemZone } from '@/scenes/SystemZone';
import { ExtractionZone } from '@/scenes/ExtractionZone';

const ZONES = [
  SubjectZone,
  FoundationZone,
  ArsenalZone,
  CaseFilesZone,
  LabZone,
  JourneyZone,
  ArchiveZone,
  SystemZone,
  ExtractionZone,
] as const;

/**
 * World — assembles the facility.
 *
 * Only the current zone and its immediate neighbours are mounted. Everything
 * else is unmounted geometry: no draw calls, no shadow cost, no memory. Moving
 * chapter mounts the next zone one frame before the camera arrives.
 */
export function World({ quality }: { quality: QualityProfile }): JSX.Element {
  const chapter = useExperience((s) => s.chapter);
  const radius = quality.zoneRadius;

  const visible = useMemo(() => {
    const set = new Set<number>();
    for (let i = chapter - radius; i <= chapter + radius; i++) {
      if (i >= 0 && i < ZONES.length) set.add(i);
    }
    return set;
  }, [chapter, radius]);

  return (
    <>
      <CameraRig />
      <LightingRig shadows={quality.shadows} shadowMapSize={quality.shadowMapSize} />
      <Dust count={quality.dust} />
      <Suspense fallback={null}>
        {chapters.map((c, i) => {
          if (!visible.has(i)) return null;
          const Zone = ZONES[i];
          return (
            <group key={c.id}>
              <Zone origin={c.origin} active={i === chapter} />
              {/* Dressing is separated from the zone so every room gets depth
                  without nine files repeating the same background pass. */}
              <Dressing origin={c.origin} seed={i + 1} />
              <DeadScreens origin={c.origin} seed={i + 1} />
              <EmergencyLamp origin={c.origin} seed={i + 1} />
              {i === chapter && <Foreground origin={c.origin} seed={i + 1} />}
            </group>
          );
        })}
      </Suspense>
      <PostStack />
    </>
  );
}
