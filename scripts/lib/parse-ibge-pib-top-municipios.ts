/**
 * Parse IBGE PIB municipal Table 1 — top municipalities by GDP (2022).
 * @see https://ftp.ibge.gov.br/Pib_Municipios/2022_2023/xlsx/tabelas_completas_2022.xlsx
 */

import { parseXlsxSheet } from './parse-xlsx-zip.js';

export const IBGE_PIB_TOP100_XLSX_URL =
  'https://ftp.ibge.gov.br/Pib_Municipios/2022_2023/xlsx/tabelas_completas_2022.xlsx';

export interface IbgePibMunicipioRow {
  pibRank: number;
  nome: string;
  uf: string;
}

const RANK_PATTERN = /^\d+º$/u;
const LABEL_PATTERN = /^(.+?)\s*\(([A-Z]{2})\)\s*$/u;

function normalizeNomeKey(nome: string, uf: string): string {
  return `${nome.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}|${uf}`;
}

export function parseIbgePibTopMunicipios(
  xlsxPath: string,
  municipioNameIndex: ReadonlyMap<string, { codigo: number; nome: string; uf: string }>,
  limit = 100,
): IbgePibMunicipioRow[] {
  const rows = parseXlsxSheet(xlsxPath, 'xl/worksheets/sheet1.xml');
  const results: IbgePibMunicipioRow[] = [];

  for (const row of rows) {
    const label = row.get('A');
    const rankLabel = row.get('B');
    if (label === undefined || rankLabel === undefined) {
      continue;
    }

    const compactRank = rankLabel.replace(/\s/g, '');
    if (!RANK_PATTERN.test(compactRank)) {
      continue;
    }

    const match = LABEL_PATTERN.exec(label.replace(/\r\n/g, ' ').trim());
    if (match === null) {
      continue;
    }

    const nome = match[1].trim();
    const uf = match[2];
    const key = normalizeNomeKey(nome, uf);
    if (!municipioNameIndex.has(key)) {
      continue;
    }

    const pibRank = Number.parseInt(compactRank.replace('º', ''), 10);
    results.push({ pibRank, nome, uf });

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}
