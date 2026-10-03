import { contact } from './contact';

/**
 * Identity. Every field below was stated by Shyam or appears on his public
 * professional profile. Nothing is inferred and nothing is embellished.
 * Unknown values are `null` and render as PENDING VERIFICATION.
 */
export const profile = {
  fullName: 'SHYAM SAI TATIPARTI',
  name: 'SHYAM SAI',
  classification: 'AI / ML ENGINEER',
  /** The one-line identity under the name. Chosen to describe the work, not a job title he does not hold. */
  discipline: 'AI / SOFTWARE ENGINEERING',
  /** Short factual introduction for the entrance. Every clause is on the record. */
  introduction:
    'Computer Science undergraduate at Gayatri Vidya Parishad College of Engineering, Visakhapatnam. Builds web platforms for monitoring physical systems, and is working towards machine learning, LLM systems and retrieval.',
  status: 'ACTIVE',
  degree: 'B.Tech — Computer Science Engineering',
  institution: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
  location: 'Visakhapatnam, Andhra Pradesh',
  years: '2024 — 2028',
  positioning: 'Computer science undergraduate building intelligent systems from data, models and code.',
  focus: [
    'Artificial Intelligence',
    'Machine Learning',
    'Generative AI',
    'LLMs',
    'RAG',
    'Agentic AI',
    'Software Engineering',
  ],
  narrative: ['FOUNDATIONS', 'SOFTWARE ENGINEERING', 'AI / ML', 'INTELLIGENT SYSTEMS', 'PRODUCTION'],
} as const;

/**
 * Appears on the public professional profile. The institution is verified;
 * the role and responsibilities are not, and are therefore left null rather
 * than guessed at. An unfilled field is worth more than a plausible invention.
 */
export const attachments = [
  {
    id: 'iitkgp',
    institution: 'INDIAN INSTITUTE OF TECHNOLOGY',
    place: 'KHARAGPUR',
    role: null as string | null,
    period: null as string | null,
    responsibilities: null as string | null,
  },
];

/** Verified language proficiencies, as stated on the professional profile. */
export const languages = [
  { name: 'Telugu', level: 'Native or bilingual proficiency' },
  { name: 'English', level: 'Full professional proficiency' },
  { name: 'Hindi', level: 'Professional working proficiency' },
  { name: 'Tamil', level: 'Professional working proficiency' },
  { name: 'Marathi', level: 'Limited working proficiency' },
  { name: 'Kannada', level: 'Elementary working proficiency' },
];

export { contact };
