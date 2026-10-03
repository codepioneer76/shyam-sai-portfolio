'use client';
import { useEffect, useRef } from 'react';
import { useExperience } from '@/state/store';

const GLYPH: Record<string, string> = {
  default: '',
  inspect: 'INSPECT',
  interact: 'USE',
  open: 'OPEN',
  read: 'READ',
  navigate: 'MAP',
  locked: 'LOCKED',
};

/**
 * Cursor — a reticle with state, not a decorated arrow.
 * Position is written straight to the transform outside React so it never
 * schedules a render, and it disables itself on touch devices.
 */
export function Cursor(): JSX.Element | null {
  const state = useExperience((s) => s.cursor);
  const phase = useExperience((s) => s.phase);
  const ref = useRef<HTMLDivElement>(null);
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    if (touch) return;
    const move = (e: PointerEvent): void => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [touch]);

  if (touch || phase === 'boot') return null;
  const label = GLYPH[state] ?? '';

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-50" aria-hidden>
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div
          className={`h-4 w-4 border transition-all duration-200 ${
            state === 'default' ? 'rotate-0 border-bone/40' : 'rotate-45 border-signal'
          }`}
        />
        {label && (
          <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] tracking-[0.24em] text-signal">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
