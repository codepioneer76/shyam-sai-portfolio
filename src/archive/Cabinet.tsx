'use client';
import { useState } from 'react';
import { credentials } from '@/data/archive';
import { Seal } from '@/components/Furnishings';
import { CertificateDoc } from './CertificateDoc';
import { chime } from '@/audio/ambience';

const DRAWERS = [0, 1, 2, 3];
const NAMES = ['A — AGENTS & FLUENCY', 'B — PLATFORM & CLOUD', 'C — FOUNDATIONS', 'D — DEVELOPMENT'];

/**
 * The records cabinet. Four drawers, each holding sealed certificates.
 *
 * A drawer slides on an eased transform with a slight settle, and only one is
 * ever open — the resistance comes from the fact that opening one closes another,
 * the way a real cabinet on a single runner behaves.
 */
export function Cabinet(): JSX.Element {
  const [open, setOpen] = useState<number | null>(0);
  const [record, setRecord] = useState<string | null>(credentials[0].id);
  const selected = credentials.find((c) => c.id === record) ?? null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* cabinet */}
      <div
        className="wood relative rounded-[3px] border border-black/70 p-4"
        style={{ boxShadow: 'inset 0 8px 30px rgba(0,0,0,.75), 0 40px 90px rgba(0,0,0,.7)' }}
      >
        {DRAWERS.map((d) => {
          const isOpen = open === d;
          const inside = credentials.filter((c) => c.drawer === d);
          return (
            <div key={d} className="relative mb-3 last:mb-0" style={{ perspective: '1200px' }}>
              <button
                onClick={() => {
                  setOpen(isOpen ? null : d);
                  chime('drawer');
                }}
                aria-expanded={isOpen}
                className="group relative block w-full rounded-[2px] border border-black/70 px-6 py-5 text-left transition-transform duration-[850ms] ease-drape"
                style={{
                  background: 'linear-gradient(180deg,#3a2318,#20130c 60%,#160d08)',
                  transform: isOpen ? 'translateZ(46px) translateY(-2px)' : 'none',
                  boxShadow: isOpen ? '0 26px 50px rgba(0,0,0,.8)' : '0 8px 18px rgba(0,0,0,.6)',
                }}
              >
                <span className="flex items-center justify-between">
                  <span>
                    <span className="font-body block text-[9.5px] tracking-label text-gold/70">{NAMES[d]}</span>
                    <span className="font-display mt-1 block text-[17px] text-ivory/90">
                      {inside.length} RECORD{inside.length === 1 ? '' : 'S'}
                    </span>
                  </span>
                  {/* brass pull */}
                  <span
                    className="block h-3 w-20 rounded-full transition-transform duration-500 group-hover:translate-x-1"
                    style={{ background: 'linear-gradient(180deg,#d8b46b,#8a6e3a 55%,#4b3a1c)' }}
                    aria-hidden
                  />
                </span>
              </button>

              {/* contents of the drawer */}
              <div
                className="overflow-hidden transition-[max-height,opacity] duration-[900ms] ease-drape"
                style={{ maxHeight: isOpen ? 340 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <ul className="flex gap-3 overflow-x-auto px-3 py-4">
                  {inside.map((c, i) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setRecord(c.id);
                          chime('paper');
                        }}
                        aria-label={`${c.name}, ${c.issuer}`}
                        aria-pressed={record === c.id}
                        className="parchment-surface relative block h-[168px] w-[132px] rounded-[1px] p-3 text-left transition-transform duration-500 hover:-translate-y-2"
                        style={{
                          transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (0.6 + i * 0.2)}deg) ${record === c.id ? 'translateY(-10px)' : ''}`,
                          boxShadow: record === c.id ? '0 18px 34px rgba(0,0,0,.7)' : '0 8px 16px rgba(0,0,0,.55)',
                        }}
                      >
                        <span className="font-body block text-[8px] tracking-label text-[#7a5a30]">{c.issuer}</span>
                        <span className="font-display mt-2 block text-[12px] leading-tight text-[#2a1c10]">{c.name}</span>
                        <span className="absolute bottom-2 right-2 scale-[0.42] origin-bottom-right">
                          <Seal initials="SS" size={64} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* the record, drawn out and unfolded under the lamp */}
      <aside className="sticky top-24 h-fit" aria-live="polite">
        {selected ? (
          <CertificateDoc key={selected.id} record={selected} />
        ) : (
          <p className="font-display text-[16px] italic text-parchment/55">Open a drawer and draw a record.</p>
        )}
      </aside>
    </div>
  );
}
