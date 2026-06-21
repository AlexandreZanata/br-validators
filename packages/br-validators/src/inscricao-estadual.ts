export {
  formatInscricaoEstadual,
  getIeOfficialSourceUrl,
  isValidInscricaoEstadual,
  stripInscricaoEstadual,
  validateInscricaoEstadual,
  validateIeDf,
  validateIeMt,
  validateIeSp,
  IE_DF_GOLDEN,
  IE_DF_GOLDEN_MASKED,
  IE_DF_LENGTH,
  IE_DF_OFFICIAL_SOURCE_URL,
  IE_MT_GOLDEN_CANONICAL,
  IE_MT_GOLDEN_LEGACY,
  IE_MT_OFFICIAL_SOURCE_URL,
  IE_OFFICIAL_SOURCE_URLS,
  IE_SP_GOLDEN,
  IE_SP_GOLDEN_MASKED,
  IE_SP_OFFICIAL_SOURCE_URL,
  IE_SUPPORTED_UFS,
} from './core/inscricao-estadual/index.js';
export type { ValidateInscricaoEstadualOptions } from './core/inscricao-estadual/index.js';
export type {
  InscricaoEstadual,
  InscricaoEstadualValidationResult,
  UfCode,
} from './types/validation-result.js';
