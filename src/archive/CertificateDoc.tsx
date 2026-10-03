'use client';
import { useEffect, useState } from 'react';
import type { Credential } from '@/data/archive';
import { chime } from '@/audio/ambience';

type Beat = 'lift' | 'crack' | 'unfold';

/**
 * A certificate drawn from the drawer.
 *
 * It arrives folded in half and sealed across the fold. The document lifts, the
 * wax splits along the crease, and the upper half swings open on the fold line
 * to reveal the credential. Keyed by record, so selecting another certificate
 * plays the sequence again from the start.
 */
export function CertificateDoc({ record }: { record: Credential }): JSX.Element {
  const [beat, setBeat] = useState<Beat>('lift');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBeat('unfold');
      return;
    }
    setBeat('lift');
    const a = window.setTimeout(() => {
      setBeat('crack');
      chime('seal');
    }, 420);
    const b = window.setTimeout(() => {
      setBeat('unfold');
      chime('unfold');
    }, 900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [record.id]);

  const unfolded = beat === 'unfold';
  const cracked = beat !== 'lift';

  return (
    <div className="relative" style={{ perspective: '1400px' }}>
      <div
        className="relative"
        style={{
          paddingTop: 150,
          transform: beat === 'lift' ? 'translateY(26px) rotate(-1.5deg)' : 'translateY(0) rotate(0deg)',
          transition: 'transform .6s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* lower half — always lying flat */}
        <div className="parchment-surface relative rounded-b-[2px] px-8 pb-8 pt-10">
          <p className="font-body text-[10px] tracking-label text-[#7a5a30]">ISSUED BY</p>
          <p className="font-display mt-1 text-[20px] text-[#2a1c10]">{record.issuer}</p>
          <div className="my-5 h-px w-full bg-[#8a6a3a]/35" />
          <p className="font-body text-[13.5px] leading-[1.85] text-[#3a2a18]">{record.body}</p>
          <p className="font-body mt-5 text-[10px] tracking-label text-[#8B1E2D]/80">ISSUE DATE — PENDING VERIFICATION</p>
        </div>

        {/* upper half — folded down over the lower until the seal breaks */}
        <div
          className="parchment-surface absolute inset-x-0 top-0 h-[150px] origin-bottom rounded-t-[2px] px-8 pt-7"
          style={{
            transform: unfolded ? 'rotateX(0deg)' : 'rotateX(-178deg)',
            transition: 'transform 1s cubic-bezier(.65,0,.35,1)',
            backfaceVisibility: 'hidden',
            boxShadow: unfolded ? 'none' : '0 -10px 30px rgba(0,0,0,.4)',
          }}
        >
          <p className="font-body text-[10px] tracking-label text-[#7a5a30]">CERTIFICATE OF COMPLETION</p>
          <h3 className="font-display mt-3 text-[clamp(20px,2.4vw,27px)] leading-tight text-[#1e1508]">{record.name}</h3>
          <p className="font-body mt-3 text-[11px] tracking-label text-[#6a4b28]">AWARDED TO SHYAM SAI TATIPARTI</p>
        </div>

        {/* the fold line and its seal */}
        <div className="pointer-events-none absolute inset-x-0 top-[150px] h-px bg-[#6a4b28]/35" aria-hidden />
        <div className="pointer-events-none absolute left-[84%] top-[150px] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {(['top', 'bottom'] as const).map((half) => (
            <span
              key={half}
              className="absolute left-1/2 top-1/2 block h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle at 36% 30%, #b8323f 0%, #8b1e2d 42%, #4d0f18 78%, #2c0810 100%)',
                boxShadow: 'inset -3px -4px 10px rgba(0,0,0,.6), 0 6px 14px rgba(0,0,0,.55)',
                clipPath: half === 'top' ? 'polygon(0 0,100% 0,100% 48%,70% 54%,44% 46%,20% 55%,0 49%)' : 'polygon(0 49%,20% 55%,44% 46%,70% 54%,100% 48%,100% 100%,0 100%)',
                transform: `translate(-50%, -50%) ${cracked ? (half === 'top' ? 'translateY(-14px) rotate(-8deg)' : 'translateY(10px) rotate(6deg)') : ''}`,
                opacity: unfolded ? 0.65 : 1,
                transition: 'transform .45s cubic-bezier(.3,1.5,.5,1), opacity .8s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
