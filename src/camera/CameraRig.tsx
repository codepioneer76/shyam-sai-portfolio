'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { chapterByIndex } from '@/data/chapters';
import { useExperience } from '@/state/store';
import { damp } from '@/utils/math';

const v = new THREE.Vector3();

/**
 * CameraRig — the camera is authored, never user-driven.
 *
 * Three layers, in order:
 *   1. shot      — chapter home shot, or a prop's inspect shot when one is focused
 *   2. easing    — frame-rate independent damping, slower on far jumps
 *   3. handheld  — two incommensurate sines plus pointer parallax, sub-centimetre
 *
 * Reduced motion collapses layers 2 and 3: the camera cuts and holds still.
 */
export function CameraRig(): null {
  const { camera, size } = useThree();
  const chapter = useExperience((s) => s.chapter);
  const focusShot = useExperience((s) => s.focusShot);
  const caseOpen = useExperience((s) => s.caseOpen);
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const transitioning = useExperience((s) => s.transitioning);

  const pos = useRef(new THREE.Vector3(0, 1.62, 6.4));
  const look = useRef(new THREE.Vector3(0, 1.25, -1.2));
  const pointer = useRef({ x: 0, y: 0 });
  const shake = useRef(0);
  /** Arrival dolly: 1 on entering a room, decaying to 0 as the camera settles. */
  const arrival = useRef(1);
  const lastChapter = useRef(chapter);
  const forward = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const c = chapterByIndex(chapter);
    const step = Math.min(dt, 0.05);

    if (lastChapter.current !== chapter) {
      lastChapter.current = chapter;
      arrival.current = 1;
    }
    arrival.current = damp(arrival.current, 0, phase === 'entering' ? 0.34 : 0.85, step);

    // 1. resolve the target shot
    let tp: [number, number, number];
    let tl: [number, number, number];
    if (focusShot) {
      tp = focusShot.pos;
      tl = focusShot.look;
    } else if (caseOpen && c.id === 'arsenal') {
      tp = [c.origin[0], 1.86, c.origin[2] + 1.36];
      tl = [c.origin[0], 0.83, c.origin[2] - 0.03];
    } else if (phase === 'boot') {
      tp = [c.origin[0], 1.62, c.origin[2] + 6.4];
      tl = [c.origin[0], 1.25, c.origin[2] - 1.2];
    } else {
      tp = c.shot.pos;
      tl = c.shot.look;
    }

    if (reduced) {
      pos.current.set(tp[0], tp[1], tp[2]);
      look.current.set(tl[0], tl[1], tl[2]);
      camera.position.copy(pos.current);
      camera.lookAt(look.current);
      return;
    }

    // 2. damping — slow and cinematic on entry, tighter during inspection
    const lambda = phase === 'entering' ? 0.42 : transitioning ? 2.2 : focusShot || caseOpen ? 5.5 : 3.0;
    pos.current.x = damp(pos.current.x, tp[0], lambda, step);
    pos.current.y = damp(pos.current.y, tp[1], lambda, step);
    pos.current.z = damp(pos.current.z, tp[2], lambda, step);
    look.current.x = damp(look.current.x, tl[0], lambda, step);
    look.current.y = damp(look.current.y, tl[1], lambda, step);
    look.current.z = damp(look.current.z, tl[2], lambda, step);

    // 3. handheld noise + parallax. Amplitude stays under a centimetre on purpose.
    pointer.current.x = damp(pointer.current.x, (state.pointer.x * size.width) / size.width, 4, step);
    pointer.current.y = damp(pointer.current.y, state.pointer.y, 4, step);
    const t = state.clock.elapsedTime;
    let ox = Math.sin(t * 0.47) * 0.006 + Math.sin(t * 1.13) * 0.0028 + state.pointer.x * 0.045;
    let oy = Math.cos(t * 0.39) * 0.005 + Math.sin(t * 0.91) * 0.0022 + state.pointer.y * 0.03;
    if (shake.current > 0) {
      ox += (Math.random() - 0.5) * shake.current;
      oy += (Math.random() - 0.5) * shake.current;
      shake.current *= Math.pow(0.02, step);
    }

    // Push in along the view axis as the arrival term decays: the room opens up
    // around the visitor instead of appearing fully framed.
    forward.current.set(look.current.x - pos.current.x, 0, look.current.z - pos.current.z).normalize();
    const back = arrival.current * (focusShot ? 0.6 : 2.1);
    const rise = arrival.current * 0.34;

    camera.position.set(
      pos.current.x + ox - forward.current.x * back,
      pos.current.y + oy + rise,
      pos.current.z - forward.current.z * back,
    );
    v.set(look.current.x + ox * 0.4, look.current.y + oy * 0.4 + rise * 0.35, look.current.z);
    camera.lookAt(v);
  });

  return null;
}
