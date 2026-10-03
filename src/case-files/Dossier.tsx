'use client';
import { useEffect, useRef, useState } from 'react';
import type { CaseFile } from '@/data/caseFiles';
import { Label, Pending } from '@/components/Furnishings';
import { chime } from '@/audio/ambience';
import { ComponentSketch } from './ComponentSketch';

type Stage = 'sealed' | 'cracked' | 'open' | 'read';

/** Components named in each project's own summary, in signal order. */
const SKETCH: Record<string, string[]> = {
  pipeguard: ['IoT sensors', 'Telemetry', 'Pressure intel.', 'Prediction', 'Leak detection'],
  riversight: ['IoT sensors', 'Telemetry', 'Dashboard', 'GIS map', 'Alerts'],
};

/**
 * A project dossier: a leather folder, clipped and sealed.
 *
 *   sealed → the wax cracks in two → the cover swings open on its spine
 *          → the pages slide out → the record is readable
 *
 * Each beat is a real state with its own sound, so the sequence can be paused
 * at any point by reduced motion and still land on the readable page.
 */
export function Dossier({ file }: { file: CaseFile }): JSX.Element {
  const [stage, setStage] = useState<Stage>('sealed');
  const [section, setSection] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const open = (): void => {
    if (stage !== 'sealed') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setStage('read');
      return;
    }
    chime('seal');
    setStage('cracked');
    timers.current.push(window.setTimeout(() => {
      chime('folder');
      setStage('open');
    }, 520));
    timers.current.push(window.setTimeout(() => {
      chime('unfold');
      setStage('read');
    }, 1350));
  };

  const close = (): void => {
    chime('folder');
    setStage('sealed');
  };

  const isOpen = stage === 'open' || stage === 'read';
  const cracked = stage !== 'sealed';

  return (
    <article className="relative" aria-label={`Project: ${file.title}`}>
      {/* ------------------------------------------------ the folder, closed */}
      <div className="relative mx-auto max-w-4xl" style={{ perspective: '2200px' }}>
        <div
          className="leather relative grid rounded-[4px] border border-black/70"
          style={{ boxShadow: '0 40px 90px rgba(0,0,0,.75), inset 0 1px 0 rgba(201,164,92,.12)', gridTemplateAreas: '"stack"' }}
        >
          {/* the pages beneath the cover — revealed when it swings away */}
          <div className="absolute inset-4 rounded-[2px] parchment-surface opacity-90" aria-hidden />

          {/* cover */}
          <div
            className="leather relative z-10 origin-left rounded-[4px] border border-black/70 p-7 md:p-10"
            style={{
              gridArea: 'stack',
              pointerEvents: isOpen ? 'none' : 'auto',
              transform: isOpen ? 'rotateY(-168deg)' : 'rotateY(0deg)',
              transition: 'transform 1.1s cubic-bezier(.65,0,.35,1)',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              boxShadow: isOpen ? 'none' : '0 18px 40px rgba(0,0,0,.6)',
            }}
          >
            <div className="absolute inset-3 rounded-[3px] border border-gold/20" aria-hidden />
            {/* brass clips on the top edge */}
            {[18, 72].map((l) => (
              <span
                key={l}
                className="absolute -top-2 h-6 w-12 rounded-[2px] border border-black/60"
                style={{ left: `${l}%`, background: 'linear-gradient(180deg,#d8b46b,#8a6e3a 55%,#4b3a1c)', boxShadow: '0 3px 6px rgba(0,0,0,.6)' }}
                aria-hidden
              />
            ))}
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <Label>{file.code} · {file.kicker}</Label>
                  <h3 className="font-display mt-3 text-[clamp(34px,5.6vw,64px)] leading-none text-ivory">{file.title}</h3>
                  <p className="font-body mt-3 text-[11px] tracking-label text-parchment/55">{file.type}</p>
                </div>
                {/* stamped status */}
                <span
                  className="font-display rotate-[-6deg] border-2 px-3 py-1.5 text-[14px] tracking-[0.2em]"
                  style={{ borderColor: 'rgba(139,30,45,.7)', color: 'rgba(170,52,66,.85)' }}
                >
                  {file.state}
                </span>
              </div>

              <p className="font-display max-w-[58ch] text-[16px] italic leading-relaxed text-parchment/75">{file.summary}</p>

              <div className="flex items-center gap-5">
                <button
                  onClick={open}
                  aria-label={`Break the seal and open ${file.title}`}
                  className="group relative h-[74px] w-[74px] shrink-0"
                >
                  {/* the seal splits into two halves */}
                  {(['left', 'right'] as const).map((half) => (
                    <span
                      key={half}
                      className="absolute inset-0 grid place-items-center rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 36% 30%, #b8323f 0%, #8b1e2d 42%, #4d0f18 78%, #2c0810 100%)',
                        boxShadow: 'inset -3px -4px 10px rgba(0,0,0,.6), 0 8px 18px rgba(0,0,0,.6)',
                        clipPath: half === 'left' ? 'polygon(0 0, 52% 0, 44% 28%, 56% 54%, 46% 78%, 54% 100%, 0 100%)' : 'polygon(52% 0, 100% 0, 100% 100%, 54% 100%, 46% 78%, 56% 54%, 44% 28%)',
                        transform: cracked ? `translate(${half === 'left' ? -7 : 7}px, ${half === 'left' ? 4 : -3}px) rotate(${half === 'left' ? -9 : 11}deg)` : 'none',
                        transition: 'transform .45s cubic-bezier(.3,1.5,.5,1)',
                      }}
                    >
                      <span className="font-display text-[15px] tracking-[0.12em] text-[#f0c9c0]/80">{file.code.slice(-2)}</span>
                    </span>
                  ))}
                </button>
                <span className="font-body text-[10.5px] tracking-label text-gold/70 transition-colors group-hover:text-gold">
                  BREAK THE SEAL TO READ THE FILE
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ the pages, sliding out */}
          <div
            className="relative z-0 overflow-hidden transition-all duration-[900ms] ease-drape"
            style={{
              gridArea: 'stack',
              maxHeight: stage === 'read' ? 2400 : 0,
              opacity: stage === 'read' ? 1 : 0,
              transform: stage === 'read' ? 'translateY(0)' : 'translateY(24px)',
            }}
          >
            <div className="parchment-surface relative m-3 rounded-[2px] p-6 md:m-4 md:p-10">
              <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[#8a6a3a]/30 pb-5">
                <div>
                  <Label className="text-[#7a5a30]">{file.code} · PROJECT</Label>
                  <h3 className="font-display mt-2 text-[clamp(28px,4.2vw,46px)] leading-none text-[#1e1508]">{file.title}</h3>
                </div>
                <button onClick={close} className="py-2 font-body text-[10px] tracking-label text-[#6a5330] hover:text-[#1e1508]">
                  CLOSE THE FOLDER
                </button>
              </header>

              {/* handwritten margin note: the summary, in his own words */}
              <p className="font-display mt-6 max-w-[62ch] text-[17px] italic leading-relaxed text-[#4a2e14]" style={{ transform: 'rotate(-0.4deg)' }}>
                “{file.summary}”
              </p>

              <div className="mt-6">
                <ComponentSketch nodes={SKETCH[file.id] ?? []} drawn={stage === 'read'} />
              </div>

              <div className="mt-8 grid gap-7 md:grid-cols-[180px_minmax(0,1fr)]">
                <nav aria-label={`${file.title} sections`} className="flex flex-row flex-wrap gap-x-4 gap-y-1 md:flex-col md:gap-1.5">
                  {file.sections.map((s, i) => (
                    <button
                      key={s.key}
                      onClick={() => {
                        setSection(i);
                        chime('paper');
                      }}
                      aria-current={section === i ? 'true' : undefined}
                      className={`py-2 text-left font-body text-[10.5px] tracking-label transition-colors md:py-0.5 ${
                        section === i ? 'text-[#8B1E2D]' : 'text-[#6a5330] hover:text-[#2e2312]'
                      }`}
                    >
                      {section === i ? '— ' : ''}
                      {s.key}
                      {s.body === null && <span className="ml-1.5 text-[#8B1E2D]/60">•</span>}
                    </button>
                  ))}
                </nav>

                <div key={section} className="min-h-[160px] border-l border-[#8a6a3a]/30 pl-0 md:pl-8" style={{ animation: 'recordIn .5s cubic-bezier(.22,1,.36,1) both' }}>
                  <Label className="text-[#7a5a30]">{file.sections[section].key}</Label>
                  {file.sections[section].body ? (
                    <p className="font-body mt-4 max-w-[62ch] text-[14.5px] leading-[1.95] text-[#2e2312]">{file.sections[section].body}</p>
                  ) : (
                    <div className="mt-5">
                      <Pending />
                      <p className="font-body mt-4 max-w-[54ch] text-[13px] italic leading-relaxed text-[#5a4326]">
                        This page of the file has not been written yet. It stays blank rather than filled with something that reads well and happens to be untrue.
                      </p>
                    </div>
                  )}
                  {file.sections[section].key === 'TECHNOLOGIES' && file.stack.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {file.stack.map((s) => (
                        <span key={s} className="font-body border border-[#3d2f18]/35 px-2 py-1 text-[10px] tracking-label text-[#2e2312]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <footer className="mt-8 flex flex-wrap gap-6 border-t border-[#8a6a3a]/30 pt-5">
                <span className="font-body text-[10.5px] tracking-label text-[#5a4326]">SOURCE {file.links.github ?? '— PENDING'}</span>
                <span className="font-body text-[10.5px] tracking-label text-[#5a4326]">DEMONSTRATION {file.links.demo ?? '— PENDING'}</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
