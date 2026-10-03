'use client';

export interface QualityProfile {
  dpr: [number, number];
  dust: number;
  shadowMapSize: number;
  shadows: boolean;
  bloom: boolean;
  /** Zones rendered either side of the current one. Everything else stays unmounted. */
  zoneRadius: number;
  touch: boolean;
}

/**
 * Device capability detection, run once on the client.
 * Mobile is not a shrunk desktop: it gets fewer particles, a smaller shadow map,
 * a tighter streaming radius, and touch interaction instead of hover.
 */
export function detectQuality(): QualityProfile {
  if (typeof window === 'undefined') {
    return { dpr: [1, 1.5], dust: 2400, shadowMapSize: 2048, shadows: true, bloom: true, zoneRadius: 1, touch: false };
  }
  const touch = window.matchMedia('(hover: none)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const weak = touch || cores <= 4 || mem <= 4;

  if (weak) {
    return { dpr: [1, 1.6], dust: 700, shadowMapSize: 1024, shadows: !touch, bloom: true, zoneRadius: 0, touch };
  }
  return { dpr: [1, 2], dust: 3000, shadowMapSize: 2048, shadows: true, bloom: true, zoneRadius: 1, touch };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
