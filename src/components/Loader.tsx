'use client';
import { useEffect, useState } from 'react';
import { actions, useStore } from '@/state/store';

const LINES = ['ARCHIVE INITIALIZING', 'CANDLES LIT', 'THE DOORS ARE OPENING'];

/**
 * The threshold before the threshold. Under two seconds, skippable with any
 * key or click, and never shown again in the same session.
 */
export function Loader(): JSX.Element | null {
  const loaded = useStore((s) => s.loaded);
  const [line, setLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem('estate.entered') === '1';
    } catch {
      /* no storage: play it */
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      actions.setLoaded();
      setGone(true);
      return;
    }
    const finish = (): void => {
      actions.setLoaded();
      try {
        window.sessionStorage.setItem('estate.entered', '1');
      } catch {
        /* ignore */
      }
      window.setTimeout(() => setGone(true), 900);
    };
    const t = [
      window.setTimeout(() => { setLine(1); setProgress(0.55); }, 550),
      window.setTimeout(() => { setLine(2); setProgress(1); }, 1150),
      window.setTimeout(finish, 1800),
    ];
    requestAnimationFrame(() => setProgress(0.2));
    const skip = (): void => {
      t.forEach(clearTimeout);
      finish();
    };
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    return () => {
      t.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink transition-opacity duration-[900ms]"
      style={{ opacity: loaded ? 0 : 1, pointerEvents: loaded ? 'none' : 'auto' }}
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <p className="font-display text-[clamp(22px,3.4vw,34px)] tracking-[0.18em] text-ivory">SHYAM SAI TATIPARTI</p>
        <div className="mx-auto mt-8 h-px w-[min(280px,60vw)] bg-gold/15">
          <div className="h-px bg-gold/80 transition-[width] duration-700 ease-drape" style={{ width: `${progress * 100}%` }} />
        </div>
        <p key={line} className="mt-6 font-body text-[10.5px] tracking-royal text-gold/70" style={{ animation: 'recordIn .5s ease both' }}>
          {LINES[line]}
        </p>
      </div>
    </div>
  );
}
