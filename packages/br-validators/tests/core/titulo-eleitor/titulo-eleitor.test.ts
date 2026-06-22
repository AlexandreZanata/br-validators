import { describe, expect, it } from 'vitest';
import {
  computeTituloEleitorCheckDigits,
  computeTituloEleitorFirstCheckDigit,
  computeTituloEleitorSecondCheckDigit,
  resolveTituloEleitorCheckDigit,
} from '../../../src/core/titulo-eleitor/check-digits.js';
import {
  TITULO_ELEITOR_ALGORITHM_REF_URL,
  TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL,
  TITULO_ELEITOR_ETITULO_URL,
  TITULO_ELEITOR_GOLDEN_EXTERIOR,
  TITULO_ELEITOR_GOLDEN_MASKED_INPUT,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
  TITULO_ELEITOR_GOLDEN_SP_EXTENDED,
  TITULO_ELEITOR_GOLDEN_SP_SPECIAL,
  TITULO_ELEITOR_NORMATIVE_SECONDARY_URL,
  TITULO_ELEITOR_OFFICIAL_SOURCE_URL,
  TITULO_ELEITOR_TSE_PORTAL_URL,
} from '../../../src/core/titulo-eleitor/constants.js';
import { applyTituloEleitorMask } from '../../../src/core/titulo-eleitor/mask.js';
import { isValidTituloEleitor, validateTituloEleitor } from '../../../src/core/titulo-eleitor/index.js';
import { parseTituloEleitorParts } from '../../../src/core/titulo-eleitor/parse.js';
import { stripTituloEleitor } from '../../../src/strip/titulo-eleitor.js';
import { formatTituloEleitor } from '../../../src/format/titulo-eleitor.js';
import vectors from '../../vectors/titulo-eleitor.official.json';

