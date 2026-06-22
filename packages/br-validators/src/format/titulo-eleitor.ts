import { applyTituloEleitorMask } from '../core/titulo-eleitor/mask.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatTituloEleitor(input: string): FormatResult {
  const result = validateTituloEleitor(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyTituloEleitorMask(result.value) };
}
