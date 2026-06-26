/**
 * Boleto arrecadação — FEBRABAN Layout v7 (48-digit linha + 44-digit código de barras).
 * @see docs/use-cases/UC-007-validate-boleto.md
 * @see BOLETO_ARRECADACAO_OFFICIAL_SOURCE_URL
 */
import type { Arrecadacao, ValidationErrorCode } from '../../types/validation-result.js';
import { brandArrecadacao } from '../../types/validation-result.js';
import {
  BOLETO_ARRECADACAO_CODIGO_BARRAS_LENGTH,
  BOLETO_ARRECADACAO_LINHA_LENGTH,
  BOLETO_ARRECADACAO_PRODUCT_ID,
} from './constants.js';
import {
  computeArrecadacaoModulo10Dv,
  getArrecadacaoDvCalculator,
  isArrecadacaoValueType,
  type ArrecadacaoValueType,
} from './arrecadacao-modulo.js';

export type ArrecadacaoInputKind = 'arrecadacao-linha' | 'arrecadacao-codigo-barras';

export type ArrecadacaoValidationResult =
  | {
      ok: true;
      value: Arrecadacao;
      inputKind: ArrecadacaoInputKind;
      format: 'arrecadacao';
      segment: string;
      valueType: ArrecadacaoValueType;
    }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: ArrecadacaoInputKind };

type Failure = Extract<ArrecadacaoValidationResult, { ok: false }>;

function failure(
  code: Failure['code'],
  message: string,
  inputKind?: ArrecadacaoInputKind,
): Failure {
  return { ok: false, code, message, ...(inputKind ? { inputKind } : {}) };
}

export function stripArrecadacao(input: string): string {
  return input.replace(/\D/g, '');
}

function validateGeneralDv(barcode: string): Failure | null {
  const valueType = barcode.charAt(2) as ArrecadacaoValueType;
  const withoutDv = barcode.slice(0, 3) + barcode.slice(4);
  const expected = String(getArrecadacaoDvCalculator(valueType)(withoutDv));
  if (barcode.charAt(3) !== expected) {
    return failure('INVALID_CHECK_DIGIT', 'Arrecadação general check digit is invalid');
  }
  return null;
}

function validateLinhaFieldDvs(linha: string, valueType: ArrecadacaoValueType): Failure | null {
  const dv = getArrecadacaoDvCalculator(valueType);
  const blocks: Array<[number, number, number]> = [
    [0, 11, 1],
    [12, 23, 2],
    [24, 35, 3],
    [36, 47, 4],
  ];

  for (const [start, dvIndex, blockNumber] of blocks) {
    const field = linha.slice(start, start + 11);
    const expected = String(dv(field));
    if (linha.charAt(dvIndex) !== expected) {
      return failure(
        'INVALID_CHECK_DIGIT',
        `Arrecadação linha block ${String(blockNumber)} check digit is invalid`,
        'arrecadacao-linha',
      );
    }
  }
  return null;
}

export function linhaArrecadacaoToCodigoBarras(linha: string): string {
  return [0, 12, 24, 36].map((start) => linha.slice(start, start + 11)).join('');
}

export function validateArrecadacaoLinha(input: string): ArrecadacaoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'Arrecadação input is empty');
  }

  if (/[^0-9.\s]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'Arrecadação linha contains invalid characters', 'arrecadacao-linha');
  }

  const stripped = stripArrecadacao(trimmed);
  if (stripped.length !== BOLETO_ARRECADACAO_LINHA_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `Arrecadação linha must have ${String(BOLETO_ARRECADACAO_LINHA_LENGTH)} digits`,
      'arrecadacao-linha',
    );
  }

  if (!stripped.startsWith(BOLETO_ARRECADACAO_PRODUCT_ID)) {
    return failure('UNSUPPORTED_FORMAT', 'Arrecadação linha must start with 8', 'arrecadacao-linha');
  }

  const valueType = stripped.charAt(2);
  if (!isArrecadacaoValueType(valueType)) {
    return failure('UNSUPPORTED_FORMAT', 'Arrecadação value type must be 6, 7, 8, or 9', 'arrecadacao-linha');
  }

  const fieldError = validateLinhaFieldDvs(stripped, valueType);
  if (fieldError) {
    return fieldError;
  }

  const barcode = linhaArrecadacaoToCodigoBarras(stripped);
  const generalError = validateGeneralDv(barcode);
  if (generalError) {
    return { ...generalError, inputKind: 'arrecadacao-linha' };
  }

  return {
    ok: true,
    value: brandArrecadacao(stripped),
    inputKind: 'arrecadacao-linha',
    format: 'arrecadacao',
    segment: stripped.charAt(1),
    valueType,
  };
}

