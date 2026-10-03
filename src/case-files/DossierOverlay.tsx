'use client';
import { caseFiles } from '@/data/caseFiles';
import { useExperience } from '@/state/store';
import { openCaseFile } from '@/state/actions';

/**
 * DossierOverlay — a case file opened on the table.
 * Sections with no verified content are shown as PENDING rather than filled
 * with plausible copy. An honest gap is a stronger signal than invented depth.
 */
export function DossierOverlay(): JSX.Element | null {
  const id = useExperience((s) => s.openCaseFile);
  const file = caseFiles.find((c) => c.id === id);
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-void/92 p-4 md:p-10" role="dialog" aria-label={`Case file ${file.title}`}>
      <article className="mx-auto max-w-3xl border border-bone/12 bg-iron/70 p-6 md:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-bone/10 pb-5">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-ash">{file.code} — {file.kicker}</p>
            <h2 className="display mt-2 text-[clamp(28px,6vw,52px)]">{file.title}</h2>
            <p className="mt-2 text-[11px] tracking-[0.18em] text-ash">{file.type}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="border border-signal/35 px-2.5 py-1.5 text-[10px] tracking-[0.2em] text-signal">{file.state}</span>
            <button onClick={() => openCaseFile(null)} className="text-[10px] tracking-[0.24em] text-ash hover:text-bone">
              CLOSE [ESC]
            </button>
          </div>
        </header>

        <p className="mt-5 max-w-[68ch] text-[13px] leading-relaxed text-[#C9C6C0]">{file.body}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {file.stack.length > 0 ? (
            file.stack.map((s) => (
              <span key={s} className="border border-bone/15 px-2 py-1 text-[10px] tracking-[0.16em] text-bone">{s}</span>
            ))
          ) : (
            <span className="text-[10.5px] tracking-[0.16em] text-tungsten">STACK NOT YET RECORDED</span>
          )}
        </div>

        <dl className="mt-8 divide-y divide-bone/10 border-t border-bone/10">
          {file.sections.map((s) => (
            <div key={s.key} className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
              <dt className="text-[10.5px] tracking-[0.2em] text-ash">{s.key}</dt>
              <dd className={`max-w-[64ch] text-[12.5px] leading-relaxed ${s.body ? 'text-[#C9C6C0]' : 'text-tungsten/70'}`}>
                {s.body ?? 'PENDING VERIFICATION — not yet supplied.'}
              </dd>
            </div>
          ))}
        </dl>

        <footer className="mt-6 flex flex-wrap gap-5 border-t border-bone/10 pt-5 text-[10.5px] tracking-[0.18em]">
          <span className={file.links.github ? 'text-signal' : 'text-ash'}>
            SOURCE {file.links.github ?? '— PENDING'}
          </span>
          <span className={file.links.demo ? 'text-signal' : 'text-ash'}>
            DEMO {file.links.demo ?? '— PENDING'}
          </span>
        </footer>
      </article>
    </div>
  );
}
