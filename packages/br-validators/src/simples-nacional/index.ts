export {
  getSimplesAnexos,
  getSimplesAnexo,
  getSimplesFaixa,
  computeSimplesAliquotaEfetiva,
} from './lookup.js';
export {
  CGSN_RESOLUCAO_140_URL,
  PLANALTO_LC123_URL,
  RECEITA_SIMPLES_ANEXO_I_URL,
  SIMPLES_FAIXAS_POR_ANEXO,
  SIMPLES_GOLDEN_ANEXO_COMERCIO,
  SIMPLES_GOLDEN_ANEXO_PROFISSIONAIS,
  SIMPLES_GOLDEN_ANEXO_SERVICOS,
  SIMPLES_MAX_ANEXOS,
  SIMPLES_MAX_RBT12,
  SIMPLES_MIN_ANEXOS,
} from './constants.js';
export type {
  SimplesAnexo,
  SimplesAnexoId,
  SimplesDataVersion,
  SimplesFaixa,
  SimplesFaixaLookup,
} from './types.js';
export { SIMPLES_NACIONAL_DATA_VERSION } from './version.js';
