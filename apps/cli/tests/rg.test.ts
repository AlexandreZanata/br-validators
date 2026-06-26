import { describe, expect, it } from 'vitest';
import { RG_PR_GOLDEN, RG_SP_GOLDEN, RG_SP_GOLDEN_MASKED, validateRg } from '@br-validators/core/rg';
import {
  printRgValidation,
  resolveRgUf,
  runRg,
  runRgCommand,
  type RgAction,
} from '../src/commands/rg.js';
import { EXIT } from '../src/constants.js';

describe('rg CLI', () => {
  it('resolves supported UF codes', () => {
    expect(resolveRgUf('sp')).toBe('SP');
    expect(resolveRgUf('ac')).toBe('AC');
    expect(resolveRgUf('al')).toBe('AL');
    expect(resolveRgUf('am')).toBe('AM');
    expect(resolveRgUf('ap')).toBe('AP');
    expect(resolveRgUf('df')).toBe('DF');
    expect(resolveRgUf('es')).toBe('ES');
    expect(resolveRgUf('go')).toBe('GO');
    expect(resolveRgUf('ma')).toBe('MA');
    expect(resolveRgUf('ce')).toBe('CE');
    expect(resolveRgUf('ZZ')).toBeNull();
    expect(resolveRgUf(undefined)).toBeNull();
  });

  it('validates SP golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRg('validate', RG_SP_GOLDEN, { uf: 'SP', json: false, quiet: false, source: false }, io)).toBe(
      EXIT.OK,
    );
    expect(io.stdout.some((line) => line.includes('valid: yes'))).toBe(true);
  });

  it('prints official source URL with --source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRgCommand('validate', RG_SP_GOLDEN, { uf: 'SP', json: false, quiet: false, source: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('returns usage for unknown action', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRgCommand('bad' as RgAction, RG_SP_GOLDEN, { uf: 'SP', json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Unknown action');
  });

  it('prints JSON validation output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRgCommand('validate', RG_SP_GOLDEN_MASKED, { uf: 'SP', json: true, quiet: false, source: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { ok: boolean; value: string };
    expect(parsed).toMatchObject({ ok: true, value: RG_SP_GOLDEN });
  });

  it('formats and strips with uf', () => {
    const formatIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRg('format', RG_SP_GOLDEN, { uf: 'SP', json: true, quiet: false, source: false }, formatIo)).toBe(
      EXIT.OK,
    );
    const stripIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRg('strip', RG_SP_GOLDEN_MASKED, { uf: 'SP', json: true, quiet: false, source: false }, stripIo)).toBe(
      EXIT.OK,
    );
  });

  it('requires uf and value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRg('validate', RG_SP_GOLDEN, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(runRg('validate', undefined, { uf: 'SP', json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
  });

  it('printRgValidation handles failure paths', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printRgValidation(
        { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad', uf: 'SP' },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(
      printRgValidation(
        { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad', uf: 'SP' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(
      printRgValidation(
        { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(
      printRgValidation(
        { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad', uf: 'SP' },
        { json: false, quiet: true },
        io,
      ),
    ).toBe(EXIT.INVALID);
    const valid = validateRg(RG_SP_GOLDEN, { uf: 'SP' });
    if (!valid.ok) {
      throw new Error('expected valid RG');
    }
    expect(printRgValidation(valid, { json: false, quiet: true }, io)).toBe(EXIT.OK);
    const jsonIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(printRgValidation(valid, { json: true, quiet: false }, jsonIo)).toBe(EXIT.OK);
    expect(JSON.parse(jsonIo.stdout[0] ?? '{}')).not.toHaveProperty('source');
  });

  it('prints checkDigitValidated no for format-only UF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRgCommand('validate', RG_PR_GOLDEN, { uf: 'PR', json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.includes('checkDigitValidated: no'))).toBe(true);
  });
});
