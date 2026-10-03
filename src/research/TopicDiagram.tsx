'use client';
import type { Diagram } from '@/data/research';

/**
 * A small ink diagram for each research topic. Drawn in the manuscript as it
 * opens: strokes trace themselves with stroke-dashoffset, so the idea is
 * sketched in front of the reader rather than pasted in.
 */
export function TopicDiagram({ kind, drawn }: { kind: Diagram; drawn: boolean }): JSX.Element {
  const ink = '#4a2e14';
  const accent = '#8B1E2D';
  const stroke = (i: number): React.CSSProperties => ({
    strokeDasharray: 400,
    strokeDashoffset: drawn ? 0 : 400,
    transition: `stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1) ${0.15 + i * 0.12}s`,
  });
  const dot = (i: number): React.CSSProperties => ({ opacity: drawn ? 1 : 0, transition: `opacity .5s ease ${0.3 + i * 0.08}s` });

  const box = (x: number, y: number, label: string, i: number, w = 78): JSX.Element => (
    <g key={label + x}>
      <rect x={x} y={y} width={w} height={30} rx={2} fill="none" stroke={ink} strokeWidth={1.2} style={stroke(i)} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={10} fill={ink} fontFamily="Georgia, serif" style={dot(i)}>
        {label}
      </text>
    </g>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, i: number): JSX.Element => (
    <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1.1} style={stroke(i)} markerEnd="url(#tip)" />
  );

  let body: JSX.Element;
  switch (kind) {
    case 'network': {
      const layers = [[40, 70, 100], [55, 85], [70]];
      const xs = [60, 170, 280];
      const lines: JSX.Element[] = [];
      layers.forEach((col, li) => {
        if (li === layers.length - 1) return;
        col.forEach((y1) => layers[li + 1].forEach((y2) => lines.push(<line key={`${li}${y1}${y2}`} x1={xs[li]} y1={y1} x2={xs[li + 1]} y2={y2} stroke={ink} strokeWidth={0.9} style={stroke(li)} />)));
      });
      body = (
        <>
          {lines}
          {layers.map((col, li) => col.map((y) => <circle key={`${li}${y}`} cx={xs[li]} cy={y} r={8} fill="#e7d6b4" stroke={li === 2 ? accent : ink} strokeWidth={1.4} style={dot(li)} />))}
          <text x={60} y={128} fontSize={9} fill={ink} fontFamily="Georgia, serif" textAnchor="middle" style={dot(3)}>features</text>
          <text x={280} y={128} fontSize={9} fill={accent} fontFamily="Georgia, serif" textAnchor="middle" style={dot(4)}>prediction</text>
        </>
      );
      break;
    }
    case 'layers':
      body = (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={40 + i * 64} y={30 + i * 6} width={44} height={80 - i * 12} fill="none" stroke={i === 3 ? accent : ink} strokeWidth={1.2} style={stroke(i)} />
          ))}
          {[0, 1, 2].map((i) => arrow(84 + i * 64, 70, 104 + i * 64, 70, i + 1))}
          <text x={170} y={130} textAnchor="middle" fontSize={9} fill={ink} fontFamily="Georgia, serif" style={dot(4)}>representations, deepening</text>
        </>
      );
      break;
    case 'generate':
      body = (
        <>
          {box(30, 55, 'prompt', 0)}
          {arrow(108, 70, 138, 70, 1)}
          {box(140, 55, 'model', 2, 70)}
          {arrow(210, 70, 240, 70, 3)}
          {box(242, 55, 'output', 4)}
          <path d="M281 90 Q281 118 175 118 Q70 118 70 90" fill="none" stroke={accent} strokeWidth={1.1} style={stroke(5)} markerEnd="url(#tip)" />
          <text x={175} y={132} textAnchor="middle" fontSize={9} fill={accent} fontFamily="Georgia, serif" style={dot(6)}>judged, then refined</text>
        </>
      );
      break;
    case 'context':
      body = (
        <>
          <rect x={30} y={28} width={170} height={84} fill="none" stroke={ink} strokeWidth={1.2} style={stroke(0)} />
          <text x={115} y={22} textAnchor="middle" fontSize={9} fill={ink} fontFamily="Georgia, serif" style={dot(0)}>context window</text>
          {['instructions', 'retrieved text', 'tool results', 'question'].map((t, i) => (
            <text key={t} x={42} y={48 + i * 18} fontSize={9.5} fill={ink} fontFamily="Georgia, serif" style={dot(i + 1)}>— {t}</text>
          ))}
          {arrow(200, 70, 232, 70, 5)}
          {box(234, 55, 'structured', 6, 80)}
        </>
      );
      break;
    case 'retrieve':
      body = (
        <>
          {box(20, 20, 'question', 0)}
          {box(20, 90, 'corpus', 1)}
          {arrow(98, 35, 128, 60, 2)}
          {arrow(98, 105, 128, 80, 2)}
          {box(130, 55, 'rank', 3, 60)}
          {arrow(190, 70, 214, 70, 4)}
          {box(216, 55, 'answer', 5, 70)}
          <text x={251} y={104} textAnchor="middle" fontSize={9} fill={accent} fontFamily="Georgia, serif" style={dot(6)}>or: not recorded</text>
        </>
      );
      break;
    case 'loop':
      body = (
        <>
          <circle cx={170} cy={70} r={46} fill="none" stroke={ink} strokeWidth={1.2} style={stroke(0)} />
          {[['plan', 170, 20], ['act', 222, 74], ['observe', 170, 128], ['revise', 116, 74]].map(([t, x, y], i) => (
            <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fontSize={10} fill={i === 1 ? accent : ink} fontFamily="Georgia, serif" style={dot(i + 1)}>
              {t as string}
            </text>
          ))}
          <path d="M214 62 L222 70 L230 60" fill="none" stroke={ink} strokeWidth={1.1} style={stroke(2)} />
          {box(262, 55, 'tools', 5, 58)}
        </>
      );
      break;
    case 'pipeline':
      body = (
        <>
          {['data', 'model', 'evaluate', 'deploy'].map((t, i) => box(14 + i * 82, 55, t, i, 64))}
          {[0, 1, 2].map((i) => arrow(78 + i * 82, 70, 96 + i * 82, 70, i + 1))}
          <path d="M300 88 Q300 124 170 124 Q46 124 46 88" fill="none" stroke={accent} strokeWidth={1} strokeDasharray="4 4" style={dot(5)} />
          <text x={170} y={138} textAnchor="middle" fontSize={9} fill={accent} fontFamily="Georgia, serif" style={dot(6)}>monitor what ships</text>
        </>
      );
      break;
    case 'modules':
      body = (
        <>
          {box(130, 14, 'interface', 0)}
          {box(40, 90, 'data', 1)}
          {box(220, 90, 'services', 2)}
          {arrow(160, 44, 90, 88, 3)}
          {arrow(200, 44, 258, 88, 3)}
          <line x1={118} y1={105} x2={218} y2={105} stroke={ink} strokeWidth={1} strokeDasharray="3 3" style={dot(4)} />
          <text x={168} y={100} textAnchor="middle" fontSize={8.5} fill={accent} fontFamily="Georgia, serif" style={dot(5)}>contract</text>
        </>
      );
      break;
    case 'tree':
    default:
      body = (
        <>
          {[[170, 22], [110, 62], [230, 62], [80, 104], [140, 104], [200, 104], [260, 104]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={11} fill="#e7d6b4" stroke={i === 4 ? accent : ink} strokeWidth={1.3} style={dot(i)} />
          ))}
          {[[170, 33, 110, 51], [170, 33, 230, 51], [110, 73, 80, 93], [110, 73, 140, 93], [230, 73, 200, 93], [230, 73, 260, 93]].map(([a, b, c, d], i) => (
            <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={ink} strokeWidth={1.1} style={stroke(i)} />
          ))}
          <text x={170} y={134} textAnchor="middle" fontSize={9} fill={ink} fontFamily="Georgia, serif" style={dot(8)}>log n, not n</text>
        </>
      );
  }

  return (
    <svg viewBox="0 0 340 140" className="w-full max-w-[420px]" aria-hidden>
      <defs>
        <marker id="tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={ink} />
        </marker>
      </defs>
      {body}
    </svg>
  );
}
