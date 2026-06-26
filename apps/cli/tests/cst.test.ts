import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { runCstLookup, runCstSearch, runCstValidate } from '../src/commands/cst/index.js';
import {
  handleCstLookupCli,
  handleCstSearchCli,
  handleCstValidateCli,
} from '../src/handlers.js';

describe('cst CLI', () => {
  it('lookup ICMS 00', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstLookup('00', { json: true, verbose: true, tax: 'icms' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; cst: { codigo: string }; tax: string };
    expect(parsed.cst.codigo).toBe('00');
    expect(parsed.tax).toBe('icms');
  });

  it('validate PIS golden code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstValidate('01', { json: true, verbose: false, tax: 'pis' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; value: string; tax: string };
    expect(parsed.value).toBe('01');
    expect(parsed.tax).toBe('pis');
  });

  it('search ICMS descriptions', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstSearch('tributada', { json: false, verbose: false, tax: 'icms', limit: 2 }, io)).toBe(EXIT.OK);
    expect(io.stdout.length).toBeGreaterThan(0);
  });

  it('requires --tax', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstValidate('00', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runCstLookup('00', { json: false, verbose: false, tax: 'invalid' }, io)).toBe(EXIT.USAGE);
    expect(runCstSearch('tributada', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('requires non-empty code and query', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstLookup('', { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.USAGE);
    expect(runCstLookup(undefined, { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.USAGE);
    expect(runCstValidate('  ', { json: false, verbose: false, tax: 'ipi' }, io)).toBe(EXIT.USAGE);
    expect(runCstValidate(undefined, { json: false, verbose: false, tax: 'ipi' }, io)).toBe(EXIT.USAGE);
    expect(runCstSearch('', { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.USAGE);
    expect(runCstSearch(undefined, { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.USAGE);
  });

  it('emits human lookup failure and empty search json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstLookup('99', { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not in embedded table');

    io.stderr.length = 0;
    expect(runCstSearch('zzzznonexistent', { json: true, verbose: false, tax: 'icms' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { results: unknown[] };
    expect(parsed.results).toEqual([]);
  });

  it('emits human validate failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstValidate('abc', { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.INVALID);
    expect(io.stderr.length).toBeGreaterThan(0);
  });

  it('returns NOT_FOUND for missing code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstValidate('99', { json: true, verbose: false, tax: 'icms' }, io)).toBe(EXIT.INVALID);
    const parsed = JSON.parse(io.stdout[0]) as { code: string };
    expect(parsed.code).toBe('NOT_FOUND');
  });

  it('lookup resolves all tax tables', () => {
    const cases = [
      { tax: 'icms', code: '00' },
      { tax: 'ipi', code: '50' },
      { tax: 'pis', code: '01' },
      { tax: 'cofins', code: '07' },
    ] as const;
    for (const entry of cases) {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      expect(runCstLookup(entry.code, { json: true, verbose: false, tax: entry.tax }, io)).toBe(EXIT.OK);
    }
  });

  it('lookup emits json failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstLookup('88', { json: true, verbose: false, tax: 'ipi' }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]) as { ok: boolean }).toEqual(expect.objectContaining({ ok: false }));
  });

  it('search prints human rows when matches exist', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstSearch('tributada', { json: false, verbose: false, tax: 'icms', limit: 1 }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('—');
  });

  it('search human mode reports no matches', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstSearch('zzzznonexistent', { json: false, verbose: false, tax: 'icms' }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe('No matches.');
  });

  it('validate human verbose output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstValidate('00', { json: false, verbose: true, tax: 'icms' }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('00');
    expect(io.stdout[1]).toBe('tax: icms');
  });

  it('lookup human verbose output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstLookup('00', { json: false, verbose: true, tax: 'icms' }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('00');
    expect(io.stdout[1]).toBe('tax: icms');
    expect(io.stdout[2]).toContain('capturadoEm:');
  });

  it('search without limit option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCstSearch('tributada', { json: true, verbose: false, tax: 'icms' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { results: unknown[] };
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  it('search resolves all tax tables', () => {
    const cases = [
      { tax: 'icms', query: 'tributada' },
      { tax: 'ipi', query: 'entrada' },
      { tax: 'pis', query: 'operação' },
      { tax: 'cofins', query: 'operação' },
    ] as const;
    for (const entry of cases) {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      expect(runCstSearch(entry.query, { json: true, verbose: false, tax: entry.tax, limit: 1 }, io)).toBe(EXIT.OK);
      const parsed = JSON.parse(io.stdout[0]) as { tax: string; results: unknown[] };
      expect(parsed.tax).toBe(entry.tax);
      expect(parsed.results.length).toBeGreaterThan(0);
    }
  });

  it('handler wrappers delegate to cst commands', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCstLookupCli('00', { json: true, tax: 'icms' }, io)).toBe(EXIT.OK);
    io.stdout.length = 0;
    expect(handleCstSearchCli('tributada', { json: true, tax: 'icms', limit: 1 }, io)).toBe(EXIT.OK);
    io.stdout.length = 0;
    expect(handleCstValidateCli('00', { json: true, tax: 'icms' }, io)).toBe(EXIT.OK);
  });
});
