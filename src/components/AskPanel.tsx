'use client';
import { useEffect, useRef, useState } from 'react';
import { actions, useStore } from '@/state/store';
import { chime } from '@/audio/ambience';
import { Label } from '@/components/Furnishings';

interface Source { source: string; text: string; score?: number }
interface Answer { answer: string; sources: Source[]; mode: string }

const ASKED = ['What does Shyam work on?', 'What is RiverSight?', 'What is PipeGuard?', 'What is his AI focus?', 'What is his education?', 'How can I contact him?'];

/**
 * ASK SHYAM — the correspondence desk.
 *
 * Brass and wood on the outside; retrieval over the portfolio record on the
 * inside. It answers only from indexed material and says so plainly when the
 * archive holds nothing, which is the whole point of grounding it.
 */
export function AskPanel(): JSX.Element | null {
  const overlay = useStore((s) => s.overlay);
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
    chime('type');
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      setError('The desk did not answer. Try again in a moment.');
      setBusy(false);
      return;
    }
    setResult((await res.json()) as Answer);
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4"
      role="dialog"
      aria-label="Ask the archive"
      onClick={() => actions.setOverlay('none')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[3px] p-[10px]"
        style={{ background: 'linear-gradient(145deg,#6a5228,#c9a45c 24%,#7d6230 52%,#c9a45c 78%,#52401e)' }}
      >
        <div className="wood rounded-[2px] border border-black/70 p-6 md:p-8">
          <header className="flex items-start justify-between gap-6">
            <div>
              <Label>THE ARCHIVE DESK</Label>
              <h2 className="font-display mt-2 text-[26px] text-ivory">ASK ABOUT SHYAM</h2>
            </div>
            <button onClick={() => actions.setOverlay('none')} className="font-body text-[10px] tracking-label text-parchment/60 hover:text-ivory">
              CLOSE [ESC]
            </button>
          </header>

          <p className="font-body mt-4 max-w-[60ch] text-[12.5px] italic leading-relaxed text-parchment/65">
            The desk answers only from what is recorded in this castle. When the record is silent, so is the desk —
            it will say so, rather than guess.
          </p>

          <div className="mt-6 flex items-center gap-3 border-b border-gold/35 pb-2.5">
            <span className="font-display text-gold" aria-hidden>❦</span>
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void ask(q);
                if (e.key === 'Escape') actions.setOverlay('none');
              }}
              placeholder="put a question to the desk"
              aria-label="Your question"
              className="font-body w-full bg-transparent text-[14px] text-ivory placeholder:text-parchment/35 focus:outline-none"
            />
            <button onClick={() => void ask(q)} disabled={busy} className="font-body text-[10px] tracking-label text-gold disabled:text-parchment/35">
              {busy ? 'CONSULTING' : 'SEND'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ASKED.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQ(s);
                  void ask(s);
                }}
                className="font-body border border-gold/20 px-2.5 py-1 text-[10px] tracking-[0.1em] text-parchment/65 transition-colors hover:border-gold/55 hover:text-ivory"
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="font-body mt-5 text-[12px] text-crimson">{error}</p>}

          {result && (
            <div className="parchment-surface mt-6 max-h-[42vh] overflow-y-auto rounded-[2px] p-6">
              <p className="font-body whitespace-pre-line text-[14px] leading-[1.9] text-[#2e2312]">{result.answer}</p>
              {result.sources.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-[#8a6a3a]/35 pt-4">
                  {result.sources.map((s, i) => (
                    <li key={i} className="font-body text-[11px] leading-relaxed text-[#5a4326]">
                      <span className="tracking-label text-[#8B1E2D]">{s.source}</span> — {s.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
