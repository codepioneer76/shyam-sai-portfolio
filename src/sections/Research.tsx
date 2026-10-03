'use client';
import { useState } from 'react';
import { Room } from '@/castle/Room';
import { Label } from '@/components/Furnishings';
import { research, type ResearchTopic } from '@/data/research';
import { experiments } from '@/data/lab';
import { TopicDiagram } from '@/research/TopicDiagram';
import { CourseworkShelf } from '@/research/CourseworkShelf';
import { Candle } from '@/castle/Candle';
import { chime } from '@/audio/ambience';

/**
 * IV — RESEARCH & AI. The scholar's study.
 *
 * Manuscripts lie across the desk at slight angles. Selecting one draws it
 * forward and opens it: the diagram inks itself, then the note, then any
 * verified connection to real work.
 */
export function Research(): JSX.Element {
  const [open, setOpen] = useState<ResearchTopic>(research[4]);
  const [drawn, setDrawn] = useState(true);

  const choose = (t: ResearchTopic): void => {
    if (t.id === open.id) return;
    chime('unfold');
    setDrawn(false);
    setOpen(t);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
  };

  return (
    <Room kind="laboratory" id="research" tall>
      {/* the desk */}
      <div
        className="wood relative rounded-[4px] border border-black/70 p-5 md:p-8"
        style={{ boxShadow: 'inset 0 12px 40px rgba(0,0,0,.75), 0 40px 90px rgba(0,0,0,.7)' }}
      >
        <div className="pointer-events-none absolute -top-10 right-8 hidden md:block" aria-hidden>
          <Candle size={1.3} seed={21} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* manuscripts strewn across the desk */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Research manuscripts">
            {research.map((t, i) => {
              const active = t.id === open.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => choose(t)}
                    aria-pressed={active}
                    className="parchment-surface group relative block h-[112px] w-full rounded-[1px] p-3 text-left transition-all duration-500 ease-drape"
                    style={{
                      transform: active ? 'translateY(-8px) scale(1.04) rotate(0deg)' : `rotate(${((i * 37) % 7) - 3}deg)`,
                      boxShadow: active ? '0 22px 40px rgba(0,0,0,.75), 0 0 0 1px rgba(139,30,45,.45)' : '0 8px 18px rgba(0,0,0,.6)',
                      opacity: active ? 1 : 0.86,
                    }}
                  >
                    <span className="font-body block text-[8.5px] tracking-label text-[#8B1E2D]">{t.state}</span>
                    <span className="font-display mt-2 block text-[14.5px] leading-tight text-[#2a1c10]">{t.name}</span>
                    {/* a pin, for the ones in active use */}
                    {(t.state === 'CURRENT FOCUS' || t.state === 'BUILDING WITH') && (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #e6c479, #8a6e3a 70%)', boxShadow: '0 2px 3px rgba(0,0,0,.6)' }} aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* the open manuscript */}
          <article
            key={open.id}
            className="parchment-surface relative rounded-[2px] p-7 md:p-9"
            style={{ animation: 'manuscriptOpen .75s cubic-bezier(.22,1,.36,1) both', transformOrigin: '50% 0%' }}
            aria-live="polite"
          >
            <div className="flex items-baseline justify-between gap-4">
              <Label className="text-[#7a5a30]">RESEARCH NOTE</Label>
              <span className="font-body text-[10px] tracking-label text-[#8B1E2D]">{open.state}</span>
            </div>
            <h3 className="font-display mt-2 text-[clamp(26px,3.4vw,38px)] leading-none text-[#1e1508]">{open.name}</h3>
            <div className="my-5 h-px w-full bg-[#8a6a3a]/35" />
            <TopicDiagram kind={open.diagram} drawn={drawn} />
            <p className="font-body mt-5 max-w-[60ch] text-[14.5px] leading-[1.9] text-[#2e2312]" style={{ opacity: drawn ? 1 : 0, transition: 'opacity .8s ease .5s' }}>
              {open.note}
            </p>
            <div className="mt-6" style={{ opacity: drawn ? 1 : 0, transition: 'opacity .8s ease .8s' }}>
              <Label className="text-[#7a5a30]">CONNECTED TO</Label>
              {open.related.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {open.related.map((r) => (
                    <li key={r} className="font-display text-[14.5px] italic text-[#4a2e14]">— {r}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-body mt-2 text-[13px] italic text-[#6a4b28]">Nothing finished yet. Studied, not yet shipped.</p>
              )}
            </div>
          </article>
        </div>

        {/* the one experiment written up in full */}
        {experiments.map((e) => (
          <div key={e.id} className="mt-10 border-t border-gold/20 pt-8">
            <Label>{e.kicker} · LOGGED</Label>
            <h4 className="font-display mt-2 text-[24px] text-ivory">{e.name}</h4>
            <p className="font-body mt-3 max-w-[70ch] text-[14px] leading-[1.9] text-parchment/75">{e.objective}</p>
            <p className="font-body mt-3 max-w-[70ch] text-[13px] leading-[1.85] text-parchment/60">{e.implementation}</p>
          </div>
        ))}
      </div>

      {/* coursework shelf */}
      <div className="mt-16">
        <p className="mb-5 text-center font-body text-[10.5px] tracking-label text-gold/70">ON THE SHELF BEHIND THE DESK</p>
        <CourseworkShelf />
      </div>
    </Room>
  );
}
