import { describe, expect, it } from 'vitest';
import {
  EAN_GOLDEN_13,
  EAN_GOLDEN_13_MASKED,
  EAN_OFFICIAL_SOURCE_URL,
} from '@br-validators/core';
import { EXIT } from '../src/constants.js';
import {
  resolveInput,
  runEan,
  runEanCommand,
  printEanValidation,
  printEanDetect,
} from '../src/commands/ean.js';

describe('resolveInput (ean)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('printEanValidation', () => {
  it('prints json failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printEanValidation({ ok: false, code: 'EMPTY_INPUT', message: 'empty' }, { json: true, quiet: false }, io);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('prints human failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printEanValidation({ ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad digit' }, { json: false, quiet: false }, io);
    expect(io.stderr[0]).toBe('valid: no');
  });
});

describe('runEanCommand', () => {
  it('validates golden EAN-13', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEanCommand('validate', EAN_GOLDEN_13, { json: false, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (ean-13)');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('validate', EAN_GOLDEN_13, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string; format?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.format).toBe('ean-13');
    expect(parsed.source).toBe(EAN_OFFICIAL_SOURCE_URL);
  });

  it('validates with json without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('validate', EAN_GOLDEN_13, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0])).not.toHaveProperty('source');
  });

  it('validates quiet valid', () => {
    expect(runEanCommand('validate', EAN_GOLDEN_13, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('validates human output with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('validate', EAN_GOLDEN_13, { json: false, quiet: false, source: true }, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates quiet invalid', () => {
    expect(runEanCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('detects ean-13 format', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('detect', EAN_GOLDEN_13, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('ean-13');
  });

  it('detects with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('detect', EAN_GOLDEN_13, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).format).toBe('ean-13');
  });

  it('detects unknown length as unknown', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('detect', '12345', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('unknown');
  });

  it('detects unknown length with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('detect', '12345', { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).format).toBe('unknown');
  });

  it('detects quiet unknown length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEanCommand('detect', '12345', { json: false, quiet: true, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('printEanDetect handles null format directly', () => {
    const io = { stdout: [] as string[] };
    printEanDetect(null, { json: true, quiet: false }, io);
    expect(JSON.parse(io.stdout[0]).format).toBe('unknown');
  });

  it('detects quiet', () => {
    expect(runEanCommand('detect', EAN_GOLDEN_13, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('formats valid EAN-13', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('format', EAN_GOLDEN_13, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(EAN_GOLDEN_13_MASKED);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEanCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('strips masked input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('strip', EAN_GOLDEN_13_MASKED, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(EAN_GOLDEN_13);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runEanCommand('strip', EAN_GOLDEN_13, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(EAN_GOLDEN_13);
  });
});

describe('runEan', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEan('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing EAN value');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEan('validate', undefined, { json: false, quiet: true, source: false, file: EAN_GOLDEN_13 }, io)).toBe(EXIT.OK);
  });
});

describe('runEanCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runEanCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
  });
});
