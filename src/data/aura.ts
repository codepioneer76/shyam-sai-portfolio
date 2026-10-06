/**
 * AURA — the flagship.
 *
 * Status and design are Shyam's own description of the system he is building.
 * The repository is not public, so nothing here claims a component is finished:
 * the architecture is shown as designed, and implementation progress stays
 * pending until he publishes it.
 */
export const aura = {
  name: 'AURA',
  title: 'Autonomous AI Research & Engineering Platform',
  status: 'IN PROGRESS' as const,
  vision:
    'A single system that takes in material, retrieves what matters, reasons with the right model, acts through tools, remembers, and measures its own work — built to show AI engineering end to end rather than one model behind one prompt.',
  /** Layers as designed, top of the request path to the bottom. */
  layers: [
    { name: 'Frontend', note: 'Where research is asked for and results are read' },
    { name: 'API / Backend', note: 'The contract between the interface and the engine' },
    { name: 'Orchestration · Agent Engine', note: 'Plans multi-step work and delegates it' },
    { name: 'Tool System', note: 'What the agents are allowed to do' },
    { name: 'Model Routing', note: 'Each request to the model that suits it' },
    { name: 'LLM Layer', note: 'The models themselves, behind one interface' },
    { name: 'Retrieval', note: 'Finds the passages an answer must rest on' },
    { name: 'Ingestion', note: 'Brings documents and data into the system' },
  ],
  /** Cross-cutting systems that watch every layer. */
  crossCutting: ['Memory', 'Evaluation', 'Observability'],
  data: ['PostgreSQL', 'Vector database', 'Redis', 'Object storage'],
  repository: null as string | null,
  progress: null as string | null,
};
