'use client';

/**
 * Candle — the only light source language in the castle.
 *
 * Flame, halo and cast pool are three separate layers with different animation
 * periods, so the light never pulses in lockstep. Seeded by index rather than
 * randomised, so a room lights the same way every visit.
 */
export function Candle({
  size = 1,
  seed = 0,
  className = '',
  pool = true,
}: {
  size?: number;
  seed?: number;
  className?: string;
  pool?: boolean;
}): JSX.Element {
  const delay = `-${(seed % 7) * 0.43 + 0.2}s`;
  const duration = `${3.1 + (seed % 5) * 0.37}s`;

  return (
    <span className={`pointer-events-none relative inline-block ${className}`} style={{ width: 10 * size, height: 46 * size }} aria-hidden>
      {/* cast pool on whatever is beneath */}
      {pool && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 190 * size,
            height: 190 * size,
            top: -70 * size,
            background: 'radial-gradient(circle, rgba(255,190,105,0.20) 0%, rgba(201,124,48,0.09) 32%, transparent 68%)',
            animation: `halo ${duration} ease-in-out infinite`,
            animationDelay: delay,
          }}
        />
      )}
      {/* wax */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 6 * size,
          height: 34 * size,
          background: 'linear-gradient(180deg, #efe3c6, #c9b189 55%, #7d6a4c)',
          boxShadow: 'inset -1px 0 2px rgba(0,0,0,.45)',
          borderRadius: '2px 2px 1px 1px',
        }}
      />
      {/* flame */}
      <span
        className="flame absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 32 * size,
          width: 7 * size,
          height: 14 * size,
          borderRadius: '50% 50% 46% 46% / 66% 66% 34% 34%',
          background: 'radial-gradient(ellipse at 50% 72%, #fff6d8 0%, #ffcf7a 38%, #e07b26 72%, rgba(160,60,10,0) 100%)',
          filter: `blur(${0.4 * size}px)`,
          transformOrigin: '50% 100%',
          animation: `flame ${duration} ease-in-out infinite`,
          animationDelay: delay,
        }}
      />
    </span>
  );
}

/** A wall sconce: candles in a brass arm, with the gilding drawn as hairlines. */
export function Sconce({ side, top, seed = 0 }: { side: 'left' | 'right'; top: string; seed?: number }): JSX.Element {
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ top, [side]: '3%' } as React.CSSProperties}
      aria-hidden
    >
      <div className="relative flex items-end gap-2">
        <Candle size={0.9} seed={seed} />
        <Candle size={1.15} seed={seed + 2} />
        <Candle size={0.85} seed={seed + 4} />
        <div
          className="absolute -bottom-3 left-1/2 h-[3px] w-16 -translate-x-1/2 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,164,92,.75), rgba(138,110,58,.5), transparent)' }}
        />
      </div>
    </div>
  );
}
