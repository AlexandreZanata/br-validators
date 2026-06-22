import { describe, expect, it } from 'vitest';
import { playgroundRouteKey, resolvePlaygroundRoute } from '../lib/playground-routes';

describe('resolvePlaygroundRoute', () => {
  it('resolves home', () => {
    expect(resolvePlaygroundRoute('/')).toEqual({ kind: 'home' });
  });

  it('resolves document routes', () => {
    expect(resolvePlaygroundRoute('/cpf')).toEqual({ kind: 'document', slug: 'cpf' });
    expect(resolvePlaygroundRoute('/pix')).toEqual({ kind: 'document', slug: 'pix' });
  });

  it('maps cartao-credito alias to cartao', () => {
    expect(resolvePlaygroundRoute('/cartao-credito')).toEqual({ kind: 'document', slug: 'cartao' });
  });

  it('resolves platform routes', () => {
    expect(resolvePlaygroundRoute('/detect')).toEqual({ kind: 'platform', slug: 'detect' });
  });

  it('builds stable route keys', () => {
    expect(playgroundRouteKey({ kind: 'home' })).toBe('home');
    expect(playgroundRouteKey({ kind: 'document', slug: 'cpf' })).toBe('document:cpf');
  });
});
