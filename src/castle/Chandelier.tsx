'use client';
import { Candle } from './Candle';

/**
 * Trig results differ in the last decimal place between the Node server and the
 * browser's V8, which React reports as a hydration mismatch. Rounding every
 * rendered coordinate to two places makes server and client agree exactly.
 */
const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Chandelier — SVG armature, real candle components on the tiers.
 *
 * It sways by a third of a degree on a nine second period. At that amplitude
 * nobody consciously sees it move; they just feel the room is not a photograph.
 */
export function Chandelier({ className = '' }: { className?: string }): JSX.Element {
  const tier = (count: number, radius: number, y: number, size: number, seedBase: number): JSX.Element[] =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return (
        <div
          key={`${y}-${i}`}
          className="absolute"
          style={{
            left: `calc(50% + ${r2(Math.cos(a) * radius)}px)`,
            top: y,
            transform: 'translateX(-50%)',
            zIndex: Math.sin(a) > 0 ? 2 : 0,
          }}
        >
          <Candle size={size} seed={seedBase + i} pool={false} />
        </div>
      );
    });

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden style={{ animation: 'sway 11s ease-in-out infinite', transformOrigin: '50% 0%' }}>
      <div className="relative h-[300px] w-[380px]">
        {/* glow first, so the brass reads as lit rather than emissive */}
        <div
          className="absolute left-1/2 top-8 h-[440px] w-[560px] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,186,96,0.20) 0%, rgba(201,124,48,0.10) 30%, transparent 66%)' }}
        />
        <svg viewBox="0 0 380 300" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a5228" />
              <stop offset="45%" stopColor="#c9a45c" />
              <stop offset="100%" stopColor="#584a22" />
            </linearGradient>
          </defs>
          <line x1="190" y1="0" x2="190" y2="52" stroke="#6a5228" strokeWidth="2.5" />
          <ellipse cx="190" cy="58" rx="18" ry="7" fill="none" stroke="#8a6e3a" strokeWidth="2" />
          {/* tiers */}
          <ellipse cx="190" cy="96" rx="140" ry="26" fill="none" stroke="#a4813f" strokeWidth="2.2" opacity="0.9" />
          <ellipse cx="190" cy="150" rx="96" ry="19" fill="none" stroke="#a4813f" strokeWidth="2" opacity="0.8" />
          <ellipse cx="190" cy="196" rx="54" ry="12" fill="none" stroke="#a4813f" strokeWidth="1.8" opacity="0.75" />
          {/* arms */}
          {Array.from({ length: 12 }, (_, i) => {
            const x = r2(190 + Math.cos((i / 12) * Math.PI * 2) * 140);
            return <line key={i} x1="190" y1="62" x2={x} y2="96" stroke="#7d6230" strokeWidth="1.1" opacity="0.75" />;
          })}
          {/* crystal drops */}
          {Array.from({ length: 34 }, (_, i) => {
            const a = (i / 34) * Math.PI * 2;
            const r = 140 - (i % 3) * 22;
            const x = r2(190 + Math.cos(a) * r);
            const y = r2(100 + (i % 5) * 9 + Math.abs(Math.sin(a)) * 10);
            return <line key={`d${i}`} x1={x} y1={y} x2={x} y2={y + 16 + (i % 4) * 5} stroke="#e7d6b4" strokeWidth="0.7" opacity="0.28" />;
          })}
          <circle cx="190" cy="216" r="7" fill="#c9a45c" opacity="0.75" />
        </svg>
        {tier(12, 140, 78, 0.72, 1)}
        {tier(8, 96, 132, 0.62, 20)}
        {tier(5, 54, 180, 0.55, 40)}
      </div>
    </div>
  );
}
