/**
 * Field-level document diff — per-type structural decomposition (BR-DIFF-001).
 * @see docs/OFFICIAL-SOURCES.md
 */
import { normalizeForPlatform } from '../platform/normalize.js';
import type { PlatformDocumentType, PlatformOptions } from '../platform/types.js';

export type DiffField = {
  field: string;
  a: string;
  b: string;
};

export type DiffResult = {
  changed: boolean;
  fields: DiffField[];
};

export function diff(
  a: string,
  b: string,
  type: PlatformDocumentType,
  options: PlatformOptions = {},
): DiffResult {
  const left = normalizeForPlatform(a, type, options);
  const right = normalizeForPlatform(b, type, options);

  if (left === right) {
    return { changed: false, fields: [] };
  }

  const leftFields = splitFields(left, type);
  const rightFields = splitFields(right, type);
  const keys = new Set([...Object.keys(leftFields), ...Object.keys(rightFields)]);
  const fields: DiffField[] = [];

  for (const field of keys) {
    const leftValue = leftFields[field];
    const rightValue = rightFields[field];
    if (leftValue !== rightValue) {
      fields.push({ field, a: leftValue, b: rightValue });
    }
  }

  return { changed: fields.length > 0, fields };
}

function splitFields(value: string, type: PlatformDocumentType): Record<string, string> {
  switch (type) {
    case 'cpf':
      return {
        base: value.slice(0, 9),
        dv: value.slice(9, 11),
      };
    case 'cnpj':
      return {
        base: value.slice(0, 12),
        dv: value.slice(12, 14),
      };
    case 'cep':
      return {
        prefix: value.slice(0, 5),
        suffix: value.slice(5, 8),
      };
    case 'telefone':
      return { ddd: value.slice(0, 2), subscriber: value.slice(2) };
    case 'pis-pasep':
      return {
        base: value.slice(0, 10),
        dv: value.slice(10, 11),
      };
    case 'cnh':
      return {
        base: value.slice(0, 9),
        dv1: value.slice(9, 10),
        dv2: value.slice(10, 11),
      };
    case 'renavam':
      return {
        base: value.slice(0, 10),
        dv: value.slice(10, 11),
      };
    case 'titulo-eleitor':
      return {
        sequential: value.slice(0, 8),
        uf: value.slice(8, 10),
        dv: value.slice(10, 12),
      };
    case 'nfe-chave':
      return {
        cUF: value.slice(0, 2),
        aamm: value.slice(2, 6),
        cnpj: value.slice(6, 20),
        mod: value.slice(20, 22),
        serie: value.slice(22, 25),
        nNF: value.slice(25, 34),
        tpEmis: value.slice(34, 35),
        cNF: value.slice(35, 43),
        cDV: value.slice(43, 44),
      };
    case 'placa':
      return { value };
    case 'boleto':
    case 'cartao-credito':
    case 'inscricao-estadual':
    case 'inscricao-estadual-produtor-rural':
    case 'pix':
    case 'brcode':
      return { value };
    default: {
      const _exhaustive: never = type;
      void _exhaustive;
      return { value };
    }
  }
}
