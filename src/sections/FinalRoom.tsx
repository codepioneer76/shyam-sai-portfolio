'use client';
import { useRef, useState } from 'react';
import { Room } from '@/castle/Room';
import { contact } from '@/data/contact';
import { profile } from '@/data/profile';
import { Plate, Label, Seal, Pending } from '@/components/Furnishings';
import { useScrollProgress } from '@/animations/useScrollProgress';
import { chime } from '@/audio/ambience';

const CHANNELS: { key: keyof typeof contact; label: string; action: string; note: string; href: (v: string) => string; external: boolean }[] = [
  { key: 'github', label: 'GITHUB', action: 'VIEW GITHUB', note: 'Every public repository', href: (v) => v, external: true },
  { key: 'email', label: 'EMAIL', action: 'SEND EMAIL', note: 'Correspondence, at length', href: (v) => `mailto:${v}`, external: false },
  { key: 'phone', label: 'PHONE', action: 'CALL', note: 'For a conversation', href: (v) => `tel:${v}`, external: false },
  { key: 'linkedin', label: 'LINKEDIN', action: 'VIEW PROFILE', note: 'The public professional record', href: (v) => v, external: true },
  { key: 'resume', label: 'RESUME', action: 'VIEW RESUME', note: 'The formal record, on one page', href: (v) => v, external: true },
];

/**
 * VII — THE FINAL ROOM.
 *
 * As the visitor walks in, the candles burn down and the great door at the end
 * of the room swings open onto daylight — the only warm-white light in the whole
 * castle. The name returns, and the ways out are laid on the threshold.
 */
export function FinalRoom(): JSX.Element {
  const [dim, setDim] = useState(0);
  const leftDoor = useRef<HTMLDivElement>(null);
  const rightDoor = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  const ref = useScrollProgress<HTMLDivElement>((p) => {
    const open = Math.min(1, Math.max(0, (p - 0.18) / 0.45));
    const e = open * open * (3 - 2 * open);
    if (leftDoor.current) leftDoor.current.style.transform = `rotateY(${e * 78}deg)`;
    if (rightDoor.current) rightDoor.current.style.transform = `rotateY(${-e * 78}deg)`;
    if (light.current) light.current.style.opacity = String(0.15 + e * 0.85);
    const d = Math.round(Math.min(1, Math.max(0, (p - 0.1) / 0.5)) * 20) / 20;
    setDim((prev) => (prev === d ? prev : d));
  });

  return (
    <Room kind="threshold" id="final" dim={dim}>
      <div ref={ref}>
        {/* the great door */}
        <div className="relative mx-auto mb-16 h-[48vh] w-full max-w-[560px]" aria-hidden>
          <div className="absolute inset-0 rounded-t-[240px] border border-gold/30" style={{ background: 'linear-gradient(180deg, rgba(20,12,9,.95), rgba(10,7,6,.98))' }} />
          {/* daylight beyond */}
          <div
            ref={light}
            className="absolute inset-x-[10%] bottom-0 top-[8%] rounded-t-[210px]"
            style={{
              opacity: 0.15,
              background: 'linear-gradient(180deg, rgba(255,236,204,.95), rgba(236,205,150,.6) 46%, rgba(201,164,92,.18))',
              boxShadow: '0 0 160px 50px rgba(255,214,150,.3)',
            }}
          />
          {/* the two leaves */}
          <div className="absolute inset-x-[10%] bottom-0 top-[8%] overflow-hidden rounded-t-[210px]" style={{ perspective: '1100px' }}>
            {[leftDoor, rightDoor].map((r, i) => (
              <div
                key={i}
                ref={r}
                className="wood absolute top-0 h-full w-1/2 border-black/80"
                style={{
                  [i === 0 ? 'left' : 'right']: 0,
                  transformOrigin: `${i === 0 ? 'left' : 'right'} center`,
                  boxShadow: 'inset 0 0 80px rgba(0,0,0,.85)',
                  willChange: 'transform',
                } as React.CSSProperties}
              >
                <div className="absolute inset-[10%_16%_48%_16%] border border-gold/20" />
                <div className="absolute inset-[56%_16%_8%_16%] border border-gold/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h3 className="font-display text-[clamp(34px,6vw,72px)] leading-[0.95] text-ivory">{profile.fullName}</h3>
          <p className="font-body mt-4 text-[12px] tracking-royal text-gold/80">{profile.discipline}</p>
          <div className="rule-gold mx-auto my-8 w-48" />
          <p className="font-display text-[clamp(24px,3.4vw,40px)] italic text-parchment/90">Let&apos;s build something.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {CHANNELS.map((c, i) => {
            const value = contact[c.key];
            return (
              <Plate key={c.key} className="p-7" delay={i * 110} tilt={i % 2 === 0 ? -0.4 : 0.4}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label className="text-[#7a5a30]">{c.label}</Label>
                    <p className="font-display mt-2 text-[19px] text-[#2a1c10]">{c.note}</p>
                  </div>
                  <span className="origin-top-right scale-[0.7]">
                    <Seal initials="SS" size={64} broken={Boolean(value)} />
                  </span>
                </div>
                <div className="mt-5">
                  {value ? (
                    <a
                      href={c.href(value)}
                      target={c.external ? '_blank' : undefined}
                      rel={c.external ? 'noreferrer' : undefined}
                      onClick={() => chime('door')}
                      className="group inline-flex flex-col gap-1.5 py-1"
                    >
                      <span className="font-body text-[11px] tracking-label text-[#8B1E2D] transition-colors group-hover:text-[#5a1720]">
                        {c.action} {c.external ? '↗' : '→'}
                      </span>
                      <span className="break-all font-body text-[13px] tracking-[0.04em] text-[#2a1c10] underline decoration-[#8B1E2D]/30 underline-offset-4 group-hover:decoration-[#8B1E2D]">
                        {value.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </a>
                  ) : (
                    <Pending label="AWAITING THE FILE" />
                  )}
                </div>
              </Plate>
            );
          })}
        </div>
      </div>
    </Room>
  );
}
