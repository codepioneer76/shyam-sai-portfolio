'use client';
import { useMemo } from 'react';

/**
 * Motes — dust in the candlelight.
 * Pure CSS transforms on a handful of spans: no canvas, no rendering loop, and
 * it stops entirely under prefers-reduced-motion.
 */
export function Motes({ count = 20 }: { count?: number }): JSX.Element {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        bottom: `${(i * 23) % 70}%`,
        size: 1 + ((i * 7) % 3) * 0.7,
        duration: 18 + ((i * 13) % 22),
        delay: -((i * 5) % 20),
        opacity: 0.18 + ((i * 11) % 5) * 0.06,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote absolute rounded-full bg-parchment"
          style={{
            left: m.left,
            bottom: m.bottom,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            animation: `drift ${m.duration}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
