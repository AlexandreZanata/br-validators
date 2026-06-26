import { describe, expect, it } from 'vitest';
import {
  brandBrCodePayload,
  brandCartaoCredito,
  brandArrecadacao,
  brandCnpj,
  brandCep,
  brandCnh,
  brandRenavam,
  brandCpf,
  brandCodigoBarras,
  brandInscricaoEstadual,
  brandLinhaDigitavel,
  brandPisPasep,
  brandNit,
  brandPixKey,
  brandPlaca,
  brandTelefone,
} from '../../src/types/validation-result.js';

describe('brandCnpj', () => {
  it('casts string to Cnpj brand', () => {
    const value = brandCnpj('12ABC34501DE35');
    expect(value).toBe('12ABC34501DE35');
  });
});

describe('brandCpf', () => {
  it('casts string to Cpf brand', () => {
    const value = brandCpf('12345678909');
    expect(value).toBe('12345678909');
  });
});

describe('brandCnh', () => {
  it('casts string to Cnh brand', () => {
    const value = brandCnh('62472927637');
    expect(value).toBe('62472927637');
  });
});

describe('brandRenavam', () => {
  it('casts string to Renavam brand', () => {
    const value = brandRenavam('63977791104');
    expect(value).toBe('63977791104');
  });
});

describe('brandCep', () => {
  it('casts string to Cep brand', () => {
    const value = brandCep('01310100');
    expect(value).toBe('01310100');
  });
});

describe('brandPlaca', () => {
  it('casts string to Placa brand', () => {
    const value = brandPlaca('ABC1D23');
    expect(value).toBe('ABC1D23');
  });
});

describe('brandPisPasep', () => {
  it('casts string to PisPasep brand', () => {
    const value = brandPisPasep('10027230888');
    expect(value).toBe('10027230888');
  });
});

describe('brandNit', () => {
  it('casts string to Nit brand', () => {
    const value = brandNit('01234567897');
    expect(value).toBe('01234567897');
  });
});

describe('brandPixKey', () => {
  it('casts string to PixKey brand', () => {
    const value = brandPixKey('pix@bcb.gov.br');
    expect(value).toBe('pix@bcb.gov.br');
  });
});

describe('brandLinhaDigitavel', () => {
  it('casts string to LinhaDigitavel brand', () => {
    const value = brandLinhaDigitavel('03399025790899183400671742301014614500000099668');
    expect(value).toBe('03399025790899183400671742301014614500000099668');
  });
});

describe('brandCodigoBarras', () => {
  it('casts string to CodigoBarras brand', () => {
    const value = brandCodigoBarras('03396145000000996689025708991834007174230101');
    expect(value).toBe('03396145000000996689025708991834007174230101');
  });
});

describe('brandArrecadacao', () => {
  it('casts string to Arrecadacao brand', () => {
    const value = brandArrecadacao('8360000000123456789012345678901234567890123456');
    expect(value).toBe('8360000000123456789012345678901234567890123456');
  });
});

describe('brandBrCodePayload', () => {
  it('casts string to BrCodePayload brand', () => {
    const payload =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D';
    const value = brandBrCodePayload(payload);
    expect(value).toBe(payload);
  });
});

describe('brandCartaoCredito', () => {
  it('casts string to CartaoCredito brand', () => {
    const value = brandCartaoCredito('4111111111111111');
    expect(value).toBe('4111111111111111');
  });
});

describe('brandInscricaoEstadual', () => {
  it('casts string to InscricaoEstadual brand', () => {
    const value = brandInscricaoEstadual('110042490114');
    expect(value).toBe('110042490114');
  });
});

describe('brandTelefone', () => {
  it('casts string to Telefone brand', () => {
    const value = brandTelefone('11999999999');
    expect(value).toBe('11999999999');
  });
});
