export type ChapterId =
  | 'entrance' | 'skills' | 'projects' | 'research' | 'certifications' | 'build' | 'final';

export interface Chapter {
  id: ChapterId;
  numeral: string;
  title: string;
  /**
   * The name this room carried in the previous edition of the estate. It is
   * shown for a moment as the visitor walks in and then dissolves into the new
   * title, so the rename reads as a transformation rather than a deletion.
   */
  formerTitle: string | null;
  /** The room of the castle this chapter is staged in. */
  room: string;
  /** The question the room answers. This is the narrative spine of the site. */
  question: string;
}

export const chapters: Chapter[] = [
  { id: 'entrance', numeral: 'I', title: 'THE ENTRANCE', formerTitle: 'THE SUBJECT', room: 'Great Hall', question: 'Who is he?' },
  { id: 'skills', numeral: 'II', title: 'SKILL SET', formerTitle: 'THE ARSENAL', room: 'Travelling Case', question: 'What can he build with?' },
  { id: 'projects', numeral: 'III', title: 'PROJECTS BUILT', formerTitle: 'CASE FILES', room: 'Investigation Desk', question: 'What has he built?' },
  { id: 'research', numeral: 'IV', title: 'RESEARCH & AI', formerTitle: 'THE LAB', room: "Scholar's Study", question: 'What is he exploring?' },
  { id: 'certifications', numeral: 'V', title: 'CERTIFICATIONS', formerTitle: 'THE ARCHIVE', room: 'Records Room', question: 'What has he completed?' },
  { id: 'build', numeral: 'VI', title: 'HOW I BUILD', formerTitle: 'THE SYSTEM', room: "Architect's Table", question: 'How does he think?' },
  { id: 'final', numeral: 'VII', title: 'THE FINAL ROOM', formerTitle: 'EXTRACTION', room: 'The Door', question: 'How do you reach him?' },
];

export const chapterById = (id: ChapterId): Chapter => chapters.find((c) => c.id === id) ?? chapters[0];
