/**
 * Boleto validation — linha digitável + código de barras (FEBRABAN cobrança).
 * @see docs/use-cases/UC-007-validate-boleto.md
 */
import type { BoletoInputKind, BoletoValidationResult } from '../../types/validation-result.js';
import { brandCodigoBarras, brandLinhaDigitavel } from '../../types/validation-result.js';
import { validateCodigoBarras } from './codigo-barras.js';
import {
  convertCodigoBarrasToLinhaDigits,
  convertLinhaToCodigoBarrasDigits,
} from './convert.js';
import { detectBoletoInputKind } from './detect.js';
import { validateLinhaDigitavel } from './linha-digitavel.js';
import { validateSemanticFields } from './semantic.js';
import { validateArrecadacao } from './arrecadacao.js';

export {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_CODE_ISPB_HOLDER,
  BOLETO_CURRENCY_ISPB,
  BOLETO_CURRENCY_REAL,
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_CODIGO_BARRAS_BB,
  BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2,
  BOLETO_GOLDEN_LINHA_BB_STRIPPED,
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_LAYOUTS_PORTAL_URL,
  BOLETO_LINHA_LENGTH,
  BOLETO_OFFICIAL_SOURCE_URL,
  BOLETO_ARRECADACAO_LINHA_LENGTH,
  BOLETO_ARRECADACAO_CODIGO_BARRAS_LENGTH,
  BOLETO_ARRECADACAO_PRODUCT_ID,
  BOLETO_ARRECADACAO_OFFICIAL_SOURCE_URL,
} from './constants.js';
export { computeModulo10FieldDv } from './modulo10.js';
export { computeModulo11BarcodeDv } from './modulo11.js';
export { detectBoletoInputKind, type DetectedBoletoInputKind } from './detect.js';
export {
  detectBoletoSituacao,
  toBoletoSituacaoCode,
  type BoletoSituacaoCode,
  type BoletoSituacaoKind,
} from './detect-situacao.js';
export {
  convertCodigoBarrasToLinhaDigits,
  convertLinhaToCodigoBarrasDigits,
} from './convert.js';
export {
  formatLinhaDigitavel,
  stripLinhaDigitavel,
  validateLinhaDigitavel,
} from './linha-digitavel.js';
export { applyLinhaDigitavelMask } from './mask.js';
export { stripCodigoBarras, validateCodigoBarras } from './codigo-barras.js';
export { validateFatorVencimento, type FatorVencimentoValidationResult } from './fator-vencimento.js';
export { validateValorDocumento, type ValorDocumentoValidationResult } from './valor-documento.js';
export { validateSemanticFields } from './semantic.js';
export {
  buildArrecadacaoGoldenPair,
  isValidArrecadacao,
  linhaArrecadacaoToCodigoBarras,
  stripArrecadacao,
  validateArrecadacao,
  validateArrecadacaoCodigoBarras,
  validateArrecadacaoLinha,
} from './arrecadacao.js';
export type { ArrecadacaoInputKind, ArrecadacaoValidationResult } from './arrecadacao.js';
export {
  computeArrecadacaoModulo10Dv,
  computeArrecadacaoModulo11Dv,
  getArrecadacaoDvCalculator,
  isArrecadacaoValueType,
} from './arrecadacao-modulo.js';
export type { ArrecadacaoValueType } from './arrecadacao-modulo.js';

export type ValidateBoletoOptions = {
  kind?: BoletoInputKind;
  validateDueFactor?: boolean;
  validateAmount?: boolean;
};

type FailedResult = Extract<BoletoValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, inputKind?: BoletoInputKind): FailedResult {
  return { ok: false, code, message, ...(inputKind ? { inputKind } : {}) };
}

function validateByKind(input: string, kind: BoletoInputKind, options?: ValidateBoletoOptions): BoletoValidationResult {
  const result = kind === 'linha-digitavel' ? validateLinhaDigitavel(input) : validateCodigoBarras(input);
  if (!result.ok) {
    return result;
  }

  const barcode =
    kind === 'linha-digitavel'
      ? convertLinhaToCodigoBarrasDigits(result.value)
      : result.value;

  const semanticError = validateSemanticFields(barcode, options ?? {}, kind);
  if (semanticError) {
    return semanticError;
  }

  return result;
}

export function isValidBoleto(input: string, options?: ValidateBoletoOptions): boolean {
  return validateBoleto(input, options).ok;
}

export function validateBoleto(input: string, options?: ValidateBoletoOptions): BoletoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'Boleto input is empty');
  }

  const detected = detectBoletoInputKind(trimmed);

  if (detected === 'arrecadacao') {
    return validateArrecadacao(trimmed);
  }

  if (options?.kind !== undefined) {
    if (detected !== 'unknown' && detected !== options.kind) {
      return failure(
        'UNSUPPORTED_FORMAT',
        `Boleto detected as ${detected} but forced kind is ${options.kind}`,
        options.kind,
      );
    }
    return validateByKind(trimmed, options.kind, options);
  }

  if (detected === 'unknown') {
    return failure('UNSUPPORTED_FORMAT', 'Boleto input kind could not be determined');
  }

  return validateByKind(trimmed, detected, options);
}

export function convertLinhaToCodigoBarras(input: string): BoletoValidationResult {
  const result = validateLinhaDigitavel(input);
  if (!result.ok) {
    return result;
  }
  const barcode = convertLinhaToCodigoBarrasDigits(result.value);
  return {
    ok: true,
    value: brandCodigoBarras(barcode),
    inputKind: 'codigo-barras',
    format: 'codigo-barras',
    situacao: result.situacao,
  };
}

export function convertCodigoBarrasToLinhaDigitavel(input: string): BoletoValidationResult {
  const result = validateCodigoBarras(input);
  if (!result.ok) {
    return result;
  }
  const linha = convertCodigoBarrasToLinhaDigits(result.value);
  return {
    ok: true,
    value: brandLinhaDigitavel(linha),
    inputKind: 'linha-digitavel',
    format: 'linha-digitavel',
    situacao: result.situacao,
  };
}
