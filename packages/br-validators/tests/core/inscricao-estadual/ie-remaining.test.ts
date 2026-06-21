import { describe, expect, it } from 'vitest';
import {
  IE_OFFICIAL_SOURCE_URLS,
  IE_SUPPORTED_UFS,
  getIeOfficialSourceUrl,
  validateInscricaoEstadual,
  validateIeAc,
  validateIeAl,
  validateIeAm,
  validateIeAp,
  validateIeBa,
  validateIeCe,
  validateIeEs,
  validateIeGo,
  validateIeMa,
  validateIeMg,
  validateIeMs,
  validateIePa,
  validateIePb,
  validateIePe,
  validateIePi,
  validateIePr,
  validateIeRj,
  validateIeRn,
  validateIeRo,
  validateIeRr,
  validateIeRs,
  validateIeSc,
  validateIeSe,
  validateIeTo,
  type UfCode,
} from '../../../src/core/inscricao-estadual/index.js';
import acVectors from '../../vectors/ie.ac.official.json';
import alVectors from '../../vectors/ie.al.official.json';
import amVectors from '../../vectors/ie.am.official.json';
import apVectors from '../../vectors/ie.ap.official.json';
import baVectors from '../../vectors/ie.ba.official.json';
import ceVectors from '../../vectors/ie.ce.official.json';
import esVectors from '../../vectors/ie.es.official.json';
import goVectors from '../../vectors/ie.go.official.json';
import maVectors from '../../vectors/ie.ma.official.json';
import mgVectors from '../../vectors/ie.mg.official.json';
import msVectors from '../../vectors/ie.ms.official.json';
import paVectors from '../../vectors/ie.pa.official.json';
import pbVectors from '../../vectors/ie.pb.official.json';
import peVectors from '../../vectors/ie.pe.official.json';
import piVectors from '../../vectors/ie.pi.official.json';
import prVectors from '../../vectors/ie.pr.official.json';
import rjVectors from '../../vectors/ie.rj.official.json';
import rnVectors from '../../vectors/ie.rn.official.json';
import roVectors from '../../vectors/ie.ro.official.json';
import rrVectors from '../../vectors/ie.rr.official.json';
import rsVectors from '../../vectors/ie.rs.official.json';
import scVectors from '../../vectors/ie.sc.official.json';
import seVectors from '../../vectors/ie.se.official.json';
import toVectors from '../../vectors/ie.to.official.json';

type GoldenCase = {
  uf: UfCode;
  vectors: { golden: { stripped: string; masked?: string } };
  validate: (input: string) => ReturnType<typeof validateIeAc>;
  badDv: string;
  badPrefix?: string;
  badLength?: string;
  legacy11?: string;
};

