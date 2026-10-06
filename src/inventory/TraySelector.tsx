'use client';
import { trays } from '@/data/arsenal';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';

/**
 * The tray labels along the case's front edge. Selecting one lifts that tray:
 * the current contents sink and the next set settles in. A real tablist, so
 * arrow keys move between trays.
 */
export function TraySelector(): JSX.Element | null {
  const open = useStore((s) => s.caseStage === 'open');
  const current = useStore((s) => s.tray);
  if (!open) return null;

  const idx = trays.findIndex((t) => t.id === current);
  const choose = (i: number): void => {
    const t = trays[(i + trays.length) % trays.length];
    if (t.id === current) return;
    chime('drawer');
    actions.setTray(t.id);
  };

  return (
    <div className="mx-auto mt-2 max-w-4xl" style={{ animation: 'recordIn .6s cubic-bezier(.22,1,.36,1) both' }}>
      <div
        role="tablist"
        aria-label="Trays in the case"
        className="flex flex-wrap justify-center gap-x-1 gap-y-2"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') choose(idx + 1);
          if (e.key === 'ArrowLeft') choose(idx - 1);
        }}
      >
        {trays.map((t, i) => {
          const on = t.id === current;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(i)}
              className={`relative px-3.5 py-2.5 font-body text-[10.5px] tracking-[0.2em] transition-colors duration-300 md:px-4 ${
                on ? 'text-gold' : 'text-parchment/50 hover:text-parchment/85'
              }`}
            >
              {t.label}
              <span
                className={`absolute inset-x-3 bottom-1 h-px transition-all duration-500 ${on ? 'bg-gold opacity-100' : 'bg-parchment/30 opacity-0'}`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center font-display text-[15px] italic text-parchment/60" aria-live="polite">
        {trays[idx]?.note}
      </p>
    </div>
  );
}
