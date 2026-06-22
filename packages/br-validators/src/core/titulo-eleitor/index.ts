/**
 * Título de Eleitor validation — modulo 11 (TSE Res. 20.132/1998 + algorithm cross-checks).
 * @see https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998
 * @see https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador
 * @see http://ghiorzi.org/DVnew.htm#e
 */
import { stripTituloEleitor } from '../../strip/index.js';
import type { TituloEleitorValidationResult, UfCode } from '../../types/validation-result.js';
import { brandTituloEleitor } from '../../types/validation-result.js';
import { computeTituloEleitorCheckDigits } from './check-digits.js';
import {
  TITULO_ELEITOR_EXTERIOR_UF_CODE,
  TITULO_ELEITOR_LENGTH,
  TITULO_ELEITOR_LENGTH_EXTENDED,
  TITULO_ELEITOR_MAX_UF_CODE,
  TITULO_ELEITOR_MIN_UF_CODE,
  TITULO_ELEITOR_UF_BY_CODE,
} from './constants.js';
import { parseTituloEleitorParts } from './parse.js';

export {
  TITULO_ELEITOR_ALGORITHM_REF_URL,
  TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL,
  TITULO_ELEITOR_DV1_WEIGHTS_8,
  TITULO_ELEITOR_DV1_WEIGHTS_9,
  TITULO_ELEITOR_DV2_WEIGHTS,
  TITULO_ELEITOR_ETITULO_URL,
  TITULO_ELEITOR_EXTERIOR_UF_CODE,
  TITULO_ELEITOR_GOLDEN_EXTERIOR,
  TITULO_ELEITOR_GOLDEN_MASKED_INPUT,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
  TITULO_ELEITOR_GOLDEN_SP_EXTENDED,
  TITULO_ELEITOR_GOLDEN_SP_SPECIAL,
  TITULO_ELEITOR_LENGTH,
  TITULO_ELEITOR_LENGTH_EXTENDED,
  TITULO_ELEITOR_NORMATIVE_SECONDARY_URL,
  TITULO_ELEITOR_NUMERIC_PATTERN_12,
  TITULO_ELEITOR_NUMERIC_PATTERN_13,
  TITULO_ELEITOR_OFFICIAL_SOURCE_URL,
  TITULO_ELEITOR_SEQUENTIAL_LENGTH,
  TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED,
  TITULO_ELEITOR_SPECIAL_UF_CODES,
  TITULO_ELEITOR_TSE_PORTAL_URL,
  TITULO_ELEITOR_UF_BY_CODE,
} from './constants.js';

type FailedResult = Extract<TituloEleitorValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, ufCode?: number): FailedResult {
  if (ufCode === undefined) {
    return { ok: false, code, message };
  }
  return { ok: false, code, message, ufCode };
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

function isValidUfCode(ufCode: number): boolean {
  return ufCode >= TITULO_ELEITOR_MIN_UF_CODE && ufCode <= TITULO_ELEITOR_MAX_UF_CODE;
}

function resolveUf(ufCode: number): UfCode | undefined {
  return TITULO_ELEITOR_UF_BY_CODE[ufCode];
}

type StructureResult =
  | { ok: false; error: FailedResult }
  | { ok: true; parts: NonNullable<ReturnType<typeof parseTituloEleitorParts>> };

function validateStructure(input: string, stripped: string): StructureResult {
  if (stripped.length === 0) {
    return { ok: false, error: failure('EMPTY_INPUT', 'Título de Eleitor input is empty') };
  }

  if (/[^0-9\s]/.test(input.replace(/\s/g, ''))) {
    return { ok: false, error: failure('INVALID_CHARACTER', 'Título de Eleitor contains invalid characters') };
  }

  if (stripped.length !== TITULO_ELEITOR_LENGTH && stripped.length !== TITULO_ELEITOR_LENGTH_EXTENDED) {
    return {
      ok: false,
      error: failure(
        'INVALID_LENGTH',
        `Título de Eleitor must have ${TITULO_ELEITOR_LENGTH} or ${TITULO_ELEITOR_LENGTH_EXTENDED} digits after normalization`,
      ),
    };
  }

  const parts = parseTituloEleitorParts(stripped);
  if (!parts) {
    return {
      ok: false,
      error: failure(
        'UNSUPPORTED_FORMAT',
        `13-digit Título de Eleitor is only valid for SP (01) or MG (02)`,
      ),
    };
  }

  if (!isValidUfCode(parts.ufCode)) {
    return {
      ok: false,
      error: failure(
        'KNOWN_INVALID_PATTERN',
        `Título de Eleitor UF code ${parts.ufDigits} is not a valid TSE electoral code`,
        parts.ufCode,
      ),
    };
  }

  if (hasRepeatedDigits(stripped)) {
    return {
      ok: false,
      error: failure('KNOWN_INVALID_PATTERN', 'Título de Eleitor with all identical digits is invalid'),
    };
  }

  return { ok: true, parts };
}

function isValidTituloEleitorChecksum(parts: {
  sequential: string;
  ufDigits: string;
  ufCode: number;
  checkDigits: string;
}): boolean {
  const expected = computeTituloEleitorCheckDigits(parts.sequential, parts.ufDigits, parts.ufCode);
  return parts.checkDigits === expected;
}

export function isValidTituloEleitor(input: string): boolean {
  return validateTituloEleitor(input).ok;
}

export function validateTituloEleitor(input: string): TituloEleitorValidationResult {
  const stripped = stripTituloEleitor(input);
  const structure = validateStructure(input, stripped);
  if (!structure.ok) {
    return structure.error;
  }

  const { parts } = structure;

  if (!isValidTituloEleitorChecksum(parts)) {
    return failure('INVALID_CHECK_DIGIT', 'Título de Eleitor check digits are invalid', parts.ufCode);
  }

  const uf = resolveUf(parts.ufCode);
  const success: Extract<TituloEleitorValidationResult, { ok: true }> = {
    ok: true,
    value: brandTituloEleitor(stripped),
    format: 'numeric',
    ufCode: parts.ufCode,
  };
  if (uf !== undefined) {
    success.uf = uf;
  } else if (parts.ufCode === TITULO_ELEITOR_EXTERIOR_UF_CODE) {
    success.exterior = true;
  }
  return success;
}
