import { contact } from './contact';

/**
 * Identity. Every field below was stated by Shyam or appears on his public
 * professional profile. Nothing is inferred and nothing is embellished.
 * Unknown values are `null` and render as PENDING VERIFICATION.
 */
export const profile = {
  fullName: 'SHYAM SAI TATIPARTI',
  name: 'SHYAM SAI',
  classification: 'ASPIRING AI ENGINEER',
  /** The one-line identity under the name. Chosen to describe the work, not a job title he does not hold. */
  discipline: 'ASPIRING AI ENGINEER',
  /** Short factual introduction for the entrance. Every clause is on the record. */
  introduction:
    'Computer Science undergraduate at GVPCE, Visakhapatnam, building toward AI engineering — through machine learning, software engineering, and the agentic and intelligent systems that join them. Currently building AURA.',
  status: 'ACTIVE',
  degree: 'B.Tech — Computer Science Engineering',
  institution: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
  location: 'Visakhapatnam, Andhra Pradesh',
  years: '2024 — 2028',
  positioning: 'Aspiring AI engineer. Builds intelligent systems from data, models and code — and is building AURA, an autonomous AI research and engineering platform.',
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
    id: 'aicte-php',
    institution: 'AICTE · INTERNSHIP',
    place: 'FULL STACK PHP DEVELOPMENT WITH PROJECT',
    role: 'Intern — built an Online Food Ordering System as the internship project.' as string | null,
    period: null as string | null,
    responsibilities: null as string | null,
  },
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
