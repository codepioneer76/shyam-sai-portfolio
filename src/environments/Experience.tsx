'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { World } from '@/environments/World';
import { detectQuality, prefersReducedMotion, type QualityProfile } from '@/utils/quality';
import { setState, useExperience } from '@/state/store';
import { closeCase, cycleDetail, enterWorld, gotoChapter, inspect, loadSave, nextChapter, openCase, prevChapter, setOverlay } from '@/state/actions';
import { audio } from '@/audio/audio';

/** Frame counter kept outside React so it never triggers a render per frame. */
function FpsMeter(): null {
  const acc = useRef(0);
  const n = useRef(0);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (): void => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      acc.current += 1000 / Math.max(dt, 1);
      n.current += 1;
      if (n.current >= 30) {
        setState({ fps: Math.round(acc.current / n.current) });
        acc.current = 0;
        n.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return null;
}

export function Experience(): JSX.Element {
  const [quality, setQuality] = useState<QualityProfile | null>(null);
  const lowEffects = useExperience((s) => s.lowEffects);

  useEffect(() => {
    const q = detectQuality();
    setQuality(q);
    setState({ reducedMotion: prefersReducedMotion() });
    const saved = loadSave();
    if (saved !== null && saved > 0) setState({ chapter: saved });
  }, []);

  // Global keyboard map. Everything reachable by mouse is reachable by key.
  useEffect(() => {
    const wheelGuard = { t: 0 };
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      switch (e.key) {
        case 'Enter': enterWorld(); break;
        case 'ArrowRight': nextChapter(); break;
        case 'ArrowLeft': prevChapter(); break;
        case 'e': case 'E': openCase(); break;
        case 'Escape': closeCase(); inspect(null); setState({ overlay: 'none' }); break;
        case 'm': case 'M': setOverlay('map'); break;
        case 'k': case 'K': setOverlay('ask'); break;
        case ']': cycleDetail(1); break;
        case '[': cycleDetail(-1); break;
        default:
          if (/^[1-9]$/.test(e.key)) gotoChapter(Number(e.key) - 1, true);
      }
    };
    const onWheel = (e: WheelEvent): void => {
      const now = performance.now();
      if (now - wheelGuard.t < 900 || Math.abs(e.deltaY) < 24) return;
      wheelGuard.t = now;
      if (e.deltaY > 0) nextChapter();
      else prevChapter();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  // The extraction chapter thins the ambience out. Silence is a scene beat.
  const chapter = useExperience((s) => s.chapter);
  useEffect(() => {
    audio.setAmbience(chapter === 8 ? 0.12 : 0.5);
  }, [chapter]);

  const dpr = useMemo<[number, number]>(() => {
    if (!quality) return [1, 1.5];
    return lowEffects ? [1, 1] : quality.dpr;
  }, [quality, lowEffects]);

  if (!quality) return <div className="fixed inset-0 bg-void" aria-hidden />;

  return (
    <>
      <FpsMeter />
      <Canvas
        className="fixed inset-0"
        dpr={dpr}
        shadows={quality.shadows}
        flat
        linear
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 38, near: 0.05, far: 90, position: [0, 1.62, 6.4] }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.FogExp2(0x090b10, 0.14);
          gl.setClearColor(0x04050a, 1);
        }}
      >
        <World quality={quality} />
      </Canvas>
    </>
  );
}
