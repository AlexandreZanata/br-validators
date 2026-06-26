import { describe, expect, it } from 'vitest';

import {
  getPncpAmparoLegalPorId,
  getAllPncpAmparosLegais,
  getPncpModalidadePorId,
  getAllPncpModalidades,
  getPncpReferenceItem,
  getAllPncpReference,
  normalizePncpCnpj,
  PNCP_CADASTRO_BASE_URL,
  PNCP_CONSULTA_OPENAPI_URL,
  PNCP_GOLDEN_MODALIDADE_ID,
  PNCP_REFERENCE_DATA_VERSION,
  searchPncpReference,
} from '../../../src/pncp-reference/index.js';
import vectors from '../../vectors/pncp-reference.official.json';

describe('PNCP reference — official golden vectors', () => {
  it('resolves modalidade id 6 as Pregão Eletrônico', () => {
    const modalidade = getPncpModalidadePorId(vectors.golden.pregaoEletronico.id);
    expect(modalidade?.id).toBe(PNCP_GOLDEN_MODALIDADE_ID);
    expect(modalidade?.nome).toContain(vectors.golden.pregaoEletronico.nomeContains);
  });

  it('resolves reference items across tables', () => {
    expect(getPncpReferenceItem('modalidades', vectors.golden.pregaoEletronico.id)?.nome).toContain(
      'Pregão',
    );
    expect(getPncpReferenceItem('modalidades', 'invalid')).toBeUndefined();
    expect(getPncpReferenceItem('modalidades', 0)).toBeUndefined();
  });

  it('exposes amparos legais helpers', () => {
    expect(getAllPncpAmparosLegais().length).toBeGreaterThan(0);
    expect(getPncpAmparoLegalPorId(1)?.id).toBe(1);
  });

  it('returns empty search results for blank query', () => {
    expect(searchPncpReference('modalidades', '')).toEqual([]);
  });

  it('normalizes string modalidade ids', () => {
    expect(getPncpModalidadePorId('6')?.id).toBe(PNCP_GOLDEN_MODALIDADE_ID);
  });

  it('respects search limit and matches description text', () => {
    const byDescription = searchPncpReference('amparos-legais', 'pregão', { limit: 1 });
    expect(byDescription).toHaveLength(1);
    const limited = searchPncpReference('modalidades', 'e', {});
    expect(limited.length).toBeGreaterThan(0);
    expect(searchPncpReference('modalidades', 'e', { limit: 1 })).toHaveLength(1);
  });
});

describe('PNCP reference — table coverage', () => {
  it('lists modalidades and amparos legais within expected ranges', () => {
    const modalidades = getAllPncpModalidades();
    expect(modalidades.length).toBeGreaterThanOrEqual(vectors.minModalidades);
    expect(modalidades.length).toBeLessThanOrEqual(vectors.maxModalidades);

    const amparos = getAllPncpAmparosLegais();
    expect(amparos.length).toBeGreaterThanOrEqual(vectors.minAmparosLegais);
  });

  it('searches amparos legais by Lei fragment', () => {
    const results = searchPncpReference('amparos-legais', 'Lei 14.133', { limit: 3 });
    expect(results.length).toBeGreaterThan(0);
  });

  it('resolves amparo legal by id', () => {
    const first = getAllPncpReference('amparos-legais')[0];
    expect(getPncpAmparoLegalPorId(first.id)?.id).toBe(first.id);
  });
});

describe('PNCP reference — CNPJ normalization', () => {
  it('normalizes CNPJ for adapter query via stripCnpj', () => {
    expect(normalizePncpCnpj(vectors.golden.cnpjQuery.formatted)).toBe(
      vectors.golden.cnpjQuery.canonical,
    );
  });
});

describe('PNCP reference — metadata', () => {
  it('exposes PNCP cadastro API in metadata', () => {
    expect(PNCP_REFERENCE_DATA_VERSION.id).toBe('pncp-reference');
    expect(
      PNCP_REFERENCE_DATA_VERSION.endpoints.some((endpoint) => endpoint.includes(PNCP_CADASTRO_BASE_URL)),
    ).toBe(true);
    expect(PNCP_REFERENCE_DATA_VERSION.contagens.modalidades).toBe(getAllPncpModalidades().length);
    expect(PNCP_CONSULTA_OPENAPI_URL).toContain('/api/consulta/');
  });
});
