/**
 * RFB CNPJ motivos de situação cadastral — offline embedded data from Motivos.zip.
 * @see https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/
 */

import motivosData from './data/motivos.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { MotivoSituacaoCadastral } from './types.js';

const motivos: readonly MotivoSituacaoCadastral[] = motivosData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(2, '0').slice(-2);
}

export function getMotivosSituacaoCadastral(): readonly MotivoSituacaoCadastral[] {
  return motivos;
}

export function lookupMotivoSituacaoCadastralPorCodigo(
  codigo: string,
): LookupResult<MotivoSituacaoCadastral> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'CNPJ situacao cadastral reason',
    normalize: normalizeCodigo,
    expectedLength: 2,
    lengthLabel: '2 digits',
    find: (normalized) => motivos.find((motivo) => motivo.codigo === normalized),
  });
}

export function getMotivoSituacaoCadastralPorCodigo(
  codigo: string,
): MotivoSituacaoCadastral | undefined {
  return unwrapLookupValue(lookupMotivoSituacaoCadastralPorCodigo(codigo));
}
