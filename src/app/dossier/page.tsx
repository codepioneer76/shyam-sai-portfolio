import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/data/profile';
import { contact } from '@/data/contact';
import { foundation } from '@/data/foundation';
import { arsenal } from '@/data/arsenal';
import { caseFiles } from '@/data/caseFiles';
import { experiments } from '@/data/lab';
import { journey } from '@/data/journey';
import { credentials } from '@/data/archive';
import { systemNotes } from '@/data/systemNotes';

export const metadata: Metadata = {
  title: 'Full record',
  description: 'The complete text record of Shyam Sai — foundations, equipment, case files, experiments, credentials and engineering positions.',
  alternates: { canonical: '/dossier' },
};

/**
 * /dossier — the same data as the 3D experience, as a document.
 * Server rendered, no WebGL, no JavaScript required. This is what a recruiter
 * on a locked-down laptop, a screen reader, or a crawler gets.
 */
export default function Dossier(): JSX.Element {
  return (
    <div className="min-h-screen overflow-y-auto bg-ink px-6 py-14 text-parchment md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-[10px] tracking-[0.24em] text-ash hover:text-ivory">
          ← ENTER THE FACILITY
        </Link>

        <header className="mt-8 border-b border-gold/20 pb-8">
          <h1 className="font-display text-[clamp(34px,8vw,64px)]">{profile.fullName}</h1>
          <p className="mt-3 text-[11px] tracking-[0.3em] text-ash">{profile.classification}</p>
          <p className="mt-5 max-w-[62ch] text-[14px] leading-relaxed text-parchment/80">{profile.positioning}</p>
          <dl className="mt-6 grid gap-2 text-[11.5px] tracking-[0.12em] text-ash sm:grid-cols-2">
            <div><dt className="inline">PROGRAMME </dt><dd className="inline text-ivory">{profile.degree}</dd></div>
            <div><dt className="inline">INSTITUTION </dt><dd className="inline text-ivory">{profile.institution}</dd></div>
            <div><dt className="inline">PERIOD </dt><dd className="inline text-ivory">{profile.years}</dd></div>
            <div><dt className="inline">LOCATION </dt><dd className="inline text-ivory">{profile.location}</dd></div>
          </dl>
        </header>

        <Section title="Foundation">
          <ul className="space-y-4">
            {foundation.map((f) => (
              <li key={f.id}>
                <h3 className="text-[13px] tracking-[0.12em] text-ivory">{f.name}</h3>
                <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">{f.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Arsenal">
          <p className="mb-5 text-[11.5px] tracking-[0.12em] text-ash">
            Applied means used in shipped work. In study means a current direction. No proficiency scores.
          </p>
          <ul className="space-y-4">
            {arsenal.map((a) => (
              <li key={a.id}>
                <h3 className="text-[13px] tracking-[0.12em]">
                  {a.name}{' '}
                  <span className={a.status === 'applied' ? 'text-gold' : 'text-crimson'}>
                    — {a.status === 'applied' ? 'applied' : 'in study'}
                  </span>
                </h3>
                <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">{a.body}</p>
                {a.deployedIn && a.deployedIn.length > 0 && (
                  <p className="mt-1 text-[10.5px] tracking-[0.14em] text-ash">DEPLOYED IN {a.deployedIn.join(' · ')}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Case files">
          {caseFiles.map((c) => (
            <article key={c.id} className="mb-10">
              <h3 className="font-display text-2xl">{c.title}</h3>
              <p className="mt-1 text-[10.5px] tracking-[0.2em] text-ash">{c.code} · {c.type} · {c.state}</p>
              <p className="mt-3 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">{c.body}</p>
              {c.stack.length > 0 && (
                <p className="mt-2 text-[11px] tracking-[0.12em] text-ash">STACK {c.stack.join(', ')}</p>
              )}
              <dl className="mt-4 space-y-3">
                {c.sections.map((s) => (
                  <div key={s.key}>
                    <dt className="text-[10.5px] tracking-[0.2em] text-ash">{s.key}</dt>
                    <dd className={`max-w-[64ch] text-[12.5px] leading-relaxed ${s.body ? 'text-parchment/80' : 'text-crimson/80'}`}>
                      {s.body ?? 'Pending verification — not yet supplied.'}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </Section>

        <Section title="Lab">
          {experiments.map((e) => (
            <article key={e.id} className="mb-6">
              <h3 className="text-[13px] tracking-[0.12em]">{e.name}</h3>
              <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">Objective: {e.objective}</p>
              <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">Technology: {e.technology}</p>
              {e.implementation && <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">Implementation: {e.implementation}</p>}
              {e.result && <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">Result: {e.result}</p>}
              {e.lessons && <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">Lessons: {e.lessons}</p>}
            </article>
          ))}
        </Section>

        <Section title="Journey">
          <ol className="space-y-2">
            {journey.map((j) => (
              <li key={j.id} className="max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">
                <span className="text-ivory">{j.name}</span> — {j.body}
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Archive">
          <ul className="space-y-3">
            {credentials.map((c) => (
              <li key={c.id} className="text-[12.5px] leading-relaxed text-parchment/80">
                <span className="text-ivory">{c.name}</span> — {c.issuer}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="System">
          <ul className="space-y-4">
            {systemNotes.map((s) => (
              <li key={s.id}>
                <h3 className="text-[13px] tracking-[0.12em]">{s.name}</h3>
                <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-parchment/80">{s.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Extraction">
          <ul className="space-y-2 text-[12.5px] text-parchment/80">
            <li>Email — {contact.email ?? 'pending'}</li>
            <li>LinkedIn — {contact.linkedin ?? 'pending'}</li>
            <li>GitHub — {contact.github ?? 'pending'}</li>
            <li>Resume — {contact.resume ?? 'pending'}</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="border-b border-gold/20 py-10">
      <h2 className="font-display mb-6 text-[22px]">{title}</h2>
      {children}
    </section>
  );
}
