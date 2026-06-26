import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_PRIMARY_MASKED,
  IE_SP_GOLDEN,
  RG_SP_GOLDEN,
} from '@br-validators/core';
import { resolveInput, runMask } from '../src/commands/mask.js';

describe('mask command', () => {
  it('masks CPF golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', CPF_GOLDEN_PRIMARY, { json: true, quiet: false }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toEqual({
      ok: true,
      formatted: CPF_GOLDEN_PRIMARY_MASKED,
    });
  });

  it('masks CPF human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', CPF_GOLDEN_PRIMARY, { json: false, quiet: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe(CPF_GOLDEN_PRIMARY_MASKED);
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cnis', 'x', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', undefined, { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('resolveInput and file option', () => {
    expect(resolveInput(undefined, CPF_GOLDEN_PRIMARY)).toBe(CPF_GOLDEN_PRIMARY);
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', undefined, { json: true, quiet: true, file: CPF_GOLDEN_PRIMARY }, io)).toBe(EXIT.OK);
  });

  it('passes uf option for IE', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('inscricao-estadual', IE_SP_GOLDEN, { json: true, quiet: true, uf: 'SP' }, io)).toBe(
      EXIT.OK,
    );
  });

  it('requires uf for RG', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('rg', RG_SP_GOLDEN, { json: true, quiet: true }, io)).toBe(EXIT.INVALID);
  });

  it('masks RG with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('rg', RG_SP_GOLDEN, { json: true, quiet: true, uf: 'SP' }, io)).toBe(EXIT.OK);
  });

  it('returns invalid for bad input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', 'bad', { json: true, quiet: false }, io)).toBe(EXIT.INVALID);
  });

  it('quiet mode', () => {
    expect(runMask('cpf', CPF_GOLDEN_PRIMARY, { json: false, quiet: true })).toBe(EXIT.OK);
    expect(runMask('cpf', 'bad', { json: false, quiet: true })).toBe(EXIT.INVALID);
  });

  it('human failure output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runMask('cpf', 'bad', { json: false, quiet: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr.some((line) => line.startsWith('code:'))).toBe(true);
  });
});
