'use client';
import { useState } from 'react';
import { foundation } from '@/data/foundation';
import { Label } from '@/components/Furnishings';
import { chime } from '@/audio/ambience';

/** The coursework shelf behind the desk: pull a spine and the volume opens beside it. */
export function CourseworkShelf(): JSX.Element {
  const [open, setOpen] = useState<string>(foundation[0].id);
  const current = foundation.find((f) => f.id === open) ?? foundation[0];

  return (
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      <div
        className="wood relative flex h-[240px] items-end gap-2 rounded-[2px] border border-black/60 p-4"
        style={{ boxShadow: 'inset 0 10px 30px rgba(0,0,0,.7)' }}
        role="group"
        aria-label="Coursework volumes"
      >
        {foundation.map((f, i) => {
          const active = open === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                setOpen(f.id);
                chime('paper');
              }}
              aria-pressed={active}
              aria-label={f.name}
              className="relative flex-1 rounded-[1px] border border-black/60 transition-all duration-700 ease-drape"
              style={{
                height: active ? '100%' : `${74 + (i % 3) * 7}%`,
                background: ['#5a1720', '#3a2a18', '#2a2420', '#4a3420', '#3a0d12'][i % 5],
                transform: active ? 'translateY(-12px)' : 'none',
                boxShadow: active ? '0 14px 26px rgba(0,0,0,.7), 0 0 0 1px rgba(201,164,92,.5)' : '0 6px 14px rgba(0,0,0,.6)',
              }}
            >
              <span className="absolute inset-x-1 top-3 h-px bg-gold/40" aria-hidden />
              <span className="absolute inset-x-1 bottom-3 h-px bg-gold/40" aria-hidden />
              <span className="font-display absolute inset-0 grid place-items-center text-[10px] tracking-[0.14em] text-ivory/90" style={{ writingMode: 'vertical-rl' }}>
                {f.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
      <div key={current.id} className="parchment-surface rounded-[2px] p-7" style={{ animation: 'recordIn .55s cubic-bezier(.22,1,.36,1) both' }}>
        <Label className="text-[#7a5a30]">COURSEWORK · B.TECH CSE</Label>
        <h4 className="font-display mt-2 text-[24px] leading-tight text-[#2a1c10]">{current.name}</h4>
        <p className="font-body mt-4 max-w-[60ch] text-[14px] leading-[1.9] text-[#3a2a18]">{current.body}</p>
      </div>
    </div>
  );
}