export function validateArrecadacaoCodigoBarras(input: string): ArrecadacaoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'Arrecadação input is empty');
  }

  if (/[^0-9]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'Arrecadação código de barras contains invalid characters', 'arrecadacao-codigo-barras');
  }

  if (trimmed.length !== BOLETO_ARRECADACAO_CODIGO_BARRAS_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `Arrecadação código de barras must have ${String(BOLETO_ARRECADACAO_CODIGO_BARRAS_LENGTH)} digits`,
      'arrecadacao-codigo-barras',
    );
  }

  if (!trimmed.startsWith(BOLETO_ARRECADACAO_PRODUCT_ID)) {
    return failure('UNSUPPORTED_FORMAT', 'Arrecadação código de barras must start with 8', 'arrecadacao-codigo-barras');
  }

  const valueType = trimmed.charAt(2);
  if (!isArrecadacaoValueType(valueType)) {
    return failure('UNSUPPORTED_FORMAT', 'Arrecadação value type must be 6, 7, 8, or 9', 'arrecadacao-codigo-barras');
  }

  const generalError = validateGeneralDv(trimmed);
  if (generalError) {
    return generalError;
  }

  return {
    ok: true,
    value: brandArrecadacao(trimmed),
    inputKind: 'arrecadacao-codigo-barras',
    format: 'arrecadacao',
    segment: trimmed.charAt(1),
    valueType,
  };
}

export function validateArrecadacao(input: string): ArrecadacaoValidationResult {
  const stripped = stripArrecadacao(input.trim());
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'Arrecadação input is empty');
  }

  if (stripped.length === BOLETO_ARRECADACAO_LINHA_LENGTH) {
    return validateArrecadacaoLinha(input);
  }

  if (stripped.length === BOLETO_ARRECADACAO_CODIGO_BARRAS_LENGTH) {
    return validateArrecadacaoCodigoBarras(input);
  }

  return failure('INVALID_LENGTH', 'Arrecadação input must have 44 or 48 digits');
}

export function isValidArrecadacao(input: string): boolean {
  return validateArrecadacao(input).ok;
}

/** @internal Golden vector helper — builds valid barcode then linha. */
export function buildArrecadacaoGoldenPair(options: {
  segment: string;
  valueType: ArrecadacaoValueType;
  value: string;
  company: string;
  free: string;
}): { barcode: string; linha: string } {
  const head = BOLETO_ARRECADACAO_PRODUCT_ID + options.segment + options.valueType;
  const body =
    options.value.padStart(11, '0') +
    options.company.padStart(4, '0') +
    options.free.padEnd(25, '0').slice(0, 25);
  const withoutDv = head + body;
  const dvFn = getArrecadacaoDvCalculator(options.valueType);
  const barcode = head + String(dvFn(withoutDv)) + body;
  const linha = [0, 11, 22, 33]
    .map((start) => barcode.slice(start, start + 11) + String(dvFn(barcode.slice(start, start + 11))))
    .join('');
  return { barcode, linha };
}

// verify mod10 example from FEBRABAN §07
export const ARRECADACAO_MOD10_GOLDEN_SEQUENCE = '01230067896';
export const ARRECADACAO_MOD10_GOLDEN_DV = computeArrecadacaoModulo10Dv(ARRECADACAO_MOD10_GOLDEN_SEQUENCE);
