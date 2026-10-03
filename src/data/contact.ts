/**
 * Contact channels.
 *
 * LinkedIn is verified: it is the profile Shyam named as the source of truth.
 * The rest stay `null` until he supplies them, and every surface that reads
 * this file renders PENDING VERIFICATION rather than inventing a handle.
 */
export interface Contact {
  linkedin: string | null;
  github: string | null;
  email: string | null;
  resume: string | null;
}

export const contact: Contact = {
  linkedin: 'https://www.linkedin.com/in/shyam-sai-tatiparti',
  github: null, // REPLACE_WITH_GITHUB_URL
  email: null, // REPLACE_WITH_EMAIL
  resume: null, // REPLACE_WITH_RESUME_URL — e.g. drop resume.pdf into /public and use '/resume.pdf'
};

export const PENDING = 'PENDING VERIFICATION' as const;
export const orPending = (value: string | null | undefined): string => value ?? PENDING;
