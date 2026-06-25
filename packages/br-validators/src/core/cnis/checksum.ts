import { computeCheckDigit } from '../cnpj/modulo11.js';
import { CNIS_BASE_LENGTH, CNIS_DV_WEIGHTS } from './constants.js';

function digitValue(char: string): number {
  return Number(char);
}

export function isValidCnisModulo11(stripped: string): boolean {
  const base = stripped.slice(0, CNIS_BASE_LENGTH);
  const dvExpected = String(computeCheckDigit(base, CNIS_DV_WEIGHTS, digitValue));
  return stripped.charAt(CNIS_BASE_LENGTH) === dvExpected;
}
