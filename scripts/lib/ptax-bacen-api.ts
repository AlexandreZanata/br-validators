/**
 * Bacen Olinda PTAX API helpers — cotacao fetch and parsing.
 * @see https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3
 */

export const BACEN_PTAX_SWAGGER_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3';

export const BACEN_PTAX_COTACAO_DIA_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)';

export const BACEN_PTAX_COTACAO_PERIODO_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)';

export const PTAX_FECHAMENTO_TIPO = 'Fechamento PTAX';

export const PTAX_FECHAMENTO_TIPOS = new Set(['Fechamento PTAX', 'Fechamento']);

export const PTAX_ROLLING_BUSINESS_DAYS = 90;

export interface BacenPtaxApiRow {
  paridadeCompra: number;
  paridadeVenda: number;
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
  tipoBoletim: string;
}

export interface BacenPtaxApiResponse {
  value: BacenPtaxApiRow[];
}

export interface PtaxCotacaoRecord {
  moeda: string;
  data: string;
  paridadeCompra: number;
  paridadeVenda: number;
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
  tipoBoletim: typeof PTAX_FECHAMENTO_TIPO;
}

export function formatBacenPtaxDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(isoDate);
  if (match === null) {
    return '';
  }
  return `${match[2]}-${match[3]}-${match[1]}`;
}

export function parsePtaxIsoDateFromDataHora(dataHoraCotacao: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/u.exec(dataHoraCotacao.trim());
  if (match === null) {
    return '';
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function buildPtaxPeriodoRequestUrl(
  moeda: string,
  dataInicialIso: string,
  dataFinalIso: string,
): string {
  const dataInicial = formatBacenPtaxDate(dataInicialIso);
  const dataFinal = formatBacenPtaxDate(dataFinalIso);
  if (dataInicial.length === 0 || dataFinal.length === 0) {
    return '';
  }
  return `${BACEN_PTAX_COTACAO_PERIODO_URL}?@moeda='${moeda}'&@dataInicial='${dataInicial}'&@dataFinalCotacao='${dataFinal}'&$format=json`;
}

export function collectRecentBusinessDayIsoDates(
  endDate: Date,
  businessDayCount: number,
): string[] {
  const dates: string[] = [];
  const cursor = new Date(endDate);
  const maxIterations = businessDayCount * 3 + 14;

  for (let iteration = 0; iteration < maxIterations && dates.length < businessDayCount; iteration += 1) {
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) {
      dates.push(formatIsoDateUtc(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return dates;
}

export function formatIsoDateUtc(date: Date): string {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolvePtaxPeriodBounds(
  endDate: Date,
  businessDayCount: number,
): { dataInicial: string; dataFinal: string } | null {
  const businessDays = collectRecentBusinessDayIsoDates(endDate, businessDayCount);
  if (businessDays.length === 0) {
    return null;
  }
  const sorted = [...businessDays].sort((left, right) => left.localeCompare(right));
  return {
    dataInicial: sorted[0],
    dataFinal: sorted[sorted.length - 1],
  };
}

export function parsePtaxFechamentoRows(
  moeda: string,
  rows: readonly BacenPtaxApiRow[],
): PtaxCotacaoRecord[] {
  const normalizedMoeda = moeda.trim().toUpperCase();
  const byDate = new Map<string, PtaxCotacaoRecord>();

  for (const row of rows) {
    if (!PTAX_FECHAMENTO_TIPOS.has(row.tipoBoletim)) {
      continue;
    }

    const data = parsePtaxIsoDateFromDataHora(row.dataHoraCotacao);
    if (data.length === 0) {
      continue;
    }

    byDate.set(data, {
      moeda: normalizedMoeda,
      data,
      paridadeCompra: row.paridadeCompra,
      paridadeVenda: row.paridadeVenda,
      cotacaoCompra: row.cotacaoCompra,
      cotacaoVenda: row.cotacaoVenda,
      dataHoraCotacao: row.dataHoraCotacao,
      tipoBoletim: PTAX_FECHAMENTO_TIPO,
    });
  }

  return [...byDate.values()].sort((left, right) => left.data.localeCompare(right.data));
}

export function mergePtaxRecords(records: readonly PtaxCotacaoRecord[]): PtaxCotacaoRecord[] {
  const byKey = new Map<string, PtaxCotacaoRecord>();

  for (const record of records) {
    const key = `${record.moeda}:${record.data}`;
    byKey.set(key, record);
  }

  return [...byKey.values()].sort((left, right) => {
    const moedaCompare = left.moeda.localeCompare(right.moeda);
    if (moedaCompare !== 0) {
      return moedaCompare;
    }
    return left.data.localeCompare(right.data);
  });
}
