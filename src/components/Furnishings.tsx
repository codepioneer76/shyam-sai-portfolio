'use client';
import { type ReactNode } from 'react';
import { useReveal } from '@/animations/useReveal';

/** A sheet of aged paper. The workhorse surface for every document in the estate. */
export function Plate({
  children,
  className = '',
  delay = 0,
  tilt = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  tilt?: number;
}): JSX.Element {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div
      ref={ref}
      className={`parchment-surface reveal relative rounded-[2px] ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <span className="pointer-events-none absolute inset-[6px] border border-[#8a6a3a]/25" aria-hidden />
      {children}
    </div>
  );
}

/** Small caps label in gold. Used for every field name in the archive. */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  const colour = /(^|\s)text-(\[|[a-z])/.test(className) && !/text-\[\d/.test(className) ? '' : 'text-gold/80';
  return <p className={`font-body text-[10px] tracking-label ${colour} ${className}`}>{children}</p>;
}

export function Rule({ className = '' }: { className?: string }): JSX.Element {
  return <div className={`rule-gold ${className}`} aria-hidden />;
}

/** Wax seal. Pressed, not drawn: the highlight sits off-centre and the edge is uneven. */
export function Seal({ initials = 'SS', broken = false, size = 76 }: { initials?: string; broken?: boolean; size?: number }): JSX.Element {
  return (
    <span
      className="relative inline-grid place-items-center rounded-full transition-transform duration-700"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 36% 30%, #b8323f 0%, #8b1e2d 42%, #4d0f18 78%, #2c0810 100%)',
        boxShadow: 'inset -3px -4px 10px rgba(0,0,0,.6), inset 2px 3px 8px rgba(255,140,150,.22), 0 8px 18px rgba(0,0,0,.6)',
        clipPath: broken
          ? 'polygon(0 0, 46% 0, 52% 22%, 44% 46%, 56% 72%, 48% 100%, 0 100%)'
          : 'polygon(12% 2%, 60% 0, 88% 14%, 100% 46%, 92% 82%, 62% 100%, 24% 96%, 2% 66%, 0 28%)',
        opacity: broken ? 0.75 : 1,
      }}
      aria-hidden
    >
      <span className="font-display text-[15px] tracking-[0.16em] text-[#f0c9c0]/80">{initials}</span>
    </span>
  );
}

/** A gilt frame — portraits, plates, and the map hang in these. */
export function Frame({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div
      className={`relative rounded-[3px] p-[10px] ${className}`}
      style={{
        background: 'linear-gradient(145deg, #6a5228 0%, #c9a45c 22%, #7d6230 48%, #c9a45c 74%, #52401e 100%)',
        boxShadow: '0 26px 60px rgba(0,0,0,.75)',
      }}
    >
      <div className="absolute inset-[5px] rounded-[2px] border border-black/40" aria-hidden />
      <div className="relative h-full w-full overflow-hidden rounded-[1px] border border-black/60">{children}</div>
    </div>
  );
}

/** Marks content the visitor should not mistake for verified fact. */
export function Pending({ label = 'PENDING VERIFICATION' }: { label?: string }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 border border-crimson/45 px-2.5 py-1 font-body text-[9.5px] tracking-label text-crimson/90">
      <span className="h-1 w-1 rotate-45 bg-crimson" aria-hidden />
      {label}
    </span>
  );
}
