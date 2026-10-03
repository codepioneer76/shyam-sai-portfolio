'use client';
import { useEffect, useRef, useState } from 'react';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';
import { Candle } from '@/castle/Candle';

const LINE = 'SESSION ARCHIVED — THE ESTATE WILL REMEMBER YOUR VISIT.';

/**
 * The archivist's machine.
 *
 * Original in form — a brass-and-wood letterpress logger, not a reproduction of
 * anyone's save point. Striking it types a line one character at a time with the
 * carriage advancing under the paper, and records the visit in localStorage so a
 * returning visitor is greeted rather than reset.
 */
export function Typewriter(): JSX.Element {
  const archived = useStore((s) => s.archived);
  const [typed, setTyped] = useState('');
  const [striking, setStriking] = useState(false);
  const timer = useRef<number[]>([]);

  useEffect(() => {
    const pending = timer.current;
    try {
      if (window.localStorage.getItem('archive.visit') && !archived) actions.archive();
    } catch {
      /* storage unavailable — the machine simply forgets */
    }
    return () => pending.forEach(clearTimeout);
  }, [archived]);

  const strike = (): void => {
    if (typed.length > 0) return;
    setStriking(true);
    chime('type');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTyped(LINE);
      setStriking(false);
      actions.archive();
      return;
    }
    for (let i = 1; i <= LINE.length; i++) {
      timer.current.push(
        window.setTimeout(() => {
          setTyped(LINE.slice(0, i));
          if (i % 2 === 0) chime('type');
          if (i === LINE.length) {
            setStriking(false);
            actions.archive();
            try {
              window.localStorage.setItem('archive.visit', new Date().toISOString());
            } catch {
              /* ignore */
            }
          }
        }, i * 52),
      );
    }
  };

  return (
    <div className="mx-auto max-w-[620px] text-center">
      <button
        onClick={strike}
        aria-label="Archive this session on the machine"
        className="group relative mx-auto block w-full max-w-[420px]"
      >
        {/* paper in the carriage */}
        <div
          className="parchment-surface relative mx-auto mb-[-10px] w-[74%] rounded-[1px] px-4 py-5 text-left transition-transform duration-700"
          style={{ transform: typed ? 'translateY(-16px) rotate(-0.4deg)' : 'translateY(0)' }}
        >
          <p className="font-mono min-h-[34px] text-[10.5px] leading-relaxed tracking-[0.08em] text-[#2a1c10]">
            {typed}
            {striking && <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-[2px] bg-[#8B1E2D]" />}
          </p>
        </div>

        {/* machine body */}
        <div
          className="relative rounded-[3px] border border-black/70 px-6 pb-5 pt-7"
          style={{
            background: 'linear-gradient(180deg,#2e1c12,#16100a 62%,#0d0805)',
            boxShadow: '0 26px 60px rgba(0,0,0,.75), inset 0 1px 0 rgba(201,164,92,.18)',
          }}
        >
          <span className="absolute inset-x-6 top-3 h-px bg-gold/25" aria-hidden />
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => (
              <span
                key={i}
                className="block h-3.5 rounded-full border border-black/60 transition-transform"
                style={{
                  background: 'linear-gradient(180deg,#d8b46b,#8a6e3a 55%,#3d2f18)',
                  transform: striking && i === typed.length % 30 ? 'translateY(2px)' : 'none',
                }}
                aria-hidden
              />
            ))}
          </div>
          <p className="font-body mt-5 text-[9.5px] tracking-label text-gold/70">
            {archived ? 'SESSION ON RECORD' : 'STRIKE TO ARCHIVE THIS VISIT'}
          </p>
        </div>
      </button>

      <div className="mt-6 flex justify-center">
        <Candle size={1.05} seed={13} />
      </div>
    </div>
  );
}
