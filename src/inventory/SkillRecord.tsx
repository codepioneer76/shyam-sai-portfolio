'use client';
import { itemsInTray, trays } from '@/data/arsenal';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';

/**
 * The case's manifest and the record that comes out with an object.
 *
 * The manifest lists every object, tray by tray, so the whole stack can be
 * read at a glance without lifting a thing — and it is the keyboard path into
 * the case: choosing an object here lifts its tray and opens its record.
 */
export function SkillRecord(): JSX.Element | null {
  const open = useStore((s) => s.caseStage === 'open');
  const item = useStore((s) => s.artifact);
  const tray = useStore((s) => s.tray);
  if (!open) return null;

  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* manifest */}
      <nav aria-label="Contents of the case" className="border-t border-gold/20 pt-5">
        <p className="font-body text-[10px] tracking-label text-gold/75">MANIFEST</p>
        <div className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {trays.map((t) => (
            <div key={t.id}>
              <p className={`font-body text-[9.5px] tracking-[0.24em] ${t.id === tray ? 'text-gold' : 'text-parchment/40'}`}>{t.label}</p>
              <ul className="mt-2 space-y-0.5">
                {itemsInTray(t.id).map((a) => {
                  const on = item?.id === a.id;
                  const primary = a.state === 'PRIMARY';
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => {
                          actions.setArtifact(a);
                          chime('folder');
                        }}
                        aria-pressed={on}
                        className={`flex w-full items-baseline justify-between gap-3 py-1 text-left transition-colors ${
                          on ? 'text-gold' : primary ? 'text-ivory hover:text-gold' : 'text-parchment/70 hover:text-ivory'
                        }`}
                      >
                        <span className={`font-body tracking-[0.1em] ${primary ? 'text-[13px] font-semibold' : 'text-[11.5px]'}`}>{a.name}</span>
                        <span className={`shrink-0 font-body text-[8.5px] tracking-[0.16em] ${primary ? 'text-gold' : 'text-parchment/35'}`}>
                          {primary ? 'PRIMARY' : a.state}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* the record */}
      <div
        key={item?.id ?? 'none'}
        className="parchment-surface relative h-fit min-h-[220px] rounded-[2px] p-7 md:p-9 lg:sticky lg:top-24"
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
                <dd className="font-display mt-1 text-[17px] text-[#8B1E2D]">{item.state === 'PRIMARY' ? 'PRIMARY LANGUAGE' : item.state}</dd>
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
          <p className="font-display text-[17px] italic text-[#5a4326]">Lift something out of the case, or choose it from the manifest.</p>
        )}
      </div>
    </div>
  );
}
