'use client';
import { useEffect, useState } from 'react';
import { Chandelier } from '@/castle/Chandelier';
import { Candle, Sconce } from '@/castle/Candle';
import { Motes } from '@/castle/Motes';
import { Room } from '@/castle/Room';
import { Plate, Label, Rule, Frame, Pending } from '@/components/Furnishings';
import { profile, attachments, languages } from '@/data/profile';
import { contact } from '@/data/contact';
import { useStore } from '@/state/store';
import { useParallax } from '@/animations/useParallax';
import { chime } from '@/audio/ambience';

/**
 * I — THE ENTRANCE.
 *
 * Two great doors fill the screen. When the loader finishes they swing inward
 * on their hinges and the hall behind them is revealed: chandelier, staircase,
 * floor, and the name. Scrolling on walks into the hall itself, where the
 * personal record lies on the table.
 */
export function Entrance(): JSX.Element {
  const loaded = useStore((s) => s.loaded);
  const [stage, setStage] = useState(0);
  const stairs = useParallax(0.16);
  const floor = useParallax(-0.08);

  useEffect(() => {
    if (!loaded) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chime('door');
    const steps = reduced ? [0, 0, 0, 0] : [200, 1300, 2600, 3600];
    const timers = steps.map((t, i) => window.setTimeout(() => setStage(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, [loaded]);

  const doorsOpen = stage >= 1;

  return (
    <div id="entrance">
      <section aria-label="The entrance" className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6">
        {/* ---------------------------------------------------------- the hall behind the doors */}
        <div className="wood absolute inset-0 -z-30" aria-hidden />
        <div
          className="absolute inset-0 -z-20"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 18%, rgba(255,178,92,0.22) 0%, transparent 60%), linear-gradient(180deg, rgba(10,7,6,.45) 0%, rgba(10,7,6,.1) 30%, rgba(10,7,6,.97) 92%)',
          }}
          aria-hidden
        />
        {/* velvet curtains, drawn back */}
        <div className="velvet pointer-events-none absolute left-0 top-0 -z-10 h-full w-[18vw] max-w-[260px]" style={{ maskImage: 'linear-gradient(to right, black 30%, transparent)', WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent)' }} aria-hidden />
        <div className="velvet pointer-events-none absolute right-0 top-0 -z-10 h-full w-[18vw] max-w-[260px]" style={{ maskImage: 'linear-gradient(to left, black 30%, transparent)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent)' }} aria-hidden />

        <div
          ref={stairs.ref}
          className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[70vh] w-[46vw] max-w-[620px]"
          style={{ transform: `translate3d(0, ${stairs.offset}px, 0)` }}
          aria-hidden
        >
          <svg viewBox="0 0 620 700" className="h-full w-full" preserveAspectRatio="xMinYMax meet">
            <path d="M0 700 L0 300 L60 300 L60 340 L140 340 L140 388 L230 388 L230 436 L330 436 L330 486 L440 486 L440 540 L560 540 L560 700 Z" fill="#1a0f0b" />
            <path d="M0 296 L60 296 L140 336 L230 384 L330 432 L440 482 L560 536" fill="none" stroke="rgba(201,164,92,.35)" strokeWidth="3" />
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={20 + i * 62} y1={306 + i * 27} x2={20 + i * 62} y2={392 + i * 30} stroke="rgba(201,164,92,.18)" strokeWidth="2" />
            ))}
            {/* burgundy runner down the stairs */}
            <path d="M60 340 L140 388 L230 436 L330 486 L440 540 L440 560 L330 506 L230 456 L140 408 L60 360 Z" fill="rgba(90,23,32,.55)" />
          </svg>
          <div className="absolute bottom-[46%] left-[7%]"><Candle size={1.3} seed={5} /></div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[-9vh] -z-10 -translate-x-1/2 scale-[0.62] md:top-[-7vh] md:scale-[0.86]">
          <Chandelier />
        </div>

        <div ref={floor.ref} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[36vh] overflow-hidden" aria-hidden>
          <div
            className="absolute inset-x-[-45%] bottom-[-14%] top-0"
            style={{
              transform: `perspective(560px) rotateX(71deg) translateY(${floor.offset * 0.35}px)`,
              transformOrigin: '50% 100%',
              backgroundColor: '#120c09',
              backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(226,212,184,0.13) 0% 25%, rgba(18,12,9,0.92) 25% 50%)',
              backgroundSize: '130px 130px',
              maskImage: 'linear-gradient(to top, black 6%, transparent 86%)',
              WebkitMaskImage: 'linear-gradient(to top, black 6%, transparent 86%)',
            }}
          />
        </div>

        <Sconce side="left" top="28%" seed={2} />
        <Sconce side="right" top="24%" seed={7} />
        <Motes count={26} />

        {/* ---------------------------------------------------------- identity */}
        <div className="relative z-10 pt-[14vh] text-center md:pt-[12vh]">
          <p className="font-body text-[11px] tracking-royal text-gold/75" style={{ opacity: stage > 1 ? 1 : 0, transition: 'opacity 2s ease' }}>
            I · THE ENTRANCE
          </p>
          <h1
            className="font-display mt-6 text-[clamp(40px,8.6vw,128px)] leading-[0.9] text-ivory"
            style={{
              opacity: stage > 1 ? 1 : 0,
              transform: stage > 1 ? 'none' : 'translateY(18px)',
              filter: stage > 1 ? 'blur(0)' : 'blur(10px)',
              transition: 'opacity 2.4s cubic-bezier(.22,1,.36,1), transform 2.4s cubic-bezier(.22,1,.36,1), filter 2.4s ease',
              textShadow: '0 2px 40px rgba(255,186,96,.22)',
            }}
          >
            SHYAM SAI
            <br />
            <span className="text-[0.62em] tracking-[0.06em] text-parchment/90">TATIPARTI</span>
          </h1>
          <div className="rule-gold mx-auto mt-8 w-[min(420px,64vw)]" style={{ opacity: stage > 2 ? 1 : 0, transition: 'opacity 2.2s ease' }} />
          <p className="font-body mt-6 text-[12px] tracking-royal text-parchment/85 md:text-[13px]" style={{ opacity: stage > 2 ? 1 : 0, transition: 'opacity 2s ease' }}>
            {profile.discipline}
          </p>
          <p
            className="font-display mx-auto mt-5 max-w-[52ch] text-[15.5px] italic leading-relaxed text-ash md:text-[17px]"
            style={{ opacity: stage > 3 ? 1 : 0, transition: 'opacity 2.2s ease' }}
          >
            {profile.introduction}
          </p>
          <a
            href="#skills"
            className="group mt-12 inline-flex flex-col items-center gap-3"
            style={{ opacity: stage > 3 ? 1 : 0, transition: 'opacity 2s ease .4s' }}
          >
            <span className="font-body text-[11px] tracking-royal text-gold transition-colors group-hover:text-ivory">WALK IN</span>
            <span className="h-10 w-px bg-gradient-to-b from-gold/70 to-transparent transition-all duration-700 group-hover:h-14" aria-hidden />
          </a>
        </div>

        {/* ---------------------------------------------------------- the doors */}
        <div className="pointer-events-none absolute inset-0 z-20" style={{ perspective: '1800px' }} aria-hidden>
          {(['left', 'right'] as const).map((side) => (
            <div
              key={side}
              className="wood absolute top-0 h-full w-1/2 border-black/80"
              style={{
                [side]: 0,
                transformOrigin: `${side} center`,
                transform: doorsOpen ? `rotateY(${side === 'left' ? 104 : -104}deg)` : 'rotateY(0deg)',
                opacity: stage >= 3 ? 0 : 1,
                transition: 'transform 3.2s cubic-bezier(.55,.05,.25,1), opacity 1.4s ease',
                boxShadow: 'inset 0 0 120px rgba(0,0,0,.85)',
                borderRightWidth: side === 'left' ? 2 : 0,
                borderLeftWidth: side === 'right' ? 2 : 0,
              } as React.CSSProperties}
            >
              {/* raised panels */}
              <div className="absolute inset-[8%_14%_52%_14%] border border-gold/20" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,.7)' }} />
              <div className="absolute inset-[54%_14%_8%_14%] border border-gold/20" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,.7)' }} />
              {/* ring pull */}
              <div
                className="absolute top-1/2 h-14 w-14 -translate-y-1/2 rounded-full border-[3px]"
                style={{ [side === 'left' ? 'right' : 'left']: '6%', borderColor: '#8a6e3a', boxShadow: '0 4px 10px rgba(0,0,0,.8)' } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ the record on the hall table */}
      <Room kind="hall" id="entrance" anchor={false}>
        <div className="grid gap-10 md:grid-cols-[360px_minmax(0,1fr)] md:gap-14">
          {/* No photograph has been supplied, so the frame holds a monogram rather than an invented likeness. */}
          <Frame className="h-[440px]">
            <div className="velvet relative grid h-full place-items-center">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rotate-45 border border-gold/45" />
                <p className="font-display -mt-[68px] text-[34px] tracking-[0.12em] text-gold/85">S·S·T</p>
                <p className="mt-20 font-body text-[10px] tracking-label text-parchment/55">PORTRAIT PLATE</p>
              </div>
            </div>
          </Frame>

          <div className="space-y-8">
            <Plate className="p-8 md:p-10">
              <Label className="text-[#7a5a30]">PERSONAL RECORD</Label>
              <h3 className="font-display mt-3 text-[clamp(26px,3.6vw,42px)] leading-none text-[#2a1c10]">{profile.fullName}</h3>
              <p className="font-body mt-2 text-[12px] tracking-label text-[#6a4b28]">{profile.discipline}</p>
              <div className="my-6 h-px w-full bg-[#8a6a3a]/30" />
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['EDUCATION', profile.degree],
                  ['INSTITUTION', profile.institution],
                  ['PERIOD', profile.years],
                  ['LOCATION', profile.location],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">{k}</dt>
                    <dd className="font-display mt-1 text-[15px] leading-snug text-[#2a1c10]">{v}</dd>
                  </div>
                ))}
              </dl>
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block py-2 font-body text-[11px] tracking-label text-[#8B1E2D] underline decoration-[#8B1E2D]/40 underline-offset-4 hover:decoration-[#8B1E2D]"
                >
                  PUBLIC PROFILE ON LINKEDIN ↗
                </a>
              )}
            </Plate>

            <div className="grid gap-8 sm:grid-cols-2">
              <Plate className="p-7" delay={140} tilt={-0.4}>
                <Label className="text-[#7a5a30]">PRESENT DIRECTION</Label>
                <ul className="mt-4 space-y-2.5">
                  {profile.focus.map((f) => (
                    <li key={f} className="font-display flex items-baseline gap-3 text-[15px] text-[#2a1c10]">
                      <span className="text-[#8B1E2D]">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </Plate>

              <Plate className="p-7" delay={260} tilt={0.5}>
                <Label className="text-[#7a5a30]">LANGUAGES</Label>
                <ul className="mt-4 space-y-2">
                  {languages.map((l) => (
                    <li key={l.name}>
                      <p className="font-display text-[15px] text-[#2a1c10]">{l.name}</p>
                      <p className="font-body text-[10.5px] text-[#6a4b28]">{l.level}</p>
                    </li>
                  ))}
                </ul>
              </Plate>
            </div>

            {attachments.map((a) => (
              <Plate key={a.id} className="p-7" delay={340}>
                <Label className="text-[#7a5a30]">EXPERIENCE ON RECORD</Label>
                <h4 className="font-display mt-3 text-[22px] leading-tight text-[#2a1c10]">
                  {a.institution}
                  <span className="block text-[15px] tracking-[0.1em] text-[#6a4b28]">{a.place}</span>
                </h4>
                <Rule className="my-5 opacity-40" />
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-body text-[10.5px] tracking-label text-[#7a5a30]">ROLE & RESPONSIBILITIES</span>
                  <Pending />
                </div>
                <p className="font-body mt-4 max-w-[52ch] text-[12.5px] italic leading-relaxed text-[#5a4326]">
                  The institution appears on the public profile. Nothing further is claimed until it is confirmed.
                </p>
              </Plate>
            ))}
          </div>
        </div>
      </Room>
    </div>
  );
}
