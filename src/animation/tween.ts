import { clamp, easeInOutCubic } from '@/utils/math';

interface Tween {
  t: number;
  dur: number;
  ease: (t: number) => number;
  update: (v: number, raw: number) => void;
  done?: () => void;
  cancelled: boolean;
}

/**
 * Minimal tween runner, stepped from the R3F frame loop.
 * Deliberately not GSAP: the whole surface used here is 40 lines, and staying
 * inside the R3F loop keeps animation and rendering on the same clock.
 */
class TweenRunner {
  private list: Tween[] = [];

  to(
    dur: number,
    update: (v: number, raw: number) => void,
    ease: (t: number) => number = easeInOutCubic,
    done?: () => void,
  ): Tween {
    const tw: Tween = { t: 0, dur, ease, update, done, cancelled: false };
    this.list.push(tw);
    return tw;
  }

  cancel(tw: Tween | null): void {
    if (tw) tw.cancelled = true;
  }

  clear(): void {
    this.list.length = 0;
  }

  step(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const tw = this.list[i];
      if (tw.cancelled) {
        this.list.splice(i, 1);
        continue;
      }
      tw.t += dt;
      const raw = clamp(tw.t / tw.dur, 0, 1);
      tw.update(tw.ease(raw), raw);
      if (raw >= 1) {
        this.list.splice(i, 1);
        tw.done?.();
      }
    }
  }
}

export const tweens = new TweenRunner();
