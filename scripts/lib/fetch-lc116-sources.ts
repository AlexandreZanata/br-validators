/**
 * Fetch LC 116 service list — Planalto primary, NFSe portal fallback.
 */

import { fetchTextWithRetry } from './fetch-utils.js';
import {
  parseNfseLc116ListHtml,
  parsePlanaltoLc116Html,
  type Lc116Record,
} from './parse-lc116-html.js';

export const PLANALTO_LC116_URL = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm';

export const NFSE_LC116_LIST_URL =
  'https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs';

export interface Lc116FetchResult {
  records: Lc116Record[];
  source: 'planalto' | 'nfse';
  endpoints: string[];
}

export async function fetchLc116Records(maxAttempts: number): Promise<Lc116FetchResult> {
  try {
    const html = await fetchTextWithRetry(PLANALTO_LC116_URL, 1);
    const records = parsePlanaltoLc116Html(html);
    if (records.length >= 150) {
      return {
        records,
        source: 'planalto',
        endpoints: [PLANALTO_LC116_URL],
      };
    }
  } catch {
    // Fall through to NFSe republication of the LC 116 annex list.
  }

  const nfseHtml = await fetchTextWithRetry(NFSE_LC116_LIST_URL, maxAttempts);
  const records = parseNfseLc116ListHtml(nfseHtml);
  return {
    records,
    source: 'nfse',
    endpoints: [PLANALTO_LC116_URL, NFSE_LC116_LIST_URL],
  };
}
