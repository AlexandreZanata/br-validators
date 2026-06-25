export {
  applyEanMask,
  computeGs1Modulo10CheckDigit,
  computeGs1Modulo10Sum,
  detectEanFormat,
  isValidEan,
  isValidGs1Modulo10,
  passesGs1Modulo10,
  validateEan,
  EAN_8_LENGTH,
  EAN_13_LENGTH,
  EAN_GOLDEN_13,
  EAN_GOLDEN_13_MASKED,
  EAN_GOLDEN_8,
  EAN_GOLDEN_8_MASKED,
  EAN_OFFICIAL_SOURCE_URL,
} from './core/ean/index.js';
export type { EanFormat } from './core/ean/index.js';
export { stripEan } from './strip/ean.js';
export { formatEan } from './format/ean.js';
export type {
  DocumentFormat,
  Ean,
  EanValidationResult,
  FormatResult,
  ValidationErrorCode,
} from './types/validation-result.js';
