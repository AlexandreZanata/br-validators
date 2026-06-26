import { describe, expect, it } from 'vitest';
import { playgroundRouteKey, resolvePlaygroundRoute } from '../lib/playground-routes';

describe('resolvePlaygroundRoute', () => {
  it('resolves home', () => {
    expect(resolvePlaygroundRoute('/')).toEqual({ kind: 'home' });
  });

  it('resolves document routes', () => {
    expect(resolvePlaygroundRoute('/cpf')).toEqual({ kind: 'document', slug: 'cpf' });
    expect(resolvePlaygroundRoute('/rg')).toEqual({ kind: 'document', slug: 'rg' });
    expect(resolvePlaygroundRoute('/pix')).toEqual({ kind: 'document', slug: 'pix' });
  });

  it('maps cartao-credito alias to cartao', () => {
    expect(resolvePlaygroundRoute('/cartao-credito')).toEqual({ kind: 'document', slug: 'cartao' });
  });

  it('resolves platform routes', () => {
    expect(resolvePlaygroundRoute('/detect')).toEqual({ kind: 'platform', slug: 'detect' });
    expect(resolvePlaygroundRoute('/compare')).toEqual({ kind: 'platform', slug: 'compare' });
    expect(resolvePlaygroundRoute('/batch')).toEqual({ kind: 'platform', slug: 'batch' });
    expect(resolvePlaygroundRoute('/diff')).toEqual({ kind: 'platform', slug: 'diff' });
    expect(resolvePlaygroundRoute('/official-sources')).toEqual({
      kind: 'platform',
      slug: 'official-sources',
    });
  });

  it('resolves reference data routes', () => {
    expect(resolvePlaygroundRoute('/data/ibge')).toEqual({ kind: 'reference-data', slug: 'data/ibge' });
    expect(resolvePlaygroundRoute('/data/calendar')).toEqual({ kind: 'reference-data', slug: 'data/calendar' });
    expect(resolvePlaygroundRoute('/data/bancos')).toEqual({ kind: 'reference-data', slug: 'data/bancos' });
    expect(resolvePlaygroundRoute('/data/fiscal')).toEqual({ kind: 'reference-data', slug: 'data/fiscal' });
    expect(resolvePlaygroundRoute('/data/payroll')).toEqual({ kind: 'reference-data', slug: 'data/payroll' });
    expect(resolvePlaygroundRoute('/data/finance')).toEqual({ kind: 'reference-data', slug: 'data/finance' });
    expect(resolvePlaygroundRoute('/data/trade')).toEqual({ kind: 'reference-data', slug: 'data/trade' });
    expect(resolvePlaygroundRoute('/data/logistics')).toEqual({ kind: 'reference-data', slug: 'data/logistics' });
  });

  it('builds stable route keys', () => {
    expect(playgroundRouteKey({ kind: 'home' })).toBe('home');
    expect(playgroundRouteKey({ kind: 'document', slug: 'cpf' })).toBe('document:cpf');
  });
});
