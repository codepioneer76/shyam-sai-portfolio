'use client';
import { useSyncExternalStore } from 'react';
import type { ArsenalItem, TrayId } from '@/data/arsenal';
import type { ChapterId } from '@/data/chapters';

export type Overlay = 'none' | 'map' | 'ask';

/**
 * The case is a small state machine, not a boolean:
 *   0 latches released → 1 → 2 (lid free) → open
 * Each step is a separate physical event with its own sound.
 */
export type CaseStage = 'closed' | 'one-latch' | 'unlatched' | 'open';

interface State {
  overlay: Overlay;
  caseStage: CaseStage;
  latchL: boolean;
  latchR: boolean;
  artifact: ArsenalItem | null;
  /** Which tray of the case is lifted. */
  tray: TrayId;
  chapter: ChapterId;
  sound: boolean;
  archived: boolean;
  loaded: boolean;
}

const initial: State = {
  overlay: 'none',
  caseStage: 'closed',
  latchL: false,
  latchR: false,
  artifact: null,
  tray: 'programming',
  chapter: 'entrance',
  sound: false,
  archived: false,
  loaded: false,
};

let state: State = initial;
const listeners = new Set<() => void>();

const set = (patch: Partial<State>): void => {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof State)[]) {
    if (state[k] !== patch[k]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const actions = {
  setOverlay: (overlay: Overlay): void => set({ overlay }),
  toggleOverlay: (overlay: Overlay): void => set({ overlay: state.overlay === overlay ? 'none' : overlay }),
  setCaseStage: (caseStage: CaseStage): void => set({ caseStage, artifact: caseStage === 'open' ? state.artifact : null }),
  setLatches: (latchL: boolean, latchR: boolean): void => set({ latchL, latchR }),
  /** Lifting an object from another tray brings that tray up first. */
  setArtifact: (artifact: ArsenalItem | null): void => set(artifact ? { artifact, tray: artifact.tray } : { artifact }),
  setTray: (tray: TrayId): void => set({ tray, artifact: state.artifact?.tray === tray ? state.artifact : null }),
  setChapter: (chapter: ChapterId): void => set({ chapter }),
  setSound: (sound: boolean): void => set({ sound }),
  archive: (): void => set({ archived: true }),
  setLoaded: (): void => set({ loaded: true }),
};

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Selectors must return primitives or stable references — never object literals. */
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(initial));
}

export const getState = (): State => state;
