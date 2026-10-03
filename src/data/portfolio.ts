/**
 * portfolio.ts — the aggregate entry point.
 *
 * Every fact rendered anywhere in this application flows from here. Components
 * never hardcode content: to change what the facility says, edit these modules.
 *
 *   profile.ts      identity
 *   contact.ts      channels (null until published)
 *   foundation.ts   CS fundamentals
 *   arsenal.ts      technologies, tagged applied | study
 *   caseFiles.ts    projects, section by section, null = pending verification
 *   lab.ts          experiments (only ones that exist)
 *   journey.ts      progression stages
 *   archive.ts      credentials
 *   systemNotes.ts  engineering positions
 *   chapters.ts     zone layout, camera shots and room mood
 */
export { profile, attachments, languages } from './profile';
export { contact, orPending, PENDING, type Contact } from './contact';
export { foundation } from './foundation';
export { arsenal, type ArsenalItem, type ItemKind } from './arsenal';
export { caseFiles, type CaseFile, type CaseSection, type SectionKey } from './caseFiles';
export { experiments, type Experiment } from './lab';
export { journey } from './journey';
export { credentials, type Credential } from './archive';
export { systemNotes } from './systemNotes';
export { chapters, type Chapter, type ChapterId } from './chapters';
export { buildCorpus, type Passage } from './knowledge';
export type { Detail, Status } from './types';
