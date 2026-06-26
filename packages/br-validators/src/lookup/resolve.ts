import {
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  lookupNotFound,
  type LookupResult,
} from '../types/lookup-result.js';

export function resolveStringCodeLookup<T>(options: {
  input: string;
  entityLabel: string;
  normalize: (input: string) => string;
  isValidNormalized: (normalized: string) => boolean;
  invalidFormatMessage: string;
  find: (normalized: string) => T | undefined;
  notFoundLabel?: (normalized: string) => string;
}): LookupResult<T> {
  const trimmed = options.input.trim();
  if (trimmed.length === 0) {
    return lookupInvalidInput(`${options.entityLabel} code is required`);
  }

  const normalized = options.normalize(options.input);
  if (!options.isValidNormalized(normalized)) {
    return lookupInvalidFormat(options.invalidFormatMessage);
  }

  const found = options.find(normalized);
  if (found === undefined) {
    const label = options.notFoundLabel?.(normalized) ?? normalized;
    return lookupNotFound(`${options.entityLabel} ${label} not in embedded table`);
  }

  return lookupFound(found);
}

export function resolveFixedLengthCodeLookup<T>(options: {
  input: string;
  entityLabel: string;
  normalize: (input: string) => string;
  expectedLength: number;
  lengthLabel: string;
  find: (normalized: string) => T | undefined;
}): LookupResult<T> {
  return resolveStringCodeLookup({
    input: options.input,
    entityLabel: options.entityLabel,
    normalize: options.normalize,
    isValidNormalized: (normalized) => normalized.length === options.expectedLength,
    invalidFormatMessage: `${options.entityLabel} code must have ${options.lengthLabel} after normalization`,
    find: options.find,
  });
}

export function resolvePositiveIntegerLookup<T>(options: {
  value: number;
  entityLabel: string;
  find: (value: number) => T | undefined;
}): LookupResult<T> {
  if (!Number.isInteger(options.value) || options.value <= 0) {
    return lookupInvalidFormat(`${options.entityLabel} must be a positive integer`);
  }

  const found = options.find(options.value);
  if (found === undefined) {
    return lookupNotFound(`${options.entityLabel} ${String(options.value)} not in embedded table`);
  }

  return lookupFound(found);
}

export function resolvePositiveIdLookup<T>(options: {
  id: number | string;
  entityLabel: string;
  find: (id: number) => T | undefined;
}): LookupResult<T> {
  const parsed = typeof options.id === 'number' ? options.id : Number.parseInt(options.id, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return lookupInvalidFormat(`${options.entityLabel} id must be a positive integer`);
  }

  const found = options.find(parsed);
  if (found === undefined) {
    return lookupNotFound(`${options.entityLabel} ${String(parsed)} not in embedded table`);
  }

  return lookupFound(found);
}
