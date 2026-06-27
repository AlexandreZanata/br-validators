export {
  getAllIssMunicipal,
  getIssMunicipalPorIbge,
  getIssMunicipalPorUf,
  getIssMunicipalPorUfMunicipio,
  getIssMunicipalUfsDisponiveis,
  searchIssMunicipal,
} from './lookup.js';
export {
  getAllIssMunicIbge,
  getIssMunicIbgeCount,
  getIssMunicIbgePorIbge,
  lookupIssMunicipalPorIbge,
  resolveIbgeLc116Fallback,
} from './cascade-lookup.js';
export {
  buildIssMunicipalResult,
  buildIssMunicIbgeResult,
  buildLc116EstimativaResult,
  resolveIssMunicipalFonte,
} from './result.js';
export {
  CNM_LEGISLACAO_URL,
  IBGE_MUNIC_BASE_2024_URL,
  IBGE_MUNIC_PESQUISA_URL,
  IBGE_MUNICIPIO_CODES_URL,
  IBGE_PIB_MUNICIPAL_URL,
  ISS_MUNIC_GOLDEN_ACRELANDIA,
  ISS_MUNIC_IBGE_WARNING,
  ISS_MUNICIPAL_CAPITAL_COUNT,
  ISS_MUNICIPAL_ESTIMATION_WARNING,
  ISS_MUNICIPAL_GOLDEN_BELO_HORIZONTE,
  ISS_MUNICIPAL_GOLDEN_CAMPINAS,
  ISS_MUNICIPAL_GOLDEN_RIO,
  ISS_MUNICIPAL_GOLDEN_SAO_PAULO,
  IBGE_SIDRA_PIB_URL,
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
  ISS_MUNICIPAL_METADATA_ESTIMATIVA,
  ISS_MUNICIPAL_TARGET_COUNT,
  NFSE_NACIONAL_URL,
  PLANALTO_LC116_ART8_URL,
  PLANALTO_LC116_URL,
} from './constants.js';
export type {
  IssMunicipalDataVersion,
  IssMunicipalFonte,
  IssMunicipalResult,
  IssMunicipalRow,
} from './types.js';
export type { IssMunicIbgeDataVersion, IssMunicIbgeRow } from './munic-ibge-types.js';
export { ISS_MUNICIPAL_DATA_VERSION } from './version.js';
export { ISS_MUNIC_IBGE_DATA_VERSION } from './munic-ibge-version.js';
