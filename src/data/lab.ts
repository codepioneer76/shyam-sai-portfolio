import type { Detail } from './types';

export interface Experiment extends Detail {
  objective: string;
  technology: string;
  implementation: string | null;
  result: string | null;
  lessons: string | null;
}

/**
 * LAB — chapter 05.
 * Only experiments that actually exist are listed. Adding one is a data edit, not a code change.
 */
export const experiments: Experiment[] = [
  {
    id: 'exp-001', name: 'GROUNDED ARCHIVE RETRIEVAL', kicker: 'EXPERIMENT 001',
    body: 'The retrieval system behind the archive terminal in chapter 08.',
    objective: 'Answer questions about this portfolio using only indexed portfolio records, so the terminal cannot state anything Shyam has not stated.',
    technology: 'TypeScript · lexical scoring (term frequency with inverse document weighting) over a chunked corpus built from the data layer.',
    implementation: 'Every record in /src/data is flattened into passages at build time. A query is tokenised, scored against the corpus, and the top passages are returned with their source. If ANTHROPIC_API_KEY is present the passages are handed to a model with instructions to answer only from them; if not, the passages are returned directly.',
    result: 'Working. The terminal returns sourced passages and refuses questions the corpus cannot support.',
    lessons: 'The retrieval half is where grounding is actually won or lost. A weak retriever makes a strong model hallucinate confidently.',
  },
];
