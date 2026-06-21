import { describe, expect, it } from 'vitest';
import {
  IE_DF_GOLDEN,
  IE_DF_GOLDEN_MASKED,
  IE_MT_GOLDEN_CANONICAL,
  IE_MT_GOLDEN_LEGACY,
  IE_SP_GOLDEN,
  IE_SP_GOLDEN_MASKED,
  formatInscricaoEstadual,
  getIeOfficialSourceUrl,
  isValidInscricaoEstadual,
  normalizeMtToCanonical,
  stripInscricaoEstadual,
  validateInscricaoEstadual,
  validateIeDf,
  validateIeMt,
  validateIeSp,
} from '../../../src/core/inscricao-estadual/index.js';
import dfVectors from '../../vectors/ie.df.official.json';
import mtVectors from '../../vectors/ie.mt.official.json';
import negativeVectors from '../../vectors/ie.negative.official.json';
import spVectors from '../../vectors/ie.sp.official.json';

describe('golden vectors', () => {
  it('matches SP official vector', () => {
    expect(validateIeSp(spVectors.golden.stripped).ok).toBe(true);
    expect(validateIeSp(spVectors.golden.masked).ok).toBe(true);
    expect(IE_SP_GOLDEN).toBe(spVectors.golden.stripped);
  });

  it('matches MT official vectors', () => {
    expect(validateIeMt(mtVectors.golden.legacy11).ok).toBe(true);
    expect(validateIeMt(mtVectors.golden.canonical9).ok).toBe(true);
    expect(IE_MT_GOLDEN_LEGACY).toBe(mtVectors.golden.legacy11);
    expect(IE_MT_GOLDEN_CANONICAL).toBe(mtVectors.golden.canonical9);
  });

  it('matches DF official vector', () => {
    expect(validateIeDf(dfVectors.golden.stripped).ok).toBe(true);
    expect(validateIeDf(dfVectors.golden.masked).ok).toBe(true);
    expect(IE_DF_GOLDEN).toBe(dfVectors.golden.stripped);
    expect(IE_DF_GOLDEN_MASKED).toBe(dfVectors.golden.masked);
  });
});

describe('validateInscricaoEstadual', () => {
  it('validates SP via union entrypoint', () => {
    const result = validateInscricaoEstadual(IE_SP_GOLDEN_MASKED, { uf: 'SP' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uf).toBe('SP');
      expect(result.value).toBe(IE_SP_GOLDEN);
    }
  });

  it('validates MT legacy and canonical', () => {
    expect(validateInscricaoEstadual(IE_MT_GOLDEN_LEGACY, { uf: 'MT' }).ok).toBe(true);
    const canonical = validateInscricaoEstadual(IE_MT_GOLDEN_CANONICAL, { uf: 'MT' });
    expect(canonical.ok).toBe(true);
    if (canonical.ok) expect(canonical.value).toBe(IE_MT_GOLDEN_CANONICAL);
  });

  it('validates DF via union entrypoint', () => {
    const result = validateInscricaoEstadual(IE_DF_GOLDEN_MASKED, { uf: 'DF' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(IE_DF_GOLDEN);
  });

  it('rejects unknown UF code', () => {
    const result = validateInscricaoEstadual(IE_SP_GOLDEN, { uf: 'XX' as 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('rejects UF mismatch on same value', () => {
    expect(validateInscricaoEstadual(IE_SP_GOLDEN, { uf: 'RJ' }).ok).toBe(false);
  });

  it('wraps isValidInscricaoEstadual', () => {
    expect(isValidInscricaoEstadual(IE_SP_GOLDEN, { uf: 'SP' })).toBe(true);
    expect(isValidInscricaoEstadual('bad', { uf: 'SP' })).toBe(false);
  });
});

describe('rejections', () => {
  it('rejects SP bad DV and rural format', () => {
    expect(validateIeSp(negativeVectors.cases.spBadDv).ok).toBe(false);
    expect(validateIeSp(negativeVectors.cases.spShort).ok).toBe(false);
    const rural = validateIeSp(negativeVectors.cases.spRural);
    expect(rural.ok).toBe(false);
    if (!rural.ok) expect(rural.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('rejects MT bad DV and prefix', () => {
    expect(validateIeMt(negativeVectors.cases.mtBadDv).ok).toBe(false);
    const prefix = validateIeMt(negativeVectors.cases.mtBadPrefix);
    expect(prefix.ok).toBe(false);
    if (!prefix.ok) expect(prefix.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('rejects DF bad DV, legacy 12, and prefix', () => {
    expect(validateIeDf(negativeVectors.cases.dfBadDv).ok).toBe(false);
    const legacy = validateIeDf(negativeVectors.cases.dfLegacy12);
    expect(legacy.ok).toBe(false);
    if (!legacy.ok) expect(legacy.code).toBe('INVALID_LENGTH');
    const prefix = validateIeDf(negativeVectors.cases.dfBadPrefix);
    expect(prefix.ok).toBe(false);
    if (!prefix.ok) expect(prefix.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('rejects empty input per UF', () => {
    const sp = validateIeSp('');
    expect(sp.ok).toBe(false);
    if (!sp.ok) expect(sp.code).toBe('EMPTY_INPUT');
    const mt = validateIeMt('  ');
    expect(mt.ok).toBe(false);
    if (!mt.ok) expect(mt.code).toBe('EMPTY_INPUT');
    const df = validateIeDf('\t');
    expect(df.ok).toBe(false);
    if (!df.ok) expect(df.code).toBe('EMPTY_INPUT');
  });
});

describe('formatInscricaoEstadual', () => {
  it('formats SP and DF masks', () => {
    const sp = formatInscricaoEstadual(IE_SP_GOLDEN, { uf: 'SP' });
    expect(sp.ok).toBe(true);
    if (sp.ok) expect(sp.formatted).toBe(IE_SP_GOLDEN_MASKED);
    const df = formatInscricaoEstadual(IE_DF_GOLDEN, { uf: 'DF' });
    expect(df.ok).toBe(true);
    if (df.ok) expect(df.formatted).toBe(IE_DF_GOLDEN_MASKED);
  });

  it('returns canonical stripped for MT', () => {
    const result = formatInscricaoEstadual(IE_MT_GOLDEN_LEGACY, { uf: 'MT' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.formatted).toBe(IE_MT_GOLDEN_CANONICAL);
  });

  it('propagates validation errors', () => {
    expect(formatInscricaoEstadual('bad', { uf: 'SP' }).ok).toBe(false);
  });
});

describe('helpers', () => {
  it('strips non-digits', () => {
    expect(stripInscricaoEstadual(IE_SP_GOLDEN_MASKED)).toBe(IE_SP_GOLDEN);
  });

  it('normalizes MT legacy to canonical', () => {
    expect(normalizeMtToCanonical('00130000019')).toBe(IE_MT_GOLDEN_CANONICAL);
  });

  it('returns per-UF source URLs', () => {
    expect(getIeOfficialSourceUrl('SP')).toContain('fazenda.sp.gov.br');
    expect(getIeOfficialSourceUrl('MT')).toContain('sefaz.mt.gov.br');
    expect(getIeOfficialSourceUrl('DF')).toContain('fazenda.df.gov.br');
  });
});
