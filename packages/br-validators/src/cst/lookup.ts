/**
 * RFB SPED CST lookup — offline embedded data from official SPED Fiscal tables.
 * @see http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal
 */

import cstCofinsData from './data/cst-cofins.json';
import cstIcmsData from './data/cst-icms.json';
import cstIpiData from './data/cst-ipi.json';
import cstPisData from './data/cst-pis.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Cst } from './types.js';

const cstIcms: readonly Cst[] = cstIcmsData;
const cstIpi: readonly Cst[] = cstIpiData;
const cstPis: readonly Cst[] = cstPisData;
const cstCofins: readonly Cst[] = cstCofinsData;

function normalizeCodigo(codigo: string, length: number): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(length, '0').slice(-length);
}

function resolveCstLookup(
  list: readonly Cst[],
  codigo: string,
  taxLabel: string,
): LookupResult<Cst> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: `CST ${taxLabel}`,
    normalize: (input) => normalizeCodigo(input, 2),
    expectedLength: 2,
    lengthLabel: '2 digits',
    find: (normalized) => list.find((entry) => entry.codigo === normalized),
  });
}

function searchCstList(
  list: readonly Cst[],
  query: string,
  options?: { limit?: number },
): readonly Cst[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cst[] = [];

  for (const entry of list) {
    if (entry.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(entry);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

/** Returns every embedded ICMS CST row (in-memory reference, not a copy). */
export function getAllCstIcms(): readonly Cst[] {
  return cstIcms;
}

/** @deprecated Use {@link getAllCstIcms} instead. Removed in v2.0. */
export function getCstIcms(): readonly Cst[] {
  return getAllCstIcms();
}

/** Returns every embedded IPI CST row (in-memory reference, not a copy). */
export function getAllCstIpi(): readonly Cst[] {
  return cstIpi;
}

/** @deprecated Use {@link getAllCstIpi} instead. Removed in v2.0. */
export function getCstIpi(): readonly Cst[] {
  return getAllCstIpi();
}

/** Returns every embedded PIS CST row (in-memory reference, not a copy). */
export function getAllCstPis(): readonly Cst[] {
  return cstPis;
}

/** @deprecated Use {@link getAllCstPis} instead. Removed in v2.0. */
export function getCstPis(): readonly Cst[] {
  return getAllCstPis();
}

/** Returns every embedded COFINS CST row (in-memory reference, not a copy). */
export function getAllCstCofins(): readonly Cst[] {
  return cstCofins;
}

/** @deprecated Use {@link getAllCstCofins} instead. Removed in v2.0. */
export function getCstCofins(): readonly Cst[] {
  return getAllCstCofins();
}

export function lookupCstIcmsPorCodigo(codigo: string): LookupResult<Cst> {
  return resolveCstLookup(cstIcms, codigo, 'ICMS');
}

export function lookupCstIpiPorCodigo(codigo: string): LookupResult<Cst> {
  return resolveCstLookup(cstIpi, codigo, 'IPI');
}

export function lookupCstPisPorCodigo(codigo: string): LookupResult<Cst> {
  return resolveCstLookup(cstPis, codigo, 'PIS');
}

export function lookupCstCofinsPorCodigo(codigo: string): LookupResult<Cst> {
  return resolveCstLookup(cstCofins, codigo, 'COFINS');
}

export function getCstIcmsPorCodigo(codigo: string): Cst | undefined {
  return unwrapLookupValue(lookupCstIcmsPorCodigo(codigo));
}

export function getCstIpiPorCodigo(codigo: string): Cst | undefined {
  return unwrapLookupValue(lookupCstIpiPorCodigo(codigo));
}

export function getCstPisPorCodigo(codigo: string): Cst | undefined {
  return unwrapLookupValue(lookupCstPisPorCodigo(codigo));
}

export function getCstCofinsPorCodigo(codigo: string): Cst | undefined {
  return unwrapLookupValue(lookupCstCofinsPorCodigo(codigo));
}

export function searchCstIcms(query: string, options?: { limit?: number }): readonly Cst[] {
  return searchCstList(cstIcms, query, options);
}

export function searchCstIpi(query: string, options?: { limit?: number }): readonly Cst[] {
  return searchCstList(cstIpi, query, options);
}

export function searchCstPis(query: string, options?: { limit?: number }): readonly Cst[] {
  return searchCstList(cstPis, query, options);
}

export function searchCstCofins(query: string, options?: { limit?: number }): readonly Cst[] {
  return searchCstList(cstCofins, query, options);
}
