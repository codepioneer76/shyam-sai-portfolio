'use client';
import { useEffect, useState } from 'react';
import { chapters } from '@/data/chapters';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';

/** Rooms on the survey sheet: a castle keep drawn as a descending plan, each floor one room. */
const PLAN = chapters.map((c, i) => {
  const zig = i % 2 === 0 ? 0 : 1;
  return { ...c, x: 96 + zig * 218, y: 56 + i * 84, w: 228, h: 58 };
});

/**
 * The map — a parchment survey of the castle.
 *
 * It arrives folded into a strip and unfolds downward; the route between rooms
 * then inks itself in, and a brass pin marks where the visitor is standing.
 * Every room is a real link, so choosing one closes the map and walks there
 * through the same smooth scroll as everything else.
 */
export function EstateMap(): JSX.Element | null {
  const overlay = useStore((s) => s.overlay);
  const current = useStore((s) => s.chapter);
  const [unfolded, setUnfolded] = useState(false);

  useEffect(() => {
    if (overlay !== 'map') {
      setUnfolded(false);
      return;
    }
    chime('unfold');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => setUnfolded(true), reduced ? 0 : 40);
    return () => clearTimeout(t);
  }, [overlay]);

  if (overlay !== 'map') return null;

  const route = PLAN.map((r, i) => `${i === 0 ? 'M' : 'L'} ${r.x + r.w / 2} ${r.y + r.h / 2}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/88 p-4" role="dialog" aria-modal="true" aria-label="Map of the castle" onClick={() => actions.setOverlay('none')}>
      <div
        className="parchment-surface relative w-full max-w-2xl origin-top rounded-[2px] p-6 md:p-9"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: unfolded ? 'perspective(1400px) rotateX(0deg) scaleY(1)' : 'perspective(1400px) rotateX(-72deg) scaleY(0.08)',
          opacity: unfolded ? 1 : 0.4,
          transition: 'transform .9s cubic-bezier(.22,1,.36,1), opacity .5s ease',
        }}
      >
        {/* fold creases left from being carried */}
        {[25, 50, 75].map((t) => (
          <span key={t} className="pointer-events-none absolute inset-x-0 h-px bg-[#6a4b28]/18" style={{ top: `${t}%` }} aria-hidden />
        ))}
        {/* candlelight falling across the corner of the sheet */}
        <span className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,200,120,.22), transparent 70%)' }} aria-hidden />

        <header className="relative flex items-start justify-between">
          <div>
            <p className="font-body text-[10px] tracking-label text-[#7a5a30]">SURVEY OF THE CASTLE</p>
            <h2 className="font-display mt-2 text-[28px] text-[#2a1c10]">SEVEN ROOMS</h2>
          </div>
          <button onClick={() => actions.setOverlay('none')} className="font-body text-[10px] tracking-label text-[#6a4b28] hover:text-[#2a1c10]">
            FOLD AWAY [ESC]
          </button>
        </header>

        <svg viewBox="0 0 640 660" className="relative mt-4 w-full">
          {/* keep outline */}
          <path d="M74 30 L566 30 L566 640 L74 640 Z" fill="none" stroke="#6a4b28" strokeWidth={1.2} strokeDasharray="2 6" opacity={0.5} />
          <path
            d={route}
            fill="none"
            stroke="#5a3c1c"
            strokeWidth={2.2}
            strokeDasharray="6 5"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: unfolded ? 0 : 1, transition: 'stroke-dashoffset 1.4s ease .5s' }}
          />
          {PLAN.map((r, i) => {
            const here = r.id === current;
            return (
              <a
                key={r.id}
                href={`#${r.id}`}
                onClick={() => {
                  actions.setOverlay('none');
                  chime('nav');
                }}
                aria-label={`${r.numeral}. ${r.title} — ${r.question}`}
                style={{ opacity: unfolded ? 1 : 0, transition: `opacity .5s ease ${0.35 + i * 0.09}s` }}
              >
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={here ? '#e2c9b0' : '#dccaa3'}
                  stroke={here ? '#8B1E2D' : '#5a3c1c'}
                  strokeWidth={here ? 2.2 : 1.5}
                  className="transition-[fill] duration-300 hover:fill-[#e6cdb4]"
                />
                <text x={r.x + 14} y={r.y + 24} fontSize={15} fill="#8B1E2D" fontFamily="Didot, Georgia, serif">{r.numeral}</text>
                <text x={r.x + 52} y={r.y + 24} fontSize={13} letterSpacing={1.4} fill="#2a1c10" fontFamily="Georgia, serif">{r.title}</text>
                <text x={r.x + 52} y={r.y + 43} fontSize={10.5} fill="#6a4b28" fontStyle="italic" fontFamily="Georgia, serif">{r.room}</text>
                {here && (
                  <g>
                    <circle cx={r.x + r.w - 16} cy={r.y + 16} r={7} fill="url(#pin)" stroke="#3d2f18" strokeWidth={0.8} />
                    <text x={r.x + r.w + 10} y={r.y + r.h / 2 + 4} fontSize={9} letterSpacing={1.2} fill="#8B1E2D" fontFamily="Georgia, serif">◂ YOU ARE HERE</text>
                  </g>
                )}
              </a>
            );
          })}
          <defs>
            <radialGradient id="pin" cx="35%" cy="30%">
              <stop offset="0" stopColor="#f0d28a" />
              <stop offset="1" stopColor="#8a6e3a" />
            </radialGradient>
          </defs>
          {/* compass rose */}
          <g transform="translate(600,40)" opacity={0.7}>
            <circle r={24} fill="none" stroke="#6a4b28" strokeWidth={1.3} />
            <path d="M0 -26 L6 0 L0 26 L-6 0 Z" fill="#8B1E2D" opacity={0.8} />
            <text x={-4} y={-30} fontSize={10} fill="#2a1c10">N</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
