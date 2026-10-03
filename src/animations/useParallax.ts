'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * useParallax — scroll-linked offset for one element.
 *
 * Reads layout once per resize, then only on scroll via rAF, and writes a
 * transform. No layout thrash, no continuous loop when the page is still, and it
 * returns 0 under prefers-reduced-motion so layers sit flat.
 */
export function useParallax(strength = 0.2): { ref: React.RefObject<HTMLDivElement>; offset: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let running = false;

    const update = (): void => {
      running = false;
      const rect = el.getBoundingClientRect();
      const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(-centre * strength);
    };
    const onScroll = (): void => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [strength]);

  return { ref, offset };
}
