import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { FetchError } from './fetch-utils.js';

export const FETCH_MAX_ATTEMPTS = 3;
export const FETCH_RETRY_DELAY_MS = 2000;

export type SourceFetchStatus =
  | 'ok'
  | 'source_unavailable'
  | 'source_empty'
  | 'dependency_failed';

export interface SourceFetchOutcome {
  datasetId: string;
  status: SourceFetchStatus;
  endpoints: string[];
  attempts: number;
  checkedAt: string;
  retainedEmbeddedDataFrom: string | null;
  message: string;
  httpStatus?: number;
}

export interface SourceAlert {
  datasetId: string;
  severity: 'warning';
  status: Exclude<SourceFetchStatus, 'ok'>;
  message: string;
  endpoints: string[];
  retainedEmbeddedDataFrom: string | null;
  documentationAction: string;
}

const DOC_MAINTENANCE =
  'See docs/DATA-SOURCE-MAINTENANCE.md — update `docs/OFFICIAL-SOURCES.md`, the fetch script endpoint(s), and `metadata.json`, then run `pnpm data:refresh` locally.';

export class SourceDataError extends Error {
  constructor(
    message: string,
    readonly status: Exclude<SourceFetchStatus, 'ok'> = 'source_empty',
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = 'SourceDataError';
  }
}

export function buildFailureOutcome(
  datasetId: string,
  endpoints: string[],
  retainedEmbeddedDataFrom: string | null,
  error: unknown,
  attempts: number,
): SourceFetchOutcome {
  const httpStatus = error instanceof FetchError ? error.status : undefined;
  const status = classifySourceError(error);
  const detail = error instanceof Error ? error.message : 'Unknown fetch error';
  const retainedLabel = retainedEmbeddedDataFrom ?? 'unknown date';
  const message =
    status === 'dependency_failed'
      ? `${detail} Embedded data from ${retainedLabel} retained in the API.`
      : `Official source appears unavailable or deprecated after ${String(attempts)} attempts (${detail}). No new data returned — embedded data from ${retainedLabel} retained in the API.`;

  return {
    datasetId,
    status,
    endpoints,
    attempts,
    checkedAt: new Date().toISOString(),
    retainedEmbeddedDataFrom,
    message,
    ...(httpStatus === undefined ? {} : { httpStatus }),
  };
}

function classifySourceError(error: unknown): Exclude<SourceFetchStatus, 'ok'> {
  if (error instanceof SourceDataError) {
    return error.status;
  }
  if (error instanceof FetchError && error.status === 404) {
    return 'source_unavailable';
  }
  if (error instanceof Error && error.message.includes('dependency')) {
    return 'dependency_failed';
  }
  return 'source_unavailable';
}

export function toSourceAlert(outcome: SourceFetchOutcome): SourceAlert | null {
  if (outcome.status === 'ok') {
    return null;
  }
  return {
    datasetId: outcome.datasetId,
    severity: 'warning',
    status: outcome.status,
    message: outcome.message,
    endpoints: outcome.endpoints,
    retainedEmbeddedDataFrom: outcome.retainedEmbeddedDataFrom,
    documentationAction: DOC_MAINTENANCE,
  };
}

export async function writeSourceFetchOutcome(
  outcomeDir: string,
  outcome: SourceFetchOutcome,
): Promise<void> {
  await mkdir(outcomeDir, { recursive: true });
  const filePath = path.join(outcomeDir, `${outcome.datasetId}.json`);
  await writeFile(filePath, `${JSON.stringify(outcome, null, 2)}\n`);
}

export async function readSourceFetchOutcomes(
  outcomeDir: string,
  datasetIds: readonly string[],
): Promise<SourceFetchOutcome[]> {
  const { readFile } = await import('node:fs/promises');
  const outcomes: SourceFetchOutcome[] = [];

  for (const datasetId of datasetIds) {
    try {
      const raw = await readFile(path.join(outcomeDir, `${datasetId}.json`), 'utf8');
      outcomes.push(JSON.parse(raw) as SourceFetchOutcome);
    } catch {
      // No outcome file — fetch step did not run or dataset has no HTTP source.
    }
  }

  return outcomes;
}
