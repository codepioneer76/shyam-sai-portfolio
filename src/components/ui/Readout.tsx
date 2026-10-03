'use client';
import { useExperience } from '@/state/store';

/**
 * Readout — the field readout for whatever is currently being examined.
 *
 * Editorial scale, not terminal scale: the object name is display type, the
 * description is set at reading size with a measure, and the whole block hangs
 * off a hairline rule at the left edge instead of sitting inside a card. There
 * is no panel, no border, no rounded rectangle — the world stays visible behind it.
 */
export function Readout(): JSX.Element {
  const detail = useExperience((s) => s.detail);
  const on = detail !== null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 transition-all duration-500 ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      aria-live="polite"
    >
      {/* Light falloff rather than a panel: the readout sits in the dark, not on a slab. */}
      <div className="bg-gradient-to-t from-void via-void/88 to-transparent px-7 pb-20 pt-24 md:px-10 md:pb-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="border-l border-signal/45 pl-5">
            <p className="text-[10.5px] tracking-[0.4em] text-signal/90">{detail?.kicker}</p>
            <h2 className="display mt-2.5 text-[clamp(26px,4.4vw,46px)] leading-[0.95]">{detail?.name}</h2>
            <p className="mt-4 max-w-[58ch] text-[14px] leading-[1.7] text-bone/75">{detail?.body}</p>

            {detail?.facts && detail.facts.length > 0 && (
              <dl className="mt-5 flex flex-wrap gap-x-9 gap-y-2">
                {detail.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-[9.5px] tracking-[0.3em] text-ash/70">{f.label}</dt>
                    <dd className="mt-1 text-[12.5px] tracking-[0.06em] text-bone">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {detail?.deployedIn !== undefined && (
              <p className="mt-4 text-[11px] tracking-[0.2em] text-ash">
                {detail.deployedIn.length > 0 ? (
                  <>
                    DEPLOYED IN <span className="text-signal">{detail.deployedIn.join('  ·  ')}</span>
                  </>
                ) : (
                  <>STATUS <span className="text-tungsten">ACTIVE STUDY — NOT YET IN A CASE FILE</span></>
                )}
              </p>
            )}
          </div>

          {detail?.status && (
            <div className="pl-5 md:pl-0 md:text-right">
              <p className="text-[9.5px] tracking-[0.3em] text-ash/70">CLASSIFICATION</p>
              <p
                className={`display mt-2 text-[19px] tracking-[0.06em] ${
                  detail.status === 'applied' ? 'text-signal' : 'text-tungsten'
                }`}
              >
                {detail.status === 'applied' ? 'APPLIED' : 'IN STUDY'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
