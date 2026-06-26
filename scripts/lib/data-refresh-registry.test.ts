import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import {
  DATASET_METADATA_PATHS,
  datasetIdFromFetchScript,
  FETCH_DATASET_IDS,
  FETCH_SCRIPTS,
  MANUAL_FETCH_DATASET_IDS,
  PROBE_ONLY_METADATA_PATHS,
} from './data-refresh-registry.js';
import { parseDatasetMetadata } from './parse-metadata.js';

describe('data-refresh-registry', () => {
  it('maps every fetch script to a daily-fetch dataset id', () => {
    for (const script of FETCH_SCRIPTS) {
      const datasetId = datasetIdFromFetchScript(script);
      expect(FETCH_DATASET_IDS).toContain(datasetId);
    }
    expect(FETCH_SCRIPTS).toContain('scripts/fetch-anp-combustiveis.ts');
    expect(FETCH_DATASET_IDS).toContain('anp-combustiveis');
  });

  it('registers all embedded metadata.json datasets exactly once', async () => {
    const ids: string[] = [];
    for (const metadataPath of DATASET_METADATA_PATHS) {
      const raw = await readFile(metadataPath, 'utf8');
      ids.push(parseDatasetMetadata(raw).id);
    }
    expect(ids.length).toBe(30);
    expect(new Set(ids).size).toBe(30);
  });

  it('requires diario/semanal datasets in daily fetch or probe-only lists', async () => {
    const probeIds = new Set<string>();
    for (const metadataPath of PROBE_ONLY_METADATA_PATHS) {
      const raw = await readFile(metadataPath, 'utf8');
      probeIds.add(parseDatasetMetadata(raw).id);
    }

    const manualIds = new Set<string>(MANUAL_FETCH_DATASET_IDS);
    const fetchIds = new Set<string>(FETCH_DATASET_IDS);

    for (const metadataPath of DATASET_METADATA_PATHS) {
      const raw = await readFile(metadataPath, 'utf8');
      const meta = parseDatasetMetadata(raw);
      const schedule = meta.verificacao.agendamento;

      if (schedule === 'manual') {
        expect(manualIds.has(meta.id), `${meta.id} should be manual`).toBe(true);
        continue;
      }

      const covered = fetchIds.has(meta.id) || probeIds.has(meta.id);
      expect(covered, `${meta.id} (${schedule}) missing from bot fetch/probe`).toBe(true);
    }
  });
});
