'use client';
import { useEffect, useRef, useState } from 'react';
import { arsenal, type ArsenalItem } from '@/data/arsenal';
import { stepSpring, type SpringState } from '@/animations/spring';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';
import { closeCase, releaseLatch } from './caseMachine';
import { Candle } from '@/castle/Candle';

/**
 * THE TRAVELLING CASE — the centrepiece of Chapter III.
 *
 * Built in CSS 3D rather than WebGL. The lid is a plane hinged at its back edge
 * with `transform-origin: top`, driven by a spring integrated in a rAF loop, so
 * it accelerates, overshoots by a degree and settles. The brass latches release
 * first and the interior light comes up a beat later — the sequence is what sells
 * the weight, not the geometry.
 */
export function Case(): JSX.Element {
  const open = useStore((s) => s.caseStage === 'open');
  const latchL = useStore((s) => s.latchL);
  const latchR = useStore((s) => s.latchR);
  const selected = useStore((s) => s.artifact);
  const select = actions.setArtifact;

  const [lid, setLid] = useState(0);
  const spring = useRef<SpringState>({ value: 0, velocity: 0 });
  const raf = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reduced.current) {
      spring.current = { value: open ? 1 : 0, velocity: 0 };
      setLid(open ? 1 : 0);
      return;
    }
    let last = performance.now();
    const tick = (now: number): void => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      // A heavy lid: low stiffness, damping just under critical so it overshoots once.
      spring.current = stepSpring(spring.current, open ? 1 : 0, dt, open ? 62 : 90, open ? 13.5 : 19);
      setLid(spring.current.value);
      if (Math.abs(spring.current.value - (open ? 1 : 0)) > 0.0006 || Math.abs(spring.current.velocity) > 0.0015) {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open]);

  const angle = -lid * 104;
  const interior = Math.max(0, (lid - 0.32) / 0.68);

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <div
        className="relative mx-auto"
        style={{ perspective: '1600px', perspectiveOrigin: '50% 30%' }}
      >
        {/* pool of candlelight the case sits in */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, rgba(255,186,96,${0.10 + interior * 0.12}) 0%, transparent 62%)`,
          }}
          aria-hidden
        />

        {/* LID */}
        <div
          className="leather absolute inset-x-0 top-0 z-20 origin-top rounded-[6px] border border-black/70"
          style={{
            height: '62%',
            transform: `rotateX(${angle}deg)`,
            transformStyle: 'preserve-3d',
            boxShadow: '0 24px 60px rgba(0,0,0,.75), inset 0 1px 0 rgba(201,164,92,.14)',
            transformOrigin: 'top center',
          }}
          aria-hidden={open}
        >
          {/* outer face: tooled border and a monogram plate */}
          <div className="absolute inset-3 rounded-[4px] border border-gold/20" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-center">
              <div className="mx-auto h-[52px] w-[52px] rotate-45 border border-gold/45" />
              <p className="font-display -mt-[38px] text-[17px] tracking-royal text-gold/80">S · S</p>
              <p className="mt-9 font-body text-[11px] tracking-label text-parchment/45">TRAVELLING CASE — PERSONAL EFFECTS</p>
            </div>
          </div>
          {/* inner face of the lid, seen once it swings back */}
          <div
            className="velvet absolute inset-0 rounded-[6px] border border-black/60"
            style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
          >
            <div className="absolute inset-4 border border-gold/15" />
          </div>
        </div>

        {/* BODY */}
        <div
          className="leather relative z-10 overflow-hidden rounded-[6px] border border-black/70"
          style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,.6), 0 40px 90px rgba(0,0,0,.72)' }}
        >
          <div className="aspect-[3/4] w-full p-3 sm:aspect-[16/10] sm:p-4 md:p-6">
            {/* velvet tray */}
            <div
              className="velvet relative h-full w-full rounded-[3px] border border-black/60 p-3 md:p-4"
              style={{ boxShadow: 'inset 0 6px 24px rgba(0,0,0,.85)' }}
            >
              {/* interior candle glow, rising with the lid */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, rgba(255,196,116,${interior * 0.26}) 0%, transparent 64%)`,
                  transition: 'background 120ms linear',
                }}
                aria-hidden
              />
              <div
                className="grid h-full grid-cols-2 gap-2.5 transition-opacity duration-700 sm:grid-cols-3 md:grid-cols-4 md:gap-3"
                style={{ opacity: interior }}
                aria-hidden={!open}
              >
                {arsenal.map((item, i) => (
                  <Artifact
                    key={item.id}
                    item={item}
                    index={i}
                    shown={interior > 0.35}
                    active={selected?.id === item.id}
                    onSelect={() => {
                      select(item);
                      chime('folder');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LATCHES — they release before the lid moves */}
        {([-1, 1] as const).map((side) => {
          const released = side === -1 ? latchL : latchR;
          return (
          <button
            key={side}
            onClick={() => {
              if (open) closeCase();
              else releaseLatch(side === -1 ? 'L' : 'R');
            }}
            aria-label={open ? 'Close the case' : released ? 'Latch released' : `Release the ${side === -1 ? 'left' : 'right'} latch`}
            aria-pressed={released}
            className="group absolute z-30 -translate-x-1/2"
            style={{ left: `${50 + side * 26}%`, top: 'calc(62% - 14px)' }}
          >
            <span
              className="block h-7 w-11 rounded-[2px] border border-black/60"
              style={{
                background: 'linear-gradient(180deg, #d8b46b, #8a6e3a 52%, #4b3a1c)',
                transform: `rotateX(${released ? -62 : 0}deg)`,
                transition: 'transform .18s cubic-bezier(.3,1.6,.5,1)',
                transformOrigin: 'top center',
                boxShadow: '0 3px 8px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,232,180,.45)',
              }}
            />
            <span className="mt-2 block text-center font-body text-[9.5px] tracking-label text-gold/45 transition-colors group-hover:text-gold">
              {open ? 'CLOSE' : released ? 'RELEASED' : 'UNLATCH'}
            </span>
          </button>
          );
        })}

        {/* handle */}
        <div className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-28 -translate-x-1/2 rounded-b-full border border-black/70" style={{ background: 'linear-gradient(180deg,#3a2415,#1a0f08)' }} aria-hidden />
      </div>

      {/* candles flanking the table */}
      <div className="mt-10 flex items-end justify-center gap-16 opacity-90">
        <Candle size={1.25} seed={3} />
        <Candle size={0.95} seed={9} />
      </div>
    </div>
  );
}

const FORM: Record<ArsenalItem['kind'], { label: string; edge: string }> = {
  volume: { label: 'BOUND VOLUME', edge: 'linear-gradient(90deg,#5a1720,#2a0d10 18%,#2a0d10 82%,#5a1720)' },
  dossier: { label: 'RESEARCH DOSSIER', edge: 'linear-gradient(90deg,#4a3420,#241708 16%,#241708 84%,#4a3420)' },
  ledger: { label: 'LEDGER', edge: 'linear-gradient(90deg,#3a2a18,#1c1209 16%,#1c1209 84%,#3a2a18)' },
  blueprint: { label: 'FOLDED PLATE', edge: 'linear-gradient(90deg,#1e2a2e,#0d1417 16%,#0d1417 84%,#1e2a2e)' },
  manuscript: { label: 'SEALED MANUSCRIPT', edge: 'linear-gradient(90deg,#4a3a22,#221a0d 16%,#221a0d 84%,#4a3a22)' },
};

/** One capability, as an object in a fitted compartment. */
function Artifact({
  item,
  index,
  shown,
  active,
  onSelect,
}: {
  item: ArsenalItem;
  index: number;
  shown: boolean;
  active: boolean;
  onSelect: () => void;
}): JSX.Element {
  const form = FORM[item.kind];
  return (
    <button
      onClick={onSelect}
      tabIndex={shown ? 0 : -1}
      aria-label={`${item.name} — ${item.cat}`}
      className="group relative block h-full w-full text-left"
      style={{
        transform: shown ? 'translateY(0)' : 'translateY(10px)',
        opacity: shown ? 1 : 0,
        transition: `transform .7s cubic-bezier(.22,1,.36,1) ${index * 42}ms, opacity .7s ease ${index * 42}ms`,
      }}
    >
      {/* compartment */}
      <span className="absolute inset-0 rounded-[2px] border border-black/70 bg-black/45" />
      {/* the object itself */}
      <span
        className="absolute inset-[3px] rounded-[2px] border border-black/60 p-2 transition-transform duration-500"
        style={{
          background: form.edge,
          transform: active ? 'translateY(-5px) rotate(-0.5deg)' : 'none',
          boxShadow: active
            ? '0 10px 22px rgba(0,0,0,.7), 0 0 0 1px rgba(201,164,92,.55)'
            : '0 4px 10px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.05)',
        }}
      >
        <span className="flex h-full flex-col justify-between">
          <span className="block">
            <span className="block h-px w-full bg-gold/35" />
            <span className="mt-2 block font-display text-[12.5px] leading-tight text-ivory/95 md:text-[13.5px]">
              {item.name}
            </span>
          </span>
          <span className="block">
            <span className="block font-body text-[9px] tracking-label text-gold/60">{form.label}</span>
            <span className="mt-1 block font-body text-[8.5px] tracking-label text-parchment/70">{item.state}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
