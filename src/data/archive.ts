import type { Detail } from './types';

export interface Credential extends Detail {
  issuer: string;
  drawer: number;
}

/** ARCHIVE — chapter 07. Titles and issuers exactly as stated. No dates invented. */
export const credentials: Credential[] = [
  { id: 'hf-agents', name: 'AI Agents Fundamentals', issuer: 'Hugging Face', kicker: 'DRAWER A', drawer: 0,
    body: 'Agent construction: tool use, control flow, and the failure modes of multi-step autonomy.' },
  { id: 'anthropic-fluency', name: 'AI Fluency for Students', issuer: 'Anthropic', kicker: 'DRAWER A', drawer: 0,
    body: 'Working with language models deliberately — delegation, verification and judgement rather than autocomplete.' },
  { id: 'claude-code-101', name: 'Claude Code 101', issuer: 'Anthropic', kicker: 'DRAWER A', drawer: 0,
    body: 'Agentic coding workflows in a terminal-native environment.' },
  { id: 'claude-platform-101', name: 'Claude Platform 101', issuer: 'Anthropic', kicker: 'DRAWER B', drawer: 1,
    body: 'Building on the model API: messages, context, and structured interaction.' },
  { id: 'ms-genai', name: 'Explore Generative AI', issuer: 'Microsoft AI Skills', kicker: 'DRAWER B', drawer: 1,
    body: 'Generative model capability and application patterns.' },
  { id: 'azure-ai', name: 'Get Started with AI in Azure', issuer: 'Microsoft / Azure', kicker: 'DRAWER B', drawer: 1,
    body: 'Cloud AI services and the deployment surface around a model.' },
  { id: 'ms-ai-concepts', name: 'Introduction to AI Concepts', issuer: 'Microsoft', kicker: 'DRAWER C', drawer: 2,
    body: 'Core AI vocabulary and problem framing.' },
  { id: 'google-genai', name: 'Introduction to Generative AI', issuer: 'Google', kicker: 'DRAWER C', drawer: 2,
    body: 'Foundations of generative modelling.' },
  { id: 'unlox-ai', name: 'Course in Artificial Intelligence', issuer: 'Unlox', kicker: 'DRAWER C', drawer: 2,
    body: 'Structured AI coursework.' },
  { id: 'aicte-php', name: 'Full Stack PHP Development With Project', issuer: 'AICTE', kicker: 'DRAWER D', drawer: 3,
    body: 'Full stack development internship track, completed with a project case study.' },
];
