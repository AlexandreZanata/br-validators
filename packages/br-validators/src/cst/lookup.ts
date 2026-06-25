/**
 * RFB SPED CST lookup — offline embedded data from official SPED Fiscal tables.
 * @see http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal
 */

import cstCofinsData from './data/cst-cofins.json';
import cstIcmsData from './data/cst-icms.json';
import cstIpiData from './data/cst-ipi.json';
import cstPisData from './data/cst-pis.json';
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

function lookupPorCodigo(list: readonly Cst[], codigo: string, length: number): Cst | undefined {
  const normalized = normalizeCodigo(codigo, length);
  if (normalized.length !== length) {
    return undefined;
  }
  return list.find((entry) => entry.codigo === normalized);
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

export function getCstIcms(): readonly Cst[] {
  return cstIcms;
}

export function getCstIpi(): readonly Cst[] {
  return cstIpi;
}

export function getCstPis(): readonly Cst[] {
  return cstPis;
}

export function getCstCofins(): readonly Cst[] {
  return cstCofins;
}

export function getCstIcmsPorCodigo(codigo: string): Cst | undefined {
  return lookupPorCodigo(cstIcms, codigo, 2);
}

export function getCstIpiPorCodigo(codigo: string): Cst | undefined {
  return lookupPorCodigo(cstIpi, codigo, 2);
}

export function getCstPisPorCodigo(codigo: string): Cst | undefined {
  return lookupPorCodigo(cstPis, codigo, 2);
}

export function getCstCofinsPorCodigo(codigo: string): Cst | undefined {
  return lookupPorCodigo(cstCofins, codigo, 2);
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
