/**
 * Municipal ISS alíquota lookup — partial embed (capitals + top PIB ~100).
 * @see docs/OFFICIAL-SOURCES.md#iss-municipal
 */

import issMunicipalData from './data/iss-municipal.json';
import { buildIssMunicipalResult } from './result.js';
import type { IssMunicipalResult, IssMunicipalRow } from './types.js';

const rows: readonly IssMunicipalRow[] = issMunicipalData;

const byIbge = new Map(rows.map((row) => [row.codigoIbge, row]));

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

/** Returns every embedded ISS municipal row (in-memory reference, not a copy). */
export function getAllIssMunicipal(): readonly IssMunicipalRow[] {
  return rows;
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

export function searchIssMunicipal(query: string, options?: { limit?: number }): readonly IssMunicipalResult[] {
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

  for (const row of rows) {
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
