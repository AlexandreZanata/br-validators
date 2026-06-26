import { describe, expect, it } from 'vitest';
import {
  RG_AC_GOLDEN,
  RG_AL_GOLDEN,
  RG_AM_GOLDEN,
  RG_AP_GOLDEN,
  RG_BA_GOLDEN,
  RG_DF_GOLDEN,
  RG_MG_GOLDEN,
  RG_MG_GOLDEN_MASKED,
  RG_MG_GOLDEN_PREFIXED,
  RG_OFFICIAL_SOURCE_URL,
  RG_OFFICIAL_SOURCE_URLS,
  RG_PENDING_UFS,
  RG_PR_GOLDEN,
  RG_RESEARCH_URLS,
  RG_RJ_GOLDEN,
  RG_RJ_GOLDEN_MASKED,
  RG_RS_GOLDEN,
  RG_SC_GOLDEN,
  RG_SP_GOLDEN,
  RG_SP_GOLDEN_MASKED,
  RG_SP_GOLDEN_X,
  RG_SP_GOLDEN_X_MASKED,
  RG_SUPPORTED_UFS,
  RG_UF_RULES,
  applyRgMask,
  applyRgRjStyleMask,
  applyRgScMask,
  applyRgSpStyleMask,
  computeRgMod10AlternatingCheckDigit,
  computeRgSpCheckDigit,
  formatRg,
  getRgOfficialSourceUrl,
  getRgPendingUfs,
  getRgResearchUrl,
  getRgUfRules,
  getRgUfSupport,
  isRgUfImplemented,
  isValidRg,
  stripRg,
  validateRg,
  validateRgAc,
  validateRgAl,
  validateRgAm,
  validateRgAp,
  validateRgBa,
  validateRgDf,
  validateRgMg,
  validateRgPr,
  validateRgRj,
  validateRgRs,
  validateRgSc,
  validateRgSp,
} from '../../../src/core/rg/index.js';
import type { ValidateRgOptions } from '../../../src/core/rg/types.js';
import * as rgBarrel from '../../../src/rg.js';
import { formatRg as formatRgBarrel } from '../../../src/format/rg.js';
import { stripRg as stripRgBarrel } from '../../../src/strip/rg.js';
import acVectors from '../../vectors/rg.ac.official.json';
import alVectors from '../../vectors/rg.al.official.json';
import amVectors from '../../vectors/rg.am.official.json';
import apVectors from '../../vectors/rg.ap.official.json';
import baVectors from '../../vectors/rg.ba.official.json';
import dfVectors from '../../vectors/rg.df.official.json';
import spVectors from '../../vectors/rg.sp.official.json';
import rjVectors from '../../vectors/rg.rj.official.json';
import mgVectors from '../../vectors/rg.mg.official.json';
import prVectors from '../../vectors/rg.pr.official.json';
import rsVectors from '../../vectors/rg.rs.official.json';
import scVectors from '../../vectors/rg.sc.official.json';

describe('RG barrel export', () => {
  it('re-exports public API from rg.ts', () => {
    expect(rgBarrel.validateRg(RG_SP_GOLDEN, { uf: 'SP' }).ok).toBe(true);
    expect(rgBarrel.getRgUfSupport()).toEqual(RG_SUPPORTED_UFS);
  });
});

