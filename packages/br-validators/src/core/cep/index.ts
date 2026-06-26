/**
 * CEP validation — structural only, no check digit (Correios).
 * @see https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
 * @see docs/VALIDATION-RULES.md BR-CEP-001 — golden vector 01310100
 */
import { stripCep } from '../../strip/index.js';
import type { Cep, ValidationResult } from '../../types/validation-result.js';
import { brandCep } from '../../types/validation-result.js';
import { CEP_LENGTH } from './constants.js';

export {
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_PRIMARY_MASKED,
  CEP_GOLDEN_SECONDARY,
  CEP_OFFICIAL_SOURCE_URL,
  CEP_FAIXA_CNEFE_BASE_URL,
  CEP_FAIXA_GOLDEN_PREFIX_RJ,
  CEP_FAIXA_GOLDEN_PREFIX_SP,
  CEP_FAIXA_MAX_PREFIXES,
  CEP_FAIXA_MIN_PREFIXES,
} from './constants.js';
export { getCepFaixaInfo, getCepFaixas } from './faixa-lookup.js';
export { CEP_FAIXA_DATA_VERSION } from './faixa-version.js';
export type { CepFaixa, CepFaixaDataVersion } from './faixa-types.js';

type FailedResult = Extract<ValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'CEP input is empty');
  }

  const withoutMask = input.replace(/[-\s]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'CEP contains invalid characters');
  }

  if (stripped.length !== CEP_LENGTH) {
    return failure('INVALID_LENGTH', `CEP must have ${CEP_LENGTH} digits after normalization`);
  }

  return null;
}

export function isValidCep(input: string): boolean {
  return validateCep(input).ok;
}

export function validateCep(input: string): ValidationResult<Cep> {
  const stripped = stripCep(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  return { ok: true, value: brandCep(stripped), format: 'numeric' };
}
