import { describe, expect, it, vi } from 'vitest';
import {
  IE_DF_GOLDEN,
  IE_SP_GOLDEN,
  applyIeDfMask,
  applyIeSpMask,
  formatInscricaoEstadual,
  normalizeMtToCanonical,
  padMtLegacy,
  validateIeDf,
  validateIeMt,
  validateInscricaoEstadual,
} from '../../../src/core/inscricao-estadual/index.js';
import {
  computeIeAcCheckDigit,
  computeIeAlCheckDigit,
  computeIeAmCheckDigit,
  computeIeApCheckDigit,
  computeIeBaCheckDigit,
  computeIeBaModule,
  computeIeCeCheckDigit,
  computeIeCyclicMod11CheckDigit,
  computeIeDfCheckDigit,
  computeIeGoCheckDigit,
  computeIeMgFirstCheckDigit,
  computeIeMgSecondCheckDigit,
  computeIeMtCheckDigit,
  computeIePeCheckDigit,
  computeIePrStyleCheckDigit,
  computeIeRoCheckDigit,
  computeIeRrCheckDigit,
  computeIeSpCheckDigit,
  computeIeToCheckDigit,
} from '../../../src/core/inscricao-estadual/modulo-ie.js';
import * as maskModule from '../../../src/core/inscricao-estadual/mask.js';

