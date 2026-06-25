import { applyEanMask } from '../core/ean/mask.js';
import { validateEan } from '../core/ean/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatEan(input: string): FormatResult {
  const result = validateEan(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyEanMask(result.value) };
}
