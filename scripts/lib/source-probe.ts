import { readFile } from 'node:fs/promises';

import { FETCH_MAX_ATTEMPTS } from './fetch-retry-config.js';
import { probeUrl } from './fetch-utils.js';
import { parseDatasetMetadata } from './parse-metadata.js';
import {
  buildFailureOutcome,
  type SourceAlert,
  type SourceFetchOutcome,
  toSourceAlert,
  writeSourceFetchOutcome,
} from './source-fetch-outcome.js';

function selectOperationalProbeEndpoints(endpoints: readonly string[]): string[] {
  return endpoints.filter(
    (endpoint) =>
      endpoint.includes('servicodados.ibge.gov.br') ||
      endpoint.includes('bcb.gov.br') ||
      endpoint.includes('informacoes.anatel.gov.br') ||
      endpoint.includes('gov.br/gestao'),
  );
}

export async function probeMetadataEndpoints(
  metadataPaths: readonly string[],
  outcomeDir: string,
): Promise<SourceAlert[]> {
  const alerts: SourceAlert[] = [];

  for (const metadataPath of metadataPaths) {
    const raw = await readFile(metadataPath, 'utf8');
    const metadata = parseDatasetMetadata(raw);
    const httpEndpoints = selectOperationalProbeEndpoints(
      metadata.endpoints.filter((endpoint) => endpoint.startsWith('http')),
    );

    if (httpEndpoints.length === 0) {
      continue;
    }

    const failedEndpoints: string[] = [];
    for (const endpoint of httpEndpoints) {
      const result = await probeUrl(endpoint);
      if (!result.ok) {
        failedEndpoints.push(endpoint);
      }
    }

    if (failedEndpoints.length === 0) {
      await writeSourceFetchOutcome(outcomeDir, {
        datasetId: metadata.id,
        status: 'ok',
        endpoints: httpEndpoints,
        attempts: FETCH_MAX_ATTEMPTS,
        checkedAt: new Date().toISOString(),
        retainedEmbeddedDataFrom: metadata.capturadoEm,
        message: 'Operational endpoint probe succeeded.',
      });
      continue;
    }

    const outcome: SourceFetchOutcome = buildFailureOutcome(
      metadata.id,
      failedEndpoints,
      metadata.capturadoEm,
      new Error(
        `Endpoint probe failed for ${String(failedEndpoints.length)} operational URL(s) — source may be deprecated or moved.`,
      ),
      FETCH_MAX_ATTEMPTS,
    );
    outcome.status = 'source_unavailable';
    await writeSourceFetchOutcome(outcomeDir, outcome);
    const alert = toSourceAlert(outcome);
    if (alert !== null) {
      alerts.push(alert);
    }
  }

  return alerts;
}
