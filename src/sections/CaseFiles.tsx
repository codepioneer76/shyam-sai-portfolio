'use client';
import { Room } from '@/castle/Room';
import { Dossier } from '@/case-files/Dossier';
import { caseFiles } from '@/data/caseFiles';
import { useReveal } from '@/animations/useReveal';

/** IV — CASE FILES. The investigation room: two folders on the examination table. */
export function CaseFiles(): JSX.Element {
  const a = useReveal<HTMLDivElement>();
  const b = useReveal<HTMLDivElement>(180);

  return (
    <Room kind="investigation" numeral="IV" title="CASE FILES" id="casefiles" tall>
      <p className="font-display mx-auto mb-14 max-w-[58ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        Two investigations, both still open. What is known is written down; what is not is left blank.
      </p>

      <div className="space-y-16">
        <div ref={a} className="reveal">
          <Dossier index={0} />
        </div>
        <div ref={b} className="reveal">
          <Dossier index={1} />
        </div>
      </div>

      <p className="mt-14 text-center font-body text-[10.5px] tracking-label text-parchment/45">
        {caseFiles.length} FILES ON THE TABLE · MARKED • WHERE A PAGE AWAITS VERIFICATION
      </p>
    </Room>
  );
}
