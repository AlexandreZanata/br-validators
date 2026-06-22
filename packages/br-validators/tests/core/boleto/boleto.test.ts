import { describe, expect, it } from 'vitest';
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_CODIGO_BARRAS_BB,
  BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2,
  BOLETO_GOLDEN_LINHA_BB_STRIPPED,
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_LINHA_LENGTH,
  BOLETO_OFFICIAL_SOURCE_URL,
  computeModulo10FieldDv,
  computeModulo11BarcodeDv,
  convertCodigoBarrasToLinhaDigitavel,
  convertCodigoBarrasToLinhaDigits,
  convertLinhaToCodigoBarras,
  convertLinhaToCodigoBarrasDigits,
  detectBoletoInputKind,
  detectBoletoSituacao,
  formatLinhaDigitavel,
  isValidBoleto,
  stripCodigoBarras,
  stripLinhaDigitavel,
  validateBoleto,
  validateCodigoBarras,
  validateLinhaDigitavel,
} from '../../../src/core/boleto/index.js';
import vectors from '../../vectors/boleto.official.json';
import edgeVectors from '../../vectors/boleto.modulo-edge.json';
import situacao2Vectors from '../../vectors/boleto.situacao2.official.json';

describe('golden vectors', () => {
  it('matches official source URL', () => {
    expect(BOLETO_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });

  it('validates Santander linha stripped', () => {
    expect(validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_STRIPPED).ok).toBe(true);
  });

  it('validates Santander linha masked', () => {
    expect(validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_MASKED).ok).toBe(true);
  });

  it('validates Santander codigo barras', () => {
    expect(validateCodigoBarras(BOLETO_GOLDEN_CODIGO_BARRAS).ok).toBe(true);
  });

  it('validates BB golden pair', () => {
    expect(validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_BB_STRIPPED).ok).toBe(true);
    expect(validateCodigoBarras(BOLETO_GOLDEN_CODIGO_BARRAS_BB).ok).toBe(true);
  });

  it('validates Situação 2 golden pair', () => {
    expect(validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED).ok).toBe(true);
    expect(validateCodigoBarras(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2).ok).toBe(true);
  });
});

describe('computeModulo10FieldDv', () => {
  it('matches Anexo IX walkthrough', () => {
    expect(computeModulo10FieldDv(vectors.modulo10.anexoIxField1.digits)).toBe(
      vectors.modulo10.anexoIxField1.expectedDv,
    );
  });

  it('matches Santander field DVs', () => {
    const linha = BOLETO_GOLDEN_LINHA_STRIPPED;
    expect(computeModulo10FieldDv(linha.slice(0, 9))).toBe(Number(linha.charAt(9)));
    expect(computeModulo10FieldDv(linha.slice(10, 20))).toBe(Number(linha.charAt(20)));
    expect(computeModulo10FieldDv(linha.slice(21, 31))).toBe(Number(linha.charAt(31)));
  });

  it('matches modulo edge remainder-zero vector', () => {
    const entry = edgeVectors.modulo10.find((item) => item.expectedDv === 0);
    expect(entry).toBeDefined();
    if (entry) {
      expect(computeModulo10FieldDv(entry.digits)).toBe(entry.expectedDv);
    }
  });
});

describe('computeModulo11BarcodeDv', () => {
  it('matches Santander barcode DV', () => {
    const cb = BOLETO_GOLDEN_CODIGO_BARRAS;
    expect(computeModulo11BarcodeDv(cb.slice(0, 4) + cb.slice(5))).toBe(Number(cb.charAt(4)));
  });

  it('maps 0/10/11 results to DV 1', () => {
    expect(computeModulo11BarcodeDv('0'.repeat(43))).toBe(1);
  });
});

describe('detectBoletoInputKind', () => {
  it('detects masked linha', () => {
    expect(detectBoletoInputKind(BOLETO_GOLDEN_LINHA_MASKED)).toBe('linha-digitavel');
  });

  it('detects codigo barras', () => {
    expect(detectBoletoInputKind(BOLETO_GOLDEN_CODIGO_BARRAS)).toBe('codigo-barras');
  });

  it('returns unknown for arrecadacao 48', () => {
    expect(detectBoletoInputKind(vectors.negative.arrecadacao48)).toBe('arrecadacao');
  });

  it('returns unknown for invalid length', () => {
    expect(detectBoletoInputKind(vectors.negative.invalidLength)).toBe('unknown');
  });

  it('returns unknown for empty', () => {
    expect(detectBoletoInputKind('')).toBe('unknown');
  });

  it('returns unknown for letters', () => {
    expect(detectBoletoInputKind('abc')).toBe('unknown');
  });

  it('returns unknown for 47 digits with invalid trailing character', () => {
    expect(detectBoletoInputKind(`${BOLETO_GOLDEN_LINHA_STRIPPED}a`)).toBe('unknown');
  });
});

