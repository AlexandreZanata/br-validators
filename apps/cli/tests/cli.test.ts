import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { listSupportedTypes } from '../src/commands/list.js';
import { resolveInput, runCnpj, runCnpjCommand } from '../src/commands/cnpj.js';
import { CNPJ_GOLDEN_ALPHANUMERIC, CNPJ_OFFICIAL_SOURCE_URL } from '@br-validators/core';
import { printFormat, printStrip, printValidation } from '../src/output.js';

describe('listSupportedTypes', () => {
  it('lists cnpj', () => {
    const io = { stdout: [] as string[] };
    expect(listSupportedTypes(io)).toBe(EXIT.OK);
    expect(io.stdout).toEqual(['cnpj', 'cpf', 'cep', 'telefone', 'cnh', 'renavam', 'titulo-eleitor', 'brcode', 'placa', 'pis-pasep', 'pix', 'boleto', 'cartao', 'ie']);
  });
});

describe('resolveInput', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });

  it('prefers explicit value over file', () => {
    expect(resolveInput('abc', 'file')).toBe('abc');
  });

  it('uses trimmed file content', () => {
    expect(resolveInput(undefined, '  value  ')).toBe('value');
  });
});

describe('runCnpjCommand', () => {
  it('validates golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnpjCommand('validate', CNPJ_GOLDEN_ALPHANUMERIC, { json: false, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnpjCommand('validate', CNPJ_GOLDEN_ALPHANUMERIC, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(CNPJ_OFFICIAL_SOURCE_URL);
  });

  it('validates quiet invalid', () => {
    expect(runCnpjCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid CNPJ', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnpjCommand('format', CNPJ_GOLDEN_ALPHANUMERIC, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('12.ABC.345/01DE-35');
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnpjCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runCnpjCommand('format', CNPJ_GOLDEN_ALPHANUMERIC, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnpjCommand('strip', '12.ABC.345/01DE-35', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CNPJ_GOLDEN_ALPHANUMERIC);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnpjCommand('strip', CNPJ_GOLDEN_ALPHANUMERIC, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(CNPJ_GOLDEN_ALPHANUMERIC);
  });
});

describe('runCnpj', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnpj('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing CNPJ');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnpj('validate', undefined, { json: false, quiet: true, source: false, file: CNPJ_GOLDEN_ALPHANUMERIC }, io),
    ).toBe(EXIT.OK);
  });
});

describe('printValidation', () => {
  it('prints human success with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printValidation(
      { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' },
      { json: false, quiet: false, source: 'https://example.com/doc.pdf' },
      io,
    );
    expect(io.stdout.some((l) => l.startsWith('source:'))).toBe(true);
  });

  it('prints human error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printValidation({ ok: false, code: 'EMPTY_INPUT', message: 'empty' }, { json: false, quiet: false }, io);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('prints json success without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printValidation(
      { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' },
      { json: true, quiet: false },
      io,
    );
    expect(JSON.parse(io.stdout[0])).not.toHaveProperty('source');
  });

  it('returns quietly when valid', () => {
    expect(
      printValidation(
        { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' },
        { json: false, quiet: true },
      ),
    ).toBe(EXIT.OK);
  });

  it('prints json failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printValidation({ ok: false, code: 'EMPTY_INPUT', message: 'empty' }, { json: true, quiet: false }, io);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });
});

describe('printFormat branches', () => {
  it('prints json success result', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printFormat({ ok: true, formatted: '12.ABC.345/01DE-35' }, { json: true, quiet: false }, io),
    ).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0]).ok).toBe(true);
  });

  it('prints json error result', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printFormat({ ok: false, code: 'INVALID_LENGTH', message: 'x' }, { json: true, quiet: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('returns valid quietly', () => {
    expect(printFormat({ ok: true, formatted: '11.222.333/0001-81' }, { json: false, quiet: true })).toBe(EXIT.OK);
  });

  it('returns invalid quietly', () => {
    expect(printFormat({ ok: false, code: 'INVALID_LENGTH', message: 'x' }, { json: false, quiet: true })).toBe(
      EXIT.INVALID,
    );
  });

  it('prints formatted value in human mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printFormat({ ok: true, formatted: '11.222.333/0001-81' }, { json: false, quiet: false }, io);
    expect(io.stdout[0]).toBe('11.222.333/0001-81');
  });
});

describe('printFormat human errors', () => {
  it('prints human format error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printFormat({ ok: false, code: 'INVALID_LENGTH', message: 'len' }, { json: false, quiet: false }, io);
    expect(io.stderr[0]).toBe('code: INVALID_LENGTH');
  });
});

describe('printStrip defaults', () => {
  it('uses default io', () => {
    expect(printStrip('ABC', { json: false })).toBe(EXIT.OK);
  });
});

describe('runCnpjCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnpjCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});
