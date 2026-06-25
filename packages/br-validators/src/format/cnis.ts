import { applyPisPasepMask } from '../core/pis-pasep/mask.js';
import { validateNit } from '../core/cnis/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatNit(input: string): FormatResult {
  const result = validateNit(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyPisPasepMask(result.value) };
}
