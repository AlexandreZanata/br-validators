/**
 * Unified equality check — normalizes via strip/validate canonical (BR-COMPARE-001).
 * @see docs/OFFICIAL-SOURCES.md
 */
import { normalizeForPlatform } from '../platform/normalize.js';
import { isPlatformDocumentType } from '../platform/types.js';
import type { PlatformDocumentType, PlatformOptions } from '../platform/types.js';

export type CompareResult = {
  equal: boolean;
};

export function compare(
  a: string,
  b: string,
  type: PlatformDocumentType,
  options: PlatformOptions = {},
): CompareResult {
  const left = normalizeForPlatform(a, type, options);
  const right = normalizeForPlatform(b, type, options);
  return { equal: left === right };
}

/** Runtime guard for dynamic callers (non-exhaustive type string). */
export function compareRuntime(
  a: string,
  b: string,
  type: string,
  options: PlatformOptions = {},
): CompareResult | { equal: false; code: 'UNSUPPORTED_FORMAT'; message: string } {
  if (!isPlatformDocumentType(type)) {
    return { equal: false, code: 'UNSUPPORTED_FORMAT', message: `Unknown document type: ${type}` };
  }
  return compare(a, b, type, options);
}
