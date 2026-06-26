/**
 * Bacen SGS série 432 — Meta Selic constants.
 * @see https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom
 */

export const BCB_SELIC_DATASET_URL =
  'https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom';

export const BCB_SELIC_SGS_API_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json';

export const BCB_SELIC_SGS_CONSULTA_URL =
  'https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432';

export const BCB_SELIC_COPOM_URL = 'https://www.bcb.gov.br/controleinflacao/copom';

export const SELIC_SGS_SERIE = 432;

export const SELIC_EMBED_CALENDAR_DAYS = 90;

export const SELIC_STALE_WARNING =
  'Embedded data. For real-time use @br-validators/adapters-selic';

/** Golden meta Selic 14,25% a.a. on 2026-06-18 (COPOM). */
export const SELIC_GOLDEN_DATA_COPOM = '2026-06-18';

export const SELIC_GOLDEN_VALOR_COPOM = 14.25;
