export {
  getMapeamentoTseIbge,
  getMunicipioIbgePorCodigoTse,
  getCodigosTsePorMunicipio,
  lookupMunicipioIbgePorCodigoTse,
} from './lookup.js';
export {
  TSE_MUNICIPIO_IBGE_ZIP_URL,
  TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO,
  TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO,
  TSE_MUNICIPIOS_MAX_MAPPINGS,
  TSE_MUNICIPIOS_MIN_MAPPINGS,
} from './constants.js';
export type { TseMunicipioMapping, TseMunicipiosDataVersion } from './types.js';
export { TSE_MUNICIPIOS_DATA_VERSION } from './version.js';
