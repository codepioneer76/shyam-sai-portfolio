'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { actions, useStore } from '@/state/store';
import { audio, chime } from '@/audio/ambience';

/**
 * Three brass switches in the corner: the map, the archive desk, and sound.
 * The sound choice persists; if it was on last visit, it resumes on the
 * visitor's first gesture — never before one.
 */
export function Controls(): JSX.Element {
  const sound = useStore((s) => s.sound);

  useEffect(() => {
    if (!audio.preferred) return;
    const resume = (): void => {
      if (!audio.enabled) actions.setSound(audio.toggle());
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, []);

  const item = 'font-body text-[10.5px] tracking-[0.24em] transition-colors';
  return (
    <div className="fixed right-5 top-5 z-40 flex items-center gap-5">
      <button onClick={() => { actions.toggleOverlay('map'); }} className={`${item} text-parchment/65 hover:text-gold`}>
        MAP
      </button>
      <button onClick={() => { chime('click'); actions.toggleOverlay('ask'); }} className={`${item} text-parchment/65 hover:text-gold`}>
        ASK
      </button>
      <button aria-pressed={sound} onClick={() => actions.setSound(audio.toggle())} className={`${item} ${sound ? 'text-gold' : 'text-parchment/65 hover:text-gold'}`}>
        {sound ? 'SOUND ON' : 'SOUND OFF'}
      </button>
      <Link href="/dossier" className={`${item} hidden text-parchment/40 hover:text-gold md:inline`}>
        TEXT
      </Link>
    </div>
  );
}
