'use client';
import { Room } from '@/castle/Room';
import { Label } from '@/components/Furnishings';
import { foundation } from '@/data/foundation';
import { useReveal } from '@/animations/useReveal';
import { useState } from 'react';
import { chime } from '@/audio/ambience';

/**
 * II — THE FOUNDATION. A shelf of bound volumes; pulling one opens it.
 * The spines are the navigation, which is what a library actually looks like.
 */
export function Foundation(): JSX.Element {
  const [open, setOpen] = useState<string | null>(foundation[0].id);
  const ref = useReveal<HTMLDivElement>();

  return (
    <Room kind="library" numeral="II" title="THE FOUNDATION" id="foundation">
      <p className="font-display mx-auto mb-12 max-w-[58ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        Nothing intelligent stands on nothing. These are the volumes the rest of the estate is built over.
      </p>

      <div ref={ref} className="reveal grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* the shelf */}
        <div
          className="wood relative flex h-[320px] items-end gap-2 rounded-[2px] border border-black/60 p-4 lg:h-[460px]"
          style={{ boxShadow: 'inset 0 10px 30px rgba(0,0,0,.7)' }}
        >
          {foundation.map((f, i) => {
            const active = open === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setOpen(f.id);
                  chime('paper');
                }}
                aria-pressed={active}
                className="group relative flex-1 rounded-[1px] border border-black/60 transition-all duration-700"
                style={{
                  height: active ? '100%' : `${74 + (i % 3) * 7}%`,
                  background: [
                    'linear-gradient(180deg,#5a1720,#2a0b10)',
                    'linear-gradient(180deg,#3a2a18,#1a1209)',
                    'linear-gradient(180deg,#24303a,#0f151a)',
                    'linear-gradient(180deg,#4a3420,#221708)',
                    'linear-gradient(180deg,#3a0d12,#180508)',
                  ][i % 5],
                  transform: active ? 'translateY(-14px)' : 'none',
                  boxShadow: active ? '0 16px 30px rgba(0,0,0,.7), 0 0 0 1px rgba(201,164,92,.5)' : '0 6px 14px rgba(0,0,0,.6)',
                }}
              >
                <span className="absolute inset-x-1 top-3 h-px bg-gold/40" aria-hidden />
                <span className="absolute inset-x-1 bottom-3 h-px bg-gold/40" aria-hidden />
                <span
                  className="font-display absolute inset-0 grid place-items-center text-[11px] tracking-[0.16em] text-ivory/90"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {f.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
          <span className="absolute inset-x-0 bottom-0 h-3 bg-black/70" aria-hidden />
        </div>

        {/* the open volume */}
        <div
          className="parchment-surface relative min-h-[320px] rounded-[2px] p-8 md:p-12"
          style={{ boxShadow: 'inset 0 0 90px rgba(74,46,18,.45), 0 30px 80px rgba(0,0,0,.7)' }}
        >
          {/* gutter shadow down the middle, like a bound spread */}
          <span
            className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-10 -translate-x-1/2 md:block"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(60,38,14,.22), transparent)' }}
            aria-hidden
          />
          {foundation.map((f) =>
            open === f.id ? (
              <div key={f.id}>
                <Label className="text-[#7a5a30]">{f.kicker}</Label>
                <h3 className="font-display mt-3 text-[clamp(24px,3.2vw,38px)] leading-tight text-[#2a1c10]">{f.name}</h3>
                <div className="my-6 h-px w-24 bg-[#8B1E2D]/50" />
                <p className="font-body max-w-[60ch] text-[15px] leading-[1.95] text-[#3a2a18]">{f.body}</p>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </Room>
  );
}
