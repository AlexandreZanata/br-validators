/**
 * NF-e cMunFG — 7-digit IBGE municipality code with check-digit rules (field B12).
 * @see https://www.ibge.gov.br/explica/codigos-dos-municipios.php
 * @see NF-e MOC 7.0 Anexo I — campo B12 cMunFG
 */

import { CMUNFG_DV_EXCEPTIONS } from './cmunfg-exceptions.js';
import type { CmunFgParseResult } from './types.js';

const CMUNFG_LENGTH = 7;
const CMUNFG_BASE_LENGTH = 6;

function digitsOnlyFromNumber(codigo: number): string {
  if (!Number.isFinite(codigo) || !Number.isInteger(codigo) || codigo < 0) {
    return '';
  }
  return String(codigo);
}

function normalizeInputDigits(codigo: number | string): string {
  if (typeof codigo === 'number') {
    return digitsOnlyFromNumber(codigo);
  }
  return codigo.trim().replace(/\D/g, '');
}

function hasInvalidCharacters(code: string): boolean {
  return !/^[\d.\-\s]+$/u.test(code.trim());
}

function sumDigitPair(doubled: number): number {
  if (doubled > 9) {
    return Math.floor(doubled / 10) + (doubled % 10);
  }
  return doubled;
}

export function computeCmunFgCheckDigit(base6: string): number | undefined {
  if (!/^\d{6}$/u.test(base6)) {
    return undefined;
  }

  let sum = 0;
  for (let index = 0; index < CMUNFG_BASE_LENGTH; index += 1) {
    const digit = Number.parseInt(base6.charAt(index), 10);
    const position = index + 1;
    if (position % 2 === 0) {
      sum += sumDigitPair(digit * 2);
    } else {
      sum += digit;
    }
  }

  return (10 - (sum % 10)) % 10;
}

function buildCmunFgFromBase6(base6: string): string {
  const exception = CMUNFG_DV_EXCEPTIONS[base6];
  if (exception !== undefined) {
    return String(exception).padStart(CMUNFG_LENGTH, '0');
  }

  const checkDigit = computeCmunFgCheckDigit(base6);
  return `${base6}${String(checkDigit)}`;
}

function padCmunFg(digits: string): string {
  return digits.padStart(CMUNFG_LENGTH, '0');
}

export function toCmunFg(codigo: number | string): string | undefined {
  const digits = normalizeInputDigits(codigo);
  if (digits.length === CMUNFG_BASE_LENGTH) {
    return buildCmunFgFromBase6(digits);
  }
  if (digits.length === CMUNFG_LENGTH) {
    const base6 = digits.slice(0, CMUNFG_BASE_LENGTH);
    const canonical = buildCmunFgFromBase6(base6);
    return padCmunFg(digits) === canonical ? canonical : undefined;
  }
  return undefined;
}

export function parseCmunFg(code: string): CmunFgParseResult {
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'EMPTY_INPUT' };
  }
  if (hasInvalidCharacters(trimmed)) {
    return { ok: false, reason: 'INVALID_CHARS' };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== CMUNFG_LENGTH) {
    return { ok: false, reason: 'INVALID_LENGTH' };
  }

  const padded = padCmunFg(digits);
  const base6 = padded.slice(0, CMUNFG_BASE_LENGTH);
  const checkDigit = Number.parseInt(padded.charAt(CMUNFG_BASE_LENGTH), 10);
  const expected = buildCmunFgFromBase6(base6);
  if (expected !== padded) {
    return { ok: false, reason: 'CHECK_DIGIT_MISMATCH' };
  }

  return {
    ok: true,
    codigo: Number.parseInt(padded, 10),
    base6,
    checkDigit,
  };
}
