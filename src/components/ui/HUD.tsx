'use client';
import { chapters, chapterByIndex } from '@/data/chapters';
import { useExperience } from '@/state/store';
import { gotoChapter, nextChapter, prevChapter, setOverlay } from '@/state/actions';

/**
 * HUD — deliberately not a navigation bar.
 *
 * The earlier build put a nine-item chapter rail across the bottom, which is the
 * single element that made the whole thing read as a website with a dark theme.
 * Navigation now lives in the world (the map is a physical object) and in the
 * keyboard. What remains on screen is what a field instrument would show:
 * where you are, what you are here to do, and one contextual prompt.
 *
 * The full chapter list still exists for assistive technology and keyboard users
 * as a visually hidden landmark, so nothing is lost by removing the rail.
 */
export function HUD(): JSX.Element | null {
  const phase = useExperience((s) => s.phase);
  const chapter = useExperience((s) => s.chapter);
  const objective = useExperience((s) => s.objective);
  const detail = useExperience((s) => s.detail);
  const overlay = useExperience((s) => s.overlay);
  const c = chapterByIndex(chapter);

  if (phase === 'boot') return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-1000 ${
        phase === 'explore' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Location + objective. Sized to be read at a glance, not squinted at. */}
      <div className="px-7 pt-6 md:px-10 md:pt-8">
        <p className="text-[11px] tracking-[0.42em] text-ash/70">SECTOR {c.code}</p>
        <h2 className="display mt-2 text-[clamp(22px,3.2vw,34px)] leading-none">{c.title}</h2>
        <p className="mt-3 flex items-center gap-2.5 text-[13px] tracking-[0.12em] text-bone/85">
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-tungsten" aria-hidden />
          {objective}
        </p>
      </div>

      {/* Position ticks: a depth gauge, not a menu. */}
      <nav aria-hidden className="pointer-events-auto fixed right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => gotoChapter(i, true)}
            title={`${ch.code} ${ch.title}`}
            tabIndex={-1}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-[10px] tracking-[0.24em] transition-opacity ${
                i === chapter ? 'text-signal opacity-100' : 'text-ash opacity-0 group-hover:opacity-70'
              }`}
            >
              {ch.title}
            </span>
            <span
              className={`h-px transition-all duration-500 ${
                i === chapter ? 'w-9 bg-signal' : 'w-4 bg-bone/25 group-hover:w-6 group-hover:bg-bone/60'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* One contextual prompt, and only when nothing else is being read. */}
      {!detail && overlay === 'none' && (
        <p className="fixed bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-[0.3em] text-ash/80">
          <span className="text-bone">[M]</span> MAP
          <span className="mx-3 text-ash/40">·</span>
          <span className="text-bone">[K]</span> TERMINAL
          <span className="mx-3 text-ash/40">·</span>
          <span className="text-bone">[→]</span> MOVE ON
        </p>
      )}

      {/* Accessible navigation. Hidden visually, complete functionally. */}
      <nav aria-label="Chapters" className="sr-only">
        <button onClick={prevChapter}>Previous chapter</button>
        <ul>
          {chapters.map((ch, i) => (
            <li key={ch.id}>
              <button onClick={() => gotoChapter(i, true)} aria-current={i === chapter ? 'true' : undefined}>
                Chapter {ch.code}: {ch.title} — {ch.objective}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={nextChapter}>Next chapter</button>
        <button onClick={() => setOverlay('map')}>Open facility map</button>
      </nav>
    </div>
  );
}
