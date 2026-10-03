'use client';
import { Room } from '@/castle/Room';
import { Plate, Label, Rule, Frame, Pending } from '@/components/Furnishings';
import { profile, attachments, languages } from '@/data/profile';

/** I — THE SUBJECT. A dossier laid on the hall table: portrait plate, record, languages. */
export function Subject(): JSX.Element {
  return (
    <Room kind="hall" numeral="I" title="THE SUBJECT" id="subject">
      <div className="grid gap-10 md:grid-cols-[380px_minmax(0,1fr)] md:gap-14">
        {/* The portrait frame holds a monogram rather than a photograph: no image
            of Shyam has been provided, and an invented likeness is still an invention. */}
        <Frame className="h-[460px]">
          <div className="velvet relative grid h-full place-items-center">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rotate-45 border border-gold/45" />
              <p className="font-display -mt-[68px] text-[34px] tracking-[0.12em] text-gold/85">S·S·T</p>
              <p className="mt-20 font-body text-[10px] tracking-label text-parchment/55">PORTRAIT PLATE</p>
              <p className="mt-2 font-body text-[9.5px] tracking-label text-parchment/35">AWAITING SITTING</p>
            </div>
          </div>
        </Frame>

        <div className="space-y-8">
          <Plate className="p-8 md:p-10">
            <Label>PERSONAL RECORD</Label>
            <h3 className="font-display mt-3 text-[clamp(26px,3.6vw,42px)] leading-none text-[#2a1c10]">{profile.fullName}</h3>
            <p className="font-body mt-2 text-[12px] tracking-label text-[#6a4b28]">{profile.classification}</p>
            <div className="my-6 h-px w-full bg-[#8a6a3a]/30" />
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['PROGRAMME', profile.degree],
                ['INSTITUTION', profile.institution],
                ['PERIOD', profile.years],
                ['SEAT', profile.location],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-body text-[9.5px] tracking-label text-[#7a5a30]">{k}</dt>
                  <dd className="font-display mt-1 text-[15px] leading-snug text-[#2a1c10]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="font-body mt-7 max-w-[58ch] text-[14px] leading-[1.85] text-[#3a2a18]">{profile.positioning}</p>
          </Plate>

          <div className="grid gap-8 sm:grid-cols-2">
            <Plate className="p-7" delay={140} tilt={-0.4}>
              <Label>PRESENT DIRECTION</Label>
              <ul className="mt-4 space-y-2.5">
                {profile.focus.map((f) => (
                  <li key={f} className="font-display flex items-baseline gap-3 text-[15px] text-[#2a1c10]">
                    <span className="text-[#8B1E2D]">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Plate>

            <Plate className="p-7" delay={260} tilt={0.5}>
              <Label>TONGUES</Label>
              <ul className="mt-4 space-y-2">
                {languages.map((l) => (
                  <li key={l.name}>
                    <p className="font-display text-[15px] text-[#2a1c10]">{l.name}</p>
                    <p className="font-body text-[10.5px] text-[#6a4b28]">{l.level}</p>
                  </li>
                ))}
              </ul>
            </Plate>
          </div>

          {/* Verified institution, unverified role. Shown exactly that way. */}
          {attachments.map((a) => (
            <Plate key={a.id} className="p-7" delay={340}>
              <Label>ATTACHMENT ON RECORD</Label>
              <h4 className="font-display mt-3 text-[22px] leading-tight text-[#2a1c10]">
                {a.institution}
                <span className="block text-[15px] tracking-[0.1em] text-[#6a4b28]">{a.place}</span>
              </h4>
              <Rule className="my-5 opacity-40" />
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-body text-[10.5px] tracking-label text-[#7a5a30]">ROLE & RESPONSIBILITIES</span>
                <Pending />
              </div>
              <p className="font-body mt-4 max-w-[52ch] text-[12.5px] italic leading-relaxed text-[#5a4326]">
                The institution appears on the public record. Nothing further is claimed here until Shyam supplies it.
              </p>
            </Plate>
          ))}
        </div>
      </div>
    </Room>
  );
}