describe('RG golden vectors — per UF', () => {
  it('validates SP SSP-SP vectors', () => {
    expect(isValidRg(spVectors.valid.raw, { uf: 'SP' })).toBe(true);
    expect(isValidRg(spVectors.valid.masked, { uf: 'SP' })).toBe(true);
    expect(isValidRg(spVectors.validX.raw, { uf: 'SP' })).toBe(true);
    expect(isValidRg(spVectors.validX.masked, { uf: 'SP' })).toBe(true);
    expect(validateRg(spVectors.invalid.raw, { uf: 'SP' }).ok).toBe(false);
    expect(RG_SP_GOLDEN).toBe(spVectors.valid.raw);
    expect(RG_SP_GOLDEN_MASKED).toBe(spVectors.valid.masked);
    expect(RG_SP_GOLDEN_X).toBe(spVectors.validX.raw);
    expect(RG_SP_GOLDEN_X_MASKED).toBe(spVectors.validX.masked);
  });

  it('validates RJ IFP-RJ vectors', () => {
    expect(isValidRg(rjVectors.valid.raw, { uf: 'RJ' })).toBe(true);
    expect(isValidRg(rjVectors.valid.masked, { uf: 'RJ' })).toBe(true);
    expect(validateRg(rjVectors.invalid.raw, { uf: 'RJ' }).ok).toBe(false);
    expect(RG_RJ_GOLDEN).toBe(rjVectors.valid.raw);
    expect(RG_RJ_GOLDEN_MASKED).toBe(rjVectors.valid.masked);
  });

  it('validates MG MaSP vectors', () => {
    expect(isValidRg(mgVectors.valid.raw, { uf: 'MG' })).toBe(true);
    expect(isValidRg(mgVectors.valid.masked, { uf: 'MG' })).toBe(true);
    expect(isValidRg(mgVectors.valid.prefixed, { uf: 'MG' })).toBe(true);
    expect(validateRg(mgVectors.invalid.raw, { uf: 'MG' }).ok).toBe(false);
    expect(RG_MG_GOLDEN).toBe(mgVectors.valid.raw);
    expect(RG_MG_GOLDEN_MASKED).toBe(mgVectors.valid.masked);
    expect(RG_MG_GOLDEN_PREFIXED).toBe(mgVectors.valid.prefixed);
  });

  it('validates PR format-only vectors', () => {
    expect(isValidRg(prVectors.valid.raw, { uf: 'PR' })).toBe(true);
    expect(validateRg(prVectors.invalid.raw, { uf: 'PR' }).ok).toBe(false);
    expect(RG_PR_GOLDEN).toBe(prVectors.valid.raw);
  });

  it('validates RS format-only vectors', () => {
    expect(isValidRg(rsVectors.valid.raw, { uf: 'RS' })).toBe(true);
    expect(validateRg(rsVectors.invalid.raw, { uf: 'RS' }).ok).toBe(false);
    expect(RG_RS_GOLDEN).toBe(rsVectors.valid.raw);
  });

  it('validates SC format-only vectors', () => {
    expect(isValidRg(scVectors.valid.raw, { uf: 'SC' })).toBe(true);
    expect(validateRg(scVectors.invalid.raw, { uf: 'SC' }).ok).toBe(false);
    expect(RG_SC_GOLDEN).toBe(scVectors.valid.raw);
  });

  it('validates BA format-only vectors', () => {
    expect(isValidRg(baVectors.valid.raw, { uf: 'BA' })).toBe(true);
    expect(validateRg(baVectors.invalid.raw, { uf: 'BA' }).ok).toBe(false);
    expect(RG_BA_GOLDEN).toBe(baVectors.valid.raw);
  });

  it('validates AC format-only vectors', () => {
    expect(isValidRg(acVectors.valid.raw, { uf: 'AC' })).toBe(true);
    expect(validateRg(acVectors.invalid.raw, { uf: 'AC' }).ok).toBe(false);
    expect(RG_AC_GOLDEN).toBe(acVectors.valid.raw);
  });

  it('validates AL format-only vectors', () => {
    expect(isValidRg(alVectors.valid.raw, { uf: 'AL' })).toBe(true);
    expect(validateRg(alVectors.invalid.raw, { uf: 'AL' }).ok).toBe(false);
    expect(RG_AL_GOLDEN).toBe(alVectors.valid.raw);
  });

  it('validates AM format-only vectors', () => {
    expect(isValidRg(amVectors.valid.raw, { uf: 'AM' })).toBe(true);
    expect(validateRg(amVectors.invalid.raw, { uf: 'AM' }).ok).toBe(false);
    expect(RG_AM_GOLDEN).toBe(amVectors.valid.raw);
  });

  it('validates AP format-only vectors', () => {
    expect(isValidRg(apVectors.valid.raw, { uf: 'AP' })).toBe(true);
    expect(validateRg(apVectors.invalid.raw, { uf: 'AP' }).ok).toBe(false);
    expect(RG_AP_GOLDEN).toBe(apVectors.valid.raw);
  });

  it('validates DF format-only vectors', () => {
    expect(isValidRg(dfVectors.valid.raw, { uf: 'DF' })).toBe(true);
    expect(validateRg(dfVectors.invalid.raw, { uf: 'DF' }).ok).toBe(false);
    expect(RG_DF_GOLDEN).toBe(dfVectors.valid.raw);
  });

  it('exports official source URLs', () => {
    expect(RG_OFFICIAL_SOURCE_URL).toBe(spVectors.url);
    expect(getRgOfficialSourceUrl('SP')).toBe(RG_OFFICIAL_SOURCE_URLS.SP);
    expect(getRgOfficialSourceUrl('PR')).toBe(prVectors.url);
    expect(getRgOfficialSourceUrl('BA')).toBe(baVectors.url);
    expect(getRgOfficialSourceUrl('AC')).toBe(acVectors.url);
    expect(getRgOfficialSourceUrl('AL')).toBe(alVectors.url);
    expect(getRgOfficialSourceUrl('AM')).toBe(amVectors.url);
    expect(getRgOfficialSourceUrl('AP')).toBe(apVectors.url);
    expect(getRgOfficialSourceUrl('DF')).toBe(dfVectors.url);
  });
});

