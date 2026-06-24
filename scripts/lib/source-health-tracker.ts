import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { SourceAlert, SourceFetchOutcome } from './source-fetch-outcome.js';
import { todayIsoDate } from './fetch-utils.js';

export interface SourceHealthState {
  datasetId: string;
  endpoints: string[];
  consecutiveFailureDays: number;
  firstFailureDate: string | null;
  lastFailureDate: string | null;
  lastSuccessDate: string | null;
  severity: 'ok' | 'warning' | 'critical';
  message: string;
  retainedEmbeddedDataFrom: string | null;
}

const DOC_MAINTENANCE =
  'See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.';

function parseHealthState(raw: string): SourceHealthState | null {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const obj = parsed;
  const datasetId = readString(obj, 'datasetId');
  if (datasetId === undefined) {
    return null;
  }
  return {
    datasetId,
    endpoints: readStringArray(obj, 'endpoints') ?? [],
    consecutiveFailureDays: readNumber(obj, 'consecutiveFailureDays') ?? 0,
    firstFailureDate: readString(obj, 'firstFailureDate') ?? null,
    lastFailureDate: readString(obj, 'lastFailureDate') ?? null,
    lastSuccessDate: readString(obj, 'lastSuccessDate') ?? null,
    severity: readSeverity(obj, 'severity') ?? 'ok',
    message: readString(obj, 'message') ?? '',
    retainedEmbeddedDataFrom: readString(obj, 'retainedEmbeddedDataFrom') ?? null,
  };
}

function readString(obj: object, key: string): string | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'string') {
    return undefined;
  }
  return descriptor.value;
}

function readNumber(obj: object, key: string): number | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'number') {
    return undefined;
  }
  return descriptor.value;
}

function readStringArray(obj: object, key: string): string[] | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || !Array.isArray(descriptor.value)) {
    return undefined;
  }
  if (!descriptor.value.every((item): item is string => typeof item === 'string')) {
    return undefined;
  }
  return descriptor.value;
}

function readSeverity(obj: object, key: string): SourceHealthState['severity'] | undefined {
  const value = readString(obj, key);
  if (value === 'ok' || value === 'warning' || value === 'critical') {
    return value;
  }
  return undefined;
}

function isPreviousCalendarDay(previousDate: string, currentDate: string): boolean {
  const previous = new Date(`${previousDate}T12:00:00.000Z`);
  const current = new Date(`${currentDate}T12:00:00.000Z`);
  const diffMs = current.getTime() - previous.getTime();
  const oneDayMs = 86_400_000;
  return diffMs >= oneDayMs && diffMs < oneDayMs * 2;
}

function buildFailureMessage(consecutiveFailureDays: number): string {
  if (consecutiveFailureDays >= 2) {
    return 'Consultation link deprecated — official source unreachable for 2 or more consecutive days.';
  }
  return 'Possible link deprecation — official source unreachable after 5 attempts (2 min interval).';
}

export function applyFetchOutcomeToHealth(
  previous: SourceHealthState | null,
  outcome: SourceFetchOutcome,
  runDate: string = todayIsoDate(),
): SourceHealthState {
  if (outcome.status === 'ok') {
    return {
      datasetId: outcome.datasetId,
      endpoints: outcome.endpoints,
      consecutiveFailureDays: 0,
      firstFailureDate: null,
      lastFailureDate: null,
      lastSuccessDate: runDate,
      severity: 'ok',
      message: 'Official source responded successfully.',
      retainedEmbeddedDataFrom: outcome.retainedEmbeddedDataFrom,
    };
  }

  if (previous !== null && previous.lastFailureDate === runDate) {
    return {
      ...previous,
      endpoints: outcome.endpoints,
      retainedEmbeddedDataFrom: outcome.retainedEmbeddedDataFrom ?? previous.retainedEmbeddedDataFrom,
      message: buildFailureMessage(previous.consecutiveFailureDays),
      severity: previous.consecutiveFailureDays >= 2 ? 'critical' : 'warning',
    };
  }

  let consecutiveFailureDays = 1;
  let firstFailureDate = runDate;

  if (
    previous !== null &&
    previous.lastFailureDate !== null &&
    isPreviousCalendarDay(previous.lastFailureDate, runDate)
  ) {
    consecutiveFailureDays = previous.consecutiveFailureDays + 1;
    firstFailureDate = previous.firstFailureDate ?? runDate;
  }

  const severity: SourceHealthState['severity'] =
    consecutiveFailureDays >= 2 ? 'critical' : 'warning';

  return {
    datasetId: outcome.datasetId,
    endpoints: outcome.endpoints,
    consecutiveFailureDays,
    firstFailureDate,
    lastFailureDate: runDate,
    lastSuccessDate: previous?.lastSuccessDate ?? null,
    severity,
    message: buildFailureMessage(consecutiveFailureDays),
    retainedEmbeddedDataFrom: outcome.retainedEmbeddedDataFrom,
  };
}

export async function readSourceHealthState(
  healthDir: string,
  datasetId: string,
): Promise<SourceHealthState | null> {
  try {
    const raw = await readFile(path.join(healthDir, `${datasetId}.json`), 'utf8');
    return parseHealthState(raw);
  } catch {
    return null;
  }
}

export async function writeSourceHealthState(
  healthDir: string,
  state: SourceHealthState,
): Promise<void> {
  await mkdir(healthDir, { recursive: true });
  await writeFile(path.join(healthDir, `${state.datasetId}.json`), `${JSON.stringify(state, null, 2)}\n`);
}

export async function syncSourceHealthFromOutcomes(
  healthDir: string,
  outcomes: readonly SourceFetchOutcome[],
  runDate: string = todayIsoDate(),
): Promise<SourceHealthState[]> {
  const states: SourceHealthState[] = [];

  for (const outcome of outcomes) {
    const previous = await readSourceHealthState(healthDir, outcome.datasetId);
    const next = applyFetchOutcomeToHealth(previous, outcome, runDate);
    await writeSourceHealthState(healthDir, next);
    states.push(next);
  }

  return states;
}

export function healthStateToAlert(state: SourceHealthState): SourceAlert | null {
  if (state.severity === 'ok') {
    return null;
  }

  return {
    datasetId: state.datasetId,
    severity: state.severity,
    status: 'source_unavailable',
    message: state.message,
    endpoints: state.endpoints,
    retainedEmbeddedDataFrom: state.retainedEmbeddedDataFrom,
    documentationAction: DOC_MAINTENANCE,
    consecutiveFailureDays: state.consecutiveFailureDays,
  };
}

export function collectHealthAlerts(states: readonly SourceHealthState[]): SourceAlert[] {
  const alerts: SourceAlert[] = [];
  for (const state of states) {
    const alert = healthStateToAlert(state);
    if (alert !== null) {
      alerts.push(alert);
    }
  }
  return alerts;
}
