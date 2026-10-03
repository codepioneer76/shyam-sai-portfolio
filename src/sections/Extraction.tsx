'use client';
import { Room } from '@/castle/Room';
import { contact } from '@/data/contact';
import { profile } from '@/data/profile';
import { Plate, Label, Seal, Pending } from '@/components/Furnishings';
import { chime } from '@/audio/ambience';

const CHANNELS: { key: keyof typeof contact; label: string; note: string }[] = [
  { key: 'email', label: 'BY LETTER', note: 'Correspondence, at length' },
  { key: 'linkedin', label: 'BY REGISTER', note: 'The public professional record' },
  { key: 'github', label: 'BY WORKS', note: 'Source, as it was written' },
  { key: 'resume', label: 'BY DOCUMENT', note: 'The formal record, on one page' },
];

/**
 * IX — EXTRACTION. The door, standing open on daylight.
 *
 * The only warm-white light in the estate is on the other side of it, which is
 * why the last room reads as an ending rather than a footer.
 */
export function Extraction(): JSX.Element {
  return (
    <Room kind="threshold" numeral="IX" title="EXTRACTION" id="extraction">
      {/* the open door */}
      <div className="relative mx-auto mb-16 h-[42vh] w-full max-w-[560px]" aria-hidden>
        <div
          className="absolute inset-0 rounded-t-[220px] border border-gold/25"
          style={{ background: 'linear-gradient(180deg, rgba(20,12,9,.95), rgba(10,7,6,.98))' }}
        />
        <div
          className="absolute inset-x-[18%] bottom-0 top-[10%] rounded-t-[180px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,233,196,.92), rgba(236,205,150,.55) 46%, rgba(201,164,92,.16))',
            boxShadow: '0 0 140px 40px rgba(255,214,150,.28)',
            animation: 'halo 9s ease-in-out infinite',
          }}
        />
        <div className="absolute inset-x-[18%] bottom-0 top-[10%] rounded-t-[180px] border border-gold/40" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display text-[clamp(22px,3vw,34px)] italic leading-relaxed text-parchment/85">
          Every investigation eventually leads somewhere.
        </p>
        <p className="font-body mt-5 text-[11px] tracking-royal text-gold/80">
          {profile.fullName} — {profile.classification}
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {CHANNELS.map((c, i) => {
          const value = contact[c.key];
          return (
            <Plate key={c.key} className="p-7" delay={i * 110} tilt={i % 2 === 0 ? -0.5 : 0.5}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="text-[#7a5a30]">{c.label}</Label>
                  <p className="font-display mt-2 text-[20px] text-[#2a1c10]">{c.note}</p>
                </div>
                <span className="scale-[0.7] origin-top-right">
                  <Seal initials="SS" size={64} broken={Boolean(value)} />
                </span>
              </div>
              <div className="mt-5">
                {value ? (
                  <a
                    href={c.key === 'email' ? `mailto:${value}` : value}
                    onClick={() => chime('door')}
                    className="font-body text-[13px] tracking-[0.08em] text-[#8B1E2D] underline decoration-[#8B1E2D]/40 underline-offset-4 hover:decoration-[#8B1E2D]"
                  >
                    {value}
                  </a>
                ) : (
                  <Pending label="AWAITING THE SEAL" />
                )}
              </div>
            </Plate>
          );
        })}
      </div>

      <p className="mx-auto mt-14 max-w-[62ch] text-center font-body text-[12px] italic leading-relaxed text-parchment/50">
        The four channels above are held closed until Shyam supplies them. They are recorded in one file,
        <span className="text-gold/80"> src/data/contact.ts</span>, and the seals break themselves the moment it is filled in.
      </p>
    </Room>
  );
}
