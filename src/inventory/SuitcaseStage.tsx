'use client';
import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Case } from './Case';
import type { Tier } from './Suitcase3D';
import { useStore } from '@/state/store';
import { closeCase, releaseNext } from './caseMachine';
import { SkillRecord } from './SkillRecord';
import { TraySelector } from './TraySelector';

/** The 3D case is its own chunk: it is not downloaded until the visitor is a room away. */
const Suitcase3D = dynamic(() => import('./Suitcase3D'), {
  ssr: false,
  loading: () => <CaseSilhouette label="THE CASE IS BEING BROUGHT IN" />,
});

/** If WebGL throws anywhere inside the canvas, the visitor gets the drawn case instead of a hole. */
class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  componentDidCatch(error: unknown): void {
    console.warn('3D case unavailable, using the drawn case instead:', error);
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Decide whether the 3D case is worth rendering on this machine.
 *
 * No WebGL at all → the drawn case. WebGL running on a *software* rasteriser
 * (SwiftShader, llvmpipe — what Chrome falls back to on blocklisted or GPU-less
 * machines) → also the drawn case: measured here at about 2 fps, which would drag
 * the whole page down for the sake of one object. `?case=3d` or `?case=2d`
 * overrides the decision, for testing.
 */
function choose3D(): boolean {
  const force = new URLSearchParams(window.location.search).get('case');
  if (force === '3d') return true;
  if (force === '2d') return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|software|softpipe/i.test(renderer);
  } catch {
    return false;
  }
}

function pickTier(): Tier {
  const w = window.innerWidth;
  const touch = window.matchMedia('(hover: none)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (w < 700 || (touch && cores <= 4)) return 'low';
  if (w < 1100 || touch || cores <= 4) return 'mid';
  return 'high';
}

/**
 * SuitcaseStage — everything around the 3D case.
 *
 *  - lazy: the WebGL chunk loads when the room is one viewport away
 *  - paused: the render loop stops entirely when the case is off screen
 *  - resilient: no WebGL, or a WebGL error, drops to the CSS case
 *  - accessible: the latches and contents are also real buttons below the canvas,
 *    so keyboard and screen-reader users get the same sequence
 */
export function SuitcaseStage(): JSX.Element {
  const wrap = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'checking' | '3d' | '2d'>('checking');
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tier, setTier] = useState<Tier>('mid');
  const [reduced, setReduced] = useState(false);

  const stage = useStore((s) => s.caseStage);
  const latchL = useStore((s) => s.latchL);
  const latchR = useStore((s) => s.latchR);

  useEffect(() => {
    setMode(choose3D() ? '3d' : '2d');
    setTier(pickTier());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (): void => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '100% 0px' });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);

  const released = Number(latchL) + Number(latchR);
  const prompt =
    stage === 'open'
      ? 'Select an object to read its record.'
      : released === 0
        ? 'Two brass latches hold the lid. Release them.'
        : released === 1
          ? 'One latch free. The other is still holding.'
          : 'Both latches free.';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div
        ref={wrap}
        className={`relative mx-auto w-full ${mode === '2d' ? '' : 'aspect-[4/3] md:aspect-[16/10]'}`}
        style={{
          background: 'radial-gradient(ellipse 55% 50% at 50% 58%, rgba(255,176,96,0.13) 0%, transparent 70%)',
        }}
      >
        {mode === '3d' && near ? (
          <WebGLBoundary fallback={<div className="flex items-center py-6"><Case /></div>}>
            <Suitcase3D tier={tier} reduced={reduced} active={visible} onStruggling={() => setMode('2d')} />
          </WebGLBoundary>
        ) : mode === '2d' ? (
          // The drawn case sizes itself; a fixed aspect frame let it overflow onto its own controls on phones.
          <div className="flex items-center py-6">
            <Case />
          </div>
        ) : (
          <CaseSilhouette label="" />
        )}
      </div>

      {/* The mechanism, as controls. Mirrors the 3D latches exactly. */}
      <div className="mt-4 flex flex-col items-center gap-4 text-center">
        <p className="font-display text-[16px] italic text-parchment/70" aria-live="polite">
          {prompt}
        </p>
        <div className="flex items-center gap-6">
          {stage !== 'open' ? (
            <button
              onClick={releaseNext}
              disabled={stage === 'unlatched'}
              className="group inline-flex items-center gap-3 border-b border-gold/40 py-2.5 font-body text-[11px] tracking-label text-gold transition-colors hover:text-ivory disabled:opacity-40"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
              {released === 0 ? 'RELEASE THE FIRST LATCH' : 'RELEASE THE SECOND LATCH'}
            </button>
          ) : (
            <button
              onClick={closeCase}
              className="border-b border-gold/30 pb-1.5 font-body text-[11px] tracking-label text-parchment/60 transition-colors hover:text-ivory"
            >
              CLOSE THE CASE
            </button>
          )}
          <span className="font-body text-[10px] tracking-label text-parchment/35">
            LATCHES {latchL ? '◆' : '◇'} {latchR ? '◆' : '◇'}
          </span>
        </div>
      </div>

      <TraySelector />
      <SkillRecord />
    </div>
  );
}

/** Shown while the 3D chunk loads: the case's outline under the candle, not a spinner. */
function CaseSilhouette({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div
        className="leather h-[34%] w-[62%] rounded-[10px] border border-black/70 opacity-70"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,.7)' }}
        aria-hidden
      />
      {label && <p className="font-body text-[10px] tracking-label text-parchment/40">{label}</p>}
    </div>
  );
}
