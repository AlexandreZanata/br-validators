/**
 * Parse NF-e country table distributed as ODS (OpenDocument Spreadsheet).
 * @see http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/NJarYc9nus=
 */

import { extractZipEntry } from './zip-extract.js';
import { type PaisBacenRecord } from './parse-nfe-paises.js';

const STATUS_TOKENS = new Set(['INCLUÍDO', 'INCLUIDO', 'ALTERADO', 'EXCLUÍDO', 'EXCLUIDO']);
const EXCLUDED_STATUS = new Set(['EXCLUÍDO', 'EXCLUIDO']);

function normalizeCodigo(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

function isCountryNameCell(value: string): boolean {
  if (value.length < 2) {
    return false;
  }
  if (STATUS_TOKENS.has(value)) {
    return false;
  }
  if (/\d{2}\/\d{2}\/\d{4}/u.test(value)) {
    return false;
  }
  return /[A-Za-zÀ-ÿ]/u.test(value);
}

function extractOdsRowCells(rowXml: string): string[] {
  const cells: string[] = [];
  const pattern = /<text:p>([^<]*)<\/text:p>/gu;
  let match: RegExpExecArray | null = pattern.exec(rowXml);
  while (match !== null) {
    const cell = match[1].trim();
    if (cell.length > 0) {
      cells.push(cell);
    }
    match = pattern.exec(rowXml);
  }
  return cells;
}

function parseOdsRow(cells: string[]): PaisBacenRecord | null {
  const codeCell = cells.find((cell) => /^\d{1,4}$/u.test(cell));
  if (codeCell === undefined) {
    return null;
  }

  const situacao = cells.find((cell) => STATUS_TOKENS.has(cell));
  if (situacao !== undefined && EXCLUDED_STATUS.has(situacao)) {
    return null;
  }

  const codeIndex = cells.indexOf(codeCell);
  for (let index = codeIndex + 1; index < cells.length; index += 1) {
    const cell = cells[index];
    if (isCountryNameCell(cell)) {
      const codigo = normalizeCodigo(codeCell);
      if (codigo.length !== 4) {
        return null;
      }
      return { codigo, nome: cell };
    }
  }

  return null;
}

export function parseNfePaisesOdsContent(contentXml: string): PaisBacenRecord[] {
  const tablePattern = /<table:table[\s\S]*?<\/table:table>/gu;
  const tables = [...contentXml.matchAll(tablePattern)].map((match) => match[0]);
  const countryTable =
    tables.find((table) => /cPais/i.test(table) && /Nome Pa[ií]s/i.test(table)) ?? contentXml;

  const byCode = new Map<string, PaisBacenRecord>();
  const rows = countryTable.split('<table:table-row');

  for (const row of rows.slice(1)) {
    const record = parseOdsRow(extractOdsRowCells(row));
    if (record === null) {
      continue;
    }
    byCode.set(record.codigo, record);
  }

  return [...byCode.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}

export function parseNfePaisesOdsArchive(archive: Uint8Array): PaisBacenRecord[] {
  const contentXml = new TextDecoder('utf-8').decode(extractZipEntry(archive, 'content.xml'));
  return parseNfePaisesOdsContent(contentXml);
}
