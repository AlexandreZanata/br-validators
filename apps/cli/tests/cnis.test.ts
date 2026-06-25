import { describe, expect, it } from 'vitest';

import { CNIS_GOLDEN_CAIXA_PIS, CNIS_GOLDEN_INSS_NIT } from '@br-validators/core/cnis';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCnis, runCnisCommand } from '../src/commands/cnis.js';

describe('resolveInput (cnis)', () => {
  it('returns value or trimmed file content', () => {
    expect(resolveInput(' 123 ', undefined)).toBe(' 123 ');
    expect(resolveInput(undefined, ' file\n')).toBe('file');
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runCnisCommand', () => {
  it('validates golden Caixa PIS with issuer metadata in json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const code = runCnisCommand('validate', CNIS_GOLDEN_CAIXA_PIS, { json: true, quiet: false, source: false }, io);
    expect(code).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { issuer: string; tipo: string };
    expect(parsed.issuer).toBe('caixa');
    expect(parsed.tipo).toBe('pis');
  });

  it('returns json failure for invalid NIT', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnisCommand('validate', '1002723088', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { ok: boolean; code: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBe('INVALID_LENGTH');
  });

  it('validates INSS NIT golden', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnisCommand('validate', CNIS_GOLDEN_INSS_NIT, { json: true, quiet: false, source: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { issuer: string; source?: string };
    expect(parsed.issuer).toBe('inss');
    expect(parsed.source).toContain('gov.br');
  });

  it('validates with issuer/tipo overrides', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const code = runCnisCommand(
      'validate',
      CNIS_GOLDEN_CAIXA_PIS,
      { json: true, quiet: false, source: false, issuer: 'inss', tipo: 'nit' },
      io,
    );
    expect(code).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { issuer: string; tipo: string };
    expect(parsed.issuer).toBe('inss');
    expect(parsed.tipo).toBe('nit');
  });

  it('prints human output with source URL', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnisCommand('validate', CNIS_GOLDEN_INSS_NIT, { json: false, quiet: false, source: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('formats and strips', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnisCommand('format', CNIS_GOLDEN_INSS_NIT, { json: true, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(runCnisCommand('strip', CNIS_GOLDEN_CAIXA_PIS, { json: true, quiet: false, source: false }, io)).toBe(EXIT.OK);
  });
});

describe('runCnis', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnis('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnis('validate', undefined, { json: false, quiet: true, source: false, file: CNIS_GOLDEN_INSS_NIT }, io),
    ).toBe(EXIT.OK);
  });

  it('prints human validation output and failure paths', () => {
    const okIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnisCommand('validate', CNIS_GOLDEN_CAIXA_PIS, { json: false, quiet: false, source: false }, okIo),
    ).toBe(EXIT.OK);
    expect(okIo.stdout.some((line) => line.includes('issuer:'))).toBe(true);

    const badIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnisCommand('validate', 'bad', { json: false, quiet: true, source: false }, badIo)).toBe(EXIT.INVALID);
    expect(runCnisCommand('validate', 'bad', { json: false, quiet: false, source: false }, badIo)).toBe(EXIT.INVALID);
  });
});

describe('runCnisCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnisCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});
