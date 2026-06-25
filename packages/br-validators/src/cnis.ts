export {
  inferNitIssuer,
  inferNitTipo,
  isValidNit,
  resolveNitMetadata,
  validateNit,
  CNIS_BASE_LENGTH,
  CNIS_DV_WEIGHTS,
  CNIS_GOLDEN_CAIXA_PIS,
  CNIS_GOLDEN_CAIXA_PIS_MASKED,
  CNIS_GOLDEN_INSS_NIT,
  CNIS_GOLDEN_INSS_NIT_MASKED,
  CNIS_INSS_NIT_SERVICE_URL,
  CNIS_LENGTH,
  CNIS_MASK_PATTERN,
  CNIS_OFFICIAL_VALIDATION_URL,
} from './core/cnis/index.js';
export type {
  NitIssuer,
  NitMetadataOptions,
  NitTipo,
  ValidateNitOptions,
} from './core/cnis/index.js';
export { stripNit } from './strip/cnis.js';
export { formatNit } from './format/cnis.js';
export type {
  DocumentFormat,
  FormatResult,
  Nit,
  NitValidationResult,
  ValidationErrorCode,
} from './types/validation-result.js';
