/**
 * Contact channels — all supplied by Shyam.
 * `resume` stays null until a real file or link exists; the final room then
 * shows it as awaiting rather than linking to something that is not there.
 */
export interface Contact {
  github: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  resume: string | null;
}

export const contact: Contact = {
  github: 'https://github.com/codepioneer76',
  email: 'tshyam.s776@gmail.com',
  phone: '9346454013',
  linkedin: 'https://www.linkedin.com/in/shyam-sai-tatiparti',
  resume: null, // REPLACE_WITH_RESUME — e.g. put resume.pdf in /public and set '/resume.pdf'
};

export const PENDING = 'PENDING VERIFICATION' as const;
export const orPending = (value: string | null | undefined): string => value ?? PENDING;