describe('modulo-ie helpers', () => {
  it('computes MT check digit when remainder > 1', () => {
    expect(computeIeMtCheckDigit('0000000009')).toBe(4);
  });

  it('computes MT check digit when remainder <= 1', () => {
    expect(computeIeMtCheckDigit('0000000000')).toBe(0);
  });

  it('computes SP check digit when remainder is 10', () => {
    expect(computeIeSpCheckDigit('11004249', [1, 3, 4, 5, 6, 7, 8, 10])).toBe(0);
  });

  it('computes DF second check digit with DV1 included', () => {
    const dv1 = computeIeDfCheckDigit(IE_DF_GOLDEN.slice(0, 11), [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const dv2 = computeIeDfCheckDigit(IE_DF_GOLDEN.slice(0, 11), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], true, dv1);
    expect(dv2).toBe(Number(IE_DF_GOLDEN.charAt(12)));
  });

  it('computes CE check digit', () => {
    expect(computeIeCeCheckDigit('83618231')).toBe(6);
  });

  it('computes AL check digit', () => {
    expect(computeIeAlCheckDigit('24868295')).toBe(4);
    expect(computeIeAlCheckDigit('00000006')).toBe(0);
  });

  it('computes AM check digit when sum < 11', () => {
    expect(computeIeAmCheckDigit('00000001')).toBe(9);
  });

  it('computes AM check digit when sum >= 11', () => {
    expect(computeIeAmCheckDigit('91705015')).toBe(0);
  });

  it('computes PR-style dual check digits', () => {
    expect(computeIePrStyleCheckDigit('12345678')).toBe(5);
    expect(computeIePrStyleCheckDigit('123456785')).toBe(0);
  });

  it('computes AC-style dual check digits', () => {
    const body = '01132538779';
    const d1 = computeIeAcCheckDigit(body);
    const d2 = computeIeAcCheckDigit(body + String(d1));
    expect(`${d1}${d2}`).toBe('10');
  });

  it('computes BA module and digits for mod10 path', () => {
    expect(computeIeBaModule('12345600')).toBe(10);
    const body = '123456';
    const d2 = computeIeBaCheckDigit(body, 10);
    const d1 = computeIeBaCheckDigit(body + String(d2), 10);
    expect(d2).toBeGreaterThanOrEqual(0);
    expect(d1).toBeGreaterThanOrEqual(0);
  });

  it('computes BA module for mod11 path', () => {
    expect(computeIeBaModule('71234567')).toBe(11);
  });

  it('computes BA module for 9-digit IE using second digit', () => {
    expect(computeIeBaModule('100000306')).toBe(10);
    expect(computeIeBaModule('160000306')).toBe(11);
  });

  it('computes PE dual check digits', () => {
    const body = '0649706';
    const d1 = computeIePeCheckDigit(body);
    const d2 = computeIePeCheckDigit(body + String(d1));
    expect(`${d1}${d2}`).toBe('39');
    expect(computeIePeCheckDigit('0000000')).toBe(0);
  });

  it('computes cyclic mod11 for RJ and RS', () => {
    expect(computeIeCyclicMod11CheckDigit('0654048', 2, 7)).toBe(1);
    expect(computeIeCyclicMod11CheckDigit('328834550', 2, 9)).toBe(3);
    expect(computeIeCyclicMod11CheckDigit('0000000', 2, 7)).toBe(0);
  });

  it('computes RO check digit with subtract-10 branch', () => {
    expect(computeIeRoCheckDigit('3920683947486')).toBe(0);
    expect(computeIeRoCheckDigit('0000000000000')).toBe(1);
  });

  it('computes GO check digit with special range override', () => {
    expect(computeIeGoCheckDigit('10103113')).toBe(1);
    expect(computeIeGoCheckDigit('11223711')).toBe(8);
    expect(computeIeGoCheckDigit('00000000')).toBe(0);
  });

  it('computes AP check digit for all range branches', () => {
    expect(computeIeApCheckDigit('03000002')).toBe(0);
    expect(computeIeApCheckDigit('03017007')).toBe(1);
    expect(computeIeApCheckDigit('03904582')).toBe(0);
  });

  it('computes RR mod9 check digit', () => {
    expect(computeIeRrCheckDigit('24768104')).toBe(7);
  });

  it('computes TO check digit when rest < 2', () => {
    expect(computeIeToCheckDigit('00000000')).toBe(0);
  });

  it('computes TO check digit when rest >= 2', () => {
    expect(computeIeToCheckDigit('70359109')).toBe(6);
  });

  it('computes MG first check digit when last digit sum is zero', () => {
    expect(computeIeMgFirstCheckDigit('00000000000')).toBe(0);
  });

  it('computes MG second check digit when result >= 10', () => {
    expect(computeIeMgSecondCheckDigit('000000000000')).toBe(0);
  });
});

describe('mask helpers', () => {
  it('throws when SP length is wrong', () => {
    expect(() => applyIeSpMask('123')).toThrow('12 digits');
  });

  it('throws when DF length is wrong', () => {
    expect(() => applyIeDfMask('123')).toThrow('13 digits');
  });
});

describe('padMtLegacy', () => {
  it('pads canonical length to legacy 11', () => {
    expect(padMtLegacy('130000019')).toBe('00130000019');
  });

  it('returns null for out-of-range lengths', () => {
    expect(padMtLegacy('12345678')).toBeNull();
    expect(padMtLegacy('123456789012')).toBeNull();
  });
});

describe('normalizeMtToCanonical', () => {
  it('uses trailing slice when trimmed length is not canonical', () => {
    expect(normalizeMtToCanonical('00000000019')).toBe('000000019');
  });
});

describe('additional rejections', () => {
  it('rejects DF invalid characters before strip', () => {
    const result = validateIeDf('073abc0001009');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects DF wrong length other than legacy 12', () => {
    const result = validateIeDf('0730000100');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects MT invalid characters', () => {
    const result = validateIeMt('13abc00019');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects MT short length', () => {
    const result = validateIeMt('12');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('handles mask failure in formatInscricaoEstadual', () => {
    vi.spyOn(maskModule, 'applyIeSpMask').mockImplementation(() => {
      throw new Error('mask failed');
    });
    const result = formatInscricaoEstadual(IE_SP_GOLDEN, { uf: 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toBe('mask failed');
    }
    vi.restoreAllMocks();
  });

  it('handles non-Error mask failure in formatInscricaoEstadual', () => {
    vi.spyOn(maskModule, 'applyIeDfMask').mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- branch coverage for non-Error throws
      throw 'not-an-error';
    });
    const result = formatInscricaoEstadual(IE_DF_GOLDEN, { uf: 'DF' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('Failed to format Inscrição Estadual');
    }
    vi.restoreAllMocks();
  });

  it('reports missing UF at runtime', () => {
    const result = validateInscricaoEstadual(IE_SP_GOLDEN, { uf: undefined as unknown as 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toContain('undefined');
      expect(result.uf).toBeUndefined();
    }
  });
});
