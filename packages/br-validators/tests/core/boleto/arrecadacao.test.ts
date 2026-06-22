import { describe, expect, it } from 'vitest';
import {
  ARRECADACAO_MOD10_GOLDEN_DV,
  ARRECADACAO_MOD10_GOLDEN_SEQUENCE,
  buildArrecadacaoGoldenPair,
  linhaArrecadacaoToCodigoBarras,
  validateArrecadacao,
  validateArrecadacaoCodigoBarras,
  validateArrecadacaoLinha,
  isValidArrecadacao,
} from '../../../src/core/boleto/arrecadacao.js';
import {
  computeArrecadacaoModulo11Dv,
  getArrecadacaoDvCalculator,
} from '../../../src/core/boleto/arrecadacao-modulo.js';
import { validateBoleto } from '../../../src/core/boleto/index.js';
import { detectBoletoInputKind } from '../../../src/core/boleto/detect.js';
import vectors from '../../vectors/boleto-arrecadacao.official.json';
import boletoVectors from '../../vectors/boleto.official.json';

describe('arrecadação modulo walkthroughs (FEBRABAN Layout v7)', () => {
  it('modulo 10 golden sequence §07', () => {
    expect(ARRECADACAO_MOD10_GOLDEN_DV).toBe(vectors.modulo10Walkthrough.dv);
    expect(ARRECADACAO_MOD10_GOLDEN_SEQUENCE).toBe(vectors.modulo10Walkthrough.sequence);
  });

  it('modulo 11 golden sequence §09', () => {
    expect(computeArrecadacaoModulo11Dv(vectors.modulo11Walkthrough.sequence)).toBe(
      vectors.modulo11Walkthrough.dv,
    );
  });
});

describe('validateArrecadacao', () => {
  const golden = buildArrecadacaoGoldenPair({
    segment: vectors.primary.segment,
    valueType: vectors.primary.valueType as '6',
    value: vectors.primary.value,
    company: vectors.primary.company,
    free: vectors.primary.free,
  });

  it('builds golden vectors matching official JSON', () => {
    expect(golden.barcode).toBe(vectors.primary.barcode);
    expect(golden.linha).toBe(vectors.primary.linha);
  });

  it('validates 48-digit linha golden', () => {
    const result = validateArrecadacaoLinha(vectors.primary.linha);
    expect(result).toMatchObject({
      ok: true,
      value: vectors.primary.linha,
      inputKind: 'arrecadacao-linha',
      format: 'arrecadacao',
      segment: vectors.primary.segment,
      valueType: vectors.primary.valueType,
    });
  });

  it('validates 44-digit barcode golden', () => {
    const result = validateArrecadacaoCodigoBarras(vectors.primary.barcode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.inputKind).toBe('arrecadacao-codigo-barras');
    }
  });

  it('converts linha to barcode', () => {
    expect(linhaArrecadacaoToCodigoBarras(vectors.primary.linha)).toBe(vectors.primary.barcode);
  });

  it('validateBoleto routes arrecadação', () => {
    const result = validateBoleto(vectors.primary.linha);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe('arrecadacao');
    }
  });

  it('detectBoletoInputKind returns arrecadacao', () => {
    expect(detectBoletoInputKind(vectors.primary.linha)).toBe('arrecadacao');
  });

  it('rejects invalid DV linha', () => {
    const result = validateArrecadacao(vectors.negative.invalidDv48);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects legacy negative sample from cobrança vectors', () => {
    const result = validateArrecadacao(boletoVectors.negative.arrecadacao48);
    expect(result.ok).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validateArrecadacao(vectors.negative.wrongLength).ok).toBe(false);
  });

  it('rejects empty input', () => {
    expect(validateArrecadacao('').ok).toBe(false);
    expect(validateArrecadacaoLinha('').ok).toBe(false);
    expect(validateArrecadacaoCodigoBarras('').ok).toBe(false);
  });

  it('rejects invalid general DV on barcode', () => {
    const badBarcode = `${vectors.primary.barcode.slice(0, 3)}0${vectors.primary.barcode.slice(4)}`;
    const result = validateArrecadacaoCodigoBarras(badBarcode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects invalid barcode length', () => {
    expect(validateArrecadacaoCodigoBarras('846123').ok).toBe(false);
  });

  it('rejects linha with wrong stripped length', () => {
    const result = validateArrecadacaoLinha('8'.repeat(47));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
      expect(result.inputKind).toBe('arrecadacao-linha');
    }
  });

  it('rejects invalid characters and formats', () => {
    expect(validateArrecadacaoLinha('846X').ok).toBe(false);
    expect(validateArrecadacaoCodigoBarras('846A').ok).toBe(false);
    expect(validateArrecadacaoLinha('7'.repeat(48)).ok).toBe(false);
    expect(validateArrecadacaoCodigoBarras('7'.repeat(44)).ok).toBe(false);
    expect(validateArrecadacaoLinha(`845${'0'.repeat(45)}`).ok).toBe(false);
    expect(validateArrecadacaoCodigoBarras(`84${'5'.repeat(42)}`).ok).toBe(false);
  });

  it('rejects when field DVs are valid but general DV on assembled barcode is stale', () => {
    const golden = buildArrecadacaoGoldenPair({
      segment: vectors.primary.segment,
      valueType: vectors.primary.valueType as '6',
      value: vectors.primary.value,
      company: vectors.primary.company,
      free: vectors.primary.free,
    });
    const dv = getArrecadacaoDvCalculator(vectors.primary.valueType);
    const chars = golden.linha.split('');
    chars[13] = chars[13] === '0' ? '1' : '0';
    chars[23] = String(dv(chars.slice(12, 23).join('')));
    const result = validateArrecadacaoLinha(chars.join(''));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
      expect(result.inputKind).toBe('arrecadacao-linha');
      expect(result.message).toContain('general');
    }
  });

  it('wraps isValidArrecadacao', () => {
    expect(isValidArrecadacao(vectors.primary.linha)).toBe(true);
    expect(isValidArrecadacao('bad')).toBe(false);
  });

  it('validates modulo 11 value type golden', () => {
    const mod11 = buildArrecadacaoGoldenPair({
      segment: vectors.modulo11.segment,
      valueType: vectors.modulo11.valueType as '8',
      value: vectors.modulo11.value,
      company: vectors.modulo11.company,
      free: vectors.modulo11.free,
    });
    expect(validateArrecadacao(mod11.linha).ok).toBe(true);
    expect(validateArrecadacao(mod11.barcode).ok).toBe(true);
  });
});
