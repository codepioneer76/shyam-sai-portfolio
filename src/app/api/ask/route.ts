import { NextResponse } from 'next/server';
import { retrieve } from '@/utils/retrieval';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the archive terminal for Shyam Sai's engineering portfolio.
Answer ONLY from the RECORDS provided. If the records do not contain the answer, reply exactly: That information is not recorded in the archive.
Never invent projects, metrics, employers, dates or results. Keep answers under 90 words. Write plainly, no marketing tone.`;

interface AskBody {
  question?: unknown;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as AskBody;
  const question = typeof body.question === 'string' ? body.question.slice(0, 400).trim() : '';
  if (!question) {
    return NextResponse.json({ error: 'A question is required.' }, { status: 400 });
  }

  const hits = retrieve(question, 4);
  const sources = hits.map((h) => ({ source: h.source, text: h.text, score: Number(h.score.toFixed(2)) }));

  if (hits.length === 0) {
    return NextResponse.json({
      answer: 'That information is not recorded in the archive.',
      sources: [],
      grounded: true,
      mode: 'retrieval-only',
    });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // No model configured: return the records themselves rather than composing prose.
    return NextResponse.json({
      answer: hits.map((h) => h.text).join('\n\n'),
      sources,
      grounded: true,
      mode: 'retrieval-only',
    });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `RECORDS:\n${hits.map((h, i) => `[${i + 1}] (${h.source}) ${h.text}`).join('\n')}\n\nQUESTION: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    // Model unreachable is not a reason to answer badly: fall back to the records.
    return NextResponse.json({
      answer: hits.map((h) => h.text).join('\n\n'),
      sources,
      grounded: true,
      mode: 'retrieval-fallback',
    });
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const answer = (data.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('\n')
    .trim();

  return NextResponse.json({
    answer: answer.length > 0 ? answer : hits.map((h) => h.text).join('\n\n'),
    sources,
    grounded: true,
    mode: 'retrieval+model',
  });
}
