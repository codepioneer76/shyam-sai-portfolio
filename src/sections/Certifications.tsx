'use client';
import { Room } from '@/castle/Room';
import { Cabinet } from '@/archive/Cabinet';
import { Typewriter } from '@/components/Typewriter';
import { credentials } from '@/data/archive';

/** V — CERTIFICATIONS. The records room: a cabinet of sealed credentials, and the logging machine. */
export function Certifications(): JSX.Element {
  return (
    <Room kind="records" id="certifications" tall>
      <p className="font-display mx-auto -mt-6 mb-12 max-w-[56ch] text-center text-[16px] italic leading-relaxed text-parchment/60">
        {credentials.length} credentials, filed by drawer. Each is sealed across its fold.
      </p>
      <Cabinet />
      <div className="mt-20">
        <Typewriter />
      </div>
    </Room>
  );
}
