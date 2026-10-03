import type { Detail } from './types';

/** SYSTEM — chapter 08. How Shyam works. Written as engineering positions, not motivation. */
export const systemNotes: Detail[] = [
  { id: 's-fundamentals', name: 'FUNDAMENTALS BEFORE FRAMEWORKS', kicker: 'POSITION 01',
    body: 'Tools change faster than the reasons they exist. Time goes into what a structure costs, what a protocol guarantees, and what a scheduler is doing — because that knowledge survives the next framework.' },
  { id: 's-honest', name: 'AN HONEST ARTEFACT BEATS A FLATTERING ONE', kicker: 'POSITION 02',
    body: 'This site marks unfinished work as pending rather than filling it with plausible copy. A portfolio that overstates is a system that will fail its first real inspection.' },
  { id: 's-constraints', name: 'DESIGN AGAINST THE CONSTRAINT, NOT THE DEMO', kicker: 'POSITION 03',
    body: 'A monitoring dashboard is judged on the day a feed is missing and a threshold is crossed. The interesting engineering is in the degraded path.' },
  { id: 's-motion', name: 'EVERY EFFECT MUST EARN ITS FRAME BUDGET', kicker: 'POSITION 04',
    body: 'Physics is authored where it reads as weight and simulated only where the visitor drags something. Effects that do not carry meaning are deleted, not tuned.' },
  { id: 's-docs', name: 'WRITING IS A BUILD STEP', kicker: 'POSITION 05',
    body: 'Technical reports are generated programmatically for the same reason software is: reproducibility, consistent structure, and a diff that means something.' },
];
