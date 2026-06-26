export {
  getAllAeroportos,
  getAeroportos,
  getAeroportoPorIata,
  getAeroportoPorIcao,
  getAeroportosPorMunicipio,
  lookupAeroportoPorIata,
  lookupAeroportoPorIcao,
} from './lookup.js';
export {
  ANAC_AERODROMOS_PUBLICOS_CSV_URL,
  AEROPORTOS_GOLDEN_IATA_BSB,
  AEROPORTOS_GOLDEN_IATA_CGB,
  AEROPORTOS_GOLDEN_IATA_GIG,
  AEROPORTOS_GOLDEN_IATA_GRU,
  AEROPORTOS_GOLDEN_IATA_SSA,
  AEROPORTOS_GOLDEN_ICAO_BSB,
  AEROPORTOS_GOLDEN_ICAO_CGB,
  AEROPORTOS_GOLDEN_ICAO_GIG,
  AEROPORTOS_GOLDEN_ICAO_GRU,
  AEROPORTOS_GOLDEN_ICAO_SSA,
  AEROPORTOS_MAX_AERODROMOS,
  AEROPORTOS_MIN_AERODROMOS,
  AEROPORTOS_MIN_WITH_IATA,
} from './constants.js';
export type { Aeroporto, AeroportosDataVersion } from './types.js';
export { AEROPORTOS_DATA_VERSION } from './version.js';
