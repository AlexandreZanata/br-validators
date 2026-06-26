/**
 * Bacen SGS série 432 — Meta Selic definida pelo Copom.
 * @see https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json
 */

export const BCB_SELIC_DATASET_URL =
  'https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom';

export const BCB_SELIC_SGS_API_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json';

export const BCB_SELIC_SGS_CONSULTA_URL =
  'https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432';

export const BCB_SELIC_COPOM_URL = 'https://www.bcb.gov.br/controleinflacao/copom';

export const SELIC_SGS_SERIE = 432;

export const SELIC_ROLLING_CALENDAR_DAYS = 90;

export const SELIC_MIN_RECORDS = 80;

export const SELIC_MAX_RECORDS = 95;

export interface SgsSelicApiRow {
  data: string;
  valor: string;
}

export interface SelicMetaRecord {
  data: string;
  valor: number;
}

export function formatSgsDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(isoDate);
  if (match === null) {
    return '';
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function parseSgsIsoDate(bacenDate: string): string {
  const trimmed = bacenDate.trim();
  const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(trimmed);
  if (slashMatch !== null) {
    return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(trimmed);
  if (isoMatch !== null) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return '';
}

export function parseSgsValor(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function formatIsoDateUtc(date: Date): string {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function subtractCalendarDays(fromIso: string, calendarDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(fromIso);
  if (match === null || calendarDays < 1) {
    return fromIso;
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() - calendarDays);
  return formatIsoDateUtc(date);
}

export function resolveSelicPeriodBounds(
  endDate: Date,
  calendarDays: number,
): { dataInicial: string; dataFinal: string } | null {
  const dataFinal = formatIsoDateUtc(endDate);
  const dataInicial = subtractCalendarDays(dataFinal, calendarDays - 1);
  if (dataInicial.length === 0 || dataFinal.length === 0) {
    return null;
  }
  return { dataInicial, dataFinal };
}

export function buildSelicRequestUrl(dataInicialIso: string, dataFinalIso: string): string {
  const dataInicial = formatSgsDate(dataInicialIso);
  const dataFinal = formatSgsDate(dataFinalIso);
  if (dataInicial.length === 0 || dataFinal.length === 0) {
    return '';
  }
  return `${BCB_SELIC_SGS_API_URL}&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;
}

export function parseSelicRows(rows: readonly SgsSelicApiRow[]): SelicMetaRecord[] {
  const parsed: SelicMetaRecord[] = [];
  for (const row of rows) {
    const data = parseSgsIsoDate(row.data);
    const valor = parseSgsValor(row.valor);
    if (data.length === 0 || valor === null) {
      continue;
    }
    parsed.push({ data, valor });
  }

  return parsed.sort((left, right) => left.data.localeCompare(right.data));
}

export function mergeSelicRecords(records: readonly SelicMetaRecord[]): SelicMetaRecord[] {
  const byDate = new Map<string, SelicMetaRecord>();
  for (const record of records) {
    byDate.set(record.data, record);
  }
  return [...byDate.values()].sort((left, right) => left.data.localeCompare(right.data));
}
