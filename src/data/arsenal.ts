import type { Detail, Status } from './types';

/** The physical form each capability takes inside the travelling case. */
export type ItemKind = 'volume' | 'dossier' | 'ledger' | 'blueprint' | 'manuscript';

/**
 * Factual state of a capability — a claim about what has been done with it,
 * which can be checked, instead of a proficiency number, which cannot.
 */
export type SkillState = 'PRIMARY' | 'USED' | 'BUILDING WITH' | 'CURRENT FOCUS' | 'STUDYING' | 'EXPLORING';

/** The case holds its contents in trays, one discipline per tray. */
export type TrayId = 'programming' | 'aiml' | 'aieng' | 'web' | 'data';

export interface Tray {
  id: TrayId;
  label: string;
  /** One line shown when the tray is lifted. */
  note: string;
}

export const trays: Tray[] = [
  { id: 'programming', label: 'PROGRAMMING', note: 'Languages. Python first — the one everything else is built in.' },
  { id: 'aiml', label: 'AI / ML', note: 'The field. Studied, and increasingly applied.' },
  { id: 'aieng', label: 'AI ENGINEERING', note: 'Turning models into systems. Most of this is being built inside AURA.' },
  { id: 'web', label: 'WEB & SOFTWARE', note: 'The surfaces the work ships through.' },
  { id: 'data', label: 'DATA, GIS & TOOLS', note: 'Visualisation, maps, documents and the platforms around them.' },
];

export interface ArsenalItem extends Detail {
  cat: string;
  tray: TrayId;
  /** Columns × rows the object occupies in its tray (trays are 4 × 2). */
  span: [number, number];
  kind: ItemKind;
  status: Status;
  state: SkillState;
}

const AURA = 'AURA (in progress)';

/**
 * Every entry is backed by something checkable: a public repository, a
 * certification, coursework, or Shyam's own statement of the languages he uses.
 * Nothing here is included because it is fashionable.
 */
