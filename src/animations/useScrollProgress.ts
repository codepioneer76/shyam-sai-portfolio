'use client';
import { useEffect, useRef } from 'react';

/**
 * Scroll progress of an element through the viewport, 0 → 1, delivered to a
 * callback rather than to React state.
 *
 * The callback writes transforms directly, so a doorway passing the camera costs
 * one rAF-throttled read and one style write per frame — no re-render, no layout
 * thrash. Reduced motion receives a fixed midpoint so the element sits still.
 */
export function useScrollProgress<T extends HTMLElement>(
  onProgress: (p: number) => void,
  /**
   * 'pass'   — 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top.
   * 'pinned' — 0 when its top reaches the top of the viewport, 1 when its bottom reaches the bottom.
   *            The right measure for a tall container with a sticky child.
   */
  mode: 'pass' | 'pinned' = 'pass',
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cb.current(0.5);
      return;
    }
    let frame = 0;
    let queued = false;
    let visible = false;

    const measure = (): void => {
      queued = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = mode === 'pinned' ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
      cb.current(Math.min(1, Math.max(0, p)));
    };
    const onScroll = (): void => {
      if (!visible || queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [mode]);

  return ref;
}
