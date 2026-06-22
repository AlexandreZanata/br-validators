import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  BOLETO_GOLDEN_LINHA_MASKED,
  CARTAO_GOLDEN_VISA,
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_PRIMARY_MASKED,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CNPJ_GOLDEN_NUMERIC_MASKED,
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_PRIMARY_MASKED,
  IE_SP_GOLDEN,
  PIS_PASEP_GOLDEN_PRIMARY,
  PIX_GOLDEN_CPF,
  PIX_GOLDEN_EMAIL,
  PLACA_GOLDEN_LEGACY,
  PLACA_GOLDEN_MERCOSUL,
  TELEFONE_GOLDEN_CELULAR_MASKED,
  TELEFONE_GOLDEN_FIXO_MASKED,
} from '@br-validators/core';
import arrecadacaoVectors from '../../br-validators/tests/vectors/boleto-arrecadacao.official.json';
import {
  boletoSchema,
  cartaoCreditoSchema,
  cepSchema,
  cnpjSchema,
  cpfSchema,
  createBoletoSchema,
  createInscricaoEstadualSchema,
  createPixKeySchema,
  inscricaoEstadualSpSchema,
  pisPasepSchema,
  pisSchema,
  pixKeySchema,
  placaSchema,
  telefoneSchema,
} from '../src/index.js';

describe('Zod schemas — golden vectors (Zod 3)', () => {
  it('parses composite object with cpf and telefone', () => {
    const schema = z.object({ cpf: cpfSchema, telefone: telefoneSchema });
    expect(schema.parse({ cpf: CPF_GOLDEN_PRIMARY, telefone: TELEFONE_GOLDEN_CELULAR_MASKED })).toEqual({
      cpf: CPF_GOLDEN_PRIMARY,
      telefone: { value: '11999999999', tipo: 'celular' },
    });
  });

  it('cpfSchema accepts masked golden', () => {
    expect(cpfSchema.parse(CPF_GOLDEN_PRIMARY_MASKED)).toBe(CPF_GOLDEN_PRIMARY);
  });

  it('cpfSchema rejects invalid CPF', () => {
    expect(cpfSchema.safeParse('00000000000').success).toBe(false);
  });

  it('cnpjSchema accepts numeric and alphanumeric goldens', () => {
    expect(cnpjSchema.parse(CNPJ_GOLDEN_NUMERIC_MASKED)).toBe('11222333000181');
    expect(cnpjSchema.parse(CNPJ_GOLDEN_ALPHANUMERIC)).toBe(CNPJ_GOLDEN_ALPHANUMERIC);
  });

  it('cepSchema accepts masked golden', () => {
    expect(cepSchema.parse(CEP_GOLDEN_PRIMARY_MASKED)).toBe(CEP_GOLDEN_PRIMARY);
    expect(cepSchema.parse(CEP_GOLDEN_PRIMARY)).toBe(CEP_GOLDEN_PRIMARY);
  });

  it('telefoneSchema returns tipo for celular and fixo', () => {
    expect(telefoneSchema.parse(TELEFONE_GOLDEN_CELULAR_MASKED)).toEqual({
      value: '11999999999',
      tipo: 'celular',
    });
    expect(telefoneSchema.parse(TELEFONE_GOLDEN_FIXO_MASKED)).toEqual({
      value: '1133333333',
      tipo: 'fixo',
    });
  });

  it('placaSchema returns format', () => {
    expect(placaSchema.parse(PLACA_GOLDEN_MERCOSUL)).toEqual({
      value: PLACA_GOLDEN_MERCOSUL,
      format: 'mercosul',
    });
    expect(placaSchema.parse(PLACA_GOLDEN_LEGACY)).toEqual({
      value: PLACA_GOLDEN_LEGACY,
      format: 'legacy',
    });
  });

  it('pisPasepSchema and pisSchema alias parse golden', () => {
    expect(pisPasepSchema.parse(PIS_PASEP_GOLDEN_PRIMARY)).toBe(PIS_PASEP_GOLDEN_PRIMARY);
    expect(pisSchema.parse(PIS_PASEP_GOLDEN_PRIMARY)).toBe(PIS_PASEP_GOLDEN_PRIMARY);
  });

  it('pixKeySchema detects key type', () => {
    expect(pixKeySchema.parse(PIX_GOLDEN_CPF)).toEqual({ value: PIX_GOLDEN_CPF, keyType: 'cpf' });
    expect(pixKeySchema.parse(PIX_GOLDEN_EMAIL)).toEqual({
      value: PIX_GOLDEN_EMAIL,
      keyType: 'email',
    });
  });

  it('createPixKeySchema forces key type', () => {
    const forced = createPixKeySchema({ type: 'email' });
    expect(forced.parse(PIX_GOLDEN_EMAIL)).toEqual({ value: PIX_GOLDEN_EMAIL, keyType: 'email' });
    expect(forced.safeParse(PIX_GOLDEN_CPF).success).toBe(false);
  });

  it('boletoSchema parses linha digitável golden', () => {
    const parsed = boletoSchema.parse(BOLETO_GOLDEN_LINHA_MASKED);
    expect(parsed.inputKind).toBe('linha-digitavel');
    if ('situacao' in parsed) {
      expect(parsed.situacao).toBe('1');
    }
    expect(parsed.value.length).toBeGreaterThan(40);
  });

  it('createBoletoSchema accepts options', () => {
    const schema = createBoletoSchema({ kind: 'linha-digitavel' });
    expect(schema.parse(BOLETO_GOLDEN_LINHA_MASKED).inputKind).toBe('linha-digitavel');
  });

  it('boletoSchema parses arrecadacao golden', () => {
    const parsed = boletoSchema.parse(arrecadacaoVectors.primary.linha);
    expect(parsed).toEqual({
      value: arrecadacaoVectors.primary.linha,
      inputKind: 'arrecadacao-linha',
      format: 'arrecadacao',
      segment: arrecadacaoVectors.primary.segment,
      valueType: arrecadacaoVectors.primary.valueType,
    });
  });

  it('cartaoCreditoSchema returns brand', () => {
    expect(cartaoCreditoSchema.parse(CARTAO_GOLDEN_VISA)).toEqual({
      value: CARTAO_GOLDEN_VISA,
      brand: 'visa',
    });
  });

  it('inscricaoEstadualSpSchema and factory parse SP golden', () => {
    expect(inscricaoEstadualSpSchema.parse(IE_SP_GOLDEN)).toEqual({
      value: IE_SP_GOLDEN,
      uf: 'SP',
    });
    expect(createInscricaoEstadualSchema({ uf: 'SP' }).parse(IE_SP_GOLDEN).uf).toBe('SP');
  });
});

describe('Zod subpath exports', () => {
  it('imports cpf schema from subpath', async () => {
    const { cpfSchema: subpathSchema } = await import('../src/cpf.js');
    expect(subpathSchema.parse(CPF_GOLDEN_PRIMARY)).toBe(CPF_GOLDEN_PRIMARY);
  });
});
