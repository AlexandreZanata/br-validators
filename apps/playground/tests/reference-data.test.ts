import { describe, expect, it } from 'vitest';
import { IBGE_GOLDEN_MUNICIPIO_SP } from '@br-validators/core/ibge';
import {
  TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO,
  TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO,
} from '@br-validators/core/tse-municipios';
import { CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS } from '@br-validators/core/cnaes';
import { CFOP_GOLDEN_COMPRA_COMERCIALIZACAO } from '@br-validators/core/cfop';
import { CBO_GOLDEN_ANALISTA_SISTEMAS } from '@br-validators/core/cbo';
import { NCM_GOLDEN_SOJA_SEMENTES } from '@br-validators/core/ncm';
import { ISS_MUNICIPAL_GOLDEN_SAO_PAULO } from '@br-validators/core/iss-municipal';
import { resolveCatalogDocUrl } from '../lib/reference-data/catalog-docs';
import { FISCAL_MODULES, LOGISTICS_MODULES, TRADE_MODULES } from '../lib/reference-data/govbr-groups';
import { resolveBancoFromInput } from '../lib/reference-data/bancos-lookup';
import { filterMunicipiosByName, getMunicipiosForUf } from '../lib/reference-data/ibge-filter';
import { resolveTseCrossRef } from '../lib/reference-data/tse-lookup';
import { playgroundRouteKey, resolvePlaygroundRoute } from '../lib/playground-routes';

describe('resolvePlaygroundRoute reference data', () => {
  it('resolves data/ibge and data/bancos', () => {
    expect(resolvePlaygroundRoute('/data/ibge')).toEqual({ kind: 'reference-data', slug: 'data/ibge' });
    expect(resolvePlaygroundRoute('/data/calendar')).toEqual({ kind: 'reference-data', slug: 'data/calendar' });
    expect(resolvePlaygroundRoute('/data/bancos')).toEqual({ kind: 'reference-data', slug: 'data/bancos' });
    expect(resolvePlaygroundRoute('/data/catalog')).toEqual({ kind: 'reference-data', slug: 'data/catalog' });
    expect(resolvePlaygroundRoute('/data/fiscal')).toEqual({ kind: 'reference-data', slug: 'data/fiscal' });
    expect(resolvePlaygroundRoute('/data/payroll')).toEqual({ kind: 'reference-data', slug: 'data/payroll' });
    expect(resolvePlaygroundRoute('/data/finance')).toEqual({ kind: 'reference-data', slug: 'data/finance' });
    expect(resolvePlaygroundRoute('/data/trade')).toEqual({ kind: 'reference-data', slug: 'data/trade' });
    expect(resolvePlaygroundRoute('/data/logistics')).toEqual({ kind: 'reference-data', slug: 'data/logistics' });
  });

  it('builds reference-data route keys', () => {
    expect(playgroundRouteKey({ kind: 'reference-data', slug: 'data/ibge' })).toBe('reference-data:data/ibge');
  });
});

describe('IBGE reference data helpers', () => {
  it('returns municipalities for SP', () => {
    const municipios = getMunicipiosForUf('SP');
    expect(municipios.length).toBeGreaterThan(0);
  });

  it('filters municipios by name for SP', () => {
    const municipios = getMunicipiosForUf('SP');
    const filtered = filterMunicipiosByName(municipios, 'São Paulo');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((m) => m.codigo === IBGE_GOLDEN_MUNICIPIO_SP)).toBe(true);
  });
});

describe('Bancos reference data helpers', () => {
  it('resolves COMPE 001 to Banco do Brasil', () => {
    const banco = resolveBancoFromInput('001');
    expect(banco?.codigo).toBe('001');
    expect(banco?.nome).toContain('Brasil');
  });
});

describe('resolveCatalogDocUrl', () => {
  it('prefixes relative docs paths with GitHub base', () => {
    expect(resolveCatalogDocUrl('docs/OFFICIAL-SOURCES.md#moedas')).toBe(
      'https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md#moedas',
    );
  });

  it('keeps absolute URLs unchanged', () => {
    const url = 'https://example.com/doc';
    expect(resolveCatalogDocUrl(url)).toBe(url);
  });
});

describe('Gov.br reference groups', () => {
  it('resolves fiscal golden NF-e cUF SP', () => {
    const module = FISCAL_MODULES.find((entry) => entry.id === 'nfeCuf');
    expect(module?.lookup('35')?.uf).toBe('SP');
    expect(module?.lookup('SP')?.codigo).toBe('35');
  });

  it('resolves fiscal golden natureza juridica', () => {
    const module = FISCAL_MODULES.find((entry) => entry.id === 'naturezaJuridica');
    expect(module?.lookup('2062')?.codigo).toBe('2062');
  });

  it('resolves fiscal CNAE, CFOP, NCM, and CBO golden codes', () => {
    const cnae = FISCAL_MODULES.find((entry) => entry.id === 'cnae');
    const cfop = FISCAL_MODULES.find((entry) => entry.id === 'cfop');
    const ncm = FISCAL_MODULES.find((entry) => entry.id === 'ncm');
    const cbo = FISCAL_MODULES.find((entry) => entry.id === 'cbo');
    expect(cnae?.lookup(CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS)?.codigo).toBe(CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS);
    expect(cfop?.lookup(CFOP_GOLDEN_COMPRA_COMERCIALIZACAO)?.codigo).toBe(CFOP_GOLDEN_COMPRA_COMERCIALIZACAO);
    expect(ncm?.lookup(NCM_GOLDEN_SOJA_SEMENTES)?.codigo).toBe(NCM_GOLDEN_SOJA_SEMENTES);
    expect(cbo?.lookup(CBO_GOLDEN_ANALISTA_SISTEMAS)?.codigo).toBe(CBO_GOLDEN_ANALISTA_SISTEMAS);
  });

  it('resolves fiscal ISS municipal golden São Paulo IBGE code', () => {
    const module = FISCAL_MODULES.find((entry) => entry.id === 'issMunicipal');
    expect(module?.lookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO))?.codigoIbge).toBe(ISS_MUNICIPAL_GOLDEN_SAO_PAULO);
    expect(module?.lookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO))?.warning).toContain('NFSe');
  });

  it('resolves trade golden moeda BRL', () => {
    const module = TRADE_MODULES.find((entry) => entry.id === 'moedas');
    expect(module?.lookup('BRL')?.codigo).toBe('BRL');
  });

  it('resolves logistics golden port and airport', () => {
    const portos = LOGISTICS_MODULES.find((entry) => entry.id === 'portos');
    const aeroportos = LOGISTICS_MODULES.find((entry) => entry.id === 'aeroportos');
    expect(portos?.lookup('BRSSZ')?.codigo).toBe('BRSSZ');
    expect(aeroportos?.lookup('GRU')?.icao).toBe('SBGR');
  });
});

describe('TSE cross-reference helpers', () => {
  it('resolves TSE code to IBGE São Paulo', () => {
    const result = resolveTseCrossRef(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);
    expect(result?.kind).toBe('tse-to-ibge');
    if (result?.kind === 'tse-to-ibge') {
      expect(result.ibgeCodigo).toBe(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO);
    }
  });

  it('resolves IBGE code to TSE codes', () => {
    const result = resolveTseCrossRef(String(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO));
    expect(result?.kind).toBe('ibge-to-tse');
    if (result?.kind === 'ibge-to-tse') {
      expect(result.codigosTse).toContain(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);
    }
  });
});
