import type { DatasetChanges } from './diff-dataset.js';

export interface FieldChangeDetail extends DatasetChanges {
  camposAlterados: string[];
  amostraChavesAlteradas: string[];
}

const MAX_FIELD_NAMES = 20;
const MAX_SAMPLE_KEYS = 5;

function collectChangedFields(
  prev: Record<string, string | number | boolean | object | null>,
  next: Record<string, string | number | boolean | object | null>,
): string[] {
  const fields = new Set<string>();
  for (const key of new Set([...Object.keys(prev), ...Object.keys(next)])) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      fields.add(key);
    }
  }
  return [...fields];
}

function asRecord(value: unknown): Record<string, string | number | boolean | object | null> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, string | number | boolean | object | null>;
}

export function diffRecordsByKeyWithFields<T extends object>(
  previous: readonly T[],
  next: readonly T[],
  keyFn: (item: T) => string,
  comparadoCom: string | null,
): FieldChangeDetail {
  const prevMap = new Map(previous.map((item) => [keyFn(item), item]));
  const nextMap = new Map(next.map((item) => [keyFn(item), item]));

  let adicionados = 0;
  let removidos = 0;
  let alterados = 0;
  const camposSet = new Set<string>();
  const amostraChaves: string[] = [];

  for (const [key, item] of nextMap) {
    const prev = prevMap.get(key);
    if (prev === undefined) {
      adicionados += 1;
    } else if (JSON.stringify(prev) !== JSON.stringify(item)) {
      alterados += 1;
      if (amostraChaves.length < MAX_SAMPLE_KEYS) {
        amostraChaves.push(key);
      }
      const prevRecord = asRecord(prev);
      const nextRecord = asRecord(item);
      if (prevRecord !== null && nextRecord !== null) {
        for (const field of collectChangedFields(prevRecord, nextRecord)) {
          camposSet.add(field);
        }
      }
    }
  }

  for (const key of prevMap.keys()) {
    if (!nextMap.has(key)) {
      removidos += 1;
    }
  }

  const camposAlterados = [...camposSet].slice(0, MAX_FIELD_NAMES);
  if (camposSet.size > MAX_FIELD_NAMES) {
    camposAlterados.push(`…+${String(camposSet.size - MAX_FIELD_NAMES)}`);
  }

  return {
    adicionados,
    removidos,
    alterados,
    comparadoCom,
    camposAlterados,
    amostraChavesAlteradas: amostraChaves,
  };
}

export function mergeFieldChangeDetails(details: readonly FieldChangeDetail[]): FieldChangeDetail {
  const camposSet = new Set<string>();
  const amostraChaves: string[] = [];

  let adicionados = 0;
  let removidos = 0;
  let alterados = 0;
  let comparadoCom: string | null = null;

  for (const detail of details) {
    adicionados += detail.adicionados;
    removidos += detail.removidos;
    alterados += detail.alterados;
    comparadoCom = detail.comparadoCom ?? comparadoCom;
    for (const field of detail.camposAlterados) {
      if (!field.startsWith('…+')) {
        camposSet.add(field);
      }
    }
    for (const key of detail.amostraChavesAlteradas) {
      if (amostraChaves.length < MAX_SAMPLE_KEYS) {
        amostraChaves.push(key);
      }
    }
  }

  const camposAlterados = [...camposSet].slice(0, MAX_FIELD_NAMES);
  if (camposSet.size > MAX_FIELD_NAMES) {
    camposAlterados.push(`…+${String(camposSet.size - MAX_FIELD_NAMES)}`);
  }

  return {
    adicionados,
    removidos,
    alterados,
    comparadoCom,
    camposAlterados,
    amostraChavesAlteradas: amostraChaves,
  };
}
