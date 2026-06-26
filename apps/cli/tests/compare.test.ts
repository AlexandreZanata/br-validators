import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_PRIMARY_MASKED,
  CNPJ_GOLDEN_NUMERIC,
  CNPJ_GOLDEN_NUMERIC_MASKED,
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_PRIMARY_MASKED,
} from '@br-validators/core';
import { printCompare, runCompare } from '../src/commands/compare.js';
import { isPlatformDocumentType } from '../src/commands/platform-document-types.js';

describe('compare command', () => {
  it('compares equal CPF values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCompare('cpf', CPF_GOLDEN_PRIMARY_MASKED, CPF_GOLDEN_PRIMARY, { json: true, quiet: false }, io)).toBe(
      EXIT.OK,
    );
    expect(JSON.parse(io.stdout[0] ?? '{}')).toEqual({ equal: true });
  });

  it('compares unequal CPF values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCompare('cpf', CPF_GOLDEN_PRIMARY, '12345678901', { json: true, quiet: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toEqual({ equal: false });
  });

  it('compares equal CNPJ values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCompare('cnpj', CNPJ_GOLDEN_NUMERIC_MASKED, CNPJ_GOLDEN_NUMERIC, { json: true, quiet: false }, io),
    ).toBe(EXIT.OK);
  });

  it('compares equal CEP values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCompare('cep', CEP_GOLDEN_PRIMARY_MASKED, CEP_GOLDEN_PRIMARY, { json: true, quiet: false }, io)).toBe(
      EXIT.OK,
    );
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCompare('unknown', 'a', 'b', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('returns usage when values missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCompare('cpf', CPF_GOLDEN_PRIMARY, undefined, { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('passes uf option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCompare('inscricao-estadual', 'bad', 'bad', { json: false, quiet: true, uf: 'SP' }, io),
    ).toBe(EXIT.OK);
  });

  it('isPlatformDocumentType', () => {
    expect(isPlatformDocumentType('cpf')).toBe(true);
    expect(isPlatformDocumentType('unknown')).toBe(false);
  });

  it('printCompare human equal and unequal', () => {
    const equalIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(printCompare({ equal: true }, { json: false, quiet: false }, equalIo)).toBe(EXIT.OK);
    expect(equalIo.stdout[0]).toContain('yes');

    const unequalIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(printCompare({ equal: false }, { json: false, quiet: false }, unequalIo)).toBe(EXIT.INVALID);
  });

  it('printCompare error result', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printCompare(
        { equal: false, code: 'UNSUPPORTED_FORMAT', message: 'bad type' },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.USAGE);
  });

  it('printCompare json unsupported type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printCompare(
        { equal: false, code: 'UNSUPPORTED_FORMAT', message: 'bad' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.USAGE);
  });

  it('printCompare quiet modes', () => {
    expect(printCompare({ equal: true }, { json: false, quiet: true })).toBe(EXIT.OK);
    expect(printCompare({ equal: false }, { json: false, quiet: true })).toBe(EXIT.INVALID);
    expect(
      printCompare({ equal: false, code: 'UNSUPPORTED_FORMAT', message: 'bad' }, { json: false, quiet: true }),
    ).toBe(EXIT.USAGE);
  });
});
