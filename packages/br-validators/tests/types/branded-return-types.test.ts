/**
 * Compile-time + runtime checks — every public validate* success path returns a branded value.
 */
import { describe, expect, it } from 'vitest';
import { validateBrCode } from '../../src/core/brcode/index.js';
import { validateCartaoCredito } from '../../src/core/cartao-credito/index.js';
import { validateCep } from '../../src/core/cep/index.js';
import { validateCnh } from '../../src/core/cnh/index.js';
import { validateCnpj } from '../../src/core/cnpj/index.js';
import { validateCpf } from '../../src/core/cpf/index.js';
import { validateNit } from '../../src/core/cnis/index.js';
import { validateEan } from '../../src/core/ean/index.js';
import { validateInscricaoEstadual } from '../../src/core/inscricao-estadual/index.js';
import { validateNfeChave } from '../../src/core/nfe-chave/index.js';
import { validatePisPasep } from '../../src/core/pis-pasep/index.js';
import { validatePixKey } from '../../src/core/pix/index.js';
import { validatePlaca } from '../../src/core/placa/index.js';
import { validateProcessoJudicial } from '../../src/core/processo-judicial/index.js';
import { validateRenavam } from '../../src/core/renavam/index.js';
import { validateRg } from '../../src/core/rg/index.js';
import { validateTelefone } from '../../src/core/telefone/index.js';
import { validateTituloEleitor } from '../../src/core/titulo-eleitor/index.js';
import {
  validateArrecadacao,
  validateBoleto,
  validateCodigoBarras,
  validateLinhaDigitavel,
} from '../../src/core/boleto/index.js';
import { CEP_GOLDEN_PRIMARY } from '../../src/core/cep/constants.js';
import { CNH_GOLDEN_PRIMARY } from '../../src/core/cnh/constants.js';
import { CNPJ_GOLDEN_NUMERIC } from '../../src/core/cnpj/constants.js';
import { CPF_GOLDEN_PRIMARY } from '../../src/core/cpf/constants.js';
import { CNIS_GOLDEN_CAIXA_PIS } from '../../src/core/cnis/constants.js';
import { EAN_GOLDEN_13 } from '../../src/core/ean/constants.js';
import { IE_SP_GOLDEN } from '../../src/core/inscricao-estadual/constants.js';
import { NFE_CHAVE_GOLDEN_PRIMARY } from '../../src/core/nfe-chave/constants.js';
import { PIS_PASEP_GOLDEN_PRIMARY } from '../../src/core/pis-pasep/constants.js';
import { PIX_GOLDEN_CPF } from '../../src/core/pix/constants.js';
import { PLACA_GOLDEN_MERCOSUL } from '../../src/core/placa/constants.js';
import { PROCESSO_JUDICIAL_GOLDEN_PRIMARY } from '../../src/core/processo-judicial/constants.js';
import { RENAVAM_GOLDEN_PRIMARY } from '../../src/core/renavam/constants.js';
import { RG_SP_GOLDEN } from '../../src/core/rg/constants.js';
import { TELEFONE_GOLDEN_CELULAR } from '../../src/core/telefone/constants.js';
import { TITULO_ELEITOR_GOLDEN_PRIMARY } from '../../src/core/titulo-eleitor/constants.js';
import {
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_LINHA_STRIPPED,
} from '../../src/core/boleto/constants.js';
import { buildArrecadacaoGoldenPair } from '../../src/core/boleto/arrecadacao.js';
import { BRCODE_GOLDEN_STATIC_CPF } from '../../src/core/brcode/constants.js';
import { CARTAO_GOLDEN_VISA } from '../../src/core/cartao-credito/constants.js';
import type {
  Arrecadacao,
  BrCodePayload,
  CartaoCredito,
  Cep,
  Cnh,
  Cnpj,
  CodigoBarras,
  Cpf,
  Ean,
  InscricaoEstadual,
  LinhaDigitavel,
  NfeChave,
  Nit,
  PisPasep,
  PixKey,
  Placa,
  ProcessoJudicial,
  Renavam,
  Rg,
  Telefone,
  TituloEleitor,
} from '../../src/types/validation-result.js';

type SuccessValue<R> = Extract<R, { ok: true }> extends { value: infer V } ? V : never;

type AssertBranded<Brand, Result> = SuccessValue<Result> extends Brand
  ? Brand extends SuccessValue<Result>
    ? true
    : never
  : never;

