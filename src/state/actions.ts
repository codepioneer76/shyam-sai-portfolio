'use client';
import { chapters, chapterByIndex } from '@/data/chapters';
import type { Detail } from '@/data/types';
import { getState, setState, type CursorState, type Overlay, type Shot } from '@/state/store';
import { audio } from '@/audio/audio';

const SAVE_KEY = 'facility.checkpoint.v1';

export function enterWorld(): void {
  if (getState().phase !== 'boot') return;
  setState({ phase: 'entering' });
  audio.clack();
  window.setTimeout(() => setState({ phase: 'explore' }), getState().reducedMotion ? 200 : 5600);
}

export function gotoChapter(index: number, viaMap = false): void {
  const s = getState();
  const i = Math.max(0, Math.min(chapters.length - 1, index));
  if (i === s.chapter || s.transitioning || s.phase !== 'explore') return;

  const far = Math.abs(i - s.chapter) > 1 || viaMap;
  setState({
    transitioning: true,
    detail: null,
    focusShot: null,
    caseOpen: false,
    openCaseFile: null,
    overlay: 'none',
  });
  audio.transition();

  const commit = (): void => {
    const c = chapterByIndex(i);
    if (!s.visited.includes(c.id)) {
      window.setTimeout(() => checkpoint(`${c.code} ${c.title} — LOGGED`), 700);
    }
    setState((prev) => ({
      chapter: i,
      objective: c.objective,
      visited: prev.visited.includes(c.id) ? prev.visited : [...prev.visited, c.id],
    }));
    save(i);
  };

  if (s.reducedMotion) {
    commit();
    setState({ transitioning: false });
    return;
  }

  // Neighbouring chapters dolly through the corridor; distant jumps cut through darkness.
  window.setTimeout(commit, far ? 620 : 40);
  window.setTimeout(() => setState({ transitioning: false }), far ? 1500 : 900);
}

export const nextChapter = (): void => gotoChapter(getState().chapter + 1);
export const prevChapter = (): void => gotoChapter(getState().chapter - 1);

export function inspect(detail: Detail | null, shot: Shot | null = null): void {
  const s = getState();
  if (s.detail?.id === detail?.id && !shot) return;
  setState({ detail, focusShot: detail ? shot : null });
  if (detail) audio.blip(1500, 0.03, 'square', 0.05);
}

export function registerChapterDetails(details: Detail[]): void {
  setState({ chapterDetails: details });
}

export function cycleDetail(dir: number): void {
  const s = getState();
  if (s.chapterDetails.length === 0) return;
  const at = s.detail ? s.chapterDetails.findIndex((d) => d.id === s.detail!.id) : -1;
  const next = (at + dir + s.chapterDetails.length) % s.chapterDetails.length;
  inspect(s.chapterDetails[next]);
}

export const setCursor = (cursor: CursorState): void => setState({ cursor });

export function openCase(): void {
  if (getState().caseOpen) return;
  setState({ caseOpen: true });
}
export function closeCase(): void {
  if (!getState().caseOpen) return;
  setState({ caseOpen: false, detail: null, focusShot: null });
}

export function openCaseFile(id: string | null): void {
  setState({ openCaseFile: id });
  if (id) audio.blip(320, 0.12, 'triangle', 0.06);
}

export function setOverlay(overlay: Overlay): void {
  setState({ overlay: getState().overlay === overlay ? 'none' : overlay });
  audio.blip(900, 0.04, 'square', 0.04);
}

/** Typewriter checkpoint — a real save point, restored on the next visit. */
export function checkpoint(message: string): void {
  setState({ checkpoint: message });
  audio.typeKey();
  window.setTimeout(() => setState({ checkpoint: null }), 4000);
}

export function save(chapter: number): void {
  try {
    window.localStorage.setItem(SAVE_KEY, String(chapter));
  } catch {
    /* storage blocked (private mode): progress just is not persisted */
  }
}

export function loadSave(): number | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw === null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(chapters.length - 1, n)) : null;
  } catch {
    return null;
  }
}
