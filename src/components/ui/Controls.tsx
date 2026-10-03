'use client';
import Link from 'next/link';
import { setState, useExperience } from '@/state/store';
import { audio } from '@/audio/audio';

/** Accessibility and quality switches. Always reachable, never hidden in a menu. */
export function Controls(): JSX.Element {
  const reduced = useExperience((s) => s.reducedMotion);
  const low = useExperience((s) => s.lowEffects);
  const sound = useExperience((s) => s.sound);
  const fps = useExperience((s) => s.fps);
  const phase = useExperience((s) => s.phase);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-30 flex gap-4 text-[10px] tracking-[0.2em] text-ash">
        <button
          aria-pressed={sound}
          onClick={() => setState({ sound: audio.toggle() })}
          className={sound ? 'text-signal' : 'hover:text-bone'}
        >
          SOUND
        </button>
        <button
          aria-pressed={reduced}
          onClick={() => setState({ reducedMotion: !reduced })}
          className={reduced ? 'text-signal' : 'hover:text-bone'}
        >
          REDUCED MOTION
        </button>
        <button
          aria-pressed={low}
          onClick={() => setState({ lowEffects: !low })}
          className={low ? 'text-signal' : 'hover:text-bone'}
        >
          LOW EFFECTS
        </button>
        <Link href="/dossier" className="hover:text-bone">
          TEXT RECORD
        </Link>
      </div>
      {phase === 'explore' && (
        <p className="pointer-events-none fixed bottom-4 left-6 z-30 text-[10px] tracking-[0.18em] text-[#4A5058]">
          {fps} FPS
        </p>
      )}
    </>
  );
}
