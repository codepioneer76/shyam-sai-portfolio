import type { SkillState } from './arsenal';

export type Diagram = 'network' | 'layers' | 'generate' | 'context' | 'retrieve' | 'loop' | 'pipeline' | 'modules' | 'tree';

export interface ResearchTopic {
  id: string;
  name: string;
  state: SkillState;
  diagram: Diagram;
  /** What the topic is — explanation, not a claim about Shyam. */
  note: string;
  /** Where it verifiably touches his work. Empty is honest. */
  related: string[];
}

/**
 * RESEARCH & AI — the manuscripts on the study desk.
 * States are deliberately modest. Nothing here claims expertise that the
 * record does not show.
 */
export const research: ResearchTopic[] = [
  {
    id: 'ml', name: 'Machine Learning', state: 'STUDYING', diagram: 'network',
    note: 'Learning a mapping from data rather than writing it by hand: features, a model, a loss, and the discipline of measuring on data the model has not seen.',
    related: [],
  },
  {
    id: 'dl', name: 'Deep Learning', state: 'STUDYING', diagram: 'layers',
    note: 'Stacked learned representations. Sequence models such as the LSTM are the natural fit for telemetry that arrives as a time series.',
    related: ['LSTM-based prediction, written up in the RiverSight report'],
  },
  {
    id: 'genai', name: 'Generative AI', state: 'CURRENT FOCUS', diagram: 'generate',
    note: 'Models that produce text, code or images, and the harder question of how to judge whether what they produced is any good.',
    related: ['Introduction to Generative AI — Google', 'Explore Generative AI — Microsoft'],
  },
  {
    id: 'llm', name: 'LLMs', state: 'CURRENT FOCUS', diagram: 'context',
    note: 'A language model as one component of a larger system: what goes into its context, what structure comes out, and where it fails.',
    related: ['Claude Platform 101 — Anthropic', 'AI Fluency for Students — Anthropic'],
  },
  {
    id: 'rag', name: 'RAG', state: 'BUILDING WITH', diagram: 'retrieve',
    note: 'Retrieval-augmented generation: find the relevant passages first, then answer only from them. Grounding is won or lost in the retrieval step.',
    related: ['The Ask desk on this site — BM25 retrieval over the portfolio record'],
  },
  {
    id: 'agents', name: 'AI Agents', state: 'EXPLORING', diagram: 'loop',
    note: 'A model that plans, calls tools and observes the result in a loop — and the new failure modes that come with autonomy.',
    related: ['AI Agents Fundamentals — Hugging Face', 'Claude Code 101 — Anthropic'],
  },
  {
    id: 'aieng', name: 'AI Engineering', state: 'EXPLORING', diagram: 'pipeline',
    note: 'Everything around the model that decides whether it is useful: data, evaluation, deployment, cost and the degraded path.',
    related: ['Get Started with AI in Azure — Microsoft', 'Introduction to AI Concepts — Microsoft'],
  },
  {
    id: 'se', name: 'Software Engineering', state: 'BUILDING WITH', diagram: 'modules',
    note: 'Boundaries, contracts and builds that can be repeated. The part of the work that outlives any particular model.',
    related: ['RiverSight', 'This portfolio'],
  },
  {
    id: 'dsa', name: 'Data Structures & Algorithms', state: 'STUDYING', diagram: 'tree',
    note: 'What a structure costs, and choosing one before writing syntax. Part of the degree coursework.',
    related: ['B.Tech CSE coursework'],
  },
];