export const arsenal: ArsenalItem[] = [
  // ---------------------------------------------------------------- PROGRAMMING
  {
    id: 'python', tray: 'programming', name: 'PYTHON', kicker: 'PRIMARY LANGUAGE', cat: 'LANGUAGE', span: [2, 1], kind: 'volume', status: 'applied', state: 'PRIMARY',
    body: 'Primary language. Used for hydrological simulation in Design Flood Synthesis, for programmatic generation of long technical reports, and on the FastAPI backend of SatQuery AI.',
    deployedIn: ['DESIGN FLOOD SYNTHESIS', 'SATQUERY AI', 'RIVERSIGHT REPORT'],
  },
  { id: 'cpp', tray: 'programming', name: 'C++', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Systems-level language used for data structures and algorithms work.', deployedIn: ['DSA COURSEWORK'] },
  { id: 'java', tray: 'programming', name: 'JAVA', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Object-oriented programming in practice: classes, interfaces and the discipline of modelling a domain.', deployedIn: ['OOP COURSEWORK'] },
  { id: 'c', tray: 'programming', name: 'C', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'The first language: memory, pointers and what the machine is actually doing.', deployedIn: ['B.TECH CSE'] },
  { id: 'sql', tray: 'programming', name: 'SQL', kicker: 'QUERY LANGUAGE', cat: 'QUERY LANGUAGE', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED', body: 'Relational schemas, normalisation and queries — the database management systems coursework.', deployedIn: ['DBMS COURSEWORK'] },
  { id: 'php', tray: 'programming', name: 'PHP', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Server-side web development, completed through the AICTE Full Stack PHP Development internship with a project.', deployedIn: ['ONLINE FOOD ORDERING SYSTEM'] },
  { id: 'html', tray: 'programming', name: 'HTML · CSS · BOOTSTRAP', kicker: 'MARKUP & STYLE', cat: 'MARKUP & STYLE', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Structure and styling of the web, with Bootstrap for responsive layout.', deployedIn: ['ONLINE FOOD ORDERING SYSTEM', 'PIPEGUARD'] },

  // ---------------------------------------------------------------- AI / ML
  { id: 'ml', tray: 'aiml', name: 'MACHINE LEARNING', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'STUDYING', body: 'Supervised learning fundamentals, features, and evaluation discipline before model selection.', deployedIn: [] },
  { id: 'dl', tray: 'aiml', name: 'DEEP LEARNING', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'STUDYING', body: 'Sequence models for telemetry — the LSTM architecture written up in the RiverSight report.', deployedIn: ['RIVERSIGHT REPORT'] },
  { id: 'genai', tray: 'aiml', name: 'GENERATIVE AI', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'CURRENT FOCUS', body: 'Generation, prompting and judging output quality as an engineering problem. Google and Microsoft generative-AI certifications.', deployedIn: [] },
  { id: 'llm', tray: 'aiml', name: 'LLMs', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'study', state: 'CURRENT FOCUS', body: 'Language models as components: context, structured output, tools, and where they fail. Anthropic platform and fluency certifications.', deployedIn: [AURA] },
  { id: 'agents', tray: 'aiml', name: 'AI AGENTS', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'study', state: 'BUILDING WITH', body: 'Plan, act, observe, revise. Hugging Face AI Agents Fundamentals, and the agent engine at the centre of AURA.', deployedIn: [AURA] },
  { id: 'rag', tray: 'aiml', name: 'RAG', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'applied', state: 'BUILDING WITH', body: 'Retrieve first, answer only from what was retrieved. Implemented in the Ask desk of this portfolio, and the retrieval layer of AURA.', deployedIn: ['THIS PORTFOLIO', AURA] },

  // ---------------------------------------------------------------- AI ENGINEERING
  { id: 'llmapps', tray: 'aieng', name: 'LLM APPLICATIONS', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'blueprint', status: 'study', state: 'BUILDING WITH', body: 'Applications with a language model inside them, built so the rest of the system survives the model being wrong.', deployedIn: [AURA] },
  { id: 'orchestration', tray: 'aieng', name: 'AGENT ORCHESTRATION', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'blueprint', status: 'study', state: 'BUILDING WITH', body: 'Coordinating multi-step agent work: planning, delegation and control flow. AURA’s orchestration engine.', deployedIn: [AURA] },
  { id: 'retrieval', tray: 'aieng', name: 'RETRIEVAL SYSTEMS', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'ledger', status: 'applied', state: 'BUILDING WITH', body: 'Ranking a corpus against a question. This portfolio’s Ask desk runs BM25 over its own record.', deployedIn: ['THIS PORTFOLIO', AURA] },
  { id: 'vector', tray: 'aieng', name: 'VECTOR SEARCH', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'ledger', status: 'study', state: 'BUILDING WITH', body: 'Semantic retrieval over embeddings, planned for AURA’s retrieval layer.', deployedIn: [AURA] },
  { id: 'tools', tray: 'aieng', name: 'TOOL CALLING', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'blueprint', status: 'study', state: 'BUILDING WITH', body: 'Letting a model act through defined tools. AURA’s tool system.', deployedIn: [AURA] },
  { id: 'routing', tray: 'aieng', name: 'MODEL ROUTING', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'blueprint', status: 'study', state: 'BUILDING WITH', body: 'Sending each request to the model that suits it. AURA’s routing layer.', deployedIn: [AURA] },
  { id: 'evals', tray: 'aieng', name: 'EVALUATION', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'dossier', status: 'study', state: 'BUILDING WITH', body: 'Measuring whether a system is actually good, not whether it looks good. AURA’s evaluation layer.', deployedIn: [AURA] },
  { id: 'aiarch', tray: 'aieng', name: 'AI SYSTEM ARCHITECTURE', kicker: 'AI ENGINEERING', cat: 'AI ENGINEERING', span: [1, 1], kind: 'blueprint', status: 'study', state: 'BUILDING WITH', body: 'How ingestion, retrieval, models, memory, evaluation and observability fit together — the design of AURA.', deployedIn: [AURA] },

  // ---------------------------------------------------------------- WEB & SOFTWARE
  { id: 'next', tray: 'web', name: 'NEXT.JS', kicker: 'FRAMEWORK', cat: 'FRAMEWORK', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'App-router React framework behind RiverSight and this portfolio.', deployedIn: ['RIVERSIGHT', 'THIS PORTFOLIO'] },
  { id: 'react', tray: 'web', name: 'REACT', kicker: 'FRAMEWORK', cat: 'FRAMEWORK', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Component model for RiverSight, SatQuery AI’s frontend and this portfolio.', deployedIn: ['RIVERSIGHT', 'SATQUERY AI', 'THIS PORTFOLIO'] },
  { id: 'typescript', tray: 'web', name: 'TYPESCRIPT', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Typed application code across RiverSight, SatQuery AI’s frontend and this portfolio.', deployedIn: ['RIVERSIGHT', 'SATQUERY AI', 'THIS PORTFOLIO'] },
  { id: 'tailwind', tray: 'web', name: 'TAILWIND CSS', kicker: 'INTERFACE', cat: 'INTERFACE', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Utility styling for dense dashboards and this site.', deployedIn: ['RIVERSIGHT', 'PIPEGUARD', 'THIS PORTFOLIO'] },
  { id: 'vite', tray: 'web', name: 'VITE', kicker: 'TOOLING', cat: 'TOOLING', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Build tooling for PipeGuard and SatQuery AI’s frontend.', deployedIn: ['PIPEGUARD', 'SATQUERY AI'] },
  { id: 'fastapi', tray: 'web', name: 'FASTAPI & REST', kicker: 'BACKEND', cat: 'BACKEND', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Python APIs. Shyam’s role on SatQuery AI is integrating its React frontend with the FastAPI backend.', deployedIn: ['SATQUERY AI'] },
  { id: 'node', tray: 'web', name: 'NODE.JS', kicker: 'RUNTIME', cat: 'RUNTIME', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED', body: 'Tooling runtime, including a docx pipeline that generates formatted engineering reports.', deployedIn: ['RIVERSIGHT REPORT'] },
  { id: 'threejs', tray: 'web', name: 'THREE.JS', kicker: 'REALTIME 3D', cat: 'REALTIME 3D', span: [1, 1], kind: 'manuscript', status: 'applied', state: 'USED', body: 'This case is built with Three.js and React Three Fiber: procedural leather and velvet, brass under an environment map, a hinge on an authored spring.', deployedIn: ['THIS PORTFOLIO'] },

  // ---------------------------------------------------------------- DATA, GIS & TOOLS
  { id: 'recharts', tray: 'data', name: 'RECHARTS', kicker: 'DATA VIS', cat: 'DATA VIS', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED', body: 'Time-series telemetry charts in RiverSight and SatQuery AI.', deployedIn: ['RIVERSIGHT', 'SATQUERY AI'] },
  { id: 'echarts', tray: 'data', name: 'ECHARTS', kicker: 'DATA VIS', cat: 'DATA VIS', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED', body: 'Pressure and telemetry visualisation in PipeGuard.', deployedIn: ['PIPEGUARD'] },
  { id: 'leaflet', tray: 'data', name: 'LEAFLET · GIS', kicker: 'MAPS', cat: 'MAPS', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED', body: 'Interactive maps: RiverSight’s GIS module and SatQuery AI’s imagery views.', deployedIn: ['RIVERSIGHT', 'SATQUERY AI'] },
  { id: 'docpipe', tray: 'data', name: 'REPORT PIPELINES', kicker: 'TOOLING', cat: 'TOOLING', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED', body: 'ReportLab, pypdf and docx — long engineering reports generated, not hand-edited.', deployedIn: ['RIVERSIGHT REPORT', 'DESIGN FLOOD SYNTHESIS'] },
  { id: 'git', tray: 'data', name: 'GIT & GITHUB', kicker: 'PLATFORM', cat: 'PLATFORM', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Version control for every project here; all public work lives at github.com/codepioneer76.', deployedIn: ['ALL PROJECTS'] },
  { id: 'vercel', tray: 'data', name: 'VERCEL', kicker: 'PLATFORM', cat: 'PLATFORM', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Production hosting for this portfolio.', deployedIn: ['THIS PORTFOLIO'] },
  { id: 'claude', tray: 'data', name: 'CLAUDE', kicker: 'PLATFORM', cat: 'PLATFORM', span: [1, 1], kind: 'volume', status: 'applied', state: 'USED', body: 'Model platform and agentic coding tools — Claude Code 101 and Claude Platform 101 certifications.', deployedIn: [] },
  { id: 'hf', tray: 'data', name: 'HUGGING FACE', kicker: 'PLATFORM', cat: 'PLATFORM', span: [1, 1], kind: 'volume', status: 'study', state: 'EXPLORING', body: 'Open models and the AI Agents Fundamentals course.', deployedIn: [] },
];

export const itemsInTray = (tray: TrayId): ArsenalItem[] => arsenal.filter((a) => a.tray === tray);
