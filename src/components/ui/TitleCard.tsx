'use client';
import { useEffect, useState } from 'react';
import { profile } from '@/data/profile';
import { useExperience } from '@/state/store';

/**
 * TitleCard — the identity beat.
 *
 * It fires once, on arrival in the first sector, after the room is already
 * visible. The name lands over an environment the visitor is looking at rather
 * than over an empty page, which is the difference between a title card and a
 * hero section. It never returns.
 */
export function TitleCard(): JSX.Element | null {
  const phase = useExperience((s) => s.phase);
  const chapter = useExperience((s) => s.chapter);
  const reduced = useExperience((s) => s.reducedMotion);
  const [stage, setStage] = useState<'idle' | 'in' | 'out' | 'done'>('idle');

  useEffect(() => {
    if (stage !== 'idle' || phase === 'boot' || chapter !== 0) return;
    const t1 = window.setTimeout(() => setStage('in'), reduced ? 200 : 3200);
    const t2 = window.setTimeout(() => setStage('out'), reduced ? 2500 : 8200);
    const t3 = window.setTimeout(() => setStage('done'), reduced ? 3500 : 10600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [phase, chapter, reduced, stage]);

  if (stage === 'idle' || stage === 'done') return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 flex items-end transition-opacity duration-[2200ms] ${
        stage === 'in' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full px-7 pb-[16vh] md:px-16">
        <p className="text-[11px] tracking-[0.5em] text-signal">IDENTITY CONFIRMED</p>
        <h1 className="display mt-4 text-[clamp(46px,11vw,132px)] leading-[0.86]">
          SHYAM
          <br />
          SAI
        </h1>
        <div className="mt-6 h-px w-[min(420px,60vw)] bg-bone/25" />
        <p className="mt-4 text-[13px] tracking-[0.34em] text-bone/80">{profile.classification}</p>
        <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-ash">{profile.positioning}</p>
      </div>
    </div>
  );
}
