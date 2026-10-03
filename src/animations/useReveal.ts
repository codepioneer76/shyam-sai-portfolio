'use client';
import { useEffect, useRef } from 'react';

/**
 * useReveal — one IntersectionObserver per element, disconnected after firing.
 * Content is visible by default in CSS when motion is reduced, so nothing can
 * be trapped behind an animation that never runs.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.shown = 'true';
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => {
          el.dataset.shown = 'true';
        }, delay);
        io.disconnect();
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return ref;
}
