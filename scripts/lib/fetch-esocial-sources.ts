/**
 * Fetch eSocial Tabela 01 — worker categories from official layout tables.
 */

import { fetchTextWithRetry } from './fetch-utils.js';
import { parseEsocialCategoriasHtml, type EsocialCategoriaRecord } from './parse-esocial-tabelas-html.js';

export const ESOCIAL_TABELAS_URL =
  'https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html';

export interface EsocialFetchResult {
  records: EsocialCategoriaRecord[];
  endpoints: string[];
}

export async function fetchEsocialCategorias(maxAttempts: number): Promise<EsocialFetchResult> {
  const html = await fetchTextWithRetry(ESOCIAL_TABELAS_URL, maxAttempts);
  const records = parseEsocialCategoriasHtml(html);
  return {
    records,
    endpoints: [ESOCIAL_TABELAS_URL],
  };
}
