'use client';
import { Room } from '@/castle/Room';
import { Case } from '@/inventory/Case';
import { Label, Rule } from '@/components/Furnishings';
import { useStore } from '@/state/store';

/** III — THE ARSENAL. The case on the table, and the note that goes with whatever is lifted out of it. */
export function Arsenal(): JSX.Element {
  const artifact = useStore((s) => s.artifact);
  const open = useStore((s) => s.caseOpen);

  return (
    <Room kind="workroom" numeral="III" title="THE ARSENAL" id="arsenal" tall>
      <p className="font-display mx-auto mb-12 max-w-[56ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        A travelling case, left on the table. The brasses are stiff but they still turn.
      </p>

      <Case />

      {/* Examination note — appears only when something has been lifted out. */}
      <div
        className="mx-auto mt-14 max-w-[760px] transition-all duration-700"
        style={{
          opacity: artifact ? 1 : 0,
          transform: artifact ? 'none' : 'translateY(14px)',
          pointerEvents: artifact ? 'auto' : 'none',
        }}
        aria-live="polite"
      >
        {artifact && (
          <div className="border-y border-gold/25 py-8 text-center">
            <Label>{artifact.cat}</Label>
            <h3 className="font-display mt-3 text-[clamp(26px,4vw,44px)] leading-none text-ivory">{artifact.name}</h3>
            <Rule className="mx-auto my-6 w-40" />
            <p className="font-body mx-auto max-w-[60ch] text-[14.5px] leading-[1.9] text-parchment/80">{artifact.body}</p>
            <p className="font-body mt-6 text-[10.5px] tracking-label text-gold/75">
              {artifact.deployedIn && artifact.deployedIn.length > 0 ? (
                <>CARRIED INTO — {artifact.deployedIn.join('  ·  ')}</>
              ) : (
                <span className="text-crimson/85">UNDER STUDY — NOT YET CARRIED INTO A CASE</span>
              )}
            </p>
          </div>
        )}
      </div>

      {!open && (
        <p className="mt-10 text-center font-body text-[11px] tracking-label text-parchment/40">
          THE CASE IS LATCHED
        </p>
      )}
    </Room>
  );
}
