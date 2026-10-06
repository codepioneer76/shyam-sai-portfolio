import type { ProjectStatus } from '@/data/caseFiles';

/**
 * Project status, readable at a glance and never ambiguous.
 * COMPLETED is a solid ink stamp; IN PROGRESS carries a living mark (a slow
 * pulse, still under reduced motion); ARCHIVED is faded. Colour is never the
 * only signal — the word is always there.
 */
const STYLE: Record<ProjectStatus, { ink: string; border: string; dot: string }> = {
  COMPLETED: { ink: 'rgba(214,190,140,.95)', border: 'rgba(201,164,92,.6)', dot: '#c9a45c' },
  'IN PROGRESS': { ink: 'rgba(196,74,88,.95)', border: 'rgba(139,30,45,.75)', dot: '#c0394b' },
  ARCHIVED: { ink: 'rgba(156,140,119,.8)', border: 'rgba(156,140,119,.45)', dot: '#9c8c77' },
};

export function StatusMark({ status, stamp = false }: { status: ProjectStatus; stamp?: boolean }): JSX.Element {
  const s = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-2.5 border-2 px-3 py-1.5 font-display tracking-[0.2em] ${stamp ? 'rotate-[-5deg] text-[13px]' : 'text-[11px]'}`}
      style={{ borderColor: s.border, color: s.ink }}
    >
      <span
        className={`h-2 w-2 rounded-full ${status === 'IN PROGRESS' ? 'animate-[halo_2.8s_ease-in-out_infinite]' : ''}`}
        style={{ background: s.dot, boxShadow: status === 'IN PROGRESS' ? `0 0 10px ${s.dot}` : 'none' }}
        aria-hidden
      />
      {status}
    </span>
  );
}
