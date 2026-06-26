import { describe, expect, it } from 'vitest';

import {
  DATA_CATALOG_VERSION,
  DATASET_REGISTRY,
  getDataCatalog,
  getDatasetMetadata,
} from '../../../src/data-catalog/index.js';
import vectors from '../../vectors/ibge.official.json';

describe('Data catalog — transparency API', () => {
  it('lists registered datasets including IBGE, bancos, telefone-ddd, feriados, and fiscal reference data', () => {
    const catalog = getDataCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(17);
    expect(catalog.some((entry) => entry.id === 'ibge')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'bancos')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'aeroportos')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'tse-municipios')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'moedas')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'ptax')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'paises-bacen')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'incoterms')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'telefone-ddd')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'feriados')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cnaes')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cfop')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'natureza-juridica')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cnpj-motivos')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'ibpt')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'nbs')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cest')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cst')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'lc116')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'esocial')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'simples-nacional')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'ncm')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cbo')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'cep-faixas')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'portos')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'anp-combustiveis')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'pncp-reference')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'transparencia-snapshots')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'nfe-cuf')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'irpf')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'inss')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'selic')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'iss-municipal')).toBe(true);
  });

  it('resolves IBGE metadata by id', () => {
    const ibge = getDatasetMetadata('ibge');
    expect(ibge?.nome).toBe('IBGE Localidades');
    expect(ibge?.endpoints).toContain(vectors.estadosUrl);
    expect(ibge?.alteracoes.adicionados).toEqual(expect.any(Number));
    expect(ibge?.alteracoes.removidos).toEqual(expect.any(Number));
    expect(ibge?.alteracoes.alterados).toEqual(expect.any(Number));
  });

  it('returns undefined for unknown dataset id', () => {
    expect(getDatasetMetadata('unknown-dataset')).toBeUndefined();
  });

  it('exposes catalog version with registry count', () => {
    expect(DATA_CATALOG_VERSION.totalDatasets).toBe(DATASET_REGISTRY.length);
    expect(DATA_CATALOG_VERSION.totalDatasets).toBe(getDataCatalog().length);
  });
});
