export {
  calcularIrpfMensal,
  getIrpfAnosDisponiveis,
  getIrpfFaixaPorValor,
  getIrpfTabelaProgressiva,
  roundIrpfCentavos,
} from './tabela.js';
export {
  IRPF_DEFAULT_ANO,
  IRPF_FAIXAS_POR_TABELA,
  IRPF_GOLDEN_BASE_3000,
  IRPF_GOLDEN_IMPOSTO_3000,
  IRPF_TABELA_PROGRESSIVA_MENSAL_URL,
  IRPF_TABELAS_URL,
  LEI_7713_URL,
} from './constants.js';
export type {
  IrpfCalculoMensal,
  IrpfDataVersion,
  IrpfFaixaLookup,
  IrpfFaixaProgressiva,
  IrpfTabelaProgressiva,
} from './types.js';
export { IRPF_DATA_VERSION } from './version.js';
