import { describe, expect, it } from 'vitest';
import {
  EAN_GOLDEN_13,
  EAN_GOLDEN_13_MASKED,
  EAN_GOLDEN_8,
  EAN_GOLDEN_8_MASKED,
  EAN_OFFICIAL_SOURCE_URL,
  applyEanMask,
  computeGs1Modulo10CheckDigit,
  computeGs1Modulo10Sum,
  detectEanFormat,
  isValidEan,
  isValidGs1Modulo10,
  passesGs1Modulo10,
  validateEan,
} from '../../../src/core/ean/index.js';
import { formatEan } from '../../../src/format/ean.js';
import { stripEan } from '../../../src/strip/ean.js';
import vectors from '../../vectors/ean.official.json';

describe('GS1 modulo-10 — EAN/UPC check digit', () => {
  it('passes official EAN-13 walkthrough 4006381333931', () => {
    expect(passesGs1Modulo10(EAN_GOLDEN_13)).toBe(true);
    expect(passesGs1Modulo10(vectors.modulo10Walkthrough.valid)).toBe(true);
    expect(computeGs1Modulo10Sum(EAN_GOLDEN_13.slice(0, -1))).toBe(89);
    expect(computeGs1Modulo10CheckDigit(EAN_GOLDEN_13.slice(0, -1))).toBe(1);
  });

  it('fails walkthrough with wrong check digit 4006381333930', () => {
    expect(passesGs1Modulo10(vectors.modulo10Walkthrough.invalid)).toBe(false);
  });

  it('returns check digit 0 when weighted sum is a multiple of 10', () => {
    expect(computeGs1Modulo10CheckDigit('0000000')).toBe(0);
  });
});

describe('EAN golden vectors', () => {
  it('validates EAN-13 golden', () => {
    expect(isValidEan(EAN_GOLDEN_13)).toBe(true);
    expect(isValidEan(vectors.ean13.canonical)).toBe(true);
    const result = validateEan(EAN_GOLDEN_13);
    expect(result).toEqual({
      ok: true,
      value: EAN_GOLDEN_13,
      format: 'ean-13',
    });
  });

  it('validates masked EAN-13 golden', () => {
    expect(isValidEan(EAN_GOLDEN_13_MASKED)).toBe(true);
    expect(isValidEan(vectors.ean13.masked)).toBe(true);
    expect(isValidGs1Modulo10(EAN_GOLDEN_13_MASKED)).toBe(true);
  });

  it('validates EAN-8 golden', () => {
    expect(isValidEan(EAN_GOLDEN_8)).toBe(true);
    const result = validateEan(EAN_GOLDEN_8);
    expect(result).toEqual({
      ok: true,
      value: EAN_GOLDEN_8,
      format: 'ean-8',
    });
  });

  it('validates masked EAN-8 golden', () => {
    expect(isValidEan(EAN_GOLDEN_8_MASKED)).toBe(true);
    expect(isValidEan(vectors.ean8.masked)).toBe(true);
  });

  it('exports official source URL', () => {
    expect(EAN_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('detectEanFormat', () => {
  it('detects ean-13 and ean-8 from stripped length', () => {
    expect(detectEanFormat(EAN_GOLDEN_13)).toBe('ean-13');
    expect(detectEanFormat(EAN_GOLDEN_8)).toBe('ean-8');
    expect(detectEanFormat('12345')).toBeNull();
  });
});

describe('formatEan', () => {
  it('formats valid EAN-13 and EAN-8', () => {
    expect(formatEan(EAN_GOLDEN_13)).toEqual({ ok: true, formatted: EAN_GOLDEN_13_MASKED });
    expect(formatEan(EAN_GOLDEN_8)).toEqual({ ok: true, formatted: EAN_GOLDEN_8_MASKED });
  });

  it('returns validation error for invalid input', () => {
    const result = formatEan(vectors.modulo10Walkthrough.invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });
});

describe('stripEan', () => {
  it('removes mask characters', () => {
    expect(stripEan(EAN_GOLDEN_13_MASKED)).toBe(EAN_GOLDEN_13);
    expect(stripEan(EAN_GOLDEN_8_MASKED)).toBe(EAN_GOLDEN_8);
  });
});

describe('isValidGs1Modulo10', () => {
  it('returns false for invalid length or characters', () => {
    expect(isValidGs1Modulo10('1234567')).toBe(false);
    expect(isValidGs1Modulo10('4A006381333931')).toBe(false);
  });

  it('returns true for valid masked input', () => {
    expect(isValidGs1Modulo10(EAN_GOLDEN_13_MASKED)).toBe(true);
  });
});

describe('validateEan — structural errors', () => {
  it('rejects empty input', () => {
    const result = validateEan('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid characters', () => {
    const result = validateEan('400638133393A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects invalid length', () => {
    const result = validateEan('1234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects all identical digits', () => {
    const result = validateEan('1111111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects invalid check digit', () => {
    const result = validateEan(vectors.modulo10Walkthrough.invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });
});

describe('applyEanMask', () => {
  it('throws for unsupported lengths', () => {
    expect(() => applyEanMask('123')).toThrow(/EAN must have/);
  });
});
