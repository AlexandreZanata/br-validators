import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  runGenerate,
  printGenerate,
  isGeneratableType,
  buildGenerateOptions,
} from '../src/commands/generate.js';
import { validateCpf, validateInscricaoEstadual, validateTituloEleitor, validateBoleto, detectCardBrand } from '@br-validators/core';

describe('generate command', () => {
  it('generates CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('cpf', { json: true, quiet: false, seed: 42 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(validateCpf(parsed.value).ok).toBe(true);
  });

  it('generates boleto cobrança', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('boleto', { json: true, quiet: false, seed: 42 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(validateBoleto(parsed.value).ok).toBe(true);
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('unknown-type', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('generates inscricao-estadual with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('inscricao-estadual', { json: true, quiet: false, seed: 42, uf: 'SP' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(validateInscricaoEstadual(parsed.value, { uf: 'SP' }).ok).toBe(true);
  });

  it('generates titulo-eleitor with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('titulo-eleitor', { json: true, quiet: false, seed: 42, uf: 'SC' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(validateTituloEleitor(parsed.value).ok).toBe(true);
  });

  it('generates cartao-credito with brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('cartao-credito', { json: true, quiet: false, seed: 42, brand: 'mastercard' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(detectCardBrand(parsed.value)).toBe('mastercard');
  });

  it('isGeneratableType and buildGenerateOptions', () => {
    expect(isGeneratableType('titulo-eleitor')).toBe(true);
    expect(buildGenerateOptions({ json: false, quiet: false, masked: true, seed: 1, format: 'legacy', uf: 'sp', brand: 'visa' })).toEqual({
      masked: true,
      seed: 1,
      format: 'legacy',
      uf: 'SP',
      brand: 'visa',
    });
  });

  it('printGenerate human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printGenerate('12345678909', { json: false, quiet: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe('12345678909');
  });

  it('printGenerate quiet', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printGenerate('123', { json: false, quiet: true }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('buildGenerateOptions empty', () => {
    expect(buildGenerateOptions({ json: false, quiet: false })).toEqual({});
  });

  it('buildGenerateOptions passes stripped flag', () => {
    expect(buildGenerateOptions({ json: false, quiet: false, stripped: true, seed: 1 })).toEqual({
      stripped: true,
      seed: 1,
    });
  });

  it('generates CPF with explicit --stripped semantics', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('cpf', { json: true, quiet: false, seed: 42, stripped: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(parsed.value).toMatch(/^\d{11}$/);
    expect(validateCpf(parsed.value).ok).toBe(true);
  });

  it('stripped wins over masked on CLI', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runGenerate('cpf', { json: true, quiet: false, seed: 42, masked: true, stripped: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(parsed.value).toMatch(/^\d{11}$/);
  });
});