describe('RG registry', () => {
  it('lists implemented UFs', () => {
    expect(getRgUfSupport()).toEqual(RG_SUPPORTED_UFS);
    expect(getRgUfRules('SP')).toEqual(RG_UF_RULES.SP);
  });

  it('returns UF_NOT_IMPLEMENTED for unsupported UF', () => {
    const result = validateRg('123', { uf: 'CE' as ValidateRgOptions['uf'] });
    expect(result).toEqual({
      ok: false,
      code: 'UF_NOT_IMPLEMENTED',
      message: 'UF CE is not implemented for RG validation',
    });
  });

  it('reports implemented vs pending UFs', () => {
    expect(getRgPendingUfs()).toEqual(RG_PENDING_UFS);
    expect(getRgPendingUfs()).toHaveLength(15);
    expect(isRgUfImplemented('SP')).toBe(true);
    expect(isRgUfImplemented('BA')).toBe(true);
    expect(isRgUfImplemented('AC')).toBe(true);
    expect(isRgUfImplemented('AL')).toBe(true);
    expect(isRgUfImplemented('AM')).toBe(true);
    expect(isRgUfImplemented('AP')).toBe(true);
    expect(isRgUfImplemented('DF')).toBe(true);
    expect(getRgResearchUrl('SP')).toBe(RG_OFFICIAL_SOURCE_URLS.SP);
    expect(getRgResearchUrl('BA')).toBe(RG_OFFICIAL_SOURCE_URLS.BA);
    expect(getRgResearchUrl('AC')).toBe(RG_OFFICIAL_SOURCE_URLS.AC);
    expect(getRgResearchUrl('AL')).toBe(RG_OFFICIAL_SOURCE_URLS.AL);
    expect(getRgResearchUrl('AM')).toBe(RG_OFFICIAL_SOURCE_URLS.AM);
    expect(getRgResearchUrl('AP')).toBe(RG_OFFICIAL_SOURCE_URLS.AP);
    expect(getRgResearchUrl('DF')).toBe(RG_OFFICIAL_SOURCE_URLS.DF);
    expect(getRgResearchUrl('CE')).toBe(RG_RESEARCH_URLS.CE);
    expect(getRgResearchUrl('ZZ' as never)).toBeUndefined();
  });

  it('strips with unsupported UF fallback', () => {
    expect(stripRg('12.3', { uf: 'CE' as ValidateRgOptions['uf'] })).toBe('123');
  });
});

describe('RG check-digit helpers', () => {
  it('computes SP check digit (Ghiorzi walkthrough)', () => {
    expect(computeRgSpCheckDigit('12030001')).toBe('1');
    expect(computeRgSpCheckDigit('00000005')).toBe('X');
  });

  it('computes mod10 alternating check digit (Ghiorzi RJ walkthrough)', () => {
    expect(computeRgMod10AlternatingCheckDigit('2799811')).toBe('1');
  });
});

