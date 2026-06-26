import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { CPF_GOLDEN_PRIMARY, CPF_GOLDEN_SECONDARY } from '@br-validators/core';
import { printDiff, runDiff } from '../src/commands/diff.js';

describe('diff command', () => {
  it('diffs CPF with dv change', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDiff('cpf', CPF_GOLDEN_PRIMARY, CPF_GOLDEN_SECONDARY, { json: true, quiet: false }, io)).toBe(
      EXIT.INVALID,
    );
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { changed: boolean; fields: { field: string }[] };
    expect(parsed.changed).toBe(true);
    expect(parsed.fields.some((field) => field.field === 'dv')).toBe(true);
  });

  it('diffs equal CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDiff('cpf', CPF_GOLDEN_PRIMARY, CPF_GOLDEN_PRIMARY, { json: true, quiet: false }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toEqual({ changed: false, fields: [] });
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDiff('unknown', 'a', 'b', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('returns usage when values missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDiff('cpf', CPF_GOLDEN_PRIMARY, undefined, { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('printDiff human changed output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printDiff(
        { changed: true, fields: [{ field: 'dv', a: '09', b: '01' }] },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(io.stdout.some((line) => line.startsWith('field:'))).toBe(true);
  });

  it('passes uf option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDiff('inscricao-estadual', 'bad', 'bad2', { json: true, quiet: true, uf: 'SP' }, io)).toBe(
      EXIT.INVALID,
    );
  });

  it('printDiff human unchanged output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printDiff({ changed: false, fields: [] }, { json: false, quiet: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('no');
  });

  it('printDiff json output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printDiff({ changed: false, fields: [] }, { json: true, quiet: false }, io)).toBe(EXIT.OK);
  });

  it('printDiff quiet modes', () => {
    expect(printDiff({ changed: false, fields: [] }, { json: false, quiet: true })).toBe(EXIT.OK);
    expect(
      printDiff({ changed: true, fields: [{ field: 'dv', a: '1', b: '2' }] }, { json: false, quiet: true }),
    ).toBe(EXIT.INVALID);
  });
});
