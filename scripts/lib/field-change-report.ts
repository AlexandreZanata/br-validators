import { readFile } from 'node:fs/promises';

import { diffRecordsByKeyWithFields, mergeFieldChangeDetails } from './field-change-detail.js';
import type { FieldChangeDetail } from './field-change-detail.js';
import { resolveDatasetJsonPaths } from './dataset-json-paths.js';

export interface DatasetFieldChangeEntry {
  id: string;
  status: 'unchanged' | 'changed';
  adicionados?: number;
  removidos?: number;
  alterados?: number;
  camposAlterados?: string[];
  amostraChavesAlteradas?: string[];
}

export interface FieldChangesReport {
  date: string;
  summary: 'no_drift' | 'drift';
  datasets: DatasetFieldChangeEntry[];
}

function inferKeyFn(sample: object): (item: object) => string {
  const keys = Object.keys(sample);
  const preferred = ['codigo', 'id', 'ispb', 'code', 'sigla'];
  for (const key of preferred) {
    if (keys.includes(key)) {
      return (item) => String((item as Record<string, string | number>)[key]);
    }
  }
  if (keys.length > 0) {
    const firstKey = keys[0];
    return (item) => String((item as Record<string, string | number>)[firstKey]);
  }
  return (item) => JSON.stringify(item);
}

function parseJsonArray(raw: string): object[] {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter((item): item is object => typeof item === 'object' && item !== null);
}

export async function buildFieldChangesReport(
  root: string,
  datasetIds: readonly string[],
  snapshots: ReadonlyMap<string, ReadonlyMap<string, string>>,
  runDate: string,
  comparadoCom: string | null,
): Promise<FieldChangesReport> {
  const datasets: DatasetFieldChangeEntry[] = [];
  let hasDrift = false;

  for (const datasetId of datasetIds) {
    const paths = resolveDatasetJsonPaths(root, datasetId);
    if (paths.length === 0) {
      datasets.push({ id: datasetId, status: 'unchanged' });
      continue;
    }

    const details: FieldChangeDetail[] = [];

    for (const filePath of paths) {
      const snapshotMap = snapshots.get(datasetId);
      const beforeContent = snapshotMap?.get(filePath);
      const afterContent = await readFile(filePath, 'utf8').catch(() => null);
      if (afterContent === null) {
        continue;
      }

      const previous = beforeContent === undefined ? [] : parseJsonArray(beforeContent);
      const next = parseJsonArray(afterContent);

      const sample = next.at(0) ?? previous.at(0);
      if (sample === undefined) {
        continue;
      }

      const keyFn = inferKeyFn(sample);
      details.push(diffRecordsByKeyWithFields(previous, next, keyFn, comparadoCom));
    }

    if (details.length === 0) {
      datasets.push({ id: datasetId, status: 'unchanged' });
      continue;
    }

    const merged = mergeFieldChangeDetails(details);
    const changed =
      merged.adicionados > 0 || merged.removidos > 0 || merged.alterados > 0;

    if (changed) {
      hasDrift = true;
      datasets.push({
        id: datasetId,
        status: 'changed',
        adicionados: merged.adicionados,
        removidos: merged.removidos,
        alterados: merged.alterados,
        camposAlterados: merged.camposAlterados,
        amostraChavesAlteradas: merged.amostraChavesAlteradas,
      });
    } else {
      datasets.push({ id: datasetId, status: 'unchanged' });
    }
  }

  return {
    date: runDate,
    summary: hasDrift ? 'drift' : 'no_drift',
    datasets,
  };
}

export async function snapshotDatasetJson(
  root: string,
  datasetIds: readonly string[],
): Promise<Map<string, Map<string, string>>> {
  const snapshots = new Map<string, Map<string, string>>();

  for (const datasetId of datasetIds) {
    const fileMap = new Map<string, string>();
    for (const filePath of resolveDatasetJsonPaths(root, datasetId)) {
      try {
        const content = await readFile(filePath, 'utf8');
        fileMap.set(filePath, content);
      } catch {
        // File may not exist on first run.
      }
    }
    snapshots.set(datasetId, fileMap);
  }

  return snapshots;
}