describe('RG masks', () => {
  it('applies RG masks', () => {
    expect(applyRgSpStyleMask(RG_SP_GOLDEN)).toBe(RG_SP_GOLDEN_MASKED);
    expect(applyRgRjStyleMask(RG_RJ_GOLDEN)).toBe(RG_RJ_GOLDEN_MASKED);
    expect(applyRgScMask(RG_SC_GOLDEN)).toBe(scVectors.valid.masked);
    expect(applyRgMask(RG_SP_GOLDEN, 'SP')).toBe(RG_SP_GOLDEN_MASKED);
    expect(applyRgMask(RG_RJ_GOLDEN, 'RJ')).toBe(RG_RJ_GOLDEN_MASKED);
    expect(applyRgMask(RG_MG_GOLDEN, 'MG')).toBe(RG_MG_GOLDEN_MASKED);
    expect(applyRgMask(RG_MG_GOLDEN_PREFIXED, 'MG')).toBe(`M${RG_MG_GOLDEN_MASKED}`);
    expect(applyRgMask(RG_PR_GOLDEN, 'PR')).toBe(RG_PR_GOLDEN);
    expect(applyRgMask(RG_RS_GOLDEN, 'RS')).toBe(RG_RS_GOLDEN);
    expect(applyRgMask(RG_BA_GOLDEN, 'BA')).toBe(RG_BA_GOLDEN);
    expect(applyRgMask(RG_AC_GOLDEN, 'AC')).toBe(RG_AC_GOLDEN);
    expect(applyRgMask(RG_AL_GOLDEN, 'AL')).toBe(RG_AL_GOLDEN);
    expect(applyRgMask(RG_AM_GOLDEN, 'AM')).toBe(RG_AM_GOLDEN);
    expect(applyRgMask(RG_AP_GOLDEN, 'AP')).toBe(RG_AP_GOLDEN);
    expect(applyRgMask(RG_DF_GOLDEN, 'DF')).toBe(RG_DF_GOLDEN);
  });

  it('throws on invalid mask lengths', () => {
    expect(() => applyRgSpStyleMask('123')).toThrow();
    expect(() => applyRgRjStyleMask('123')).toThrow();
    expect(() => applyRgScMask('123')).toThrow();
  });

  it('formats via formatRg', () => {
    expect(formatRg(RG_SP_GOLDEN, { uf: 'SP' })).toEqual({ ok: true, formatted: RG_SP_GOLDEN_MASKED });
    expect(formatRg(RG_PR_GOLDEN, { uf: 'PR' })).toEqual({ ok: true, formatted: RG_PR_GOLDEN });
    expect(formatRg(RG_BA_GOLDEN, { uf: 'BA' })).toEqual({ ok: true, formatted: RG_BA_GOLDEN });
    expect(formatRg(RG_AC_GOLDEN, { uf: 'AC' })).toEqual({ ok: true, formatted: RG_AC_GOLDEN });
    expect(formatRg(RG_AL_GOLDEN, { uf: 'AL' })).toEqual({ ok: true, formatted: RG_AL_GOLDEN });
    expect(formatRg(RG_AM_GOLDEN, { uf: 'AM' })).toEqual({ ok: true, formatted: RG_AM_GOLDEN });
    expect(formatRg(RG_AP_GOLDEN, { uf: 'AP' })).toEqual({ ok: true, formatted: RG_AP_GOLDEN });
    expect(formatRg(RG_DF_GOLDEN, { uf: 'DF' })).toEqual({ ok: true, formatted: RG_DF_GOLDEN });
    expect(formatRgBarrel(RG_SC_GOLDEN, { uf: 'SC' })).toEqual({
      ok: true,
      formatted: scVectors.valid.masked,
    });
    expect(formatRg('bad', { uf: 'SP' }).ok).toBe(false);
  });
});

