export {
  computeIbptCargaTotal,
  getIbptCargaPorNcmUf,
  getIbptCargas,
  getIbptTabelaAtual,
} from './lookup.js';
export {
  IBPT_GOLDEN_NCM_CAVALOS,
  IBPT_GOLDEN_NCM_CERVEJA,
  IBPT_GOLDEN_NCM_SOJA,
  IBPT_GOLDEN_UF_RJ,
  IBPT_GOLDEN_UF_SP,
  IBPT_GOLDEN_NCMS,
  IBPT_GOLDEN_UFS,
  IBPT_LEI_12741_URL,
  IBPT_MAX_EMBEDDED_CARGAS,
  IBPT_MIN_EMBEDDED_CARGAS,
  IBPT_OFFICIAL_PORTAL_URL,
  IBPT_UF_SIGLAS,
} from './constants.js';
export type { IbptCargaLookup, IbptCargaTributaria, IbptDataVersion } from './types.js';
export { IBPT_DATA_VERSION } from './version.js';
