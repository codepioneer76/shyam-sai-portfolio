import type { Detail, Status } from './types';

/** The physical form each capability takes inside the travelling case. */
export type ItemKind = 'volume' | 'dossier' | 'ledger' | 'blueprint' | 'manuscript';

/**
 * Factual state of a capability. These replace proficiency scores: each one is
 * a claim about what Shyam has done with it, which can be checked, rather than
 * a number that cannot.
 */
export type SkillState = 'USED' | 'BUILDING WITH' | 'CURRENT FOCUS' | 'STUDYING' | 'EXPLORING';

export interface ArsenalItem extends Detail {
  cat: string;
  span: [number, number];
  kind: ItemKind;
  status: Status;
  state: SkillState;
}

/**
 * ARSENAL — chapter 03.
 * `applied` = used to ship something in this archive. `study` = current direction.
 * No percentages, no proficiency bars: the split itself is the honest signal.
 */
export const arsenal: ArsenalItem[] = [
  {
    id: 'python', name: 'PYTHON', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [2, 1], kind: 'volume', status: 'applied', state: 'USED',
    body: 'Primary language for simulation and data work. Used for hydrological simulation routines and for generating large multi-section technical documents programmatically.',
    deployedIn: ['DESIGN FLOOD SYNTHESIS', 'RIVERSIGHT'],
  },
  {
    id: 'typescript', name: 'TYPESCRIPT', kicker: 'LANGUAGE', cat: 'LANGUAGE', span: [2, 1], kind: 'volume', status: 'applied', state: 'USED',
    body: 'Typed application layer for every web system in this archive. Telemetry payloads, sensor records and chart series are modelled as types before any UI is written.',
    deployedIn: ['RIVERSIGHT', 'THIS ARCHIVE'],
  },
  {
    id: 'next', name: 'NEXT.JS 14', kicker: 'FRAMEWORK', cat: 'FRAMEWORK', span: [2, 1], kind: 'blueprint', status: 'applied', state: 'BUILDING WITH',
    body: 'App-router React framework. Powers the RiverSight monitoring platform and this experience — routing, server rendering of the text record, progressive loading of the 3D layer.',
    deployedIn: ['RIVERSIGHT', 'THIS ARCHIVE'],
  },
  {
    id: 'react', name: 'REACT', kicker: 'FRAMEWORK', cat: 'FRAMEWORK', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED',
    body: 'Component model behind the dashboards. State is kept close to the data stream so map, charts and alert panels re-render independently.',
    deployedIn: ['RIVERSIGHT', 'THIS ARCHIVE'],
  },
  {
    id: 'tailwind', name: 'TAILWIND', kicker: 'INTERFACE', cat: 'INTERFACE', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED',
    body: 'Utility styling used to keep dense dashboard layouts consistent without an ever-growing stylesheet.',
    deployedIn: ['RIVERSIGHT', 'THIS ARCHIVE'],
  },
  {
    id: 'recharts', name: 'RECHARTS', kicker: 'DATA VIS', cat: 'DATA VIS', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED',
    body: 'Time-series rendering for telemetry: level, flow and pressure traces with threshold bands.',
    deployedIn: ['RIVERSIGHT'],
  },
  {
    id: 'leaflet', name: 'REACT-LEAFLET', kicker: 'GIS', cat: 'GIS', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED',
    body: 'Map layer for station geometry and river reach visualisation — sensor markers, reach overlays, bathymetric context.',
    deployedIn: ['RIVERSIGHT'],
  },
  {
    id: 'node', name: 'NODE.JS', kicker: 'RUNTIME', cat: 'RUNTIME', span: [1, 1], kind: 'blueprint', status: 'applied', state: 'USED',
    body: 'Tooling runtime. Drives a docx-based document generation pipeline producing formatted engineering reports with tables, figure captions and consistent styling.',
    deployedIn: ['RIVERSIGHT'],
  },
  {
    id: 'docpipe', name: 'DOC PIPELINE', kicker: 'TOOLING', cat: 'TOOLING', span: [1, 1], kind: 'ledger', status: 'applied', state: 'USED',
    body: 'ReportLab, pypdf and docx. Deterministic generation of long technical documents — the same discipline as any other output pipeline: structure, templating, reproducible builds.',
    deployedIn: ['RIVERSIGHT', 'DESIGN FLOOD SYNTHESIS'],
  },
  {
    id: 'threejs', name: 'THREE.JS', kicker: 'REALTIME 3D', cat: 'REALTIME 3D', span: [1, 1], kind: 'manuscript', status: 'applied', state: 'BUILDING WITH',
    body: 'Real-time 3D in the browser. The travelling case this record sits in is built with Three.js and React Three Fiber: procedural leather and velvet, brass under an environment map, and a hinge driven by an authored spring.',
    deployedIn: ['THIS ARCHIVE'],
  },
  {
    id: 'ml', name: 'MACHINE LEARNING', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'STUDYING',
    body: 'Supervised learning fundamentals, feature engineering on sensor data, and evaluation discipline before model selection.',
    deployedIn: [],
  },
  {
    id: 'dl', name: 'DEEP LEARNING', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'STUDYING',
    body: 'Sequence models for telemetry — LSTM architecture studied while writing the predictive sections of the RiverSight report.',
    deployedIn: [],
  },
  {
    id: 'genai', name: 'GENERATIVE AI', kicker: 'AI CORE', cat: 'AI CORE', span: [1, 1], kind: 'dossier', status: 'study', state: 'CURRENT FOCUS',
    body: 'Generation, prompting strategy and evaluation of model output treated as an engineering problem rather than a chat interface.',
    deployedIn: [],
  },
  {
    id: 'llm', name: 'LLM SYSTEMS', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'study', state: 'CURRENT FOCUS',
    body: 'Context construction, structured output, tool interfaces, and the failure modes that appear once a language model becomes a component in a larger system.',
    deployedIn: [],
  },
  {
    id: 'rag', name: 'RAG', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'study', state: 'BUILDING WITH',
    body: 'Retrieval-augmented generation: chunking, scoring, grounding. The retrieval half is implemented in this site — the archive terminal in chapter 08 answers only from indexed portfolio records.',
    deployedIn: ['THIS ARCHIVE'],
  },
  {
    id: 'agents', name: 'AGENTIC AI', kicker: 'AI SYSTEMS', cat: 'AI SYSTEMS', span: [1, 1], kind: 'manuscript', status: 'study', state: 'EXPLORING',
    body: 'Multi-step agents, tool calling and control flow. Studied through the Hugging Face AI Agents Fundamentals track.',
    deployedIn: [],
  },
];
