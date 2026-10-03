'use client';
import { Room } from '@/castle/Room';
import { Plate, Label, Pending } from '@/components/Furnishings';
import { experiments } from '@/data/lab';
import { Candle } from '@/castle/Candle';

/**
 * V — THE LAB. A working desk: pinned notes, an annotated diagram, and the one
 * experiment that actually exists written out in full. Nothing is invented to
 * fill the wall.
 */
export function Lab(): JSX.Element {
  return (
    <Room kind="laboratory" numeral="V" title="THE LAB" id="lab" tall>
      <p className="font-display mx-auto mb-14 max-w-[58ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        Where things are tried before they are claimed.
      </p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          {experiments.map((e, i) => (
            <Plate key={e.id} className="p-8 md:p-10" delay={i * 120}>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <Label className="text-[#7a5a30]">{e.kicker}</Label>
                <span className="font-body text-[10px] tracking-label text-[#8B1E2D]">LOGGED</span>
              </div>
              <h3 className="font-display mt-3 text-[clamp(22px,3vw,34px)] leading-tight text-[#2a1c10]">{e.name}</h3>
              <div className="my-6 h-px w-full bg-[#8a6a3a]/30" />
              <dl className="space-y-5">
                {[
                  ['OBJECTIVE', e.objective],
                  ['INSTRUMENT', e.technology],
                  ['METHOD', e.implementation],
                  ['OUTCOME', e.result],
                  ['WHAT IT TAUGHT', e.lessons],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">{k}</dt>
                    <dd className="font-body mt-1.5 max-w-[64ch] text-[14px] leading-[1.85] text-[#3a2a18]">
                      {v ?? <Pending />}
                    </dd>
                  </div>
                ))}
              </dl>
            </Plate>
          ))}

          <Plate className="p-8" delay={200} tilt={0.4}>
            <Label className="text-[#7a5a30]">THE REST OF THE BENCH</Label>
            <p className="font-body mt-4 max-w-[60ch] text-[14px] leading-[1.9] text-[#3a2a18]">
              One experiment is written up because one experiment has been run to a conclusion. The others are in
              progress and will be entered here when they produce something worth entering. An empty bench is honest;
              a full one that cannot be defended is not.
            </p>
          </Plate>
        </div>

        {/* the pipeline, drawn as an annotated diagram pinned to the wall */}
        <aside className="relative">
          <div
            className="sticky top-24 rounded-[2px] border border-gold/20 p-7"
            style={{ background: 'linear-gradient(160deg, rgba(26,10,10,.85), rgba(10,7,6,.9))' }}
          >
            <Label>RETRIEVAL, DRAWN OUT</Label>
            <ol className="mt-6 space-y-0">
              {[
                ['QUESTION', 'put to the terminal'],
                ['CORPUS', 'assembled from the record'],
                ['SCORING', 'rare words carry the weight'],
                ['PASSAGES', 'four, with their sources'],
                ['ANSWER', 'or an admission of nothing'],
              ].map(([k, v], i, arr) => (
                <li key={k} className="relative pl-8">
                  <span className="absolute left-[7px] top-2 h-2 w-2 rotate-45 border border-gold/70" aria-hidden />
                  {i < arr.length - 1 && (
                    <span className="absolute left-[11px] top-5 h-[calc(100%-12px)] w-px bg-gradient-to-b from-gold/45 to-gold/10" aria-hidden />
                  )}
                  <p className="font-display text-[15px] text-ivory">{k}</p>
                  <p className="font-body pb-6 text-[11.5px] italic text-ash">{v}</p>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex justify-end">
              <Candle size={0.8} seed={11} />
            </div>
          </div>
        </aside>
      </div>
    </Room>
  );
}
