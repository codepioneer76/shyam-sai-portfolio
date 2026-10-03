'use client';
import { useRef } from 'react';
import { useScrollProgress } from '@/animations/useScrollProgress';
import { chime } from '@/audio/ambience';

/**
 * Doorway — the passage between two rooms.
 *
 * As it scrolls past, an arched opening grows from a distant doorway until its
 * frame passes out of the edges of the screen: the visitor walks through it.
 * The next room's name hangs in the opening, and the darkness at the frame edges
 * closes in and releases — so no room ever simply ends and the next begin.
 */
export function Doorway({ next, numeral }: { next: string; numeral: string }): JSX.Element {
  const arch = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const crossed = useRef(false);

  const ref = useScrollProgress<HTMLDivElement>((p) => {
    // ease so the approach is slow and the passage through is quick
    const e = p * p * (3 - 2 * p);
    const scale = 0.42 + Math.pow(e, 2.2) * 5.2;
    if (arch.current) arch.current.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`;
    if (glow.current) glow.current.style.opacity = String(Math.min(1, e * 1.6) * (1 - Math.max(0, (p - 0.78) / 0.22)));
    if (label.current) {
      const l = 1 - Math.abs(p - 0.42) / 0.26;
      label.current.style.opacity = String(Math.max(0, l));
      label.current.style.transform = `translate3d(-50%, ${(0.42 - p) * 60}px, 0)`;
    }
    if (dark.current) dark.current.style.opacity = String(0.35 + Math.sin(p * Math.PI) * 0.55);
    if (!crossed.current && p > 0.62) {
      crossed.current = true;
      chime('nav');
    }
    if (p < 0.3) crossed.current = false;
  });

  return (
    <div ref={ref} className="relative h-[110vh] overflow-clip" aria-hidden>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the room beyond, faintly lit */}
        <div
          ref={glow}
          className="absolute inset-0 opacity-0"
          style={{ background: 'radial-gradient(ellipse 40% 50% at 50% 52%, rgba(255,184,104,0.16) 0%, rgba(90,23,32,0.12) 38%, transparent 70%)' }}
        />
        {/* the arch */}
        <div ref={arch} className="absolute left-1/2 top-1/2 h-[70vh] w-[46vh] will-change-transform" style={{ transform: 'translate3d(-50%,-50%,0) scale(0.42)' }}>
          <svg viewBox="0 0 460 700" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="stone" x1="0" x2="1">
                <stop offset="0" stopColor="#0e0908" />
                <stop offset="0.5" stopColor="#1d1310" />
                <stop offset="1" stopColor="#0e0908" />
              </linearGradient>
            </defs>
            {/* masonry frame around the opening */}
            <path
              d="M-2000 -2000 H2460 V2700 H-2000 Z M40 700 L40 250 Q230 -40 420 250 L420 700 Z"
              fill="url(#stone)"
              fillRule="evenodd"
            />
            <path d="M40 700 L40 250 Q230 -40 420 250 L420 700" fill="none" stroke="rgba(201,164,92,0.45)" strokeWidth="2.5" />
            <path d="M22 700 L22 244 Q230 -72 438 244 L438 700" fill="none" stroke="rgba(201,164,92,0.14)" strokeWidth="1.2" />
            {/* keystone */}
            <path d="M212 34 L248 34 L240 70 L220 70 Z" fill="rgba(201,164,92,0.35)" />
          </svg>
        </div>
        {/* the next room's name, hanging in the opening */}
        <div ref={label} className="absolute left-1/2 top-[46%] text-center opacity-0" style={{ transform: 'translate3d(-50%,0,0)' }}>
          <p className="font-display text-[12px] tracking-royal text-gold/70">{numeral}</p>
          <p className="font-display mt-2 text-[clamp(18px,2.4vw,26px)] tracking-[0.18em] text-parchment/85">{next}</p>
        </div>
        <div
          ref={dark}
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,7,6,0.95) 85%)', opacity: 0.35 }}
        />
      </div>
    </div>
  );
}
