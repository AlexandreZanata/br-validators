import { describe, expect, it } from 'vitest';

import { EXIT } from '../src/constants.js';
import {
  formatIssMunicipalHuman,
  runIssMunicipalList,
  runIssMunicipalLookup,
  runIssMunicipalResolve,
  runIssMunicipalSearch,
} from '../src/commands/iss-municipal/index.js';
import {
  handleIssMunicipalListCli,
  handleIssMunicipalLookupCli,
  handleIssMunicipalResolveCli,
  handleIssMunicipalSearchCli,
} from '../src/handlers.js';
import { ISS_MUNICIPAL_GOLDEN_SAO_PAULO } from '@br-validators/core/iss-municipal';

describe('iss-municipal CLI', () => {
  it('looks up golden São Paulo with disclaimer on stderr', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIssMunicipalLookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO), { json: true, verbose: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; iss: { codigoIbge: number }; capturadoEm?: string };
    expect(parsed.iss.codigoIbge).toBe(ISS_MUNICIPAL_GOLDEN_SAO_PAULO);
    expect(parsed.capturadoEm).toBeDefined();
    expect(io.stderr.length).toBe(0);
  });

  it('omits capturadoEm in json lookup when not verbose', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIssMunicipalLookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO), { json: true, verbose: false }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { capturadoEm?: string };
    expect(parsed.capturadoEm).toBeUndefined();
  });

  it('prints human disclaimer on lookup', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIssMunicipalLookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO), { json: false, verbose: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stderr[0]).toContain('NFSe');
    expect(io.stdout[0]).toContain('São Paulo/SP');
  });

  it('prints verbose human output with leiUrl and capturadoEm', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIssMunicipalLookup(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO), { json: false, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('leiUrl:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('capturadoEm:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('estimativa: false'))).toBe(true);
  });

  it('prints verbose human output for estimation row', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalLookup('3534401', { json: false, verbose: true }, io)).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('estimativa: true'))).toBe(true);
  });

  it('returns INVALID for unknown IBGE code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalLookup('9999999', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('requires lookup code argument', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalLookup('  ', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('searches municipalities and resolves by UF/nome', () => {
    const searchIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalSearch('campinas', { json: true, verbose: false }, searchIo)).toBe(EXIT.OK);
    const searchParsed = JSON.parse(searchIo.stdout[0]) as { results: { nome: string }[] };
    expect(searchParsed.results.length).toBeGreaterThan(0);

    const ufSearchIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIssMunicipalSearch('campinas', { json: true, verbose: false, uf: 'SP' }, ufSearchIo),
    ).toBe(EXIT.OK);
    const ufSearchParsed = JSON.parse(ufSearchIo.stdout[0]) as { results: { uf: string }[] };
    expect(ufSearchParsed.results.every((row) => row.uf === 'SP')).toBe(true);

    const humanSearchIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalSearch('campinas', { json: false, verbose: false }, humanSearchIo)).toBe(EXIT.OK);
    expect(humanSearchIo.stdout[0]).toContain('Campinas');

    const emptySearchIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalSearch('zzzznonexistentmunicipio', { json: false, verbose: false }, emptySearchIo)).toBe(
      EXIT.OK,
    );
    expect(emptySearchIo.stdout[0]).toBe('No ISS municipal rows matched.');

    const resolveIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalResolve('SP', 'São Paulo', { json: false, verbose: false }, resolveIo)).toBe(EXIT.OK);
    expect(formatIssMunicipalHuman).toBeDefined();
  });

  it('returns INVALID when resolve misses municipality', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalResolve('ZZ', 'Nowhere', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('requires search query and resolve arguments', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalSearch(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalSearch('  ', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalResolve('SP', undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalResolve(undefined, 'São Paulo', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalResolve('  ', 'São Paulo', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIssMunicipalResolve('SP', '  ', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('lists municipalities by UF', () => {
    const jsonIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalList({ json: true, verbose: true, uf: 'SP', limit: 3 }, jsonIo)).toBe(EXIT.OK);
    const parsed = JSON.parse(jsonIo.stdout[0]) as { uf: string; total: number; results: unknown[]; capturadoEm?: string };
    expect(parsed.uf).toBe('SP');
    expect(parsed.total).toBe(3);
    expect(parsed.capturadoEm).toBeDefined();

    const humanIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalList({ json: false, verbose: true, uf: 'SP', limit: 2 }, humanIo)).toBe(EXIT.OK);
    expect(humanIo.stdout.some((line) => line.startsWith('capturadoEm:'))).toBe(true);

    const emptyIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalList({ json: false, verbose: false, uf: 'ZZ' }, emptyIo)).toBe(EXIT.OK);
    expect(emptyIo.stdout[0]).toContain('No ISS municipal rows embedded');

    const usageIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIssMunicipalList({ json: false, verbose: false }, usageIo)).toBe(EXIT.USAGE);
  });

  it('handlers delegate to iss-municipal command runners', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIssMunicipalListCli({ json: true, verbose: false, uf: 'SP', limit: 2 }, io)).toBe(EXIT.OK);
    expect(handleIssMunicipalLookupCli(String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO), { json: true, verbose: true }, io)).toBe(
      EXIT.OK,
    );
    expect(handleIssMunicipalSearchCli('sp', { json: false, verbose: false, limit: 2, uf: 'SP' }, io)).toBe(EXIT.OK);
    expect(handleIssMunicipalResolveCli('SP', 'São Paulo', { json: true, verbose: false }, io)).toBe(EXIT.OK);
  });
});
