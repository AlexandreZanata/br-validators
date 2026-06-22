/**
 * Código de barras validation — modulo 11 general DV (Anexo X).
 * @see BR-BOLETO-003, BR-BOLETO-004, BR-BOLETO-010
 */
import type { BoletoSituacao, CobrancaBoletoValidationResult } from '../../types/validation-result.js';
import { brandCodigoBarras } from '../../types/validation-result.js';
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_CODE_ISPB_HOLDER,
} from './constants.js';
import { detectBoletoSituacao, toBoletoSituacaoCode } from './detect-situacao.js';
import { computeModulo11BarcodeDv } from './modulo11.js';

type FailedResult = Extract<CobrancaBoletoValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, inputKind: 'codigo-barras' };
}

export function stripCodigoBarras(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateCodigoBarras(input: string): CobrancaBoletoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Código de barras input is empty' };
  }

  if (/[^0-9]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'Código de barras contains invalid characters');
  }

  if (trimmed.length !== BOLETO_CODIGO_BARRAS_LENGTH) {
    return failure('INVALID_LENGTH', `Código de barras must have ${BOLETO_CODIGO_BARRAS_LENGTH} digits`);
  }

  const situacaoKind = detectBoletoSituacao(trimmed);
  if (situacaoKind === 'unknown') {
    const isIspbHolder = trimmed.slice(0, 3) === BOLETO_CODE_ISPB_HOLDER;
    const message = isIspbHolder
      ? 'ISPB holder boleto (code 988) requires currency indicator 0 (Situação 2)'
      : 'Bank boleto currency code must be 9 (Real) for Situação 1';
    return failure('UNSUPPORTED_FORMAT', message);
  }

  if (trimmed.charAt(4) === '0') {
    return failure('INVALID_CHECK_DIGIT', 'Barcode DV cannot be 0');
  }

  const expectedDv = String(computeModulo11BarcodeDv(trimmed.slice(0, 4) + trimmed.slice(5)));
  if (trimmed.charAt(4) !== expectedDv) {
    return failure('INVALID_CHECK_DIGIT', 'Código de barras check digit is invalid');
  }

  const situacao = toBoletoSituacaoCode(situacaoKind) as BoletoSituacao;
  return {
    ok: true,
    value: brandCodigoBarras(trimmed),
    inputKind: 'codigo-barras',
    format: 'codigo-barras',
    situacao,
  };
}
