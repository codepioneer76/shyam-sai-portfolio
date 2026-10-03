'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * RoomTitle — the rename, performed.
 *
 * The room's former name is shown for a beat as the visitor walks in, then its
 * letters drift apart, lift and blur away, and the new name condenses out of the
 * haze in its place. It happens once per visit per room, and never under reduced
 * motion — the new name is simply there.
 */
export function RoomTitle({ id, title, former, numeral, question }: { id: string; title: string; former: string | null; numeral: string; question: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'waiting' | 'former' | 'dissolve' | 'present'>(former ? 'waiting' : 'present');

  useEffect(() => {
    if (!former) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('present');
      return;
    }
    const el = ref.current;
    if (!el) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setPhase('former');
        timers.push(window.setTimeout(() => setPhase('dissolve'), 520));
        timers.push(window.setTimeout(() => setPhase('present'), 1000));
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [former]);

  const letters = (former ?? '').split('');
  const mid = (letters.length - 1) / 2;
  const showFormer = phase === 'former' || phase === 'dissolve';
  const dissolving = phase === 'dissolve';

  return (
    <header ref={ref} className="relative z-10 mb-14 text-center">
      <p className="font-display text-[13px] tracking-royal text-gold/80">{numeral}</p>

      <div className="relative mt-4 grid place-items-center">
        {/* the former name, separating letter by letter */}
        {former && (
          <p
            aria-hidden
            className="font-display pointer-events-none absolute whitespace-nowrap text-[clamp(28px,5vw,64px)] leading-none text-parchment/60"
            style={{ opacity: showFormer ? 1 : 0, transition: 'opacity .5s ease' }}
          >
            {letters.map((ch, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  transform: dissolving ? `translate3d(${(i - mid) * 14}px, ${-26 - Math.abs(i - mid) * 3}px, 0)` : 'none',
                  filter: dissolving ? 'blur(8px)' : 'none',
                  opacity: dissolving ? 0 : 1,
                  transition: `transform .75s cubic-bezier(.22,1,.36,1) ${Math.abs(i - mid) * 16}ms, filter .75s ease ${Math.abs(i - mid) * 16}ms, opacity .65s ease ${Math.abs(i - mid) * 16}ms`,
                }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </p>
        )}

        {/* the name the room carries now */}
        <h2
          id={`${id}-title`}
          className="font-display text-[clamp(38px,7vw,92px)] leading-[0.95] text-ivory"
          style={{
            opacity: phase === 'present' ? 1 : 0,
            filter: phase === 'present' ? 'blur(0)' : 'blur(14px)',
            transform: phase === 'present' ? 'none' : 'scale(1.06)',
            letterSpacing: phase === 'present' ? '0.01em' : '0.12em',
            transition: 'opacity .8s ease, filter .8s ease, transform 1s cubic-bezier(.22,1,.36,1), letter-spacing 1s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {title}
        </h2>
      </div>

      <div className="rule-gold mx-auto mt-6 w-[min(320px,52vw)]" />
      <p
        className="font-display mt-5 text-[17px] italic text-parchment/60"
        style={{ opacity: phase === 'present' ? 1 : 0, transition: 'opacity .9s ease .2s' }}
      >
        {question}
      </p>
    </header>
  );
}
