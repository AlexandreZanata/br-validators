import { describe, expect, it } from 'vitest';

import {
  getPaisPorCodigoBacen,
  getAllPaisesBacen,
  NFE_PAISES_TABLE_URL,
  PAISES_BACEN_DATA_VERSION,
  PAISES_BACEN_GOLDEN_BRASIL,
} from '../../../src/paises-bacen/index.js';
import vectors from '../../vectors/paises-bacen.official.json';

describe('Paises Bacen — official golden vectors', () => {
  it('resolves Brasil by Bacen code 1058', () => {
    const pais = getPaisPorCodigoBacen(vectors.golden.brasil.codigo);
    expect(pais?.codigo).toBe(PAISES_BACEN_GOLDEN_BRASIL);
    expect(pais?.nome).toContain(vectors.golden.brasil.nomeContains);
  });

  it('normalizes Bacen code with non-significant leading zeros', () => {
    expect(getPaisPorCodigoBacen('1058')?.nome).toContain('BRASIL');
    expect(getPaisPorCodigoBacen('01058')?.codigo).toBe('1058');
  });

  it('returns undefined for unknown or invalid Bacen codes', () => {
    expect(getPaisPorCodigoBacen('9999')).toBeUndefined();
    expect(getPaisPorCodigoBacen('')).toBeUndefined();
    expect(getPaisPorCodigoBacen('abc')).toBeUndefined();
  });
});

describe('Paises Bacen — national coverage', () => {
  it('lists countries within expected NF-e table range', () => {
    const list = getAllPaisesBacen();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minPaises);
    expect(list.length).toBeLessThanOrEqual(vectors.maxPaises);
    expect(new Set(list.map((pais) => pais.codigo)).size).toBe(list.length);
  });

  it('exposes official NF-e endpoint in metadata', () => {
    expect(PAISES_BACEN_DATA_VERSION.id).toBe('paises-bacen');
    expect(PAISES_BACEN_DATA_VERSION.endpoints).toContain(NFE_PAISES_TABLE_URL);
    expect(PAISES_BACEN_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(PAISES_BACEN_DATA_VERSION.contagens.paises).toBe(getAllPaisesBacen().length);
  });
});
