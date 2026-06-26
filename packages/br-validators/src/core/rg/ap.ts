/**
 * Amapá RG — format-only (legacy PCA/SSP-AP numbering: 9 digits).
 * Polícia Científica do Amapá does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://apdigital.portal.ap.gov.br/carta-de-servico/solicitacao-de-agendamento-para-emissao-da-1o-via-da-carteira-de-identidade-nacional-cin1
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'AP' as const;
const RULES = RG_UF_RULES.AP;

export function stripRgAp(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgAp(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'AP RG contains invalid characters');
  }

  const canonical = stripRgAp(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `AP RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
