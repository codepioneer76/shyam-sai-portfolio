'use client';
import { useEffect, useState } from 'react';
import { Chandelier } from '@/castle/Chandelier';
import { Candle, Sconce } from '@/castle/Candle';
import { Motes } from '@/castle/Motes';
import { profile } from '@/data/profile';
import { actions, useStore } from '@/state/store';
import { useParallax } from '@/animations/useParallax';

/**
 * THE ENTRANCE HALL — the title sequence.
 *
 * Opens almost black. The chandelier resolves first, then the staircase and the
 * floor, then the name. Nothing scrolls until the room has assembled itself, and
 * the whole sequence is skippable by scrolling or by the keyboard.
 */
export function Hero(): JSX.Element {
  const [stage, setStage] = useState(0);
  const entered = useStore((s) => s.entered);
  const stairs = useParallax(0.16);
  const floor = useParallax(-0.08);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const steps = reduced ? [0, 60, 120, 180] : [600, 2200, 4000, 5600];
    const timers = steps.map((t, i) => window.setTimeout(() => setStage(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="hall" aria-label="Entrance hall" className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6">
      {/* panelled walls */}
      <div className="wood absolute inset-0 -z-30" style={{ opacity: stage > 0 ? 1 : 0, transition: 'opacity 3s ease' }} aria-hidden />
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 18%, rgba(255,178,92,0.20) 0%, transparent 60%), linear-gradient(180deg, rgba(10,7,6,.5) 0%, rgba(10,7,6,.12) 30%, rgba(10,7,6,.97) 92%)',
        }}
        aria-hidden
      />

      {/* grand staircase, drawn in silhouette at the left edge */}
      <div
        ref={stairs.ref}
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[70vh] w-[46vw] max-w-[620px]"
        style={{ transform: `translate3d(0, ${stairs.offset}px, 0)`, opacity: stage > 1 ? 1 : 0, transition: 'opacity 2.6s ease' }}
        aria-hidden
      >
        <svg viewBox="0 0 620 700" className="h-full w-full" preserveAspectRatio="xMinYMax meet">
          <path d="M0 700 L0 300 L60 300 L60 340 L140 340 L140 388 L230 388 L230 436 L330 436 L330 486 L440 486 L440 540 L560 540 L560 700 Z" fill="#1a0f0b" />
          <path d="M0 296 L60 296 L140 336 L230 384 L330 432 L440 482 L560 536" fill="none" stroke="rgba(201,164,92,.35)" strokeWidth="3" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={20 + i * 62} y1={306 + i * 27} x2={20 + i * 62} y2={392 + i * 30} stroke="rgba(201,164,92,.18)" strokeWidth="2" />
          ))}
          <path d="M0 700 L0 300 L60 300 L60 700 Z" fill="#120a07" />
        </svg>
        <div className="absolute bottom-[46%] left-[7%]"><Candle size={1.3} seed={5} /></div>
      </div>

      {/* chandelier */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-4vh] -z-10 -translate-x-1/2 scale-[0.78] md:scale-100"
        style={{ opacity: stage > 0 ? 1 : 0, transition: 'opacity 3.4s ease' }}
      >
        <Chandelier />
      </div>

      {/* patterned floor */}
      <div
        ref={floor.ref}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[36vh] overflow-hidden"
        style={{ opacity: stage > 1 ? 1 : 0, transition: 'opacity 3s ease' }}
        aria-hidden
      >
        <div
          className="absolute inset-x-[-45%] bottom-[-14%] top-0"
          style={{
            transform: `perspective(560px) rotateX(71deg) translateY(${floor.offset * 0.35}px)`,
            transformOrigin: '50% 100%',
            backgroundColor: '#120c09',
            backgroundImage:
              'repeating-conic-gradient(from 0deg, rgba(226,212,184,0.13) 0% 25%, rgba(18,12,9,0.92) 25% 50%)',
            backgroundSize: '130px 130px',
            maskImage: 'linear-gradient(to top, black 6%, transparent 86%)',
            WebkitMaskImage: 'linear-gradient(to top, black 6%, transparent 86%)',
          }}
        />
      </div>

      <Sconce side="left" top="28%" seed={2} />
      <Sconce side="right" top="24%" seed={7} />
      <Motes count={26} />

      {/* the title card */}
      <div className="relative z-10 text-center">
        <p
          className="font-body text-[11px] tracking-royal text-gold/75"
          style={{ opacity: stage > 2 ? 1 : 0, transition: 'opacity 2s ease' }}
        >
          THE ROYAL ARCHIVE OF
        </p>
        <h1
          className="font-display mt-6 text-[clamp(46px,11vw,150px)] leading-[0.84] text-ivory"
          style={{
            opacity: stage > 2 ? 1 : 0,
            transform: stage > 2 ? 'none' : 'translateY(18px)',
            transition: 'opacity 2.6s cubic-bezier(.22,1,.36,1), transform 2.6s cubic-bezier(.22,1,.36,1)',
            textShadow: '0 2px 40px rgba(255,186,96,.22)',
          }}
        >
          SHYAM
          <br />
          SAI
        </h1>
        <div
          className="rule-gold mx-auto mt-8 w-[min(420px,64vw)]"
          style={{ opacity: stage > 2 ? 1 : 0, transition: 'opacity 2.4s ease .3s' }}
        />
        <p
          className="font-body mt-6 text-[12px] tracking-royal text-parchment/85 md:text-[13px]"
          style={{ opacity: stage > 3 ? 1 : 0, transition: 'opacity 2.2s ease' }}
        >
          {profile.classification}
        </p>
        <p
          className="font-display mt-3 text-[15px] italic text-ash md:text-[17px]"
          style={{ opacity: stage > 3 ? 1 : 0, transition: 'opacity 2.4s ease .25s' }}
        >
          {profile.motto}
        </p>

        <a
          href="#subject"
          onClick={() => actions.enter()}
          className="group mt-14 inline-flex flex-col items-center gap-3"
          style={{ opacity: stage > 3 ? 1 : 0, transition: 'opacity 2s ease .5s' }}
        >
          <span className="font-body text-[11px] tracking-royal text-gold transition-colors group-hover:text-ivory">
            {entered ? 'RETURN INSIDE' : 'ENTER THE ARCHIVE'}
          </span>
          <span className="h-10 w-px bg-gradient-to-b from-gold/70 to-transparent transition-all duration-700 group-hover:h-14" aria-hidden />
        </a>
      </div>
    </section>
  );
}
