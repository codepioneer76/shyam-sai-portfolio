import type { Detail } from './types';

/** The investigation structure every project file follows. */
export type SectionKey = 'PROBLEM' | 'APPROACH' | 'ARCHITECTURE' | 'TECHNOLOGIES' | 'CURRENT STATE' | 'LESSONS';

export interface CaseSection {
  key: SectionKey;
  /** null = not yet supplied by Shyam. Rendered as PENDING VERIFICATION, never invented. */
  body: string | null;
}

export interface CaseFile extends Detail {
  code: string;
  title: string;
  type: string;
  state: 'ACTIVE' | 'ARCHIVED' | 'IN PROGRESS';
  /** One-line description, exactly as Shyam wrote it. */
  summary: string;
  stack: string[];
  links: { github: string | null; demo: string | null };
  sections: CaseSection[];
}

/**
 * Projects built.
 *
 * Every non-null section below restates something Shyam has said about the
 * project. Earlier drafts of this file described architecture decisions and
 * interface behaviour in more detail than was ever stated; those passages were
 * removed rather than kept because they read well.
 */
export const caseFiles: CaseFile[] = [
  {
    id: 'pipeguard',
    code: 'PF-001',
    name: 'PIPEGUARD',
    title: 'PIPEGUARD',
    kicker: 'PIPELINE MONITORING',
    type: 'IoT · TELEMETRY · PREDICTIVE ANALYTICS',
    state: 'IN PROGRESS',
    summary:
      'An intelligent pipeline monitoring system combining IoT, telemetry, pressure intelligence and predictive analytics for real-time leak detection and operational safety.',
    body: 'An intelligent pipeline monitoring system combining IoT, telemetry, pressure intelligence and predictive analytics for real-time leak detection and operational safety.',
    stack: [],
    links: { github: null, demo: null },
    sections: [
      { key: 'PROBLEM', body: 'Leaks in pipelines, and the operational safety that depends on detecting them in real time rather than after the fact.' },
      { key: 'APPROACH', body: 'IoT telemetry and pressure intelligence feeding predictive analytics, aimed at real-time leak detection.' },
      { key: 'ARCHITECTURE', body: null },
      { key: 'TECHNOLOGIES', body: null },
      { key: 'CURRENT STATE', body: null },
      { key: 'LESSONS', body: null },
    ],
  },
  {
    id: 'riversight',
    code: 'PF-002',
    name: 'RIVERSIGHT',
    title: 'RIVERSIGHT',
    kicker: 'RIVER MONITORING',
    type: 'IoT · GIS · HYDROLOGY',
    state: 'ACTIVE',
    summary:
      'An IoT-enabled intelligent river monitoring platform for real-time telemetry, GIS mapping, bathymetric insights, predictive analytics and hydrological monitoring through an interactive dashboard with alerts and AI-driven intelligence.',
    body: 'An IoT-enabled intelligent river monitoring platform for real-time telemetry, GIS mapping, bathymetric insights, predictive analytics and hydrological monitoring through an interactive dashboard with alerts and AI-driven intelligence.',
    stack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'React-Leaflet'],
    links: { github: null, demo: null },
    sections: [
      { key: 'PROBLEM', body: 'Continuous, real-time monitoring of river conditions — telemetry, hydrology and bathymetry — with alerts when conditions change.' },
      { key: 'APPROACH', body: 'IoT telemetry combined with GIS mapping, bathymetric insight and predictive analytics, surfaced through one interactive dashboard with alerts.' },
      { key: 'ARCHITECTURE', body: null },
      { key: 'TECHNOLOGIES', body: 'Next.js 14, React and TypeScript for the platform; Tailwind CSS for layout; Recharts for time-series telemetry; React-Leaflet for the GIS map.' },
      { key: 'CURRENT STATE', body: 'Active. The academic report is written and has been revised repeatedly, including a Pressure Intelligence Module section covering transient pressure analysis, alarm rationalisation and LSTM-based prediction.' },
      { key: 'LESSONS', body: 'The report became a build problem: first generated through Python with ReportLab and pypdf, later through a Node.js docx pipeline, so that every revision could be rebuilt cleanly rather than edited by hand.' },
    ],
  },
];
