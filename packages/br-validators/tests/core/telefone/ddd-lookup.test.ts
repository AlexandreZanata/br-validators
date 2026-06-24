import { describe, expect, it } from 'vitest';

import { ANATEL_DDDS } from '../../../src/core/telefone/constants.js';
import {
  getDddInfo,
  TELEFONE_DDD_DATA_VERSION,
  validateTelefone,
} from '../../../src/core/telefone/index.js';
import vectors from '../../vectors/telefone-ddd.official.json';

describe('DDD geographic lookup — official golden vectors', () => {
  it('resolves DDD 11 to São Paulo / Sudeste', () => {
    const info = getDddInfo('11');
    expect(info?.ddd).toBe('11');
    expect(info?.uf).toBe(vectors.valid['11'].uf);
    expect(info?.regiao).toBe(vectors.valid['11'].regiao);
    expect(info?.municipios.some((nome) => nome.includes(vectors.valid['11'].municipioContains))).toBe(
      true,
    );
  });

  it('resolves DDD 66 to Mato Grosso / Centro-Oeste', () => {
    const info = getDddInfo('66');
    expect(info?.uf).toBe(vectors.valid['66'].uf);
    expect(info?.regiao).toBe(vectors.valid['66'].regiao);
    expect(info?.municipios.some((nome) => nome.includes(vectors.valid['66'].municipioContains))).toBe(
      true,
    );
  });

  it('resolves DDD 92 to Amazonas / Norte', () => {
    const info = getDddInfo('92');
    expect(info?.uf).toBe(vectors.valid['92'].uf);
    expect(info?.regiao).toBe(vectors.valid['92'].regiao);
    expect(info?.municipios.some((nome) => nome.includes(vectors.valid['92'].municipioContains))).toBe(
      true,
    );
  });

  it('returns undefined for invalid DDD codes', () => {
    for (const invalid of vectors.invalid) {
      expect(getDddInfo(invalid)).toBeUndefined();
    }
    expect(getDddInfo('')).toBeUndefined();
  });

  it('normalizes DDD input with non-digits stripped', () => {
    expect(getDddInfo('(66)')).toEqual(getDddInfo('66'));
  });
});

describe('DDD lookup — validation alignment', () => {
  it('covers every Anatel DDD in embedded dataset', () => {
    for (const ddd of ANATEL_DDDS) {
      expect(getDddInfo(ddd)).toBeDefined();
    }
    expect(TELEFONE_DDD_DATA_VERSION.contagens.ddds).toBe(ANATEL_DDDS.length);
  });

  it('does not break validateTelefone for DDD 66 celular', () => {
    expect(validateTelefone('66999999999').ok).toBe(true);
  });
});

describe('DDD data version — transparency metadata', () => {
  it('exposes capture metadata with official endpoints', () => {
    expect(TELEFONE_DDD_DATA_VERSION.id).toBe('telefone-ddd');
    expect(TELEFONE_DDD_DATA_VERSION.endpoints[0]).toBe(vectors.source);
    expect(TELEFONE_DDD_DATA_VERSION.verificacao.agendamento).toBe('diario');
  });
});
