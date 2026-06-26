import { describe, expect, it } from 'vitest';

import {
  getIncotermPorCodigo,
  getAllIncoterms,
  ICC_INCOTERMS_2020_URL,
  INCOTERMS_DATA_VERSION,
  INCOTERMS_GOLDEN_FOB,
  INCOTERMS_2020_COUNT,
} from '../../../src/incoterms/index.js';
import vectors from '../../vectors/incoterms.official.json';

describe('Incoterms — official golden vectors', () => {
  it('resolves FOB (Free On Board)', () => {
    const incoterm = getIncotermPorCodigo(vectors.golden.fob.codigo);
    expect(incoterm?.codigo).toBe(INCOTERMS_GOLDEN_FOB);
    expect(incoterm?.nome).toBe(vectors.golden.fob.nome);
    expect(incoterm?.edicao).toBe('2020');
  });

  it('resolves CIF (Cost, Insurance and Freight)', () => {
    const incoterm = getIncotermPorCodigo(vectors.golden.cif.codigo);
    expect(incoterm?.codigo).toBe('CIF');
    expect(incoterm?.nome).toBe(vectors.golden.cif.nome);
    expect(incoterm?.edicao).toBe('2020');
  });

  it('resolves DAP (Delivered at Place)', () => {
    const incoterm = getIncotermPorCodigo(vectors.golden.dap.codigo);
    expect(incoterm?.codigo).toBe('DAP');
    expect(incoterm?.nome).toBe(vectors.golden.dap.nome);
    expect(incoterm?.edicao).toBe('2020');
  });

  it('normalizes Incoterm code case-insensitively', () => {
    expect(getIncotermPorCodigo('fob')?.codigo).toBe('FOB');
  });

  it('returns undefined for unknown or invalid Incoterm codes', () => {
    expect(getIncotermPorCodigo('XXX')).toBeUndefined();
    expect(getIncotermPorCodigo('')).toBeUndefined();
    expect(getIncotermPorCodigo('FO')).toBeUndefined();
  });
});

describe('Incoterms — ICC 2020 static list', () => {
  it('lists all 11 Incoterms 2020 terms', () => {
    const list = getAllIncoterms();
    expect(list.length).toBe(INCOTERMS_2020_COUNT);
    expect(list.length).toBe(vectors.count);
    expect(new Set(list.map((entry) => entry.codigo)).size).toBe(list.length);
    expect(list[0]?.edicao).toBe('2020');
  });

  it('exposes ICC reference URL in metadata', () => {
    expect(INCOTERMS_DATA_VERSION.id).toBe('incoterms');
    expect(INCOTERMS_DATA_VERSION.endpoints).toContain(ICC_INCOTERMS_2020_URL);
    expect(INCOTERMS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(INCOTERMS_DATA_VERSION.contagens.incoterms).toBe(getAllIncoterms().length);
  });
});
