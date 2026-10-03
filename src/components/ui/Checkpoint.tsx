'use client';
import { useEffect, useState } from 'react';
import { useExperience } from '@/state/store';
import { audio } from '@/audio/audio';

/** The logger's output: type it out one character at a time, then let it fade. */
export function Checkpoint(): JSX.Element | null {
  const message = useExperience((s) => s.checkpoint);
  const reduced = useExperience((s) => s.reducedMotion);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!message) {
      setTyped('');
      return;
    }
    if (reduced) {
      setTyped(message);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(message.slice(0, i));
      if (i % 2 === 0) audio.typeKey();
      if (i >= message.length) window.clearInterval(id);
    }, 42);
    return () => window.clearInterval(id);
  }, [message, reduced]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-30 -translate-x-1/2 border border-bone/15 bg-void/80 px-4 py-2.5">
      <p className="text-[11px] tracking-[0.24em] text-bone">
        {typed}
        <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-signal" aria-hidden />
      </p>
    </div>
  );
}
