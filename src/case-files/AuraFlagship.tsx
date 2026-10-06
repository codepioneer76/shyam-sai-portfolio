'use client';
import { useState } from 'react';
import { aura } from '@/data/aura';
import { Label } from '@/components/Furnishings';
import { StatusMark } from './StatusMark';
import { chime } from '@/audio/ambience';

/**
 * AURA — the flagship.
 *
 * Not a folder like the others: a black, gold-tooled portfolio with a crimson
 * ribbon, larger and lit from above, so it reads as the centrepiece of the room
 * before a word is read. Opening it unrolls the plans: the architecture draws
 * itself layer by layer. Everything shown is the system as designed; nothing
 * claims a layer is finished.
 */
export function AuraFlagship(): JSX.Element {
  const [open, setOpen] = useState(false);

  const toggle = (): void => {
    chime(open ? 'folder' : 'unfold');
    setOpen(!open);
  };

  return (
    <article aria-label="Flagship project: AURA" className="relative mx-auto max-w-5xl">
      {/* the pool of light this object sits in — warmer and wider than the other folders */}
      <div
        className="pointer-events-none absolute -inset-x-16 -top-24 bottom-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 30%, rgba(255,190,110,.16), transparent 70%)' }}
        aria-hidden
      />

      <div
        className="relative overflow-hidden rounded-[5px] border border-black/80 px-6 py-9 md:px-12 md:py-12"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(201,164,92,.08), transparent 55%), linear-gradient(160deg, #1b1210 0%, #0d0807 60%, #070404 100%)',
          boxShadow: '0 50px 120px rgba(0,0,0,.8), inset 0 1px 0 rgba(201,164,92,.22)',
        }}
      >
        {/* gold tooling */}
        <div className="pointer-events-none absolute inset-3 rounded-[3px] border border-gold/30" aria-hidden />
        <div className="pointer-events-none absolute inset-[18px] rounded-[2px] border border-gold/10" aria-hidden />
        {/* crimson ribbon down the spine */}
        <div
          className="pointer-events-none absolute bottom-0 right-10 top-0 w-5 md:right-16"
          style={{ background: 'linear-gradient(90deg,#4d0f18,#8b1e2d 45%,#5a1720)', boxShadow: '0 0 18px rgba(0,0,0,.6)' }}
          aria-hidden
        />

        <div className="relative pr-10 md:pr-16">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-body text-[10.5px] tracking-royal text-gold">FLAGSHIP PROJECT</span>
            <StatusMark status={aura.status} />
          </div>

          <h3 className="font-display mt-6 text-[clamp(56px,11vw,128px)] leading-[0.85] text-ivory" style={{ textShadow: '0 2px 50px rgba(255,186,96,.18)' }}>
            {aura.name}
          </h3>
          <p className="font-display mt-4 text-[clamp(17px,2.2vw,24px)] tracking-[0.06em] text-parchment/90">{aura.title.toUpperCase()}</p>
          <div className="rule-gold my-7 w-56" />
          <p className="font-body max-w-[62ch] text-[15px] leading-[1.9] text-parchment/75">{aura.vision}</p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button
              onClick={toggle}
              aria-expanded={open}
              className="group inline-flex items-center gap-3 border-b border-gold/50 py-2.5 font-body text-[11px] tracking-label text-gold transition-colors hover:text-ivory"
            >
              <span className={`h-2 w-2 rotate-45 bg-gold transition-transform duration-500 ${open ? 'rotate-[225deg]' : ''}`} aria-hidden />
              {open ? 'ROLL UP THE PLANS' : 'UNROLL THE PLANS'}
            </button>
            <span className="font-body text-[10px] tracking-label text-parchment/40">REPOSITORY — NOT YET PUBLIC</span>
          </div>
        </div>

        {/* ------------------------------------------------ the plans */}
        <div
          className="overflow-hidden transition-[max-height,opacity] duration-[1100ms] ease-drape"
          style={{ maxHeight: open ? 1600 : 0, opacity: open ? 1 : 0 }}
        >
          <div className="parchment-surface relative mt-10 rounded-[2px] p-6 md:p-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Label className="text-[#7a5a30]">ARCHITECTURE · AS DESIGNED</Label>
              <span className="font-body text-[10px] tracking-label text-[#8B1E2D]">UNDER CONSTRUCTION</span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_170px]">
              {/* the request path, top to bottom */}
              <ol className="space-y-2">
                {aura.layers.map((l, i) => (
                  <li
                    key={l.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border border-[#5a3c1c]/45 bg-[#e3d2ad]/60 px-4 py-2.5"
                    style={{
                      opacity: open ? 1 : 0,
                      transform: open ? 'none' : 'translateX(-14px)',
                      transition: `opacity .5s ease ${0.25 + i * 0.08}s, transform .6s cubic-bezier(.22,1,.36,1) ${0.25 + i * 0.08}s`,
                    }}
                  >
                    <span className="font-display text-[16px] text-[#1e1508]">{l.name}</span>
                    <span className="font-body text-[11.5px] italic text-[#5a4326]">{l.note}</span>
                  </li>
                ))}
              </ol>

              {/* systems that watch every layer */}
              <div
                className="flex flex-row gap-2 md:flex-col"
                style={{ opacity: open ? 1 : 0, transition: 'opacity .6s ease .95s' }}
              >
                {aura.crossCutting.map((c) => (
                  <div key={c} className="flex flex-1 items-center justify-center border-2 border-dashed border-[#8B1E2D]/45 px-2 py-3 text-center">
                    <span className="font-display text-[14px] leading-tight text-[#5a1720]">{c}</span>
                  </div>
                ))}
                <p className="hidden font-body text-[10px] leading-snug tracking-[0.08em] text-[#6a4b28] md:block">ACROSS EVERY LAYER</p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#8a6a3a]/35 pt-5" style={{ opacity: open ? 1 : 0, transition: 'opacity .6s ease 1.1s' }}>
              <Label className="text-[#7a5a30]">DATA LAYER</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {aura.data.map((d) => (
                  <span key={d} className="border border-[#3d2f18]/40 px-3 py-1.5 font-body text-[11px] tracking-[0.1em] text-[#2e2312]">
                    {d}
                  </span>
                ))}
              </div>
              <p className="font-body mt-6 max-w-[64ch] text-[12.5px] italic leading-relaxed text-[#5a4326]">
                This is the system as designed. Which layers are built, and how far, will be recorded here as the work is published —
                nothing above claims a layer is finished.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
