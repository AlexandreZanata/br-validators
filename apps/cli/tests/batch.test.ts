import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { CPF_GOLDEN_PRIMARY, CPF_GOLDEN_PRIMARY_MASKED } from '@br-validators/core';
import { parseBatchLines, printBatch, resolveBatchInputs, runBatch } from '../src/commands/batch.js';

describe('batch command', () => {
  it('validates mixed batch', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const lines = `${CPF_GOLDEN_PRIMARY}\nbad\n${CPF_GOLDEN_PRIMARY_MASKED}`;
    expect(runBatch('cpf', { json: true, quiet: false, lines }, io)).toBe(EXIT.INVALID);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { summary: { total: number; valid: number; invalid: number } };
    expect(parsed.summary).toEqual({ total: 3, valid: 2, invalid: 1 });
  });

  it('validates all-valid batch', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const lines = `${CPF_GOLDEN_PRIMARY}\n${CPF_GOLDEN_PRIMARY_MASKED}`;
    expect(runBatch('cpf', { json: true, quiet: false, lines }, io)).toBe(EXIT.OK);
  });

  it('applies limit', () => {
    const lines = `${CPF_GOLDEN_PRIMARY}\n${CPF_GOLDEN_PRIMARY_MASKED}\nbad`;
    expect(resolveBatchInputs({ json: false, quiet: false, lines, limit: 2 })).toEqual([
      CPF_GOLDEN_PRIMARY,
      CPF_GOLDEN_PRIMARY_MASKED,
    ]);
  });

  it('parseBatchLines skips empty lines', () => {
    expect(parseBatchLines(` ${CPF_GOLDEN_PRIMARY} \n\n`)).toEqual([CPF_GOLDEN_PRIMARY]);
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBatch('unknown', { json: false, quiet: false, lines: 'x' }, io)).toBe(EXIT.USAGE);
  });

  it('returns usage when lines missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBatch('cpf', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('returns usage for empty lines', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBatch('cpf', { json: false, quiet: false, lines: '  \n  ' }, io)).toBe(EXIT.USAGE);
  });

  it('printBatch human output with invalid rows', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printBatch(
        {
          valid: [{ index: 0, input: CPF_GOLDEN_PRIMARY, value: CPF_GOLDEN_PRIMARY }],
          invalid: [{ index: 1, input: 'bad', code: 'INVALID_LENGTH', message: 'bad' }],
          summary: { total: 2, valid: 1, invalid: 1 },
        },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(io.stdout.some((line) => line.startsWith('total:'))).toBe(true);
    expect(io.stderr.some((line) => line.startsWith('fail['))).toBe(true);
  });

  it('resolveBatchInputs without limit returns all lines', () => {
    expect(resolveBatchInputs({ json: false, quiet: false, lines: 'a\nb' })).toEqual(['a', 'b']);
  });

  it('passes uf option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBatch('inscricao-estadual', { json: true, quiet: true, lines: 'bad', uf: 'SP' }, io)).toBe(
      EXIT.INVALID,
    );
  });

  it('printBatch human all-valid output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printBatch(
        {
          valid: [{ index: 0, input: CPF_GOLDEN_PRIMARY, value: CPF_GOLDEN_PRIMARY }],
          invalid: [],
          summary: { total: 1, valid: 1, invalid: 0 },
        },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('ok['))).toBe(true);
  });

  it('printBatch quiet and json modes', () => {
    const ok = {
      valid: [{ index: 0, input: CPF_GOLDEN_PRIMARY, value: CPF_GOLDEN_PRIMARY }],
      invalid: [],
      summary: { total: 1, valid: 1, invalid: 0 },
    };
    expect(printBatch(ok, { json: false, quiet: true })).toBe(EXIT.OK);
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printBatch(ok, { json: true, quiet: false }, io)).toBe(EXIT.OK);
  });
});
