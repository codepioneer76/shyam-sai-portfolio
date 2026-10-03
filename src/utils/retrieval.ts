import { buildCorpus, type Passage } from '@/data/knowledge';

/**
 * Question scaffolding is stripped before scoring. In a corpus this small, a word
 * like "hold" or "work" is statistically rare, so leaving it in lets the grammar of
 * the question outrank its subject.
 */
const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'to', 'in', 'on', 'for', 'and', 'or',
  'what', 'who', 'how', 'does', 'do', 'did', 'his', 'he', 'him', 'it', 'this', 'that', 'with',
  'about', 'tell', 'me', 'you', 'your', 'can', 'has', 'have', 'i', 'at', 'any',
  'know', 'knows', 'use', 'uses', 'used', 'using', 'work', 'works', 'worked', 'working',
  'hold', 'holds', 'held', 'get', 'got', 'make', 'makes', 'made', 'show', 'list', 'give',
  'when', 'where', 'why', 'which', 'whose', 'been', 'being', 'also', 'some', 'all', 'more',
  'most', 'than', 'then', 'into', 'from', 'over', 'under', 'out', 'up', 'so', 'if', 'but',
  'not', 'there', 'many', 'much', 'right', 'now', 'currently', 'like', 'want', 'need', 'good',
  'thing', 'things', 'stuff', 'really', 'actually', 'please', 'tell',
]);

/** Crude but sufficient normalisation: fold plurals so "certifications" finds "certification". */
const stem = (t: string): string => {
  if (t.length > 4 && t.endsWith('ies')) return `${t.slice(0, -3)}y`;
  if (t.length > 4 && (t.endsWith('ses') || t.endsWith('xes') || t.endsWith('ches'))) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
};

const tokenise = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, ' ')
    .split(/[\s/]+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);

interface Indexed {
  passage: Passage;
  tf: Map<string, number>;
  len: number;
}

let index: { docs: Indexed[]; df: Map<string, number>; avgLen: number } | null = null;

function getIndex(): NonNullable<typeof index> {
  if (index) return index;
  const docs = buildCorpus().map((passage) => {
    // The source label is part of the searchable text: "case file" should match a case file.
    const tokens = tokenise(`${passage.source} ${passage.text}`);
    const tf = new Map<string, number>();
    tokens.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    return { passage, tf, len: tokens.length };
  });
  const df = new Map<string, number>();
  docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(docs.length, 1);
  index = { docs, df, avgLen };
  return index;
}

export interface Scored extends Passage {
  score: number;
}

const K1 = 1.4;
const B = 0.75;

/**
 * BM25 over the portfolio corpus.
 *
 * Length normalisation matters here: without it, long records (the experiment
 * log, the identity record) win every query simply by containing more words.
 * Rare terms — "riversight", "leaflet", "bathymetric" — carry the ranking, which
 * is exactly the behaviour a grounded terminal needs.
 */
export function retrieve(query: string, k = 4): Scored[] {
  const { docs, df, avgLen } = getIndex();
  const q = tokenise(query);
  // A query made entirely of scaffolding ("who is he?") still has an obvious answer.
  if (q.length === 0) {
    const identity = docs.find((d) => d.passage.id === 'identity');
    return identity ? [{ ...identity.passage, score: 1 }] : [];
  }
  const N = docs.length;

  const scored = docs.map((d) => {
    let score = 0;
    let matched = 0;
    q.forEach((t) => {
      const f = d.tf.get(t);
      if (!f) return;
      matched += 1;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
    });
    // A single common-term hit is not a match; one rare term, or two of anything, is.
    const confident = matched >= 2 || score >= 1.3;
    return { ...d.passage, score: confident ? score : 0 };
  });

  return scored
    .filter((s) => s.score > 0.9)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
