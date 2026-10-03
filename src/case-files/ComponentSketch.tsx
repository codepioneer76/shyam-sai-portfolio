'use client';

/**
 * A pen sketch of the components a project is described as having.
 *
 * Deliberately labelled AS DESCRIBED: it draws the parts named in the project's
 * own summary, in the order a signal passes through them. It makes no claim
 * about how those parts are actually wired, which is recorded separately under
 * ARCHITECTURE — and stays pending until Shyam supplies it.
 */
export function ComponentSketch({ nodes, drawn }: { nodes: string[]; drawn: boolean }): JSX.Element {
  const gap = 118;
  const width = Math.max(560, nodes.length * gap + 40);
  return (
    <figure className="mt-2">
      <svg viewBox={`0 0 ${width} 110`} className="w-full" role="img" aria-label={`Components as described: ${nodes.join(', ')}`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#5a3c1c" />
          </marker>
        </defs>
        {nodes.map((n, i) => {
          const x = 30 + i * gap;
          return (
            <g key={n} style={{ opacity: drawn ? 1 : 0, transition: `opacity .6s ease ${0.2 + i * 0.18}s` }}>
              <rect x={x} y={34} width={96} height={40} rx={3} fill="rgba(90,23,32,0.06)" stroke="#5a3c1c" strokeWidth={1.4} />
              <text x={x + 48} y={58} textAnchor="middle" fontSize={11} fill="#2a1c10" fontFamily="Georgia, serif">
                {n}
              </text>
              {i < nodes.length - 1 && (
                <line
                  x1={x + 96}
                  y1={54}
                  x2={x + gap}
                  y2={54}
                  stroke="#5a3c1c"
                  strokeWidth={1.2}
                  markerEnd="url(#arrow)"
                  strokeDasharray="30"
                  strokeDashoffset={drawn ? 0 : 30}
                  style={{ transition: `stroke-dashoffset .5s ease ${0.35 + i * 0.18}s` }}
                />
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="font-body mt-1 text-[9.5px] tracking-label text-[#7a5a30]">
        COMPONENTS AS DESCRIBED — ARCHITECTURE RECORDED SEPARATELY
      </figcaption>
    </figure>
  );
}
