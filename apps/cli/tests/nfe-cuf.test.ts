import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  formatNfeCufHuman,
  runNfeCufLookup,
  runNfeCufLookupCommand,
} from '../src/commands/nfe-cuf/lookup.js';
import { handleNfeCufLookupCli } from '../src/handlers.js';

describe('nfe-cuf CLI', () => {
  it('lookup golden SP', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookup('35', { json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      cuf: { codigo: string; uf: string };
      capturadoEm?: string;
    };
    expect(parsed.cuf.codigo).toBe('35');
    expect(parsed.cuf.uf).toBe('SP');
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('lookup human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookupCommand('35', { json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe(formatNfeCufHuman({
      codigo: '35',
      uf: 'SP',
      nome: 'São Paulo',
      codigoIbge: '35',
    }));
  });

  it('lookup human verbose output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookupCommand('35', { json: false, verbose: true }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('cUF 35');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('returns INVALID for unknown cUF human', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookup('19', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not in embedded table');
  });

  it('returns INVALID for unknown cUF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookup('19', { json: true, verbose: false }, io)).toBe(EXIT.INVALID);
    const parsed = JSON.parse(io.stdout[0]) as { code: string };
    expect(parsed.code).toBe('NOT_FOUND');
  });

  it('returns INVALID for invalid format human', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookup('abc', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('2 digits');
  });

  it('requires code argument', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeCufLookup('', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runNfeCufLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runNfeCufLookupCommand('', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('handler wrapper delegates to lookup command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleNfeCufLookupCli('35', { json: true }, io)).toBe(EXIT.OK);
  });
});
