'use client';
import { useRef, useState } from 'react';
import { Room } from '@/castle/Room';
import { Label } from '@/components/Furnishings';
import { buildStages } from '@/data/build';
import { useScrollProgress } from '@/animations/useScrollProgress';
import { chime } from '@/audio/ambience';

/** Node positions on the sheet: a serpentine route, drawn by hand rather than on a grid. */
const NODES: [number, number][] = [
  [110, 110], [380, 90], [640, 150], [880, 250], [640, 360], [370, 430], [150, 520],
];
const ROUTE = 'M110 110 C 230 60, 290 80, 380 90 S 560 190, 640 150 S 860 170, 880 250 S 760 380, 640 360 S 470 440, 370 430 S 210 520, 150 520';

/**
 * VI — HOW I BUILD. A blank engineering sheet that draws itself as you scroll.
 *
 * The section is pinned while its container scrolls past, and scroll progress
 * drives the ink: the route extends, each stage's node is stamped as the line
 * reaches it, and its margin note appears. Nodes are also buttons, so the whole
 * process can be read by clicking or tabbing instead of scrolling.
 */
export function HowIBuild(): JSX.Element {
  const [stage, setStage] = useState(-1);
  const [picked, setPicked] = useState<number | null>(null);
  const route = useRef<SVGPathElement>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const reachedRef = useRef(-1);

  const ref = useScrollProgress<HTMLDivElement>((p) => {
    const drawn = Math.min(1, p * 1.12);
    if (route.current) route.current.style.strokeDashoffset = String(1 - drawn);
    const idx = Math.min(buildStages.length - 1, Math.floor(drawn * buildStages.length - 0.15));
    if (idx !== reachedRef.current) {
      if (idx > reachedRef.current) chime('type');
      reachedRef.current = idx;
      setStage(idx);
    }
  }, 'pinned');

  const current = picked ?? Math.max(0, stage);
  const s = buildStages[current];

  const goTo = (i: number): void => {
    setPicked(i);
    chime('paper');
  };

  return (
    <Room kind="study" id="build">
      <div
        ref={(el) => {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          container.current = el;
        }}
        className="relative h-[320vh]"
      >
        <div className="sticky top-0 flex min-h-screen flex-col justify-center gap-8 py-10 lg:flex-row lg:items-center">
          {/* the sheet */}
          <div className="parchment-surface relative w-full rounded-[2px] p-4 lg:w-[62%] lg:p-6">
            <div className="absolute inset-3 border border-[#8a6a3a]/25" aria-hidden />
            {/* faint construction grid */}
            <div
              className="pointer-events-none absolute inset-6 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(90,60,28,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(90,60,28,.12) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
              aria-hidden
            />
            <svg viewBox="0 0 1000 620" className="relative w-full" role="group" aria-label="Engineering process, drawn as a route">
              <path
                ref={route}
                d={ROUTE}
                fill="none"
                stroke="#4a2e14"
                strokeWidth={2.2}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                strokeLinecap="round"
              />
              {buildStages.map((b, i) => {
                const [x, y] = NODES[i];
                const reached = i <= stage;
                const active = i === current;
                return (
                  <g key={b.id} style={{ opacity: reached ? 1 : 0.14, transition: 'opacity .6s ease' }}>
                    <circle cx={x} cy={y} r={active ? 30 : 24} fill="#e7d6b4" stroke={active ? '#8B1E2D' : '#4a2e14'} strokeWidth={active ? 2.4 : 1.6} style={{ transition: 'r .4s ease' }} />
                    <text x={x} y={y + 6} textAnchor="middle" fontSize={17} fill={active ? '#8B1E2D' : '#2a1c10'} fontFamily="Didot, Georgia, serif">
                      {String(i + 1).padStart(2, '0')}
                    </text>
                    <text x={x} y={y + 52} textAnchor="middle" fontSize={15} letterSpacing={3} fill="#2a1c10" fontFamily="Georgia, serif">
                      {b.name}
                    </text>
                    {/* margin note, inked in once the route reaches the stage */}
                    <text
                      x={x}
                      y={y - 40}
                      textAnchor="middle"
                      fontSize={13}
                      fill="#6a4b28"
                      fontStyle="italic"
                      fontFamily="Georgia, serif"
                      style={{ opacity: reached ? 1 : 0, transition: 'opacity .8s ease .2s' }}
                    >
                      {b.margin}
                    </text>
                    {/* stamp */}
                    <g style={{ opacity: reached ? 0.8 : 0, transform: reached ? 'scale(1)' : 'scale(1.6)', transformOrigin: `${x + 34}px ${y - 22}px`, transition: 'opacity .35s ease .15s, transform .35s cubic-bezier(.3,1.6,.5,1) .15s' }}>
                      <circle cx={x + 34} cy={y - 22} r={9} fill="none" stroke="#8B1E2D" strokeWidth={1.4} />
                      <path d={`M${x + 29} ${y - 22} l3 3 l6 -7`} fill="none" stroke="#8B1E2D" strokeWidth={1.6} />
                    </g>
                    {/* the node is also a control */}
                    <circle
                      cx={x}
                      cy={y}
                      r={34}
                      fill="transparent"
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`${b.name}: ${b.principle}`}
                      onClick={() => goTo(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goTo(i);
                        }
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* the reading for the current stage */}
          <div key={s.id} className="w-full lg:w-[38%]" style={{ animation: 'recordIn .55s cubic-bezier(.22,1,.36,1) both' }} aria-live="polite">
            <Label>STAGE {String(current + 1).padStart(2, '0')} OF {String(buildStages.length).padStart(2, '0')}</Label>
            <h3 className="font-display mt-3 text-[clamp(30px,4vw,48px)] leading-none text-ivory">{s.name}</h3>
            <div className="rule-gold my-6 w-40" />
            <p className="font-display text-[20px] leading-snug text-parchment/90">{s.principle}</p>
            <p className="font-body mt-5 text-[14px] leading-[1.9] text-parchment/65">{s.evidence}</p>
            {picked !== null && (
              <button onClick={() => setPicked(null)} className="mt-6 font-body text-[10px] tracking-label text-gold/70 hover:text-gold">
                FOLLOW THE SCROLL AGAIN
              </button>
            )}
          </div>
        </div>
      </div>
    </Room>
  );
}