const REMAINING: GoldenCase[] = [
  { uf: 'AC', vectors: acVectors, validate: validateIeAc, badDv: '0113253877999', badPrefix: '0213253877910', badLength: '01132538779' },
  { uf: 'AL', vectors: alVectors, validate: validateIeAl, badDv: '248682955', badPrefix: '258682954', badLength: '24868295' },
  { uf: 'AM', vectors: amVectors, validate: validateIeAm, badDv: '917050151', badLength: '91705015' },
  { uf: 'AP', vectors: apVectors, validate: validateIeAp, badDv: '039045821', badPrefix: '049045820', badLength: '03904582' },
  { uf: 'BA', vectors: baVectors, validate: validateIeBa, badDv: '63984301', badLength: '639843' },
  { uf: 'CE', vectors: ceVectors, validate: validateIeCe, badDv: '836182317', badLength: '83618231' },
  { uf: 'ES', vectors: esVectors, validate: validateIeEs, badDv: '463921811', badLength: '46392181' },
  { uf: 'GO', vectors: goVectors, validate: validateIeGo, badDv: '112237119', badPrefix: '992237118', badLength: '11223711' },
  { uf: 'MA', vectors: maVectors, validate: validateIeMa, badDv: '123517681', badPrefix: '113517680', badLength: '12351768' },
  { uf: 'MG', vectors: mgVectors, validate: validateIeMg, badDv: '2490944173999', badLength: '24909441739' },
  { uf: 'MS', vectors: msVectors, validate: validateIeMs, badDv: '282570927', badPrefix: '272570926', badLength: '28257092' },
  { uf: 'PA', vectors: paVectors, validate: validateIePa, badDv: '153662477', badPrefix: '163662476', badLength: '15366247' },
  { uf: 'PB', vectors: pbVectors, validate: validateIePb, badDv: '312029064', badLength: '31202906' },
  { uf: 'PE', vectors: peVectors, validate: validateIePe, badDv: '064970638', badLength: '0649706' },
  { uf: 'PI', vectors: piVectors, validate: validateIePi, badDv: '465180427', badLength: '46518042' },
  { uf: 'PR', vectors: prVectors, validate: validateIePr, badDv: '0031595585', badLength: '00315955' },
  { uf: 'RJ', vectors: rjVectors, validate: validateIeRj, badDv: '06540482', badLength: '0654048' },
  { uf: 'RN', vectors: rnVectors, validate: validateIeRn, badDv: '204502293', badPrefix: '214502292', badLength: '20450229' },
  { uf: 'RO', vectors: roVectors, validate: validateIeRo, badDv: '39206839474861', badLength: '3920683947486' },
  { uf: 'RR', vectors: rrVectors, validate: validateIeRr, badDv: '247681048', badPrefix: '257681047', badLength: '24768104' },
  { uf: 'RS', vectors: rsVectors, validate: validateIeRs, badDv: '3288345504', badLength: '328834550' },
  { uf: 'SC', vectors: scVectors, validate: validateIeSc, badDv: '632480719', badLength: '63248071' },
  { uf: 'SE', vectors: seVectors, validate: validateIeSe, badDv: '826594043', badLength: '82659404' },
  { uf: 'TO', vectors: toVectors, validate: validateIeTo, badDv: '27035910939', badLength: '2703591093', legacy11: '270399109388' },
];

describe('Phase 8b golden vectors', () => {
  it.each(REMAINING.map((c) => [c.uf, c] as const))('%s official golden passes', (uf, c) => {
    expect(c.validate(c.vectors.golden.stripped).ok).toBe(true);
    if (c.vectors.golden.masked) {
      expect(c.validate(c.vectors.golden.masked).ok).toBe(true);
    }
    expect(validateInscricaoEstadual(c.vectors.golden.stripped, { uf }).ok).toBe(true);
  });
});

describe('Phase 8b rejections', () => {
  it.each(REMAINING.map((c) => [c.uf, c] as const))('%s rejects bad DV', (_uf, c) => {
    const result = c.validate(c.badDv);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it.each(REMAINING.filter((c) => c.badLength).map((c) => [c.uf, c] as const))(
    '%s rejects wrong length',
    (_uf, c) => {
      const result = c.validate(c.badLength!);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
    },
  );

  it.each(REMAINING.filter((c) => c.badPrefix).map((c) => [c.uf, c] as const))(
    '%s rejects bad prefix',
    (_uf, c) => {
      const result = c.validate(c.badPrefix!);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
    },
  );

  it.each(REMAINING.map((c) => [c.uf, c] as const))('%s rejects empty input', (_uf, c) => {
    const result = c.validate('  ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });

  it.each(REMAINING.map((c) => [c.uf, c] as const))('%s rejects invalid characters', (_uf, c) => {
    const result = c.validate('abc123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });
});

describe('TO legacy 11-digit', () => {
  it('validates legacy format', () => {
    expect(validateIeTo(toVectors.golden.stripped).ok).toBe(true);
  });

  it('validates canonical 9-digit format', () => {
    expect(validateIeTo('000000000').ok).toBe(true);
  });

  it('rejects invalid legacy middle prefix', () => {
    const result = validateIeTo('27045910938');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });
});

describe('RN mod11 edge case', () => {
  it('validates DV zero when mod < 2', () => {
    expect(validateIeRn('200000020').ok).toBe(true);
  });
});

describe('27 UF registry', () => {
  it('lists all Brazilian UFs', () => {
    expect(IE_SUPPORTED_UFS).toHaveLength(27);
  });

  it('has official source URL per UF', () => {
    for (const uf of IE_SUPPORTED_UFS) {
      expect(getIeOfficialSourceUrl(uf)).toBe(IE_OFFICIAL_SOURCE_URLS[uf]);
      expect(getIeOfficialSourceUrl(uf)).toMatch(/^https?:\/\//);
    }
  });
});
