'use client';
import { Room } from '@/castle/Room';
import { Cabinet } from '@/archive/Cabinet';
import { Typewriter } from '@/components/Typewriter';

/** VII — THE ARCHIVE. Records cabinet, and the machine that logs the visit. */
export function Archive(): JSX.Element {
  return (
    <Room kind="records" numeral="VII" title="THE ARCHIVE" id="archive" tall>
      <p className="font-display mx-auto mb-14 max-w-[58ch] text-center text-[17px] italic leading-relaxed text-parchment/70">
        Credentials are kept here, sealed and filed. What each one actually taught is written on the record itself.
      </p>

      <Cabinet />

      <div className="mt-20">
        <Typewriter />
      </div>
    </Room>
  );
}