const _cpf: AssertBranded<Cpf, ReturnType<typeof validateCpf>> = true;
const _cnpj: AssertBranded<Cnpj, ReturnType<typeof validateCnpj>> = true;
const _cep: AssertBranded<Cep, ReturnType<typeof validateCep>> = true;
const _placa: AssertBranded<Placa, ReturnType<typeof validatePlaca>> = true;
const _pis: AssertBranded<PisPasep, ReturnType<typeof validatePisPasep>> = true;
const _nit: AssertBranded<Nit, ReturnType<typeof validateNit>> = true;
const _pix: AssertBranded<PixKey, ReturnType<typeof validatePixKey>> = true;
const _telefone: AssertBranded<Telefone, ReturnType<typeof validateTelefone>> = true;
const _cnh: AssertBranded<Cnh, ReturnType<typeof validateCnh>> = true;
const _renavam: AssertBranded<Renavam, ReturnType<typeof validateRenavam>> = true;
const _titulo: AssertBranded<TituloEleitor, ReturnType<typeof validateTituloEleitor>> = true;
const _nfe: AssertBranded<NfeChave, ReturnType<typeof validateNfeChave>> = true;
const _processo: AssertBranded<ProcessoJudicial, ReturnType<typeof validateProcessoJudicial>> = true;
const _rg: AssertBranded<Rg, ReturnType<typeof validateRg>> = true;
const _ean: AssertBranded<Ean, ReturnType<typeof validateEan>> = true;
const _cartao: AssertBranded<CartaoCredito, ReturnType<typeof validateCartaoCredito>> = true;
const _brcode: AssertBranded<BrCodePayload, ReturnType<typeof validateBrCode>> = true;
const _ie: AssertBranded<InscricaoEstadual, ReturnType<typeof validateInscricaoEstadual>> = true;
const _linha: AssertBranded<LinhaDigitavel, ReturnType<typeof validateLinhaDigitavel>> = true;
const _barcode: AssertBranded<CodigoBarras, ReturnType<typeof validateCodigoBarras>> = true;
const _arrecadacao: AssertBranded<Arrecadacao, ReturnType<typeof validateArrecadacao>> = true;
const _boletoLinha: AssertBranded<
  LinhaDigitavel | CodigoBarras | Arrecadacao,
  ReturnType<typeof validateBoleto>
> = true;

void _cpf;
void _cnpj;
void _cep;
void _placa;
void _pis;
void _nit;
void _pix;
void _telefone;
void _cnh;
void _renavam;
void _titulo;
void _nfe;
void _processo;
void _rg;
void _ean;
void _cartao;
void _brcode;
void _ie;
void _linha;
void _barcode;
void _arrecadacao;
void _boletoLinha;

describe('branded validate* success values', () => {
  it('returns branded Cpf', () => {
    const result = validateCpf(CPF_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CPF_GOLDEN_PRIMARY);
    }
  });

  it('returns branded Cnpj', () => {
    const result = validateCnpj(CNPJ_GOLDEN_NUMERIC);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CNPJ_GOLDEN_NUMERIC);
    }
  });

  it('returns branded Cep', () => {
    const result = validateCep(CEP_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CEP_GOLDEN_PRIMARY);
    }
  });

  it('returns branded Placa', () => {
    const result = validatePlaca(PLACA_GOLDEN_MERCOSUL);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(PLACA_GOLDEN_MERCOSUL);
    }
  });

  it('returns branded PisPasep', () => {
    const result = validatePisPasep(PIS_PASEP_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(PIS_PASEP_GOLDEN_PRIMARY);
    }
  });

  it('returns branded Nit', () => {
    const result = validateNit(CNIS_GOLDEN_CAIXA_PIS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CNIS_GOLDEN_CAIXA_PIS);
    }
  });

  it('returns branded PixKey', () => {
    const result = validatePixKey(PIX_GOLDEN_CPF);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(PIX_GOLDEN_CPF);
    }
  });

  it('returns branded Telefone', () => {
    const result = validateTelefone(TELEFONE_GOLDEN_CELULAR);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(TELEFONE_GOLDEN_CELULAR);
    }
  });

  it('returns branded Cnh', () => {
    const result = validateCnh(CNH_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CNH_GOLDEN_PRIMARY);
    }
  });

  it('returns branded Renavam', () => {
    const result = validateRenavam(RENAVAM_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(RENAVAM_GOLDEN_PRIMARY);
    }
  });

  it('returns branded TituloEleitor', () => {
    const result = validateTituloEleitor(TITULO_ELEITOR_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(TITULO_ELEITOR_GOLDEN_PRIMARY);
    }
  });

  it('returns branded NfeChave', () => {
    const result = validateNfeChave(NFE_CHAVE_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(NFE_CHAVE_GOLDEN_PRIMARY);
    }
  });

  it('returns branded ProcessoJudicial', () => {
    const result = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
    }
  });

  it('returns branded Rg', () => {
    const result = validateRg(RG_SP_GOLDEN, { uf: 'SP' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(RG_SP_GOLDEN);
    }
  });

  it('returns branded Ean', () => {
    const result = validateEan(EAN_GOLDEN_13);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(EAN_GOLDEN_13);
    }
  });

  it('returns branded CartaoCredito', () => {
    const result = validateCartaoCredito(CARTAO_GOLDEN_VISA);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CARTAO_GOLDEN_VISA);
    }
  });

  it('returns branded BrCodePayload', () => {
    const result = validateBrCode(BRCODE_GOLDEN_STATIC_CPF);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BRCODE_GOLDEN_STATIC_CPF);
    }
  });

  it('returns branded InscricaoEstadual', () => {
    const result = validateInscricaoEstadual(IE_SP_GOLDEN, { uf: 'SP' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(IE_SP_GOLDEN);
    }
  });

  it('returns branded LinhaDigitavel', () => {
    const result = validateLinhaDigitavel(BOLETO_GOLDEN_LINHA_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
    }
  });

  it('returns branded CodigoBarras', () => {
    const result = validateCodigoBarras(BOLETO_GOLDEN_CODIGO_BARRAS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BOLETO_GOLDEN_CODIGO_BARRAS);
    }
  });

  it('returns branded Arrecadacao', () => {
    const golden = buildArrecadacaoGoldenPair({
      segment: '1',
      valueType: '6',
      value: '12345678901',
      company: '1234',
      free: '0',
    });
    const result = validateArrecadacao(golden.linha);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(golden.linha);
    }
  });

  it('returns branded LinhaDigitavel or CodigoBarras from validateBoleto', () => {
    const result = validateBoleto(BOLETO_GOLDEN_LINHA_STRIPPED);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
    }
  });
});
