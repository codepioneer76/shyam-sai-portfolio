'use client';
import { arsenal } from '@/data/arsenal';
import { caseFiles } from '@/data/caseFiles';
import { credentials } from '@/data/archive';
import { profile } from '@/data/profile';
import { contact } from '@/data/contact';
import { useExperience } from '@/state/store';
import { gotoChapter, setOverlay } from '@/state/actions';

/**
 * Curator — the in-world index.
 * An equipment dealer's ledger rather than a nav menu: it answers "what is in
 * this facility" with counts, then puts you in front of the thing itself.
 */
export function Curator(): JSX.Element | null {
  const overlay = useExperience((s) => s.overlay);
  if (overlay !== 'curator') return null;

  const rows: { label: string; count: string; chapter: number }[] = [
    { label: 'EQUIPMENT', count: `${arsenal.filter((a) => a.status === 'applied').length} applied · ${arsenal.filter((a) => a.status === 'study').length} in study`, chapter: 2 },
    { label: 'CASE FILES', count: `${caseFiles.length} logged`, chapter: 3 },
    { label: 'EXPERIMENTS', count: '1 logged', chapter: 4 },
    { label: 'CREDENTIALS', count: `${credentials.length} filed`, chapter: 6 },
    { label: 'POSITIONS', count: '5 recorded', chapter: 7 },
    { label: 'CHANNELS', count: Object.values(contact).filter(Boolean).length > 0 ? 'published' : 'pending', chapter: 8 },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/85 p-4" role="dialog" aria-label="Facility index">
      <div className="w-full max-w-lg border border-bone/15 bg-iron/90 p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-ash">ARCHIVE CURATOR</p>
            <h2 className="display mt-1 text-xl">WHAT ARE YOU LOOKING FOR?</h2>
          </div>
          <button onClick={() => setOverlay('curator')} className="text-[10px] tracking-[0.24em] text-ash hover:text-bone">
            CLOSE
          </button>
        </div>

        <ul className="mt-5 divide-y divide-bone/10">
          {rows.map((r) => (
            <li key={r.label}>
              <button
                onClick={() => {
                  gotoChapter(r.chapter, true);
                  setOverlay('curator');
                }}
                className="flex w-full items-baseline justify-between py-3 text-left transition-colors hover:text-signal"
              >
                <span className="text-[12px] tracking-[0.18em]">{r.label}</span>
                <span className="text-[10.5px] tracking-[0.14em] text-ash">{r.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
