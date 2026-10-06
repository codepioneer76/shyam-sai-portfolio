'use client';
import { Room } from '@/castle/Room';
import { SuitcaseStage } from '@/inventory/SuitcaseStage';

/** II — SKILL SET. The travelling case, and everything packed inside it. */
export function SkillSet(): JSX.Element {
  return (
    <Room kind="workroom" id="skills" tall>
      <p className="font-display mx-auto -mt-6 mb-8 max-w-[56ch] text-center text-[16px] italic leading-relaxed text-parchment/60">
        A travelling case on the table, packed in five trays by discipline — Python first. Every object is marked with what has actually been done with it.
      </p>
      <SuitcaseStage />
    </Room>
  );
}
