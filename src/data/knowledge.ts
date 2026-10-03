import { profile } from './profile';
import { contact } from './contact';
import { arsenal } from './arsenal';
import { caseFiles } from './caseFiles';
import { foundation } from './foundation';
import { journey } from './journey';
import { research } from './research';
import { buildStages } from './build';
import { languages, attachments } from './profile';
import { credentials } from './archive';
import { experiments } from './lab';
import { systemNotes } from './systemNotes';

export interface Passage {
  id: string;
  source: string;
  text: string;
}

/**
 * The retrieval corpus for the archive terminal.
 * Built from the same data the world renders, so the terminal can never
 * know something the portfolio does not contain.
 */
export function buildCorpus(): Passage[] {
  const p: Passage[] = [];

  p.push({
    id: 'identity',
    source: 'SUBJECT',
    text: `${profile.name} is an ${profile.classification}. ${profile.degree} at ${profile.institution}, ${profile.location}, ${profile.years}. Positioning: ${profile.positioning} Current focus areas: ${profile.focus.join(', ')}. Trajectory: ${profile.narrative.join(' to ')}.`,
  });

  foundation.forEach((f) =>
    p.push({ id: `foundation:${f.id}`, source: 'FOUNDATION', text: `${f.name} is part of Shyam's computer science foundation. ${f.body}` }),
  );

  arsenal.forEach((a) =>
    p.push({
      id: `arsenal:${a.id}`,
      source: 'ARSENAL',
      text: `${a.name} (${a.cat}) — state: ${a.state}. ${a.body}${a.deployedIn && a.deployedIn.length ? ` Deployed in: ${a.deployedIn.join(', ')}.` : ' Not yet used in a case file.'}`,
    }),
  );

  caseFiles.forEach((c) => {
    p.push({
      id: `case:${c.id}`,
      source: `CASE FILE ${c.code}`,
      text: `${c.title} (${c.code}) is a ${c.type} project, status ${c.state}. ${c.body}${c.stack.length ? ` Stack: ${c.stack.join(', ')}.` : ' Stack not yet recorded.'}`,
    });
    c.sections.forEach((s) => {
      if (s.body) p.push({ id: `case:${c.id}:${s.key}`, source: `${c.title} / ${s.key}`, text: `${c.title} — ${s.key}: ${s.body}` });
    });
  });

  experiments.forEach((e) =>
    p.push({
      id: `lab:${e.id}`,
      source: 'LAB',
      text: `Experiment ${e.name}. Objective: ${e.objective} Technology: ${e.technology}${e.implementation ? ` Implementation: ${e.implementation}` : ''}${e.result ? ` Result: ${e.result}` : ''}${e.lessons ? ` Lessons: ${e.lessons}` : ''}`,
    }),
  );

  research.forEach((r) =>
    p.push({
      id: `research:${r.id}`,
      source: 'RESEARCH & AI',
      text: `${r.name} — ${r.state}. ${r.note}${r.related.length ? ` Related: ${r.related.join('; ')}.` : ''}`,
    }),
  );

  buildStages.forEach((b) =>
    p.push({ id: `build:${b.id}`, source: 'HOW I BUILD', text: `${b.name}: ${b.principle} ${b.evidence}` }),
  );

  p.push({
    id: 'languages',
    source: 'THE ENTRANCE',
    text: `Languages spoken: ${languages.map((l) => `${l.name} (${l.level})`).join(', ')}.`,
  });

  attachments.forEach((a) =>
    p.push({
      id: `attachment:${a.id}`,
      source: 'THE ENTRANCE',
      text: `${a.institution} ${a.place} appears on Shyam's public professional profile. The role and responsibilities are not recorded in the archive.`,
    }),
  );

  journey.forEach((j) =>
    p.push({ id: `journey:${j.id}`, source: 'JOURNEY', text: `Journey stage ${j.name}. ${j.body}` }),
  );

  credentials.forEach((c) =>
    p.push({ id: `cred:${c.id}`, source: 'ARCHIVE', text: `Certification: ${c.name}, issued by ${c.issuer}. ${c.body}` }),
  );

  systemNotes.forEach((s) =>
    p.push({ id: `system:${s.id}`, source: 'SYSTEM', text: `Engineering position — ${s.name}: ${s.body}` }),
  );

  const c = contact;
  p.push({
    id: 'contact',
    source: 'EXTRACTION',
    text: `Contact channels. Email: ${c.email ?? 'not yet published'}. LinkedIn: ${c.linkedin ?? 'not yet published'}. GitHub: ${c.github ?? 'not yet published'}. Resume: ${c.resume ?? 'not yet published'}.`,
  });

  return p;
}