describe('RG per-UF edge cases', () => {
  it('SP rejects empty, invalid chars, wrong length, non-digit base', () => {
    expect(validateRgSp('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgSp('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgSp('12345678')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
    expect(validateRgSp('1234567X1')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgSp('120300012')).toMatchObject({ ok: false, code: 'INVALID_CHECK_DIGIT' });
  });

  it('RJ rejects empty, invalid chars, wrong length, bad DV', () => {
    expect(validateRgRj('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgRj('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgRj('1234567')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
    expect(validateRgRj('27998112')).toMatchObject({ ok: false, code: 'INVALID_CHECK_DIGIT' });
  });

  it('MG rejects empty, invalid chars, wrong length, bad DV', () => {
    expect(validateRgMg('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgMg('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgMg('1234567')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
    expect(validateRgMg('M1234567')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
    expect(validateRgMg('M1234567A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgMg('M123456X1')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgMg('27998112')).toMatchObject({ ok: false, code: 'INVALID_CHECK_DIGIT' });
  });

  it('PR rejects empty, invalid chars, wrong length', () => {
    expect(validateRgPr('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgPr('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgPr('1234567')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('RS rejects empty, invalid chars, wrong length', () => {
    expect(validateRgRs('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgRs('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgRs('123456789')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('AC rejects empty, invalid chars, wrong length', () => {
    expect(validateRgAc('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgAc('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgAc('12345')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('AL rejects empty, invalid chars, wrong length', () => {
    expect(validateRgAl('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgAl('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgAl('123456')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('AM rejects empty, invalid chars, wrong length', () => {
    expect(validateRgAm('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgAm('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgAm('12345678')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('AP rejects empty, invalid chars, wrong length', () => {
    expect(validateRgAp('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgAp('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgAp('12345678')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('DF rejects empty, invalid chars, wrong length', () => {
    expect(validateRgDf('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgDf('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgDf('123456')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('BA rejects empty, invalid chars, wrong length', () => {
    expect(validateRgBa('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgBa('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgBa('123456789')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('SC rejects empty, invalid chars, wrong length', () => {
    expect(validateRgSc('')).toMatchObject({ ok: false, code: 'EMPTY_INPUT' });
    expect(validateRgSc('12A')).toMatchObject({ ok: false, code: 'INVALID_CHARACTER' });
    expect(validateRgSc('12345678')).toMatchObject({ ok: false, code: 'INVALID_LENGTH' });
  });

  it('strips per UF via barrel', () => {
    expect(stripRg(RG_SP_GOLDEN_MASKED, { uf: 'SP' })).toBe(RG_SP_GOLDEN);
    expect(stripRg(RG_RJ_GOLDEN_MASKED, { uf: 'RJ' })).toBe(RG_RJ_GOLDEN);
    expect(stripRg(RG_MG_GOLDEN_PREFIXED, { uf: 'MG' })).toBe(RG_MG_GOLDEN_PREFIXED);
    expect(stripRgBarrel(RG_PR_GOLDEN, { uf: 'PR' })).toBe(RG_PR_GOLDEN);
    expect(stripRg(RG_RS_GOLDEN, { uf: 'RS' })).toBe(RG_RS_GOLDEN);
    expect(stripRg(RG_SC_GOLDEN, { uf: 'SC' })).toBe(RG_SC_GOLDEN);
    expect(stripRg(RG_BA_GOLDEN, { uf: 'BA' })).toBe(RG_BA_GOLDEN);
    expect(stripRg(RG_AC_GOLDEN, { uf: 'AC' })).toBe(RG_AC_GOLDEN);
    expect(stripRg(RG_AL_GOLDEN, { uf: 'AL' })).toBe(RG_AL_GOLDEN);
    expect(stripRg(RG_AM_GOLDEN, { uf: 'AM' })).toBe(RG_AM_GOLDEN);
    expect(stripRg(RG_AP_GOLDEN, { uf: 'AP' })).toBe(RG_AP_GOLDEN);
    expect(stripRg(RG_DF_GOLDEN, { uf: 'DF' })).toBe(RG_DF_GOLDEN);
  });
});
