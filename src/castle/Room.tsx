'use client';
import { type ReactNode } from 'react';
import { Sconce } from './Candle';
import { Motes } from './Motes';
import { useParallax } from '@/animations/useParallax';
import { RoomTitle } from './RoomTitle';
import { chapterById, type ChapterId } from '@/data/chapters';

export type RoomKind = 'hall' | 'library' | 'workroom' | 'investigation' | 'laboratory' | 'gallery' | 'records' | 'study' | 'threshold';

/**
 * Room — the shared architecture every chapter is staged inside.
 *
 * Four layers, all CSS: back wall (panelling or stone), an arch or aperture,
 * floor in perspective, and drapery at the edges of frame. They move at
 * different rates on scroll, which is what makes the page read as depth rather
 * than as stacked sections.
 */
export function Room({
  kind,
  id,
  children,
  tall = false,
  dim = 0,
  anchor = true,
}: {
  kind: RoomKind;
  id: ChapterId;
  children: ReactNode;
  tall?: boolean;
  /** 0–1: how far the candles in this room have burned down. The final room uses it. */
  dim?: number;
  /** Set false when an outer element already carries the chapter's anchor id. */
  anchor?: boolean;
}): JSX.Element {
  const chapter = chapterById(id);
  const numeral = chapter.numeral;
  const back = useParallax(0.12);
  const mid = useParallax(0.28);
  const floor = useParallax(-0.1);

  const palette: Record<RoomKind, { wall: string; wash: string; floor: string }> = {
    hall: { wall: 'wood', wash: 'rgba(201,124,48,0.16)', floor: 'checker' },
    library: { wall: 'wood', wash: 'rgba(180,110,45,0.13)', floor: 'boards' },
    workroom: { wall: 'velvet', wash: 'rgba(201,124,48,0.15)', floor: 'boards' },
    investigation: { wall: 'wood', wash: 'rgba(160,95,40,0.12)', floor: 'boards' },
    laboratory: { wall: 'wood', wash: 'rgba(120,90,60,0.1)', floor: 'stone' },
    gallery: { wall: 'velvet', wash: 'rgba(180,110,45,0.1)', floor: 'checker' },
    records: { wall: 'wood', wash: 'rgba(150,95,40,0.1)', floor: 'boards' },
    study: { wall: 'wood', wash: 'rgba(190,120,50,0.13)', floor: 'boards' },
    threshold: { wall: 'velvet', wash: 'rgba(232,205,150,0.18)', floor: 'stone' },
  };
  const p = palette[kind];

  return (
    <section
      id={anchor ? id : undefined}
      aria-labelledby={`${id}-title`}
      className={`relative isolate flex w-full flex-col justify-center overflow-clip ${tall ? 'min-h-[150vh]' : 'min-h-[110vh]'} px-6 py-24 md:px-14`}
    >
      {/* back wall */}
      <div
        ref={back.ref}
        className={`absolute inset-0 -z-30 ${p.wall}`}
        style={{ transform: `translate3d(0, ${back.offset}px, 0)` }}
        aria-hidden
      />
      {/* seams: every room dissolves into the doorway either side of it */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[22vh] bg-gradient-to-b from-ink to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22vh] bg-gradient-to-t from-ink to-transparent" aria-hidden />
      {/* candle wash + darkness at the edges */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 34%, ${p.wash} 0%, transparent 62%), linear-gradient(180deg, rgba(10,7,6,0.92) 0%, rgba(10,7,6,0.35) 35%, rgba(10,7,6,0.96) 100%)`,
          opacity: 1 - dim * 0.6,
        }}
        aria-hidden
      />
      {/* arch */}
      <div
        ref={mid.ref}
        className="pointer-events-none absolute left-1/2 top-[6%] -z-20 h-[62vh] w-[74vw] max-w-[1100px] -translate-x-1/2"
        style={{ transform: `translate3d(-50%, ${mid.offset}px, 0)` }}
        aria-hidden
      >
        <svg viewBox="0 0 1100 700" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M40 700 L40 300 Q550 -70 1060 300 L1060 700 Z"
            fill="none"
            stroke="rgba(201,164,92,0.16)"
            strokeWidth="2"
          />
          <path
            d="M92 700 L92 316 Q550 -6 1008 316 L1008 700 Z"
            fill="rgba(0,0,0,0.34)"
            stroke="rgba(201,164,92,0.10)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* floor */}
      <div
        ref={floor.ref}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[38vh] overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-x-[-40%] bottom-[-12%] top-0"
          style={{
            transform: `perspective(520px) rotateX(70deg) translateY(${floor.offset * 0.4}px)`,
            transformOrigin: '50% 100%',
            backgroundColor: '#140d0a',
            backgroundImage:
              p.floor === 'checker'
                ? 'repeating-conic-gradient(from 0deg, rgba(233,220,190,0.10) 0% 25%, rgba(20,13,10,0.9) 25% 50%)'
                : p.floor === 'boards'
                  ? 'repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 2px, rgba(86,52,30,0.22) 2px 74px)'
                  : 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 2px, rgba(70,64,58,0.16) 2px 90px), repeating-linear-gradient(90deg, rgba(0,0,0,0.5) 0 2px, rgba(70,64,58,0.14) 2px 120px)',
            backgroundSize: p.floor === 'checker' ? '120px 120px' : undefined,
            maskImage: 'linear-gradient(to top, black 8%, transparent 88%)',
            WebkitMaskImage: 'linear-gradient(to top, black 8%, transparent 88%)',
          }}
        />
      </div>

      {/* drapery at both edges of frame */}
      <Drape side="left" />
      <Drape side="right" />

      <div style={{ opacity: 1 - dim * 0.85, transition: 'opacity 1.2s ease' }}>
        <Sconce side="left" top="16%" seed={numeral.length * 3} />
        <Sconce side="right" top="22%" seed={numeral.length * 5 + 1} />
      </div>
      <Motes count={22} />

      <RoomTitle id={id} title={chapter.title} former={chapter.formerTitle} numeral={numeral} question={chapter.question} />

      <div className="relative z-10 mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

function Drape({ side }: { side: 'left' | 'right' }): JSX.Element {
  return (
    <div
      className="velvet pointer-events-none absolute top-0 -z-10 h-full w-[16vw] max-w-[230px]"
      style={{
        [side]: 0,
        maskImage: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, black 18%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, black 18%, transparent 100%)`,
        opacity: 0.85,
      } as React.CSSProperties}
      aria-hidden
    />
  );
}
