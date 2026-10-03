'use client';
import { Room } from '@/castle/Room';
import { Dossier } from '@/case-files/Dossier';
import { caseFiles } from '@/data/caseFiles';
import { useReveal } from '@/animations/useReveal';

/** III — PROJECTS BUILT. Two leather folders on the investigation desk. */
export function ProjectsBuilt(): JSX.Element {
  return (
    <Room kind="investigation" id="projects" tall>
      <div className="space-y-20">
        {caseFiles.map((f, i) => (
          <Slide key={f.id} delay={i * 160}>
            <Dossier file={f} />
          </Slide>
        ))}
      </div>
      <p className="mt-14 text-center font-body text-[10.5px] tracking-label text-parchment/40">
        PAGES MARKED • AWAIT VERIFICATION
      </p>
    </Room>
  );
}

/** Folders slide onto the desk from below, not fade in from nowhere. */
function Slide({ children, delay }: { children: React.ReactNode; delay: number }): JSX.Element {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
