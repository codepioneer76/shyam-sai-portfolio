/**
 * A critically-damped-ish spring, used for the case lid and drawers.
 * Authored motion rather than a physics engine: the lid must feel heavy the
 * same way every time, which a solver cannot promise.
 */
export interface SpringState {
  value: number;
  velocity: number;
}

export function stepSpring(
  s: SpringState,
  target: number,
  dt: number,
  stiffness = 120,
  damping = 18,
  mass = 1,
): SpringState {
  const f = -stiffness * (s.value - target);
  const d = -damping * s.velocity;
  const a = (f + d) / mass;
  const velocity = s.velocity + a * dt;
  const value = s.value + velocity * dt;
  return { value, velocity };
}

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
export const easeOutBack = (t: number, s = 1.3): number =>
  1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
