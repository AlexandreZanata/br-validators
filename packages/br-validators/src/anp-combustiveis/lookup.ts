/**
 * ANP weekly fuel price survey — offline embedded municipal averages.
 * @see docs/OFFICIAL-SOURCES.md#anp-combustiveis
 */

import precosMediosData from './data/precos-medios.json';
import semanasData from './data/semanas.json';
import {
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  lookupNotFound,
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { AnpCombustivel, AnpPrecoMedio, AnpPrecosMediosQuery, AnpSemanaPesquisa } from './types.js';
import { ANP_COMBUSTIVEL_VALUES } from './types.js';

const precosMedios: readonly AnpPrecoMedio[] = precosMediosData as AnpPrecoMedio[];
const semanas: readonly AnpSemanaPesquisa[] = semanasData;

function normalizePlaceName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUf(uf: string): string {
  return uf.trim().toUpperCase();
}

function isValidCombustivel(produto: string): produto is AnpCombustivel {
  return (ANP_COMBUSTIVEL_VALUES as readonly string[]).includes(produto);
}

function resolveSemanaInicio(semanaInicio?: string): string | undefined {
  if (semanaInicio === undefined) {
    return pickLatestAnpSemana(semanas)?.inicio;
  }
  const trimmed = semanaInicio.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function pickLatestAnpSemana(items: readonly AnpSemanaPesquisa[]): AnpSemanaPesquisa | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return [...items].sort((left, right) => right.inicio.localeCompare(left.inicio))[0];
}

/** Returns every embedded ANP survey week row (in-memory reference, not a copy). */
export function getAllAnpSemanasPesquisa(): readonly AnpSemanaPesquisa[] {
  return semanas;
}

/** @deprecated Use {@link getAllAnpSemanasPesquisa} instead. Removed in v2.0. */
export function getAnpSemanasPesquisa(): readonly AnpSemanaPesquisa[] {
  return getAllAnpSemanasPesquisa();
}

export function getAnpSemanaAtual(): AnpSemanaPesquisa | undefined {
  return pickLatestAnpSemana(semanas);
}

export function lookupAnpPrecosMedios(query: AnpPrecosMediosQuery): LookupResult<AnpPrecoMedio> {
  const trimmedUf = query.uf.trim();
  const trimmedMunicipio = query.municipio.trim();
  if (trimmedUf.length === 0 || trimmedMunicipio.length === 0) {
    return lookupInvalidInput('UF and municipio are required');
  }

  const uf = normalizeUf(query.uf);
  if (!/^[A-Z]{2}$/.test(uf)) {
    return lookupInvalidFormat('UF must be a 2-letter state code');
  }

  const municipio = normalizePlaceName(query.municipio);
  if (municipio.length === 0) {
    return lookupInvalidFormat('Municipio name is required after normalization');
  }

  if (!isValidCombustivel(query.produto)) {
    return lookupInvalidFormat('Produto must be a valid ANP fuel type');
  }

  const semanaInicio = resolveSemanaInicio(query.semanaInicio);
  if (semanaInicio === undefined) {
    return lookupInvalidFormat('semanaInicio must be YYYY-MM-DD or omitted for latest week');
  }

  const found = precosMedios.find(
    (record) =>
      record.semanaInicio === semanaInicio &&
      record.uf === uf &&
      normalizePlaceName(record.municipioNome) === municipio &&
      record.produto === query.produto,
  );

  if (found === undefined) {
    return lookupNotFound(
      `ANP average price for ${query.produto} in ${municipio}/${uf} not in embedded table`,
    );
  }

  return lookupFound(found);
}

export function getAnpPrecosMedios(query: AnpPrecosMediosQuery): AnpPrecoMedio | undefined {
  return unwrapLookupValue(lookupAnpPrecosMedios(query));
}

export function lookupAnpPrecosMediosPorIbge(
  codigo: number,
  produto: AnpCombustivel,
  semanaInicio?: string,
): LookupResult<AnpPrecoMedio> {
  if (!Number.isInteger(codigo) || codigo <= 0) {
    return lookupInvalidFormat('IBGE municipality code must be a positive integer');
  }

  if (!isValidCombustivel(produto)) {
    return lookupInvalidFormat('Produto must be a valid ANP fuel type');
  }

  const resolvedSemana = resolveSemanaInicio(semanaInicio);
  if (resolvedSemana === undefined) {
    return lookupInvalidFormat('semanaInicio must be YYYY-MM-DD or omitted for latest week');
  }

  const found = precosMedios.find(
    (record) =>
      record.semanaInicio === resolvedSemana &&
      record.municipioIbge === codigo &&
      record.produto === produto,
  );

  if (found === undefined) {
    return lookupNotFound(
      `ANP average price for ${produto} in IBGE ${String(codigo)} not in embedded table`,
    );
  }

  return lookupFound(found);
}

export function getAnpPrecosMediosPorIbge(
  codigo: number,
  produto: AnpCombustivel,
  semanaInicio?: string,
): AnpPrecoMedio | undefined {
  return unwrapLookupValue(lookupAnpPrecosMediosPorIbge(codigo, produto, semanaInicio));
}

/** Returns every embedded ANP municipal average price row (in-memory reference, not a copy). */
export function getAllAnpPrecosMedios(): readonly AnpPrecoMedio[] {
  return precosMedios;
}

/** @deprecated Use {@link getAllAnpPrecosMedios} instead. Removed in v2.0. */
export function getAnpPrecosMediosEmbedded(): readonly AnpPrecoMedio[] {
  return getAllAnpPrecosMedios();
}
