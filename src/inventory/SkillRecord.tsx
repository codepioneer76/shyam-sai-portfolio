'use client';
import { arsenal } from '@/data/arsenal';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';

/**
 * The record that comes out with an object, plus the case's manifest.
 *
 * The manifest is the keyboard path into the case: every object inside is
 * also a button here, so nothing is reachable only by pointing at a canvas.
 */
export function SkillRecord(): JSX.Element | null {
  const open = useStore((s) => s.caseStage === 'open');
  const item = useStore((s) => s.artifact);
  if (!open) return null;

  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      {/* manifest */}
      <nav aria-label="Contents of the case" className="border-t border-gold/20 pt-5">
        <p className="font-body text-[10px] tracking-label text-gold/75">MANIFEST</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {arsenal.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => {
                  actions.setArtifact(a);
                  chime('folder');
                }}
                aria-pressed={item?.id === a.id}
                className={`w-full text-left font-body text-[11px] tracking-[0.12em] transition-colors ${
                  item?.id === a.id ? 'text-gold' : 'text-parchment/65 hover:text-ivory'
                }`}
              >
                {a.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* the record */}
      <div
        key={item?.id ?? 'none'}
        className="parchment-surface relative min-h-[220px] rounded-[2px] p-7 md:p-9"
        style={{ animation: item ? 'recordIn .6s cubic-bezier(.22,1,.36,1) both' : undefined }}
        aria-live="polite"
      >
        {item ? (
          <>
            <p className="font-body text-[10px] tracking-label text-[#7a5a30]">{item.cat}</p>
            <h3 className="font-display mt-2 text-[clamp(26px,3.6vw,40px)] leading-none text-[#2a1c10]">{item.name}</h3>
            <div className="my-5 h-px w-full bg-[#8a6a3a]/35" />
            <dl className="space-y-5">
              <div>
                <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">STATE</dt>
                <dd className="font-display mt-1 text-[17px] text-[#8B1E2D]">{item.state}</dd>
              </div>
              <div>
                <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">CURRENT USE</dt>
                <dd className="font-body mt-1.5 max-w-[60ch] text-[14px] leading-[1.85] text-[#3a2a18]">{item.body}</dd>
              </div>
              <div>
                <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">RELATED WORK</dt>
                <dd className="font-body mt-1.5 text-[13px] text-[#3a2a18]">
                  {item.deployedIn && item.deployedIn.length > 0 ? (
                    item.deployedIn.join('  ·  ')
                  ) : (
                    <span className="italic text-[#6a4b28]">Not yet part of a finished project.</span>
                  )}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="font-display text-[17px] italic text-[#5a4326]">Lift something out of the case.</p>
        )}
      </div>
    </div>
  );
}
