'use client';
import { Room } from '@/castle/Room';
import { Dossier } from '@/case-files/Dossier';
import { AuraFlagship } from '@/case-files/AuraFlagship';
import { StatusMark } from '@/case-files/StatusMark';
import { byStatus, type ProjectStatus } from '@/data/caseFiles';
import { contact } from '@/data/contact';
import { useReveal } from '@/animations/useReveal';

const GROUPS: { status: ProjectStatus; heading: string; line: string }[] = [
  { status: 'COMPLETED', heading: 'Finished work', line: 'Built, shipped to a public repository, closed.' },
  { status: 'IN PROGRESS', heading: 'On the desk now', line: 'Being built as you read this.' },
  { status: 'ARCHIVED', heading: 'In the archive', line: 'Older work, kept for the record.' },
];

/**
 * III — PROJECTS BUILT.
 * The flagship first, under its own light. Then the finished work, then what
 * is still on the desk — so a visitor can tell at a glance which is which.
 */
export function ProjectsBuilt(): JSX.Element {
  return (
    <Room kind="investigation" id="projects" tall>
      <Slide delay={0}>
        <AuraFlagship />
      </Slide>

      {GROUPS.map((g) => {
        const files = byStatus(g.status);
        if (files.length === 0) return null;
        return (
          <section key={g.status} aria-label={g.heading} className="mt-28">
            <header className="mb-12 flex flex-col items-center gap-4 text-center">
              <StatusMark status={g.status} />
              <h3 className="font-display text-[clamp(26px,3.6vw,40px)] text-ivory">{g.heading}</h3>
              <p className="font-display text-[15px] italic text-parchment/55">{g.line}</p>
            </header>
            <div className="space-y-20">
              {files.map((f, i) => (
                <Slide key={f.id} delay={i * 140}>
                  <Dossier file={f} />
                </Slide>
              ))}
            </div>
          </section>
        );
      })}

      {contact.github && (
        <p className="mt-20 text-center">
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="inline-block border-b border-gold/40 py-2 font-body text-[11px] tracking-label text-gold/85 transition-colors hover:text-ivory"
          >
            EVERY PUBLIC REPOSITORY — GITHUB.COM/CODEPIONEER76 ↗
          </a>
        </p>
      )}
    </Room>
  );
}

function Slide({ children, delay }: { children: React.ReactNode; delay: number }): JSX.Element {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
