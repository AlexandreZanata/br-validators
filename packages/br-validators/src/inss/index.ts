export {
  calcularInssMensal,
  getInssAnosDisponiveis,
  getInssFaixaPorSalario,
  getInssTabelaContribuicao,
  roundInssCentavos,
} from './tabela.js';
export {
  INSS_ALIQUOTAS_URL,
  INSS_DEFAULT_ANO,
  INSS_FAIXAS_POR_TABELA,
  INSS_GOLDEN_CONTRIBUICAO_3000,
  INSS_GOLDEN_SALARIO_3000,
  INSS_PORTARIA_DOU_URL,
  INSS_PORTARIA_PDF_URL,
  INSS_TETO_2025,
  LEI_10887_URL,
} from './constants.js';
export type {
  InssCalculoMensal,
  InssDataVersion,
  InssFaixaContribuicao,
  InssFaixaLookup,
  InssTabelaContribuicao,
} from './types.js';
export { INSS_DATA_VERSION } from './version.js';
