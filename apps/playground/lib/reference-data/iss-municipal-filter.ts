import {
  getIssMunicipalPorIbge,
  getIssMunicipalPorUf,
  searchIssMunicipal,
  type IssMunicipalResult,
} from '@br-validators/core/iss-municipal';

export const ISS_MUNICIPAL_PLAYGROUND_LIST_LIMIT = 25;

export type IssMunicipalExplorerMode = 'empty' | 'list' | 'single' | 'search';

export interface IssMunicipalExplorerResult {
  mode: IssMunicipalExplorerMode;
  rows: readonly IssMunicipalResult[];
  totalForUf: number;
}

function isIbgeLookupQuery(query: string): boolean {
  const digits = query.replace(/\D/g, '');
  return digits.length >= 6;
}

export function countIssMunicipalForUf(uf: string): number {
  const normalizedUf = uf.trim().toUpperCase();
  if (!/^[A-Z]{2}$/u.test(normalizedUf)) {
    return 0;
  }
  return getIssMunicipalPorUf(normalizedUf).length;
}

export function resolveIssMunicipalExplorerResults(query: string, uf: string): IssMunicipalExplorerResult {
  const trimmed = query.trim();
  const normalizedUf = uf.trim().toUpperCase();
  const totalForUf = normalizedUf.length > 0 ? countIssMunicipalForUf(normalizedUf) : 0;

  if (trimmed.length === 0) {
    if (normalizedUf.length === 0) {
      return { mode: 'empty', rows: [], totalForUf: 0 };
    }
    return {
      mode: 'list',
      rows: getIssMunicipalPorUf(normalizedUf).slice(0, ISS_MUNICIPAL_PLAYGROUND_LIST_LIMIT),
      totalForUf,
    };
  }

  if (isIbgeLookupQuery(trimmed)) {
    const row = getIssMunicipalPorIbge(trimmed);
    if (row === undefined) {
      return { mode: 'single', rows: [], totalForUf };
    }
    if (normalizedUf.length > 0 && row.uf !== normalizedUf) {
      return { mode: 'single', rows: [], totalForUf };
    }
    return { mode: 'single', rows: [row], totalForUf };
  }

  const searchOptions =
    normalizedUf.length > 0
      ? { uf: normalizedUf, limit: 10 }
      : { limit: 10 };
  return {
    mode: 'search',
    rows: searchIssMunicipal(trimmed, searchOptions),
    totalForUf,
  };
}
