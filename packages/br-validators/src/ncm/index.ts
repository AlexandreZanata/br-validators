export { getAllNcm, getNcms, getNcmPorCodigo, lookupNcmPorCodigo, searchNcm } from './lookup.js';
export { formatNcmDisplay, isValidNcm, validateNcm } from './validate.js';
export {
  NCM_GOLDEN_CAVALOS_REPRODUTORES,
  NCM_GOLDEN_SOJA_SEMENTES,
  NCM_JSON_URL,
  NCM_MAX_LEAF_CODES,
  NCM_MIN_LEAF_CODES,
} from './constants.js';
export type { Ncm, NcmDataVersion } from './types.js';
export { NCM_DATA_VERSION } from './version.js';
