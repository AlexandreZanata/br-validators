export {
  calcularInssMensal,
  getInssAnosDisponiveis,
  getInssFaixaPorSalario,
  getInssTabelaContribuicao,
  roundInssCentavos,
  INSS_DATA_VERSION,
  INSS_DEFAULT_ANO,
  INSS_FAIXAS_POR_TABELA,
  INSS_GOLDEN_CONTRIBUICAO_3000,
  INSS_GOLDEN_SALARIO_3000,
  INSS_ALIQUOTAS_URL,
  INSS_PORTARIA_DOU_URL,
  INSS_PORTARIA_PDF_URL,
  INSS_TETO_2025,
  LEI_10887_URL,
} from './inss/index.js';
export type {
  InssCalculoMensal,
  InssDataVersion,
  InssFaixaContribuicao,
  InssFaixaLookup,
  InssTabelaContribuicao,
} from './inss/types.js';
