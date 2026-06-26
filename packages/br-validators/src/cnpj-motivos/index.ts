export {
  getMotivoSituacaoCadastralPorCodigo,
  getMotivosSituacaoCadastral,
  lookupMotivoSituacaoCadastralPorCodigo,
} from './lookup.js';
export {
  CNPJ_MOTIVOS_BASE_URL,
  CNPJ_MOTIVOS_GOLDEN_EXTINCAO_VOLUNTARIA,
  CNPJ_MOTIVOS_GOLDEN_INCORPORACAO,
  CNPJ_MOTIVOS_GOLDEN_SEM_MOTIVO,
  CNPJ_MOTIVOS_LAYOUT_URL,
  CNPJ_MOTIVOS_MAX_CODES,
  CNPJ_MOTIVOS_MIN_CODES,
  SITUACAO_CADASTRAL_LABELS,
} from './constants.js';
export type { CnpjMotivosDataVersion, MotivoSituacaoCadastral } from './types.js';
export { CNPJ_MOTIVOS_DATA_VERSION } from './version.js';
