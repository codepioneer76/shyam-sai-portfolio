'use client';
import { useEffect, useState } from 'react';
import { chapters, type ChapterId } from '@/data/chapters';
import { actions, useStore } from '@/state/store';
import { audio } from '@/audio/ambience';

/**
 * The index — a register in the margin, not a navigation bar.
 * Roman numerals at the edge, the current room gilded and named. Real anchors,
 * so it works with a keyboard, a screen reader, and with scripts half-loaded.
 * It also tells the audio engine which room the visitor is standing in.
 */
export function Index(): JSX.Element {
  const chapter = useStore((s) => s.chapter);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /**
     * The current room is the one holding the middle of the screen. Visibility
     * ratios fail here: once a room is taller than the viewport (Projects now
     * is), its ratio stays small and a neighbouring room keeps winning.
     */
    let frame = 0;
    let queued = false;
    let last: ChapterId | null = null;
    const measure = (): void => {
      queued = false;
      const mid = window.innerHeight * 0.45;
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          if (c.id !== last) {
            last = c.id;
            actions.setChapter(c.id);
            audio.setRoom(c.id);
          }
          break;
        }
      }
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    const onScroll = (): void => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <nav
        aria-label="Rooms"
        className={`fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-1000 lg:block ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <ol className="space-y-3.5">
          {chapters.map((c) => {
            const active = chapter === c.id;
            return (
              <li key={c.id}>
                <a href={`#${c.id}`} className="group flex items-center gap-3" aria-current={active ? 'location' : undefined}>
                  <span className={`font-display w-9 text-right text-[13px] tracking-[0.08em] transition-colors duration-500 ${active ? 'text-gold' : 'text-parchment/30 group-hover:text-parchment/70'}`}>
                    {c.numeral}
                  </span>
                  <span className={`h-px transition-all duration-700 ${active ? 'w-7 bg-gold' : 'w-3 bg-parchment/25 group-hover:w-5'}`} aria-hidden />
                  <span className={`whitespace-nowrap font-body text-[10px] tracking-[0.18em] transition-all duration-500 ${active ? 'text-parchment/85 opacity-0 group-hover:opacity-100 2xl:opacity-100' : 'text-parchment/55 opacity-0 group-hover:opacity-100'}`}>
                    {c.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* narrow screens: the same register, along the bottom edge */}
      <nav aria-label="Rooms" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-gold/20 bg-ink/92 px-2 py-1.5 lg:hidden">
        {chapters.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-label={c.title}
            aria-current={chapter === c.id ? 'location' : undefined}
            className={`font-display min-w-[40px] px-2 py-2 text-center text-[13px] ${chapter === c.id ? 'text-gold' : 'text-parchment/45'}`}
          >
            {c.numeral}
          </a>
        ))}
      </nav>
    </>
  );
}
