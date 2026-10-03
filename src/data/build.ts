export interface BuildStage {
  id: string;
  name: string;
  /** The principle, stated plainly. */
  principle: string;
  /** Where it is visible in real work. Only verified references. */
  evidence: string;
  /** Margin annotation inked beside the blueprint. */
  margin: string;
}

/**
 * HOW I BUILD — the engineering blueprint.
 * Principles are Shyam's positions; evidence lines point only at work that exists.
 */
export const buildStages: BuildStage[] = [
  {
    id: 'problem',
    name: 'PROBLEM',
    principle: 'Start from the failure that matters, not the technology that is interesting.',
    evidence: 'PipeGuard begins with a leak detected too late. RiverSight begins with river conditions seen too late.',
    margin: 'what breaks, and for whom?',
  },
  {
    id: 'understand',
    name: 'UNDERSTAND',
    principle: 'Learn the domain before the framework.',
    evidence: 'The RiverSight report works through transient pressure analysis and alarm rationalisation before any model is proposed.',
    margin: 'read the physics first',
  },
  {
    id: 'design',
    name: 'DESIGN',
    principle: 'Choose structures by what they cost. Decide where data lives before deciding how it looks.',
    evidence: 'Data structures, DBMS, operating systems and networks — the coursework this rests on.',
    margin: 'storage before screens',
  },
  {
    id: 'build',
    name: 'BUILD',
    principle: 'Use the smallest set of tools that does the job well.',
    evidence: 'Next.js, React and TypeScript for interfaces. Python for simulation and document generation.',
    margin: 'fewer, better tools',
  },
  {
    id: 'test',
    name: 'TEST',
    principle: 'Check against the source, not against what you hoped to see.',
    evidence: 'The Ask desk on this site returns nothing rather than a guess when the record is silent.',
    margin: 'an honest blank beats a confident error',
  },
  {
    id: 'iterate',
    name: 'ITERATE',
    principle: 'Make the second version cheap to produce.',
    evidence: 'The RiverSight report moved from a Python/ReportLab pipeline to a Node.js docx pipeline so every revision rebuilds cleanly.',
    margin: 'rebuild, do not patch',
  },
  {
    id: 'deploy',
    name: 'DEPLOY',
    principle: 'Nothing counts until it runs somewhere other than the author’s machine.',
    evidence: 'This site ships only behind a clean install, a type check and a production build.',
    margin: 'it runs, or it does not exist',
  },
];
