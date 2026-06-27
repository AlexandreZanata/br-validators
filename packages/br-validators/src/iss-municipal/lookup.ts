/**
 * Municipal ISS alíquota lookup — partial embed (capitals + top PIB ~500).
 * @see docs/OFFICIAL-SOURCES.md#iss-municipal
 */

import issMunicipalData from './data/iss-municipal.json';
import { buildIssMunicipalResult } from './result.js';
import type { IssMunicipalResult, IssMunicipalRow } from './types.js';

const rows: readonly IssMunicipalRow[] = issMunicipalData;

const byIbge = new Map(rows.map((row) => [row.codigoIbge, row]));

function buildByUfIndex(sourceRows: readonly IssMunicipalRow[]): Map<string, readonly IssMunicipalRow[]> {
  const buckets = new Map<string, IssMunicipalRow[]>();
  for (const row of sourceRows) {
    const existing = buckets.get(row.uf);
    if (existing === undefined) {
      buckets.set(row.uf, [row]);
    } else {
      existing.push(row);
    }
  }
  return buckets;
}

const byUf = buildByUfIndex(rows);

const ufsDisponiveis: readonly string[] = [...byUf.keys()].sort((left, right) =>
  left.localeCompare(right, 'pt-BR'),
);

function normalizeIbgeCodigo(codigo: number | string): number | null {
  const digits = String(codigo).replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function normalizeUf(uf: string): string {
  return uf.trim().toUpperCase();
}

function normalizeNome(nome: string): string {
  return nome
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function resolveUfRows(uf: string): readonly IssMunicipalRow[] | null {
  const normalizedUf = normalizeUf(uf);
  if (!/^[A-Z]{2}$/u.test(normalizedUf)) {
    return null;
  }
  return byUf.get(normalizedUf) ?? [];
}

/** Returns every embedded ISS municipal row (in-memory reference, not a copy). */
export function getAllIssMunicipal(): readonly IssMunicipalRow[] {
  return rows;
}

/** Returns UFs present in the partial embed, sorted alphabetically. */
export function getIssMunicipalUfsDisponiveis(): readonly string[] {
  return ufsDisponiveis;
}

export function getIssMunicipalPorIbge(codigo: number | string): IssMunicipalResult | undefined {
  const normalized = normalizeIbgeCodigo(codigo);
  if (normalized === null) {
    return undefined;
  }

  const row = byIbge.get(normalized);
  if (row === undefined) {
    return undefined;
  }

  return buildIssMunicipalResult(row);
}

export function getIssMunicipalPorUf(uf: string): readonly IssMunicipalResult[] {
  const ufRows = resolveUfRows(uf);
  if (ufRows === null) {
    return [];
  }
  return ufRows.map((row) => buildIssMunicipalResult(row));
}

export function getIssMunicipalPorUfMunicipio(uf: string, nome: string): IssMunicipalResult | undefined {
  const normalizedUf = normalizeUf(uf);
  if (!/^[A-Z]{2}$/u.test(normalizedUf)) {
    return undefined;
  }

  const normalizedNome = normalizeNome(nome);
  if (normalizedNome.length === 0) {
    return undefined;
  }

  const row = rows.find(
    (entry) => entry.uf === normalizedUf && normalizeNome(entry.nome) === normalizedNome,
  );
  if (row === undefined) {
    return undefined;
  }

  return buildIssMunicipalResult(row);
}

export function searchIssMunicipal(
  query: string,
  options?: { uf?: string; limit?: number },
): readonly IssMunicipalResult[] {
  const normalizedQuery = query
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: IssMunicipalResult[] = [];
  let searchRows: readonly IssMunicipalRow[] = rows;

  if (options?.uf !== undefined) {
    const ufRows = resolveUfRows(options.uf);
    if (ufRows === null) {
      return [];
    }
    searchRows = ufRows;
  }

  for (const row of searchRows) {
    const nome = normalizeNome(row.nome);
    const uf = row.uf.toLowerCase();
    const codigo = String(row.codigoIbge);
    if (nome.includes(normalizedQuery) || uf.includes(normalizedQuery) || codigo.includes(normalizedQuery)) {
      results.push(buildIssMunicipalResult(row));
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
