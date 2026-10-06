import type { Detail } from './types';

export type SectionKey = 'PROBLEM' | 'WHAT WAS BUILT' | 'KEY FEATURES' | 'TECHNOLOGIES' | 'CURRENT STATE' | 'LESSONS';
export type ProjectStatus = 'COMPLETED' | 'IN PROGRESS' | 'ARCHIVED';

export interface CaseSection {
  key: SectionKey;
  /** null = not yet supplied. Rendered as PENDING VERIFICATION, never invented. */
  body: string | null;
}

export interface CaseFile extends Omit<Detail, 'status'> {
  code: string;
  title: string;
  type: string;
  status: ProjectStatus;
  /** One-line description for the closed folder. */
  summary: string;
  /** For team work: what Shyam himself did. */
  role: string | null;
  stack: string[];
  links: { github: string | null; demo: string | null };
  /** Components in signal order, for the pen sketch. Only parts the project actually has. */
  sketch: string[];
  sections: CaseSection[];
}

/**
 * Projects built — sourced from the public repositories at github.com/codepioneer76.
 * Stacks come from each repository's package manifests, features from its source
 * tree, not from its README's ambitions: PipeGuard's README lists React, Node.js
 * and MQTT, but the code is plain JavaScript on Vite, so the code is what is shown.
 */
