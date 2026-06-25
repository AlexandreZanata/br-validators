export {
  getEstados,
  getMunicipios,
  getMunicipioPorCodigo,
} from './lookup.js';
export {
  computeCmunFgCheckDigit,
  parseCmunFg,
  toCmunFg,
} from './cmunfg.js';
export {
  IBGE_ESTADOS_URL,
  IBGE_EXPECTED_ESTADOS,
  IBGE_GOLDEN_ESTADO_SP,
  IBGE_GOLDEN_MUNICIPIO_BRASILIA,
  IBGE_GOLDEN_MUNICIPIO_SORRISO,
  IBGE_GOLDEN_MUNICIPIO_SP,
  IBGE_MIN_MUNICIPIOS,
  IBGE_MUNICIPIO_CODIGOS_URL,
  IBGE_MUNICIPIOS_URL,
  IBGE_OFFICIAL_DOCS_URL,
  IBGE_UF_SIGLAS,
  CMUNFG_GOLDEN_BASE_SAO_PAULO,
  CMUNFG_GOLDEN_EXCEPTION_BOM_PRINCIPIO,
  CMUNFG_GOLDEN_SAO_PAULO,
  NFE_MOC_ANEXO_I_URL,
} from './constants.js';
export type {
  CmunFgParseFailure,
  CmunFgParseFailureReason,
  CmunFgParseResult,
  CmunFgParseSuccess,
  Estado,
  IbgeDataVersion,
  IbgeRegiao,
  Municipio,
} from './types.js';
export { IBGE_DATA_VERSION } from './version.js';
