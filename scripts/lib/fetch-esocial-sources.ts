/**
 * Fetch eSocial Tabela 01 — worker categories from official layout tables.
 */

import { fetchTextWithRetry } from './fetch-utils.js';
import {
  parseEsocialCategoriasHtml,
  parseEsocialRubricasHtml,
  type EsocialCategoriaRecord,
  type EsocialRubricaRecord,
} from './parse-esocial-tabelas-html.js';

export const ESOCIAL_TABELAS_URL =
  'https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html';

export interface EsocialFetchResult {
  records: EsocialCategoriaRecord[];
  endpoints: string[];
}

export interface EsocialRubricasFetchResult {
  records: EsocialRubricaRecord[];
  endpoints: string[];
}

async function fetchEsocialTabelasHtml(maxAttempts: number): Promise<string> {
  return fetchTextWithRetry(ESOCIAL_TABELAS_URL, maxAttempts);
}

export async function fetchEsocialCategorias(maxAttempts: number): Promise<EsocialFetchResult> {
  const html = await fetchEsocialTabelasHtml(maxAttempts);
  const records = parseEsocialCategoriasHtml(html);
  return {
    records,
    endpoints: [ESOCIAL_TABELAS_URL],
  };
}

export async function fetchEsocialRubricas(maxAttempts: number): Promise<EsocialRubricasFetchResult> {
  const html = await fetchEsocialTabelasHtml(maxAttempts);
  const records = parseEsocialRubricasHtml(html);
  return {
    records,
    endpoints: [ESOCIAL_TABELAS_URL],
  };
}
