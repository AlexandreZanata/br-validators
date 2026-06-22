import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runTituloEleitor, runTituloEleitorCommand } from '../src/commands/titulo-eleitor.js';
import {
  TITULO_ELEITOR_GOLDEN_MASKED_INPUT,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
  TITULO_ELEITOR_OFFICIAL_SOURCE_URL,
} from '@br-validators/core';

describe('resolveInput (titulo-eleitor)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runTituloEleitorCommand', () => {
  it('validates golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates golden primary with json without source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(TITULO_ELEITOR_OFFICIAL_SOURCE_URL);
  });

  it('validates with plain output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: false, quiet: false, source: true }, io);
    expect(io.stdout[0]).toContain('valid: yes');
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('validate', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('validate', 'bad', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
    expect(io.stderr[1]).toContain('code:');
  });

  it('validates quiet invalid', () => {
    expect(runTituloEleitorCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('validates quiet mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTituloEleitorCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runTituloEleitorCommand('format', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('formats valid input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('format', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('0043 5687 0906');
  });

  it('formats with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('format', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; formatted?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.formatted).toBe('0043 5687 0906');
  });

  it('strips spaced input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('strip', TITULO_ELEITOR_GOLDEN_MASKED_INPUT, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(TITULO_ELEITOR_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTituloEleitorCommand('strip', TITULO_ELEITOR_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { stripped: string };
    expect(parsed.stripped).toBe(TITULO_ELEITOR_GOLDEN_PRIMARY);
  });
});

describe('runTituloEleitor', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTituloEleitor('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing Título de Eleitor');
  });

  it('reads from file content', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitor('validate', undefined, { json: false, quiet: true, source: false, file: TITULO_ELEITOR_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runTituloEleitorCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTituloEleitorCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});
