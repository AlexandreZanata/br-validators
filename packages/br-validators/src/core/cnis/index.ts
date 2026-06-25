/**
 * CNIS / NIT validation — modulo 11 with issuer metadata (INSS vs Caixa).
 * @see https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf — RV_03
 */
import { stripNit } from '../../strip/cnis.js';
import type { NitValidationResult } from '../../types/validation-result.js';
import { brandNit } from '../../types/validation-result.js';
import { isValidCnisModulo11 } from './checksum.js';
import { CNIS_LENGTH } from './constants.js';
import { resolveNitMetadata, type NitMetadataOptions } from './issuer.js';

export {
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
} from './constants.js';
export type {
  NitIssuer,
  NitMetadataOptions,
  NitTipo,
} from './issuer.js';
export {
  inferNitIssuer,
  inferNitTipo,
  resolveNitMetadata,
} from './issuer.js';

type FailedResult = Extract<NitValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function hasRepeatedDigits(value: string): boolean {
  const first = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'NIT input is empty');
  }

  const withoutMask = input.replace(/[.-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'NIT contains invalid characters');
  }

  if (stripped.length !== CNIS_LENGTH) {
    return failure('INVALID_LENGTH', `NIT must have ${String(CNIS_LENGTH)} digits after normalization`);
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'NIT with all identical digits is invalid');
  }

  return null;
}

export type ValidateNitOptions = NitMetadataOptions;

export function isValidNit(input: string, options?: ValidateNitOptions): boolean {
  return validateNit(input, options).ok;
}

export function validateNit(input: string, options?: ValidateNitOptions): NitValidationResult {
  const stripped = stripNit(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (!isValidCnisModulo11(stripped)) {
    return failure('INVALID_CHECK_DIGIT', 'NIT check digit is invalid');
  }

  const metadata = resolveNitMetadata(stripped, options);
  return {
    ok: true,
    value: brandNit(stripped),
    format: 'numeric',
    issuer: metadata.issuer,
    tipo: metadata.tipo,
  };
}
