import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { runSanitize, printSanitize, isSanitizableType, resolveInput } from '../src/commands/sanitize.js';
import { CPF_GOLDEN_PRIMARY, CPF_GOLDEN_PRIMARY_MASKED } from '@br-validators/core';

describe('sanitize command', () => {
  it('sanitizes CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSanitize('cpf', CPF_GOLDEN_PRIMARY_MASKED, { json: true, quiet: false }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toMatchObject({ ok: true, value: CPF_GOLDEN_PRIMARY });
  });

  it('rejects unknown sanitize type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSanitize('unknown', 'x', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('sanitizes PIX email key', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSanitize('pix', '  PIX@BCB.GOV.BR ', { json: true, quiet: false }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toMatchObject({ ok: true, value: 'pix@bcb.gov.br' });
  });

  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSanitize('cpf', undefined, { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('resolveInput and file option', () => {
    expect(resolveInput(undefined, CPF_GOLDEN_PRIMARY_MASKED)).toBe(CPF_GOLDEN_PRIMARY_MASKED);
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runSanitize('cpf', undefined, { json: false, quiet: true, file: CPF_GOLDEN_PRIMARY_MASKED }, io),
    ).toBe(EXIT.OK);
  });

  it('passes uf option for IE', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSanitize('inscricao-estadual', 'bad', { json: false, quiet: true, uf: 'SP' }, io)).toBe(EXIT.INVALID);
  });

  it('isSanitizableType', () => {
    expect(isSanitizableType('cpf')).toBe(true);
    expect(isSanitizableType('pix')).toBe(true);
  });

  it('printSanitize success human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printSanitize({ ok: true, value: CPF_GOLDEN_PRIMARY, fixes: ['trimmed'] }, { json: false, quiet: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((l) => l.includes('fixes:'))).toBe(true);
  });

  it('printSanitize json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printSanitize({ ok: false, code: 'INVALID_LENGTH', message: 'bad' }, { json: true, quiet: false }, io),
    ).toBe(EXIT.INVALID);
  });

  it('printSanitize quiet modes', () => {
    expect(printSanitize({ ok: true, value: CPF_GOLDEN_PRIMARY, fixes: [] }, { json: false, quiet: true })).toBe(
      EXIT.OK,
    );
    expect(
      printSanitize({ ok: false, code: 'INVALID_LENGTH', message: 'bad' }, { json: false, quiet: true }),
    ).toBe(EXIT.INVALID);
  });

  it('printSanitize failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printSanitize({ ok: false, code: 'INVALID_LENGTH', message: 'bad' }, { json: false, quiet: false }, io),
    ).toBe(EXIT.INVALID);
  });
});
