/**
 * Parse RFB CNPJ open-data Motivos CSV (semicolon-delimited, quoted, Latin-1).
 * @see https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/
 */

import { parseSemicolonCsvRow } from './parse-semicolon-csv.js';

export interface CnpjMotivoRecord {
  codigo: string;
  descricao: string;
}

function stripQuotes(value: string): string {
  return value.replace(/^"/, '').replace(/"$/, '').trim();
}

function normalizeCodigo(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(2, '0').slice(-2);
}

export function parseCnpjMotivosCsv(csvText: string): CnpjMotivoRecord[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const records: CnpjMotivoRecord[] = [];

  for (const line of lines) {
    const fields = parseSemicolonCsvRow(line).map(stripQuotes);
    if (fields.length < 2) {
      continue;
    }
    const codigo = normalizeCodigo(fields[0] ?? '');
    const descricao = fields[1] ?? '';
    if (codigo.length !== 2 || descricao.length === 0) {
      continue;
    }
    records.push({ codigo, descricao });
  }

  return records.sort((left, right) => left.codigo.localeCompare(right.codigo));
}