export const caseFiles: CaseFile[] = [
  {
    id: 'riversight', code: 'PF-002', name: 'RIVERSIGHT', title: 'RIVERSIGHT',
    kicker: 'RIVER MONITORING PLATFORM', type: 'IoT · GIS · HYDROLOGY', status: 'COMPLETED',
    summary: 'IoT-enabled river monitoring: real-time telemetry, GIS mapping, bathymetry, predictive analytics and alerts in one dashboard.',
    body: 'An IoT-enabled intelligent river monitoring platform for real-time telemetry, GIS mapping, bathymetric insights, predictive analytics and hydrological monitoring through an interactive dashboard with alerts.',
    role: null,
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'React-Leaflet', 'Framer Motion'],
    links: { github: 'https://github.com/codepioneer76/Riversight', demo: null },
    sketch: ['Telemetry', 'GIS map', 'Bathymetry', 'Predictions', 'Alerts'],
    sections: [
      { key: 'PROBLEM', body: 'River conditions are watched at too few points and too slowly. The aim: one live view of telemetry, hydrology and bathymetry, with alerts when conditions change.' },
      { key: 'WHAT WAS BUILT', body: 'A Next.js platform with seven modules — telemetry, GIS, bathymetry, pressure, predictions, alerts and analytics — each its own route, built from shared chart, gauge and layout components.' },
      { key: 'KEY FEATURES', body: 'Time-series and gauge charts for live readings · an interactive GIS map · depth profiles for bathymetric insight · a pressure dashboard · prediction and alert views.' },
      { key: 'TECHNOLOGIES', body: 'Next.js and React with TypeScript; Tailwind CSS; Recharts for telemetry; React-Leaflet for GIS; Framer Motion for interface motion.' },
      { key: 'CURRENT STATE', body: 'Completed. The platform is in its public repository with the full academic project report, including a Pressure Intelligence Module covering transient pressure analysis, alarm rationalisation and LSTM-based prediction.' },
      { key: 'LESSONS', body: 'The report became a build problem: generated first through Python (ReportLab, pypdf), then a Node.js docx pipeline, so every revision rebuilt cleanly instead of being edited by hand.' },
    ],
  },
  {
    id: 'pipeguard', code: 'PF-001', name: 'PIPEGUARD', title: 'PIPEGUARD',
    kicker: 'PIPELINE MONITORING DASHBOARD', type: 'TELEMETRY · LEAK DETECTION · ANALYTICS', status: 'COMPLETED',
    summary: 'A pipeline monitoring dashboard for leak detection, pressure analysis and telemetry — data import, visualisation, analysis and reporting.',
    body: 'An intelligent pipeline monitoring dashboard combining telemetry, pressure intelligence and analytics for leak detection and operational safety.',
    role: null,
    stack: ['JavaScript', 'Vite', 'Tailwind CSS', 'ECharts', 'SheetJS'],
    links: { github: 'https://github.com/codepioneer76/PipeGuard', demo: null },
    sketch: ['Data import', 'Visualisation', 'Analysis', 'Reports'],
    sections: [
      { key: 'PROBLEM', body: 'Pipeline leaks found late are expensive in loss and in risk. Pressure behaviour holds the early signal, if it can be seen clearly.' },
      { key: 'WHAT WAS BUILT', body: 'A single-page dashboard with its own client-side router: login, dashboard, data import, visualisation, analysis, reports and settings.' },
      { key: 'KEY FEATURES', body: 'Spreadsheet import of pressure and telemetry data · interactive ECharts visualisation · an analysis view for anomalies and thresholds · generated reports.' },
      { key: 'TECHNOLOGIES', body: 'Plain JavaScript on Vite, Tailwind CSS, ECharts for visualisation, SheetJS for spreadsheet import.' },
      { key: 'CURRENT STATE', body: 'Completed as a dashboard. The repository’s stated next steps are real sensor integration, AI-based failure prediction and leak localisation.' },
      { key: 'LESSONS', body: null },
    ],
  },
  {
    id: 'flood', code: 'PF-003', name: 'DESIGN FLOOD SYNTHESIS', title: 'DESIGN FLOOD SYNTHESIS',
    kicker: 'HYDROLOGICAL ENGINEERING', type: 'PYTHON · HYDROLOGY · SIMULATION', status: 'COMPLETED',
    summary: 'A Python hydrological application: rainfall-runoff analysis, unit hydrograph convolution, flood simulation and automated reports.',
    body: 'A Python-based hydrological engineering application for design flood synthesis using rainfall-runoff analysis, unit hydrograph convolution, flood simulation, interactive visualisations and automated report generation.',
    role: null,
    stack: ['Python'],
    links: { github: 'https://github.com/codepioneer76/Design-Flood-Synthesis', demo: null },
    sketch: ['Rainfall', 'Runoff', 'Unit hydrograph', 'Flood simulation', 'Report'],
    sections: [
      { key: 'PROBLEM', body: 'Estimating the design flood a structure must survive, from rainfall to peak discharge.' },
      { key: 'WHAT WAS BUILT', body: 'A Python application covering rainfall-runoff analysis, unit hydrograph convolution, flood simulation, interactive visualisation and automated report generation.' },
      { key: 'KEY FEATURES', body: null },
      { key: 'TECHNOLOGIES', body: 'Python.' },
      { key: 'CURRENT STATE', body: 'Completed as an academic project; its report was integrated with RiverSight’s. The public repository currently holds the project description only — source not yet published.' },
      { key: 'LESSONS', body: null },
    ],
  },
  {
    id: 'satquery', code: 'PF-004', name: 'SATQUERY AI', title: 'SATQUERY AI',
    kicker: 'SMART INDIA HACKATHON · TEAM', type: 'SATELLITE IMAGERY · QUESTION ANSWERING', status: 'IN PROGRESS',
    summary: 'A Smart India Hackathon team prototype for asking natural-language questions of satellite imagery.',
    body: 'Satellite-imagery question answering (SIH26167): a React frontend over a FastAPI backend, with ML, orchestration and evaluation modules.',
    role: 'Team member — integrating the React frontend with the FastAPI backend.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Zustand', 'React-Leaflet', 'Recharts', 'FastAPI', 'Python'],
    links: { github: 'https://github.com/codepioneer76/SatQuery-AI-Shyam', demo: null },
    sketch: ['Imagery', 'Question', 'Orchestration', 'ML inference', 'Answer'],
    sections: [
      { key: 'PROBLEM', body: 'Satellite imagery holds answers that are hard to ask for. The aim: put a question in plain language and get an answer grounded in the image.' },
      { key: 'WHAT WAS BUILT', body: 'A team prototype: React frontend, FastAPI backend, and Python modules for data pipeline, ML inference, agent orchestration and evaluation. Shyam’s part is the frontend-to-backend integration.' },
      { key: 'KEY FEATURES', body: null },
      { key: 'TECHNOLOGIES', body: 'React with TypeScript on Vite, Tailwind CSS, TanStack Query, Zustand, React-Leaflet, Recharts; FastAPI and Python on the backend.' },
      { key: 'CURRENT STATE', body: 'In progress — Smart India Hackathon prototype under active development.' },
      { key: 'LESSONS', body: null },
    ],
  },
];

/** Project files grouped the way the room presents them. */
export const byStatus = (status: ProjectStatus): CaseFile[] => caseFiles.filter((c) => c.status === status);
