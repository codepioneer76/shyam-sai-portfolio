'use client';
import { Room } from '@/castle/Room';
import { journey } from '@/data/journey';
import { useReveal } from '@/animations/useReveal';
import { Candle } from '@/castle/Candle';

/**
 * VI — THE JOURNEY. A gallery corridor: portraits of each stage hung along a
 * receding wall, each lit by its own candle as the visitor draws level with it.
 */
export function Journey(): JSX.Element {
  return (
    <Room kind="gallery" numeral="VI" title="THE JOURNEY" id="journey" tall>
      <p className="font-display mx-auto mb-16 max-w-[56ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        The long gallery. Each frame is a year of deciding what to learn next.
      </p>

      <ol className="relative mx-auto max-w-3xl">
        {/* the picture rail */}
        <span className="absolute left-[27px] top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent md:left-1/2" aria-hidden />
        {journey.map((j, i) => (
          <Stage key={j.id} name={j.name} kicker={j.kicker} body={j.body} index={i} side={i % 2 === 0 ? 'left' : 'right'} />
        ))}
      </ol>
    </Room>
  );
}

function Stage({
  name,
  kicker,
  body,
  index,
  side,
}: {
  name: string;
  kicker: string;
  body: string;
  index: number;
  side: 'left' | 'right';
}): JSX.Element {
  const ref = useReveal<HTMLLIElement>(index * 40);
  return (
    <li
      ref={ref}
      className={`reveal relative mb-12 pl-16 md:w-[calc(50%-42px)] md:pl-0 ${
        side === 'left' ? 'md:mr-auto md:pr-14 md:text-right' : 'md:ml-auto md:pl-14'
      }`}
    >
      {/* the candle on the rail */}
      <span className={`absolute top-1 ${side === 'left' ? 'left-2 md:-right-[46px] md:left-auto' : 'left-2 md:-left-[46px]'}`}>
        <Candle size={0.62} seed={index * 3} pool={false} />
      </span>

      <div
        className="rounded-[2px] border border-gold/20 p-6 transition-colors duration-700 hover:border-gold/45"
        style={{ background: 'linear-gradient(150deg, rgba(58,13,18,.42), rgba(10,7,6,.72))' }}
      >
        <p className="font-body text-[9.5px] tracking-label text-gold/70">{kicker}</p>
        <h3 className="font-display mt-2 text-[21px] leading-tight text-ivory">{name}</h3>
        <p className="font-body mt-3 text-[13px] leading-[1.85] text-parchment/70">{body}</p>
      </div>
    </li>
  );
}
