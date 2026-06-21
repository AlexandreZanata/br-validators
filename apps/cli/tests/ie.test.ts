import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  printIeValidation,
  resolveInput,
  resolveUf,
  runIe,
  runIeCommand,
} from '../src/commands/ie.js';
import {
  IE_DF_GOLDEN,
  IE_MT_GOLDEN_LEGACY,
  IE_SP_GOLDEN,
  IE_SP_OFFICIAL_SOURCE_URL,
} from 'br-validators';

describe('resolveInput (ie)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('resolveUf', () => {
  it('accepts supported UFs case-insensitively', () => {
    expect(resolveUf('SP')).toBe('SP');
    expect(resolveUf('rj')).toBe('RJ');
    expect(resolveUf('mg')).toBe('MG');
  });

  it('rejects unknown UF', () => {
    expect(resolveUf('XX')).toBeNull();
    expect(resolveUf(undefined)).toBeNull();
  });
});

describe('printIeValidation', () => {
  it('prints human success with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('validate', IE_SP_GOLDEN, {
        json: false,
        quiet: false,
        source: false,
        uf: 'SP',
      }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (SP)');
  });

  it('prints json failure with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printIeValidation(
        { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad', uf: 'SP' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).uf).toBe('SP');
  });

  it('prints json failure without uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printIeValidation(
        { ok: false, code: 'UNSUPPORTED_FORMAT', message: 'bad' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).uf).toBeUndefined();
  });
});

describe('runIeCommand', () => {
  it('validates SP golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('validate', IE_SP_GOLDEN, { json: false, quiet: false, source: false, uf: 'SP' }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (SP)');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('validate', IE_SP_GOLDEN, { json: true, quiet: false, source: true, uf: 'SP' }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; uf: string; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.uf).toBe('SP');
    expect(parsed.source).toBe(IE_SP_OFFICIAL_SOURCE_URL);
  });

  it('validates with json without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('validate', IE_SP_GOLDEN, { json: true, quiet: false, source: false, uf: 'SP' }, io);
    const parsed = JSON.parse(io.stdout[0]) as { source?: string };
    expect(parsed.source).toBeUndefined();
  });

  it('validates with human output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('validate', IE_SP_GOLDEN, { json: false, quiet: false, source: true, uf: 'SP' }, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates RJ golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('validate', '06540481', { json: false, quiet: true, source: false, uf: 'RJ' }, io),
    ).toBe(EXIT.OK);
  });

  it('rejects wrong UF for value', () => {
    expect(
      runIeCommand('validate', IE_SP_GOLDEN, { json: false, quiet: true, source: false, uf: 'MT' }),
    ).toBe(EXIT.INVALID);
  });

  it('returns usage when uf missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('validate', IE_SP_GOLDEN, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('--uf');
  });

  it('formats SP masked', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('format', IE_SP_GOLDEN, { json: false, quiet: false, source: false, uf: 'SP' }, io);
    expect(io.stdout[0]).toBe('110.042.490.114');
  });

  it('formats MT canonical digits', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('format', IE_MT_GOLDEN_LEGACY, { json: false, quiet: false, source: false, uf: 'MT' }, io);
    expect(io.stdout[0]).toBe('130000019');
  });

  it('formats DF masked', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('format', IE_DF_GOLDEN, { json: false, quiet: false, source: false, uf: 'DF' }, io);
    expect(io.stdout[0]).toBe('073.00001.001-09');
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('format', 'bad', { json: true, quiet: false, source: false, uf: 'SP' }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runIeCommand('format', IE_SP_GOLDEN, { json: false, quiet: true, source: false, uf: 'SP' }),
    ).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('strip', '110.042.490.114', { json: false, quiet: false, source: false, uf: 'SP' }, io);
    expect(io.stdout[0]).toBe(IE_SP_GOLDEN);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIeCommand('strip', IE_SP_GOLDEN, { json: true, quiet: false, source: false, uf: 'SP' }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(IE_SP_GOLDEN);
  });

  it('validates quiet invalid', () => {
    expect(
      runIeCommand('validate', 'bad', { json: false, quiet: true, source: false, uf: 'SP' }),
    ).toBe(EXIT.INVALID);
  });

  it('prints human failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('validate', '110042490115', { json: false, quiet: false, source: false, uf: 'SP' }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
  });
});

describe('runIe', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIe('validate', undefined, { json: false, quiet: false, source: false, uf: 'SP' }, io),
    ).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing IE');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIe('validate', undefined, {
        json: false,
        quiet: true,
        source: false,
        uf: 'SP',
        file: IE_SP_GOLDEN,
      }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runIeCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIeCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false, uf: 'SP' }, io),
    ).toBe(EXIT.USAGE);
  });
});