describe('conversion', () => {
  it('round-trips Santander linha to barcode', () => {
    expect(convertLinhaToCodigoBarrasDigits(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe(
      BOLETO_GOLDEN_CODIGO_BARRAS,
    );
  });

  it('round-trips Santander barcode to linha', () => {
    expect(convertCodigoBarrasToLinhaDigits(BOLETO_GOLDEN_CODIGO_BARRAS)).toBe(
      BOLETO_GOLDEN_LINHA_STRIPPED,
    );
  });

  it('round-trips BB golden pair', () => {
    expect(convertLinhaToCodigoBarrasDigits(BOLETO_GOLDEN_LINHA_BB_STRIPPED)).toBe(
      BOLETO_GOLDEN_CODIGO_BARRAS_BB,
    );
    expect(convertCodigoBarrasToLinhaDigits(BOLETO_GOLDEN_CODIGO_BARRAS_BB)).toBe(
      BOLETO_GOLDEN_LINHA_BB_STRIPPED,
    );
  });

  it('round-trips Situação 2 golden pair', () => {
    expect(convertLinhaToCodigoBarrasDigits(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED)).toBe(
      BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2,
    );
    expect(convertCodigoBarrasToLinhaDigits(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2)).toBe(
      BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED,
    );
  });
});

describe('validateLinhaDigitavel rejections', () => {
  it('rejects empty input', () => {
    const result = validateLinhaDigitavel('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });

  it('rejects invalid characters', () => {
    const result = validateLinhaDigitavel('03399.02579X08991.834006 71742.301014 6 14500000099668');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects invalid length', () => {
    const result = validateLinhaDigitavel('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects wrong field 1 DV', () => {
    const bad = `${BOLETO_GOLDEN_LINHA_STRIPPED.slice(0, 9)}0${BOLETO_GOLDEN_LINHA_STRIPPED.slice(10)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects wrong field 2 DV', () => {
    const bad = `${BOLETO_GOLDEN_LINHA_STRIPPED.slice(0, 20)}0${BOLETO_GOLDEN_LINHA_STRIPPED.slice(21)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects wrong field 3 DV', () => {
    const bad = `${BOLETO_GOLDEN_LINHA_STRIPPED.slice(0, 31)}0${BOLETO_GOLDEN_LINHA_STRIPPED.slice(32)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects wrong field 4 barcode DV', () => {
    const bad = `${BOLETO_GOLDEN_LINHA_STRIPPED.slice(0, 32)}0${BOLETO_GOLDEN_LINHA_STRIPPED.slice(33)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects wrong check digit', () => {
    const result = validateLinhaDigitavel(vectors.negative.invalidLinhaCheckDigit);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects non-Real currency for Situação 1', () => {
    const bad = `0338${BOLETO_GOLDEN_LINHA_STRIPPED.slice(4)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('accepts Situação 2 currency indicator 0', () => {
    const result = validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.situacao).toBe('2');
  });

  it('rejects code 988 with currency 9 on linha', () => {
    const bad = `9889${BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED.slice(4)}`;
    const result = validateLinhaDigitavel(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });
});

describe('validateCodigoBarras rejections', () => {
  it('rejects empty input', () => {
    const result = validateCodigoBarras('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });

  it('rejects invalid length', () => {
    const result = validateCodigoBarras('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects non-digit characters', () => {
    const result = validateCodigoBarras(`${BOLETO_GOLDEN_CODIGO_BARRAS.slice(0, 10)}X${BOLETO_GOLDEN_CODIGO_BARRAS.slice(11)}`);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects wrong barcode DV', () => {
    const bad = `${BOLETO_GOLDEN_CODIGO_BARRAS.slice(0, 4)}1${BOLETO_GOLDEN_CODIGO_BARRAS.slice(5)}`;
    const result = validateCodigoBarras(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects DV zero', () => {
    const zeroDv = `${BOLETO_GOLDEN_CODIGO_BARRAS.slice(0, 4)}0${BOLETO_GOLDEN_CODIGO_BARRAS.slice(5)}`;
    const result = validateCodigoBarras(zeroDv);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects non-Real currency for Situação 1', () => {
    const bad = `0338${BOLETO_GOLDEN_CODIGO_BARRAS.slice(4)}`;
    const result = validateCodigoBarras(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('accepts Situação 2 barcode with code 988 and currency 0', () => {
    const result = validateCodigoBarras(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.situacao).toBe('2');
  });

  it('rejects code 988 with currency 9 on barcode', () => {
    const bad = `9889${BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2.slice(4)}`;
    const result = validateCodigoBarras(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toContain('988');
    }
  });
});

describe('validateBoleto union', () => {
  it('validates linha auto-detect', () => {
    const result = validateBoleto(BOLETO_GOLDEN_LINHA_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok && result.format !== 'arrecadacao') {
      expect(result.inputKind).toBe('linha-digitavel');
      expect(result.format).toBe('linha-digitavel');
      expect(result.situacao).toBe('1');
    }
  });

  it('validates Situação 2 linha with situacao 2', () => {
    const result = validateBoleto(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok && result.format !== 'arrecadacao') {
      expect(result.situacao).toBe('2');
      expect(detectBoletoSituacao(result.value)).toBe('situacao-2');
    }
  });

  it('validates semantic flags on Situação 1 barcode', () => {
    const result = validateBoleto(BOLETO_GOLDEN_CODIGO_BARRAS, {
      validateDueFactor: true,
      validateAmount: true,
    });
    expect(result.ok).toBe(true);
  });

  it('skips semantic flags for Situação 2', () => {
    const result = validateBoleto(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2, {
      validateDueFactor: true,
      validateAmount: true,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects forced kind with invalid structural input', () => {
    const result = validateBoleto('123', { kind: 'linha-digitavel' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects semantic due factor when flag enabled', () => {
    const withoutDv = `03399998${BOLETO_GOLDEN_CODIGO_BARRAS.slice(9)}`;
    const rebuilt = `${withoutDv.slice(0, 4)}${String(computeModulo11BarcodeDv(withoutDv))}${withoutDv.slice(4)}`;
    const result = validateBoleto(rebuilt, { validateDueFactor: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('validates barcode auto-detect', () => {
    const result = validateBoleto(BOLETO_GOLDEN_CODIGO_BARRAS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.inputKind).toBe('codigo-barras');
    }
  });

  it('rejects unknown input', () => {
    const result = validateBoleto('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('validates arrecadacao 48 when check digits are valid', async () => {
    const arrecadacaoVectors = await import('../../vectors/boleto-arrecadacao.official.json');
    const result = validateBoleto(arrecadacaoVectors.primary.linha);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe('arrecadacao');
      expect(detectBoletoInputKind(arrecadacaoVectors.primary.linha)).toBe('arrecadacao');
    }
  });

  it('rejects invalid arrecadacao 48', () => {
    const result = validateBoleto(vectors.negative.arrecadacao48);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
      expect(detectBoletoInputKind(vectors.negative.arrecadacao48)).toBe('arrecadacao');
    }
  });

  it('rejects empty input', () => {
    const result = validateBoleto('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });

  it('rejects strict kind mismatch', () => {
    const result = validateBoleto(BOLETO_GOLDEN_CODIGO_BARRAS, { kind: 'linha-digitavel' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.inputKind).toBe('linha-digitavel');
    }
  });

  it('accepts forced kind when detect matches', () => {
    expect(validateBoleto(BOLETO_GOLDEN_CODIGO_BARRAS, { kind: 'codigo-barras' }).ok).toBe(true);
  });

  it('wraps isValidBoleto', () => {
    expect(isValidBoleto(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe(true);
    expect(isValidBoleto('bad')).toBe(false);
  });
});

describe('convertLinhaToCodigoBarras / convertCodigoBarrasToLinhaDigitavel', () => {
  it('converts valid linha to barcode', () => {
    const result = convertLinhaToCodigoBarras(BOLETO_GOLDEN_LINHA_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BOLETO_GOLDEN_CODIGO_BARRAS);
      expect(result.inputKind).toBe('codigo-barras');
    }
  });

  it('converts valid barcode to linha', () => {
    const result = convertCodigoBarrasToLinhaDigitavel(BOLETO_GOLDEN_CODIGO_BARRAS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
      expect(result.inputKind).toBe('linha-digitavel');
    }
  });

  it('converts valid Situação 2 barcode to linha', () => {
    const result = convertCodigoBarrasToLinhaDigitavel(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2);
    expect(result.ok).toBe(true);
    if (result.ok && result.format !== 'arrecadacao') {
      expect(result.value).toBe(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED);
      expect(result.situacao).toBe('2');
    }
  });

  it('matches situacao2 official vector source', () => {
    expect(situacao2Vectors.golden.situacao).toBe('2');
  });

  it('propagates validation failure', () => {
    expect(convertLinhaToCodigoBarras('bad').ok).toBe(false);
    expect(convertCodigoBarrasToLinhaDigitavel('bad').ok).toBe(false);
  });
});

describe('strip and format', () => {
  it('strips masked linha', () => {
    expect(stripLinhaDigitavel(BOLETO_GOLDEN_LINHA_MASKED)).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
  });

  it('formats stripped linha', () => {
    expect(formatLinhaDigitavel(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe(BOLETO_GOLDEN_LINHA_MASKED);
  });

  it('strips codigo barras', () => {
    expect(stripCodigoBarras(` ${BOLETO_GOLDEN_CODIGO_BARRAS} `)).toBe(BOLETO_GOLDEN_CODIGO_BARRAS);
  });

  it('exposes length constants', () => {
    expect(BOLETO_LINHA_LENGTH).toBe(47);
    expect(BOLETO_CODIGO_BARRAS_LENGTH).toBe(44);
  });
});
