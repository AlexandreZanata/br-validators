/**
 * CNIS issuer / tipo metadata — heuristic when caller context is unknown.
 * Checksum validation is authoritative (RV_03); issuer inference is not a CNIS lookup.
 */

import type { NitIssuer, NitTipo } from '../../types/validation-result.js';

export type { NitIssuer, NitTipo };

export type NitMetadataOptions = {
  issuer?: NitIssuer;
  tipo?: NitTipo;
};

export function inferNitIssuer(stripped: string): NitIssuer {
  return stripped.charAt(0) === '0' ? 'inss' : 'caixa';
}

export function inferNitTipo(stripped: string): NitTipo {
  const first = stripped.charAt(0);
  if (first === '0') {
    return 'nit';
  }
  if (first === '1' || first === '2' || first === '3') {
    return 'pis';
  }
  return 'nis';
}

export function resolveNitMetadata(
  stripped: string,
  options?: NitMetadataOptions,
): { issuer: NitIssuer; tipo: NitTipo } {
  return {
    issuer: options?.issuer ?? inferNitIssuer(stripped),
    tipo: options?.tipo ?? inferNitTipo(stripped),
  };
}
