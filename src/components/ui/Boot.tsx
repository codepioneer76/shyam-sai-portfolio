'use client';
import { useEffect, useRef, useState } from 'react';
import { profile } from '@/data/profile';
import { useExperience } from '@/state/store';
import { enterWorld } from '@/state/actions';
import { audio } from '@/audio/audio';

const LINES: [string, string][] = [
  ['SYSTEM', 'INITIALIZING'],
  ['ENVIRONMENT', 'UNKNOWN'],
  ['POWER', 'RESTORED — 12%'],
  ['SIGNAL', 'DETECTED'],
  ['ARCHIVE', 'LOCKED'],
  ['CASE DATABASE', '2 ENTRIES'],
  ['IDENTITY', 'CONFIRMED'],
];

/** The first thirty seconds. Text arrives on a machine's schedule, not a designer's. */
export function Boot(): JSX.Element | null {
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    const interval = reduced ? 90 : 230;
    LINES.forEach((_, i) => {
      pending.push(
        window.setTimeout(() => {
          setShown(i + 1);
          audio.blip(880 + Math.random() * 200, 0.02, 'square', 0.03);
        }, 400 + i * interval),
      );
    });
    pending.push(window.setTimeout(() => setReady(true), 400 + LINES.length * interval + (reduced ? 150 : 700)));
    return () => pending.forEach(clearTimeout);
  }, [reduced]);

  if (phase !== 'boot') return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center transition-colors duration-[3000ms] ${
        ready ? 'bg-void/55' : 'bg-void/95'
      }`}
    >
      <div className="w-[min(620px,86vw)]">
        <div className="min-h-[250px] text-[13.5px] leading-[2.2] tracking-[0.14em]" aria-live="polite">
          {LINES.slice(0, shown).map(([a, b]) => (
            <div key={a} className="fade-up">
              <span className="text-ash">{a}</span>{' '}
              <span className="text-ash/40">{'.'.repeat(Math.max(2, 30 - a.length - b.length))}</span>{' '}
              <span className="text-signal">{b}</span>
            </div>
          ))}
        </div>

        <div className={`mt-7 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[13.5px] tracking-[0.14em]">
            <span className="text-ash">SIGNATURE</span>{' '}
            <span className="text-ash/40">{'.'.repeat(11)}</span>{' '}
            <span className="text-signal">{profile.name}</span>
          </p>
          <p className="mt-2 text-[13.5px] tracking-[0.14em]">
            <span className="text-ash">CLEARANCE</span>{' '}
            <span className="text-ash/40">{'.'.repeat(11)}</span>{' '}
            <span className="text-signal">GRANTED</span>
          </p>
        </div>

        <div className={`mt-10 transition-opacity duration-700 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <button
            onClick={enterWorld}
            className="group inline-flex items-center gap-4 border-b border-signal/40 pb-3 text-[15px] tracking-[0.42em] text-signal transition-colors hover:text-bone"
          >
            <span className="h-2 w-2 rotate-45 bg-signal transition-transform duration-500 group-hover:rotate-[135deg]" aria-hidden />
            ENTER FACILITY
            <span className="text-[11px] tracking-[0.2em] text-ash">[ ENTER ]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
