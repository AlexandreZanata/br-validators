import { describe, expect, it } from 'vitest';

import {
  isLookupNotFound,
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  lookupNotFound,
  unwrapLookupValue,
} from '../../src/types/lookup-result.js';
import {
  resolveFixedLengthCodeLookup,
  resolvePositiveIdLookup,
  resolvePositiveIntegerLookup,
  resolveStringCodeLookup,
} from '../../src/lookup/resolve.js';

describe('lookup result factories', () => {
  it('lookupFound wraps value', () => {
    expect(lookupFound({ id: 1 })).toEqual({ ok: true, value: { id: 1 } });
  });

  it('lookupNotFound sets NOT_FOUND code', () => {
    const result = lookupNotFound('missing');
    expect(result).toEqual({ ok: false, code: 'NOT_FOUND', message: 'missing' });
    expect(isLookupNotFound(result)).toBe(true);
  });

  it('lookupInvalidInput sets INVALID_INPUT code', () => {
    const result = lookupInvalidInput('required');
    expect(result).toEqual({ ok: false, code: 'INVALID_INPUT', message: 'required' });
    expect(isLookupNotFound(result)).toBe(false);
  });

  it('lookupInvalidFormat sets INVALID_FORMAT code', () => {
    const result = lookupInvalidFormat('bad format');
    expect(result).toEqual({ ok: false, code: 'INVALID_FORMAT', message: 'bad format' });
    expect(isLookupNotFound(result)).toBe(false);
  });

  it('unwrapLookupValue returns value on success', () => {
    const found = unwrapLookupValue(lookupFound('ok'));
    expect(found).toBe('ok');
  });
});

describe('resolveStringCodeLookup', () => {
  it('rejects empty input', () => {
    const result = resolveStringCodeLookup({
      input: '  ',
      entityLabel: 'Test',
      normalize: (v) => v.trim(),
      isValidNormalized: (v) => v.length > 0,
      invalidFormatMessage: 'bad',
      find: () => ({ id: 1 }),
    });
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Test code is required',
    });
  });

  it('rejects invalid normalized shape', () => {
    const result = resolveStringCodeLookup({
      input: 'x',
      entityLabel: 'Test',
      normalize: () => '',
      isValidNormalized: (v) => v.length > 0,
      invalidFormatMessage: 'bad shape',
      find: () => ({ id: 1 }),
    });
    expect(result).toEqual({ ok: false, code: 'INVALID_FORMAT', message: 'bad shape' });
  });

  it('returns NOT_FOUND when find misses', () => {
    const result = resolveStringCodeLookup({
      input: 'abc',
      entityLabel: 'Test',
      normalize: (v) => v,
      isValidNormalized: () => true,
      invalidFormatMessage: 'bad',
      find: () => undefined,
      notFoundLabel: () => 'ABC',
    });
    expect(result).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Test ABC not in embedded table',
    });
  });

  it('returns found value', () => {
    const result = resolveStringCodeLookup({
      input: 'hit',
      entityLabel: 'Test',
      normalize: (v) => v,
      isValidNormalized: () => true,
      invalidFormatMessage: 'bad',
      find: () => ({ id: 42 }),
    });
    expect(result).toEqual({ ok: true, value: { id: 42 } });
  });
});

describe('resolveFixedLengthCodeLookup', () => {
  it('delegates length validation to resolveStringCodeLookup', () => {
    const result = resolveFixedLengthCodeLookup({
      input: '12',
      entityLabel: 'Code',
      normalize: (v) => v,
      expectedLength: 4,
      lengthLabel: '4 digits',
      find: () => ({ id: 1 }),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_FORMAT');
    }
  });
});

describe('resolvePositiveIntegerLookup', () => {
  it('rejects non-positive integers', () => {
    expect(resolvePositiveIntegerLookup({
      value: 0,
      entityLabel: 'Municipio',
      find: () => ({ nome: 'X' }),
    })).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
      message: 'Municipio must be a positive integer',
    });
  });

  it('returns NOT_FOUND when missing', () => {
    expect(resolvePositiveIntegerLookup({
      value: 9999999,
      entityLabel: 'Municipio',
      find: () => undefined,
    })).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Municipio 9999999 not in embedded table',
    });
  });
});

describe('resolvePositiveIdLookup', () => {
  it('parses string ids', () => {
    const result = resolvePositiveIdLookup({
      id: '3',
      entityLabel: 'Item',
      find: (parsed) => (parsed === 3 ? { id: 3 } : undefined),
    });
    expect(result).toEqual({ ok: true, value: { id: 3 } });
  });

  it('rejects invalid ids', () => {
    expect(resolvePositiveIdLookup({
      id: 'abc',
      entityLabel: 'Item',
      find: () => undefined,
    })).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
      message: 'Item id must be a positive integer',
    });
  });
});

describe('lookup subpath barrel', () => {
  it('re-exports resolve helpers and LookupResult types', async () => {
    const barrel = await import('../../src/lookup.js');
    expect(barrel.lookupFound('value')).toEqual({ ok: true, value: 'value' });
    expect(barrel.resolveStringCodeLookup).toBeTypeOf('function');
  });
});
