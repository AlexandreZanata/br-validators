export interface DatasetChanges {
  adicionados: number;
  removidos: number;
  alterados: number;
  comparadoCom: string | null;
}

export {
  diffRecordsByKeyWithFields,
  mergeFieldChangeDetails,
  type FieldChangeDetail,
} from './field-change-detail.js';

export function diffRecordsByKey<T>(
  previous: readonly T[],
  next: readonly T[],
  keyFn: (item: T) => string,
  comparadoCom: string | null,
): DatasetChanges {
  const prevMap = new Map(previous.map((item) => [keyFn(item), item]));
  const nextMap = new Map(next.map((item) => [keyFn(item), item]));

  let adicionados = 0;
  let removidos = 0;
  let alterados = 0;

  for (const [key, item] of nextMap) {
    const prev = prevMap.get(key);
    if (prev === undefined) {
      adicionados += 1;
    } else if (JSON.stringify(prev) !== JSON.stringify(item)) {
      alterados += 1;
    }
  }

  for (const key of prevMap.keys()) {
    if (!nextMap.has(key)) {
      removidos += 1;
    }
  }

  return { adicionados, removidos, alterados, comparadoCom };
}
