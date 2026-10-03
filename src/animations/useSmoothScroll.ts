'use client';
import { useEffect } from 'react';
import type Lenis from 'lenis';

/**
 * Smooth scroll.
 *
 * Lenis is the only third-party runtime dependency in this project. Momentum
 * scrolling that feels right across trackpads, wheels and touch is genuinely
 * fiddly, and it costs about 3 kB.
 *
 * It is loaded with a dynamic import rather than a static one so it stays out of
 * the initial bundle and never reaches the server. The try/catch covers a chunk
 * that fails to arrive over the network at runtime — the page then scrolls
 * natively and nothing else changes.
 *
 * It does NOT cover a missing install: webpack resolves this specifier at build
 * time, so `npm install` is still required, exactly as it is for React itself.
 * (Verified by deleting node_modules/lenis and watching dev return 500.)
 *
 * Reduced motion is honoured live, not just at mount: if the visitor changes the
 * OS setting while the page is open, the instance is destroyed and native
 * scrolling takes over immediately.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let frame = 0;
    let cancelled = false;

    const start = async (): Promise<void> => {
      if (cancelled || lenis || media.matches) return;
      try {
        const { default: LenisCtor } = await import('lenis');
        if (cancelled || media.matches) return;

        lenis = new LenisCtor({
          duration: 1.25,
          easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
          touchMultiplier: 1.4,
          wheelMultiplier: 0.9,
        });

        const raf = (time: number): void => {
          lenis?.raf(time);
          frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);
      } catch {
        // Chunk failed to load — fall through to native scrolling.
        lenis = null;
      }
    };

    const stop = (): void => {
      cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = null;
    };

    /**
     * Anchor handling lives outside Lenis so the index, the map and the mobile
     * bar all navigate correctly whether or not smooth scroll loaded.
     */
    const jump = (e: MouseEvent): void => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const dest = document.getElementById(hash.slice(1));
      if (!dest) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(dest, { duration: 1.8 });
      } else {
        dest.scrollIntoView({ behavior: media.matches ? 'auto' : 'smooth' });
      }
      history.replaceState(null, '', hash);
    };

    const onMotionChange = (): void => {
      if (media.matches) stop();
      else void start();
    };

    void start();
    document.addEventListener('click', jump);
    media.addEventListener('change', onMotionChange);

    return () => {
      cancelled = true;
      document.removeEventListener('click', jump);
      media.removeEventListener('change', onMotionChange);
      stop();
    };
  }, []);
}
