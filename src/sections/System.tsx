'use client';
import { Room } from '@/castle/Room';
import { systemNotes } from '@/data/systemNotes';
import { useReveal } from '@/animations/useReveal';
import { Label } from '@/components/Furnishings';

/**
 * VIII — THE SYSTEM. The architect's study: positions written out on the wall
 * like house rules, in the order they are actually applied.
 */
export function System(): JSX.Element {
  return (
    <Room kind="study" numeral="VIII" title="THE SYSTEM" id="system">
      <p className="font-display mx-auto mb-14 max-w-[58ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        How the work is thought about, written plainly and kept where it can be argued with.
      </p>

      <div className="mx-auto max-w-4xl divide-y divide-gold/15 border-y border-gold/20">
        {systemNotes.map((s, i) => (
          <Position key={s.id} numeral={String(i + 1).padStart(2, '0')} name={s.name} body={s.body} index={i} />
        ))}
      </div>
    </Room>
  );
}

function Position({ numeral, name, body, index }: { numeral: string; name: string; body: string; index: number }): JSX.Element {
  const ref = useReveal<HTMLDivElement>(index * 90);
  return (
    <div ref={ref} className="reveal group grid gap-4 py-9 md:grid-cols-[90px_minmax(0,1fr)] md:gap-10">
      <Label className="pt-2">{numeral}</Label>
      <div>
        <h3 className="font-display text-[clamp(21px,2.6vw,30px)] leading-tight text-ivory transition-colors duration-500 group-hover:text-gold">
          {name}
        </h3>
        <p className="font-body mt-3 max-w-[64ch] text-[14px] leading-[1.9] text-parchment/72">{body}</p>
      </div>
    </div>
  );
}
