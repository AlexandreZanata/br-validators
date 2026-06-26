/**
 * Unified lookup result shape — mirrors {@link ValidationResult} ok/code/message contract
 * without document-specific success fields (e.g. `format`).
 * @see docs/LIBRARY-API.md — Lookup list getters
 */

export type LookupErrorCode = 'NOT_FOUND' | 'INVALID_FORMAT' | 'INVALID_INPUT';

export type LookupResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: LookupErrorCode; message: string };

export function lookupFound<T>(value: T): LookupResult<T> {
  return { ok: true, value };
}

export function lookupNotFound(message: string): LookupResult<never> {
  return { ok: false, code: 'NOT_FOUND', message };
}

export function lookupInvalidInput(message: string): LookupResult<never> {
  return { ok: false, code: 'INVALID_INPUT', message };
}

export function lookupInvalidFormat(message: string): LookupResult<never> {
  return { ok: false, code: 'INVALID_FORMAT', message };
}

/** Unwrap v1.x `get*PorCodigo` compatibility — returns `undefined` on any failure. */
export function unwrapLookupValue<T>(result: LookupResult<T>): T | undefined {
  return result.ok ? result.value : undefined;
}

export function isLookupNotFound<T>(result: LookupResult<T>): result is {
  ok: false;
  code: 'NOT_FOUND';
  message: string;
} {
  return !result.ok && result.code === 'NOT_FOUND';
}
