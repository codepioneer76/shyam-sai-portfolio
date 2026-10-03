'use client';
import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/state/store';
import { setOverlay } from '@/state/actions';
import { audio } from '@/audio/audio';

interface Source {
  source: string;
  text: string;
}
interface Answer {
  answer: string;
  sources: Source[];
  grounded: boolean;
  mode: string;
}

const SUGGESTED = ['What is RiverSight?', 'What has he actually shipped?', 'What is he learning now?', 'Which certifications does he hold?'];

/**
 * AskTerminal — the in-world query interface.
 * It talks to /api/ask, which retrieves from the portfolio corpus. If no model
 * key is configured it returns the retrieved records verbatim: the terminal
 * would rather show you the source than compose something it cannot support.
 */
export function AskTerminal(): JSX.Element | null {
  const overlay = useExperience((s) => s.overlay);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (overlay === 'ask') input.current?.focus();
  }, [overlay]);

  if (overlay !== 'ask') return null;

  const ask = async (question: string): Promise<void> => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    audio.blip(1400, 0.04, 'square', 0.05);
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      setError(`TERMINAL FAULT — ${res.status}. The query was not answered.`);
      setBusy(false);
      return;
    }
    setResult((await res.json()) as Answer);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/88 p-4" role="dialog" aria-label="Archive terminal">
      <div className="w-full max-w-2xl border border-signal/25 bg-[#070A0C] p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-signal">ARCHIVE TERMINAL</p>
            <h2 className="display mt-1 text-xl">ASK THE SYSTEM</h2>
          </div>
          <button onClick={() => setOverlay('ask')} className="text-[10px] tracking-[0.24em] text-ash hover:text-bone">
            CLOSE [ESC]
          </button>
        </div>

        <p className="mt-3 max-w-[62ch] text-[11.5px] leading-relaxed text-ash">
          Answers are drawn only from indexed portfolio records. Anything outside the archive returns no result rather than a guess.
        </p>

        <div className="mt-5 flex items-center gap-3 border-b border-signal/25 pb-2">
          <span className="text-signal" aria-hidden>&gt;</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void ask(q);
              if (e.key === 'Escape') setOverlay('ask');
            }}
            placeholder="query the archive"
            aria-label="Question"
            className="w-full bg-transparent text-[13px] tracking-[0.06em] text-bone placeholder:text-ash/50 focus:outline-none"
          />
          <button onClick={() => void ask(q)} disabled={busy} className="text-[10px] tracking-[0.24em] text-signal disabled:text-ash">
            {busy ? 'QUERYING' : 'SEND'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                void ask(s);
              }}
              className="border border-bone/12 px-2 py-1 text-[10px] tracking-[0.14em] text-ash hover:border-signal/40 hover:text-bone"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="mt-5 text-[11.5px] tracking-[0.14em] text-tungsten">{error}</p>}

        {result && (
          <div className="mt-6 max-h-[40vh] overflow-y-auto">
            <p className="max-w-[68ch] whitespace-pre-line text-[13px] leading-relaxed text-[#C9C6C0]">{result.answer}</p>
            {result.sources.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-bone/10 pt-3">
                {result.sources.map((s, i) => (
                  <li key={i} className="text-[10.5px] leading-relaxed text-ash">
                    <span className="text-signal">{s.source}</span> — {s.text}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[10px] tracking-[0.2em] text-ash/70">RETRIEVAL {result.mode.toUpperCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
