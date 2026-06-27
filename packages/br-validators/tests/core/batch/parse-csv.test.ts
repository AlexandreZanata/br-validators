import { describe, expect, it } from 'vitest';

import { parseBatchCsv } from '../../../src/batch/parse-csv.js';

describe('parseBatchCsv', () => {
  it('extracts column by header name', () => {
    const raw = 'cpf,name\n12345678909,Alice\n98765432100,Bob';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result).toEqual({ ok: true, values: ['12345678909', '98765432100'] });
  });

  it('extracts column by numeric index', () => {
    const raw = 'cpf,name\n12345678909,Alice';
    const result = parseBatchCsv(raw, { col: '0' });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('supports tab delimiter', () => {
    const raw = 'cpf\tname\n12345678909\tAlice';
    const result = parseBatchCsv(raw, { col: 'cpf', delimiter: '\t' });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('handles quoted fields with commas', () => {
    const raw = 'cpf,note\n"12345678909","foo,bar"';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('returns error when column missing from header', () => {
    const raw = 'name\nAlice';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Column "cpf" not found in header');
    }
  });

  it('parses without header when skipHeader is false', () => {
    const raw = '12345678909,Alice\n98765432100,Bob';
    const result = parseBatchCsv(raw, { col: '0', skipHeader: false });
    expect(result).toEqual({ ok: true, values: ['12345678909', '98765432100'] });
  });

  it('returns error for out-of-range numeric column index', () => {
    const raw = 'cpf\n12345678909';
    const result = parseBatchCsv(raw, { col: '9' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Column "9" not found');
    }
  });

  it('returns error when column name used without header row', () => {
    const result = parseBatchCsv('12345678909', { col: '-1', skipHeader: false });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('requires --skip-header');
    }
  });

  it('parses escaped quotes inside quoted fields', () => {
    const raw = 'cpf,note\n"12345678909","say ""hi"""';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('skips empty cells in the selected column', () => {
    const raw = 'cpf,name\n,Alice\n12345678909,Bob';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('honors explicit skipHeader and delimiter options', () => {
    const raw = 'cpf;name\n12345678909;Alice';
    const result = parseBatchCsv(raw, { col: 'cpf', delimiter: ';', skipHeader: true });
    expect(result).toEqual({ ok: true, values: ['12345678909'] });
  });

  it('skips rows missing the selected column', () => {
    const raw = 'cpf,name,extra\n12345678909,Alice,x\nBob';
    const result = parseBatchCsv(raw, { col: 'extra' });
    expect(result).toEqual({ ok: true, values: ['x'] });
  });

  it('returns error for empty CSV', () => {
    expect(parseBatchCsv('  \n  ', { col: 'cpf' })).toEqual({
      ok: false,
      message: 'CSV input is empty',
    });
  });

  it('returns error when no values in column', () => {
    const raw = 'cpf\n  ';
    const result = parseBatchCsv(raw, { col: 'cpf' });
    expect(result).toEqual({ ok: false, message: 'No values found in CSV column' });
  });

  it('requires numeric index when skipHeader is false and col is a name', () => {
    const raw = '12345678909,Alice';
    const result = parseBatchCsv(raw, { col: 'cpf', skipHeader: false });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('requires --skip-header');
    }
  });
});
