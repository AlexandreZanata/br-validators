export {
  getAllAeroportos,
  getAeroportos,
  getAeroportoPorIata,
  getAeroportoPorIcao,
  lookupAeroportoPorIata,
  lookupAeroportoPorIcao,
  getAeroportosPorMunicipio,
  AEROPORTOS_DATA_VERSION,
  ANAC_AERODROMOS_PUBLICOS_CSV_URL,
  AEROPORTOS_GOLDEN_IATA_GRU,
  AEROPORTOS_GOLDEN_IATA_GIG,
  AEROPORTOS_GOLDEN_IATA_BSB,
  AEROPORTOS_GOLDEN_IATA_SSA,
  AEROPORTOS_GOLDEN_IATA_CGB,
} from './aeroportos/index.js';
export type { Aeroporto, AeroportosDataVersion } from './aeroportos/types.js';
