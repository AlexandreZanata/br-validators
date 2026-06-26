export {
  getSelicHistorico,
  getSelicList,
  getSelicMeta,
  getSelicMetaPorData,
  pickLatestSelicMeta,
} from './lookup.js';
export {
  BCB_SELIC_COPOM_URL,
  BCB_SELIC_DATASET_URL,
  BCB_SELIC_SGS_API_URL,
  BCB_SELIC_SGS_CONSULTA_URL,
  SELIC_EMBED_CALENDAR_DAYS,
  SELIC_GOLDEN_DATA_COPOM,
  SELIC_GOLDEN_VALOR_COPOM,
  SELIC_SGS_SERIE,
  SELIC_STALE_WARNING,
} from './constants.js';
export {
  buildSelicMetaResult,
  getBrazilTodayIso,
  isSelicMetaStale,
  subtractBusinessDays,
} from './staleness.js';
export type {
  SelicDataVersion,
  SelicHistoricoRange,
  SelicLookupOptions,
  SelicMetaObservacao,
  SelicMetaResult,
} from './types.js';
export { SELIC_DATA_VERSION } from './version.js';