describe('Título de Eleitor golden vectors — Wikipedia PT + Ghiorzi', () => {
  it('validates official primary vector (SC, UF=09)', () => {
    expect(isValidTituloEleitor(TITULO_ELEITOR_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidTituloEleitor(vectors.primary.officialFormatted)).toBe(true);
    const result = validateTituloEleitor(TITULO_ELEITOR_GOLDEN_PRIMARY);
    expect(result).toEqual({
      ok: true,
      value: TITULO_ELEITOR_GOLDEN_PRIMARY,
      format: 'numeric',
      ufCode: 9,
      uf: 'SC',
    });
  });

  it('validates SP special-rule and extended vectors', () => {
    expect(isValidTituloEleitor(TITULO_ELEITOR_GOLDEN_SP_SPECIAL)).toBe(true);
    expect(isValidTituloEleitor(TITULO_ELEITOR_GOLDEN_SP_EXTENDED)).toBe(true);
    const sp = validateTituloEleitor(TITULO_ELEITOR_GOLDEN_SP_SPECIAL);
    expect(sp.ok).toBe(true);
    if (sp.ok) {
      expect(sp.ufCode).toBe(1);
      expect(sp.uf).toBe('SP');
    }
  });

  it('validates exterior vector (UF=28, ZZ)', () => {
    expect(isValidTituloEleitor(TITULO_ELEITOR_GOLDEN_EXTERIOR)).toBe(true);
    expect(isValidTituloEleitor(vectors.exterior.canonical)).toBe(true);
    const result = validateTituloEleitor(TITULO_ELEITOR_GOLDEN_EXTERIOR);
    expect(result).toEqual({
      ok: true,
      value: TITULO_ELEITOR_GOLDEN_EXTERIOR,
      format: 'numeric',
      ufCode: 28,
      exterior: true,
    });
  });

  it('computes exterior DV walkthrough', () => {
    expect(computeTituloEleitorCheckDigits('00000001', '28', 28)).toBe('95');
  });

  it('accepts spaced input decoration', () => {
    expect(isValidTituloEleitor(TITULO_ELEITOR_GOLDEN_MASKED_INPUT)).toBe(true);
    expect(isValidTituloEleitor(vectors.maskedInput.input)).toBe(true);
  });

  it('formats with display mask', () => {
    expect(formatTituloEleitor(TITULO_ELEITOR_GOLDEN_PRIMARY)).toEqual({
      ok: true,
      formatted: vectors.primary.officialFormatted,
    });
    expect(formatTituloEleitor(TITULO_ELEITOR_GOLDEN_SP_EXTENDED)).toEqual({
      ok: true,
      formatted: vectors.spExtended.officialFormatted,
    });
  });

  it('exports official source URLs', () => {
    expect(TITULO_ELEITOR_OFFICIAL_SOURCE_URL).toBe(vectors.url);
    expect(TITULO_ELEITOR_NORMATIVE_SECONDARY_URL).toBe(vectors.normativeSecondaryUrl);
    expect(TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL).toBe(vectors.algorithmWeightsRefUrl);
    expect(TITULO_ELEITOR_ALGORITHM_REF_URL).toBe(vectors.algorithmRefUrl);
    expect(TITULO_ELEITOR_TSE_PORTAL_URL).toBe(vectors.tsePortalUrl);
    expect(TITULO_ELEITOR_ETITULO_URL).toBe(vectors.eTituloUrl);
    expect(vectors.normativeNote).toContain('Res. 20.132/1998');
  });
});

describe('Título de Eleitor check digits', () => {
  it('computes primary DV walkthrough (sequential 00435687, UF=09 → DV 06)', () => {
    expect(computeTituloEleitorFirstCheckDigit('00435687', 9)).toBe(0);
    expect(computeTituloEleitorSecondCheckDigit('09', 0, 9)).toBe(6);
    expect(computeTituloEleitorCheckDigits('00435687', '09', 9)).toBe('06');
  });

  it('applies SP/MG remainder-zero rule', () => {
    expect(resolveTituloEleitorCheckDigit(0, 1)).toBe(1);
    expect(resolveTituloEleitorCheckDigit(0, 2)).toBe(1);
    expect(resolveTituloEleitorCheckDigit(0, 9)).toBe(0);
    expect(resolveTituloEleitorCheckDigit(10, 9)).toBe(0);
  });

  it('computes extended 9-digit sequential for SP', () => {
    expect(computeTituloEleitorCheckDigits('123456789', '01', 1)).toBe('75');
  });
});

describe('parseTituloEleitorParts', () => {
  it('parses 12-digit structure', () => {
    expect(parseTituloEleitorParts(TITULO_ELEITOR_GOLDEN_PRIMARY)).toEqual({
      sequential: '00435687',
      ufDigits: '09',
      ufCode: 9,
      checkDigits: '06',
    });
  });

  it('parses 13-digit SP structure', () => {
    expect(parseTituloEleitorParts(TITULO_ELEITOR_GOLDEN_SP_EXTENDED)).toEqual({
      sequential: '123456789',
      ufDigits: '01',
      ufCode: 1,
      checkDigits: '75',
    });
  });

  it('returns null for unsupported 13-digit UF', () => {
    expect(parseTituloEleitorParts(vectors.unsupportedExtended.canonical)).toBeNull();
  });

  it('returns null for invalid length', () => {
    expect(parseTituloEleitorParts('123')).toBeNull();
  });
});

describe('Título de Eleitor validation errors', () => {
  it('rejects invalid check digit', () => {
    expect(isValidTituloEleitor(vectors.invalidCheckDigit.canonical)).toBe(false);
    const result = validateTituloEleitor(vectors.invalidCheckDigit.canonical);
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'Título de Eleitor check digits are invalid',
      ufCode: 9,
    });
  });

  it('rejects invalid UF code 00', () => {
    expect(isValidTituloEleitor(vectors.invalidUf.canonical)).toBe(false);
    const result = validateTituloEleitor(vectors.invalidUf.canonical);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.ufCode).toBe(0);
    }
  });

  it('rejects unsupported 13-digit non-SP/MG format', () => {
    const result = validateTituloEleitor(vectors.unsupportedExtended.canonical);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects all-same-digit sequence', () => {
    expect(isValidTituloEleitor('111111111111')).toBe(false);
    const result = validateTituloEleitor('111111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects empty input', () => {
    const result = validateTituloEleitor('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid length', () => {
    const result = validateTituloEleitor('1234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid character', () => {
    const result = validateTituloEleitor('00435687090A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });
});

describe('stripTituloEleitor', () => {
  it('strips spaced decoration from input', () => {
    expect(stripTituloEleitor(TITULO_ELEITOR_GOLDEN_MASKED_INPUT)).toBe(TITULO_ELEITOR_GOLDEN_PRIMARY);
  });
});

describe('formatTituloEleitor errors', () => {
  it('rejects invalid without formatted field', () => {
    const result = formatTituloEleitor('invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBeDefined();
    }
  });

  it('rejects empty input', () => {
    const result = formatTituloEleitor('');
    expect(result.ok).toBe(false);
  });
});

describe('applyTituloEleitorMask', () => {
  it('applies 12-digit mask', () => {
    expect(applyTituloEleitorMask(TITULO_ELEITOR_GOLDEN_PRIMARY)).toBe(vectors.primary.officialFormatted);
  });

  it('applies 13-digit mask', () => {
    expect(applyTituloEleitorMask(TITULO_ELEITOR_GOLDEN_SP_EXTENDED)).toBe(
      vectors.spExtended.officialFormatted,
    );
  });

  it('throws when canonical length is wrong', () => {
    expect(() => applyTituloEleitorMask('123')).toThrow(
      'Título de Eleitor must have exactly 12 or 13 digits to format',
    );
  });
});
