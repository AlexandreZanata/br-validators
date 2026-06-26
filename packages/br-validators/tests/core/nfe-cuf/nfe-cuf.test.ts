import { describe, expect, it } from 'vitest';

import {
  getAllCuf,
  getCufs,
  getCufPorCodigo,
  getCufPorUf,
  lookupCufPorCodigo,
  IBGE_UF_CODES_URL,
  NFE_CUF_DATA_VERSION,
  NFE_CUF_COUNT,
  NFE_CUF_GOLDEN_SP,
  NFE_CUF_MANUAL_UF_URL,
  NFE_PORTAL_URL,
} from '../../../src/nfe-cuf/index.js';
import vectors from '../../vectors/nfe-cuf.official.json';

describe('NF-e cUF — official golden vectors', () => {
  it('resolves golden SP (cUF 35)', () => {
    const row = getCufPorCodigo(vectors.golden.saoPaulo.codigo);
    expect(row).toEqual({
      codigo: NFE_CUF_GOLDEN_SP,
      uf: 'SP',
      nome: 'São Paulo',
      codigoIbge: '35',
    });
  });

  it('resolves DF and RO golden rows', () => {
    expect(getCufPorCodigo(vectors.golden.distritoFederal.codigo)?.uf).toBe('DF');
    expect(getCufPorCodigo(vectors.golden.rondonia.codigo)?.uf).toBe('RO');
  });

  it('reverse lookup by UF sigla', () => {
    expect(getCufPorUf('sp')?.codigo).toBe('35');
    expect(getCufPorUf('DF')?.nome).toBe('Distrito Federal');
  });

  it('returns undefined for unknown cUF code or UF', () => {
    expect(getCufPorCodigo(vectors.negative.notFound)).toBeUndefined();
    expect(getCufPorCodigo(vectors.negative.invalidFormat)).toBeUndefined();
    expect(getCufPorUf(vectors.negative.invalidUf)).toBeUndefined();
    expect(getCufPorUf('')).toBeUndefined();
  });

  it('lookupCufPorCodigo distinguishes INVALID_FORMAT and NOT_FOUND', () => {
    const invalid = lookupCufPorCodigo(vectors.negative.invalidFormat);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.code).toBe('INVALID_FORMAT');
    }

    const notFound = lookupCufPorCodigo(vectors.negative.notFound);
    expect(notFound.ok).toBe(false);
    if (!notFound.ok) {
      expect(notFound.code).toBe('NOT_FOUND');
    }

    const empty = lookupCufPorCodigo('');
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.code).toBe('INVALID_INPUT');
    }
  });

  it('strips non-digit characters from cUF code input', () => {
    expect(getCufPorCodigo('3-5')?.uf).toBe('SP');
  });
  it('deprecated getCufs aliases getAllCuf', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- coverage for v1 alias removed in v2.0
    expect(getCufs()).toBe(getAllCuf());
  });
});

describe('NF-e cUF — static table', () => {
  it('lists all 27 federative units', () => {
    const list = getAllCuf();
    expect(list.length).toBe(NFE_CUF_COUNT);
    expect(list.length).toBe(vectors.count);
    expect(new Set(list.map((row) => row.codigo)).size).toBe(list.length);
    expect(new Set(list.map((row) => row.uf)).size).toBe(list.length);
  });

  it('covers every official UF sigla', () => {
    const siglas = new Set(getAllCuf().map((row) => row.uf));
    for (const uf of vectors.allUfs) {
      expect(siglas.has(uf)).toBe(true);
      expect(getCufPorUf(uf)?.codigoIbge).toBe(getCufPorUf(uf)?.codigo);
    }
  });

  it('exposes NF-e manual and IBGE cross-ref in metadata', () => {
    expect(NFE_CUF_DATA_VERSION.id).toBe('nfe-cuf');
    expect(NFE_CUF_DATA_VERSION.endpoints).toContain(NFE_CUF_MANUAL_UF_URL);
    expect(NFE_CUF_DATA_VERSION.endpoints).toContain(NFE_PORTAL_URL);
    expect(NFE_CUF_DATA_VERSION.endpoints).toContain(IBGE_UF_CODES_URL);
    expect(NFE_CUF_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(NFE_CUF_DATA_VERSION.contagens.cuf).toBe(getAllCuf().length);
    expect(NFE_CUF_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });
});
