import type { Detail } from './types';

/** CS fundamentals, presented as physical core modules in a rack. */
export const foundation: Detail[] = [
  { id: 'dsa', name: 'DATA STRUCTURES & ALGORITHMS', kicker: 'CORE MODULE 01',
    body: 'The layer everything else is measured against: how a structure is chosen, what it costs, and why the obvious solution is often the wrong shape for the data.' },
  { id: 'oop', name: 'OBJECT-ORIENTED PROGRAMMING', kicker: 'CORE MODULE 02',
    body: 'Modelling a domain as objects with clear boundaries — the same instinct that separates telemetry, transport and presentation in a monitoring system.' },
  { id: 'dbms', name: 'DATABASE MANAGEMENT SYSTEMS', kicker: 'CORE MODULE 03',
    body: 'Schema design, normalisation, query behaviour. Sensor systems generate far more rows than screens; the storage decision arrives before the dashboard does.' },
  { id: 'os', name: 'OPERATING SYSTEMS', kicker: 'CORE MODULE 04',
    body: 'Processes, scheduling, memory, concurrency. What a runtime is actually doing underneath the framework.' },
  { id: 'net', name: 'COMPUTER NETWORKS', kicker: 'CORE MODULE 05',
    body: 'Protocols, latency, loss. An IoT platform is a networking problem long before it is a machine learning problem.' },
];
