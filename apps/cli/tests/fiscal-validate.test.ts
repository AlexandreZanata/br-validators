import { describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('@br-validators/core/ncm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@br-validators/core/ncm')>();
  return { ...actual, validateNcm: vi.fn(actual.validateNcm) };
});

import { EXIT } from '../src/constants.js';
import {
  isReferenceValidateCommand,
  runReferenceValidate,
  runReferenceValidateCommand,
} from '../src/commands/reference-lookup/validate.js';
import { validateNcm } from '@br-validators/core/ncm';

describe('isReferenceValidateCommand', () => {
  it('accepts ncm, cfop, and csosn', () => {
    expect(isReferenceValidateCommand('ncm')).toBe(true);
    expect(isReferenceValidateCommand('cfop')).toBe(true);
    expect(isReferenceValidateCommand('csosn')).toBe(true);
    expect(isReferenceValidateCommand('cnae')).toBe(false);
  });
});

describe('runReferenceValidateCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates golden NCM with format', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('ncm', '01012100', { json: true, verbose: false }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      value: string;
      description: string;
      format: string;
    };
    expect(parsed.value).toBe('01012100');
    expect(parsed.format).toBe('0101.21.00');
    expect(parsed.description.length).toBeGreaterThan(0);
  });

  it('returns INVALID for unknown NCM', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('ncm', '99999999', { json: true, verbose: false }, io)).toBe(EXIT.INVALID);
    const parsed = JSON.parse(io.stdout[0]) as { ok: false; code: string };
    expect(parsed.code).toBe('NOT_FOUND');
  });

  it('emits human stderr on validation failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('ncm', 'abc', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('8 digits');
  });

  it('includes module metadata when verbose json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('cfop', '5102', { json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { module: string };
    expect(parsed.module).toBe('cfop');
  });

  it('omits optional format in human output when undefined', () => {
    vi.mocked(validateNcm).mockReturnValueOnce({
      ok: true,
      value: '01012100',
      description: 'Horse',
    });
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('ncm', '01012100', { json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe('01012100 — Horse');
  });

  it('omits optional format in json when undefined', () => {
    vi.mocked(validateNcm).mockReturnValueOnce({
      ok: true,
      value: '01012100',
      description: 'Horse',
    });
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('ncm', '01012100', { json: true, verbose: false }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { format?: string; value: string };
    expect(parsed.value).toBe('01012100');
    expect(parsed.format).toBeUndefined();
  });

  it('validates golden CFOP human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidateCommand('cfop', '5102', { json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('5102');
    expect(io.stdout[0]).toContain('format: 5.102');
  });

  it('requires code argument', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidate('cnae', '1102', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Unknown reference validate command');
    expect(runReferenceValidate('ncm', undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runReferenceValidateCommand('ncm', '', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('runReferenceValidate dispatches to command runner', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceValidate('ncm', '01012100', { json: true, verbose: false }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { value: string };
    expect(parsed.value).toBe('01012100');
  });
});
