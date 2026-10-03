/**
 * Seeded RNG (mulberry32).
 *
 * Set dressing must look scattered but never re-scatter: a room that rearranges
 * itself on re-entry destroys the sense of a real place. Seeding by zone index
 * gives every room its own stable mess.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(r: () => number, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
export const range = (r: () => number, a: number, b: number): number => a + r() * (b - a);
