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
    const els = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) {
          const id = top.target.id as ChapterId;
          actions.setChapter(id);
          audio.setRoom(id);
        }
      },
      { threshold: [0.1, 0.3, 0.6], rootMargin: '-25% 0px -35% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = (): void => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
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
