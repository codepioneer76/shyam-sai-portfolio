'use client';
import { chapters } from '@/data/chapters';
import { useExperience } from '@/state/store';
import { gotoChapter, setOverlay } from '@/state/actions';

/**
 * MapOverlay — the facility drawn as a survey sheet.
 * Paper stock, a fold crease, drawn zone boxes, hand-annotated markers. It is
 * navigation, so every zone is a button with a real focus ring.
 */
export function MapOverlay(): JSX.Element | null {
  const overlay = useExperience((s) => s.overlay);
  const chapter = useExperience((s) => s.chapter);
  const visited = useExperience((s) => s.visited);
  if (overlay !== 'map') return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/80 p-4" role="dialog" aria-label="Facility map">
      <div className="relative w-full max-w-3xl border border-[#6f6a5c]/40 bg-[#B9B2A0] p-6 text-[#1A1712] shadow-[0_40px_120px_rgba(0,0,0,.7)]">
        {/* fold crease */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-black/10" aria-hidden />
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-[#5A5346]">SURVEY SHEET 01</p>
            <h2 className="display mt-1 text-2xl">FACILITY LAYOUT</h2>
          </div>
          <button onClick={() => setOverlay('map')} className="text-[10px] tracking-[0.24em] text-[#5A5346] hover:text-[#1A1712]">
            CLOSE [ESC]
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-px bg-[#1A1712]/20">
          {chapters.map((c, i) => {
            const seen = visited.includes(c.id) || i === chapter;
            return (
              <button
                key={c.id}
                onClick={() => {
                  gotoChapter(i, true);
                  setOverlay('map');
                }}
                className={`group relative bg-[#B9B2A0] p-4 text-left transition-colors hover:bg-[#C7C0AE] ${
                  i === chapter ? 'bg-[#C7C0AE]' : ''
                }`}
              >
                <span className="text-[10px] tracking-[0.24em] text-[#5A5346]">{c.code}</span>
                <span className="display mt-1 block text-[15px]">{c.title}</span>
                <span className="mt-2 block text-[10.5px] leading-snug text-[#3E382E]">{c.objective}</span>
                <span
                  className={`absolute right-3 top-3 h-2 w-2 rotate-45 ${
                    i === chapter ? 'bg-[#8C3A2A]' : seen ? 'bg-[#3E382E]/50' : 'bg-transparent ring-1 ring-[#3E382E]/40'
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[10px] tracking-[0.2em] text-[#5A5346]">
          MARKED ● VISITED · ◆ CURRENT POSITION · KEYS 1–9 JUMP DIRECTLY
        </p>
      </div>
    </div>
  );
}
