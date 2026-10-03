'use client';
import { actions, getState } from '@/state/store';
import { chime } from '@/audio/ambience';

/**
 * The case's mechanism, shared by the 3D model and the 2D fallback so both
 * behave identically:
 *
 *   closed ──release a latch──▶ one-latch ──release the other──▶ unlatched
 *        ▲                                                         │
 *        └──────────────── close ◀──── open ◀── (lid lifts itself after a beat)
 *
 * Latches are individual objects: either can go first, each makes its own click,
 * and the lid only moves once both are free — which is how a real case works.
 */
let lidTimer: number | null = null;

export function releaseLatch(side: 'L' | 'R'): void {
  const s = getState();
  if (s.caseStage === 'open') return;
  const L = side === 'L' ? true : s.latchL;
  const R = side === 'R' ? true : s.latchR;
  if (L === s.latchL && R === s.latchR) return;

  actions.setLatches(L, R);
  chime('latch');

  if (L && R) {
    actions.setCaseStage('unlatched');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The small pause between the second click and the lid moving is deliberate:
    // it is the beat where the visitor realises the thing is about to open.
    if (lidTimer) window.clearTimeout(lidTimer);
    lidTimer = window.setTimeout(() => actions.setCaseStage('open'), reduced ? 0 : 560);
  } else {
    actions.setCaseStage('one-latch');
  }
}

/** Release whichever latch is still closed. Used by the keyboard control and the fallback. */
export function releaseNext(): void {
  const s = getState();
  if (!s.latchL) releaseLatch('L');
  else if (!s.latchR) releaseLatch('R');
}

export function closeCase(): void {
  if (lidTimer) window.clearTimeout(lidTimer);
  actions.setCaseStage('closed');
  actions.setLatches(false, false);
}
