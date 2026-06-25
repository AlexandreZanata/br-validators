import { describe, expect, it } from 'vitest';
import { formatBoleto } from '../../src/format/boleto.js';
import { formatCartaoCredito } from '../../src/format/cartao-credito.js';
import { formatEan } from '../../src/format/ean.js';
import { formatCep } from '../../src/format/cep.js';
import { formatCnpj } from '../../src/format/cnpj.js';
import { formatCpf } from '../../src/format/cpf.js';
import {
  formatDocument,
  formatDocumentRuntime,
  isFormattableDocumentType,
} from '../../src/format/document.js';
import * as formatBarrel from '../../src/format/index.js';
import { formatPisPasep } from '../../src/format/pis-pasep.js';
import { formatPixKey } from '../../src/format/pix.js';
import { formatPlaca } from '../../src/format/placa.js';
import vectors from '../vectors/format.official.json';

const FORMATTERS = {
  cpf: formatCpf,
  cnpj: formatCnpj,
  cep: formatCep,
  placa: formatPlaca,
  'pis-pasep': formatPisPasep,
  pix: formatPixKey,
  boleto: formatBoleto,
  'cartao-credito': formatCartaoCredito,
  ean: formatEan,
} as const;

describe('format.official.json — UC-003 golden vectors', () => {
  for (const testCase of vectors.cases) {
    it(`formats ${testCase.type} ${testCase.raw}${testCase.note ? ` (${testCase.note})` : ''}`, () => {
      const direct = FORMATTERS[testCase.type as keyof typeof FORMATTERS](testCase.raw);
      expect(direct).toEqual({ ok: true, formatted: testCase.formatted });

      const viaDocument = formatDocument(testCase.type as keyof typeof FORMATTERS, testCase.raw);
      expect(viaDocument).toEqual(direct);
    });
  }
});

describe('formatDocument runtime guard', () => {
  it('rejects unknown document type', () => {
    const result = formatDocumentRuntime('unknown-type', '12345678909');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('isFormattableDocumentType narrows known types', () => {
    expect(isFormattableDocumentType('cpf')).toBe(true);
    expect(isFormattableDocumentType('nope')).toBe(false);
  });

  it('formatDocumentRuntime delegates valid type', () => {
    const result = formatDocumentRuntime('cpf', '12345678909');
    expect(result).toEqual({ ok: true, formatted: '123.456.789-09' });
  });

  it('format barrel re-exports pipeline', () => {
    expect(formatBarrel.formatDocument).toBe(formatDocument);
    expect(formatBarrel.formatBoleto).toBe(formatBoleto);
    expect(formatBarrel.FORMATTABLE_DOCUMENT_TYPES).toContain('pix');
  });
});

describe('BR-GLOBAL-002 — no partial mask on invalid input', () => {
  it('formatCpf rejects invalid without formatted field', () => {
    const result = formatCpf('invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result).not.toHaveProperty('formatted');
    }
  });

  it('formatPixKey rejects invalid without formatted field', () => {
    const result = formatPixKey('not-a-pix-key');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result).not.toHaveProperty('formatted');
    }
  });

  it('formatBoleto rejects barcode input', () => {
    const result = formatBoleto('03396145000000996689025708991834007174230101');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('formatBoleto rejects barcode input', () => {
    const result = formatBoleto('03396145000000996689025708991834007174230101');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('formatBoleto rejects empty input', () => {
    const result = formatBoleto('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('formatBoleto rejects invalid linha', () => {
    const result = formatBoleto('03399025790899183400671742301014614500000099669');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('formatCpf rejects empty input', () => {
    const result = formatCpf('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});
