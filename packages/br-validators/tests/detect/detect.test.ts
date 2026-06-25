import { describe, expect, it } from 'vitest';
import { detect } from '../../src/detect/index.js';
import {
  isBoletoArrecadacao,
  looksLikeBoleto,
  looksLikeBrCode,
  looksLikeCartao,
  looksLikeEan,
  looksLikeCep,
  looksLikeCnpjAlphanumeric,
  looksLikeCnpjNumeric,
  looksLikeElevenDigits,
  looksLikeIe,
  looksLikeNfeChave,
  looksLikePix,
  looksLikePlaca,
  looksLikeProcessoJudicial,
  looksLikeTelefone,
  looksLikeTituloEleitor,
  stripAlnumUpper,
  stripDigits,
} from '../../src/detect/helpers.js';
import cpfVectors from '../vectors/cpf.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';
import placaVectors from '../vectors/placa.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';
import pixVectors from '../vectors/pix.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import boletoVectors from '../vectors/boleto.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import eanVectors from '../vectors/ean.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import nfeVectors from '../vectors/nfe-chave.official.json';
import tituloVectors from '../vectors/titulo-eleitor.official.json';
import processoVectors from '../vectors/processo-judicial.official.json';
import brcodeVectors from '../vectors/brcode.official.json';
import ieSpVectors from '../vectors/ie.sp.official.json';
import ieSpRuralVectors from '../vectors/inscricao-estadual-produtor-rural.official.json';

describe('detect()', () => {
  it('detects CPF golden', () => {
    const result = detect(cpfVectors.primary.formatted);
    expect(result).toEqual({ type: 'cpf', ok: true, value: cpfVectors.primary.canonical, format: 'numeric' });
  });

  it('detects CNPJ numeric golden', () => {
    const result = detect(cnpjVectors.numeric.formatted);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.type).toBe('cnpj');
      expect(result.value).toBe(cnpjVectors.numeric.canonical);
    }
  });

  it('detects CNPJ alphanumeric golden', () => {
    const result = detect(cnpjVectors.alphanumeric.canonical);
    expect(result).toMatchObject({
      type: 'cnpj',
      ok: true,
      value: cnpjVectors.alphanumeric.canonical,
      format: 'alphanumeric',
    });
  });

  it('detects CEP golden', () => {
    const result = detect(cepVectors.primary.formatted);
    expect(result).toMatchObject({ type: 'cep', ok: true, value: cepVectors.primary.canonical });
  });

  it('detects placa legacy', () => {
    const result = detect(placaVectors.legacy.formatted);
    expect(result).toMatchObject({ type: 'placa', ok: true, value: placaVectors.legacy.canonical, format: 'legacy' });
  });

  it('detects placa mercosul', () => {
    const result = detect(placaVectors.mercosul.canonical);
    expect(result).toMatchObject({ type: 'placa', ok: true, value: placaVectors.mercosul.canonical, format: 'mercosul' });
  });

  it('detects PIS golden', () => {
    const result = detect(pisVectors.primary.formatted);
    expect(result).toMatchObject({ type: 'pis-pasep', ok: true, value: pisVectors.primary.canonical });
  });

  it('detects PIX email', () => {
    const result = detect(pixVectors.email.primary);
    expect(result).toMatchObject({ type: 'pix', ok: true, meta: { keyType: 'email' } });
  });

  it('detects telefone celular', () => {
    const result = detect(telefoneVectors.celular.formatted);
    expect(result).toMatchObject({ type: 'telefone', ok: true, value: telefoneVectors.celular.canonical });
  });

  it('detects boleto linha digitavel', () => {
    const result = detect(boletoVectors.golden.santander.linhaMasked);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.type).toBe('boleto');
    }
  });

  it('detects cartao credito', () => {
    const result = detect(cartaoVectors.visa.masked);
    expect(result).toMatchObject({ type: 'cartao-credito', ok: true, value: cartaoVectors.visa.canonical });
  });

  it('detects EAN-13 golden', () => {
    const result = detect(eanVectors.ean13.masked);
    expect(result).toMatchObject({ type: 'ean', ok: true, value: eanVectors.ean13.canonical, format: 'ean-13' });
  });

  it('skips EAN detect when check digit invalid', () => {
    const result = detect(eanVectors.modulo10Walkthrough.invalid);
    expect(result.type).not.toBe('ean');
  });

  it('detects CNH golden', () => {
    const result = detect(cnhVectors.primary.officialFormatted);
    expect(result).toMatchObject({ type: 'cnh', ok: true, value: cnhVectors.primary.canonical });
  });

  it('detects RENAVAM golden as pis-pasep (equivalent DV — PIS priority)', () => {
    const result = detect(renavamVectors.primary.canonical);
    expect(result).toMatchObject({ type: 'pis-pasep', ok: true, value: renavamVectors.primary.canonical });
  });

  it('detects NF-e chave with parsed meta', () => {
    const result = detect(nfeVectors.primary.officialFormatted);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.type).toBe('nfe-chave');
      expect(result.meta?.parsed).toEqual(nfeVectors.primary.parsed);
    }
  });

  it('detects processo judicial CNJ with segment meta', () => {
    const result = detect(processoVectors.primary.masked);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.type).toBe('processo-judicial');
      expect(result.meta?.segments).toEqual(processoVectors.primary.segments);
    }
  });

  it('detects titulo eleitor', () => {
    const result = detect(tituloVectors.primary.officialFormatted);
    expect(result).toMatchObject({ type: 'titulo-eleitor', ok: true, value: tituloVectors.primary.canonical });
  });

  it('detects titulo eleitor exterior without uf meta', () => {
    const result = detect(tituloVectors.exterior.canonical);
    expect(result).toMatchObject({
      type: 'titulo-eleitor',
      ok: true,
      value: tituloVectors.exterior.canonical,
      meta: { exterior: true },
    });
  });

  it('detects BR Code dynamic URL payload shape only as unknown', () => {
    const result = detect(brcodeVectors.dynamicUrl.payload);
    expect(result.ok).toBe(false);
  });

  it('detects BR Code static EVP', () => {
    const result = detect(brcodeVectors.staticEvp.payload);
    expect(result).toMatchObject({ type: 'brcode', ok: true, format: 'brcode' });
  });

  it('detects IE SP with uf option', () => {
    const result = detect(ieSpVectors.golden.masked, { uf: 'SP' });
    expect(result).toMatchObject({ type: 'inscricao-estadual', ok: true, value: ieSpVectors.golden.stripped });
  });

  it('detects IE produtor rural SP with uf', () => {
    const result = detect(ieSpRuralVectors.golden.masked, { uf: 'SP' });
    expect(result).toMatchObject({
      type: 'inscricao-estadual-produtor-rural',
      ok: true,
      value: ieSpRuralVectors.golden.canonical,
    });
  });

  it('11-digit collision: CPF wins over PIS/CNH/RENAVAM for CPF golden', () => {
    const result = detect(cpfVectors.primary.canonical);
    expect(result.type).toBe('cpf');
  });

  it('11-digit collision: CNH golden detected as CNH not CPF', () => {
    const result = detect(cnhVectors.primary.canonical);
    expect(result.type).toBe('cnh');
  });

  it('11-digit collision: PIS golden detected as pis-pasep', () => {
    const result = detect(pisVectors.primary.canonical);
    expect(result.type).toBe('pis-pasep');
  });

  it('skips invalid 48-digit boleto arrecadacao', () => {
    expect(isBoletoArrecadacao(boletoVectors.negative.arrecadacao48)).toBe(true);
    const result = detect(boletoVectors.negative.arrecadacao48);
    expect(result.ok).toBe(false);
    expect(result.type).toBe('unknown');
  });

  it('detects valid arrecadação linha', async () => {
    const arrecadacaoVectors = await import('../vectors/boleto-arrecadacao.official.json');
    const result = detect(arrecadacaoVectors.primary.linha);
    expect(result).toMatchObject({
      ok: true,
      type: 'boleto',
      format: 'arrecadacao',
      value: arrecadacaoVectors.primary.linha,
    });
  });

  it('returns empty input for blank string', () => {
    const result = detect('   ');
    expect(result).toEqual({ type: 'unknown', ok: false, code: 'EMPTY_INPUT', message: 'Input is empty' });
  });

  it('returns unknown for garbage input', () => {
    const result = detect('not-a-document');
    expect(result).toMatchObject({ type: 'unknown', ok: false, code: 'UNSUPPORTED_FORMAT' });
  });

  it('IE without uf is not detected from digits alone', () => {
    const result = detect(ieSpVectors.golden.stripped);
    expect(result.ok).toBe(false);
  });

  it('helper stripDigits and stripAlnumUpper', () => {
    expect(stripDigits('12.345')).toBe('12345');
    expect(stripAlnumUpper('ab-12')).toBe('AB12');
  });

  it('buildDetectSuccess optional format and meta branches', async () => {
    const { buildDetectSuccess } = await import('../../src/detect/index.js');
    expect(buildDetectSuccess('cpf', '12345678909')).toEqual({
      type: 'cpf',
      ok: true,
      value: '12345678909',
    });
    expect(buildDetectSuccess('cpf', '12345678909', 'numeric')).toMatchObject({
      format: 'numeric',
    });
    expect(buildDetectSuccess('cpf', '12345678909', undefined, { note: 'test' })).toMatchObject({
      meta: { note: 'test' },
    });
  });

  it('helper structural predicates', () => {
    expect(looksLikeBoleto(boletoVectors.golden.santander.linhaMasked)).toBe(true);
    expect(looksLikeNfeChave(nfeVectors.primary.canonical)).toBe(true);
    expect(looksLikeProcessoJudicial(processoVectors.primary.masked)).toBe(true);
    expect(looksLikeProcessoJudicial(processoVectors.primary.canonical)).toBe(true);
    expect(looksLikeProcessoJudicial('1234567890123456789')).toBe(false);
    expect(looksLikeBrCode(brcodeVectors.staticEvp.payload)).toBe(true);
    expect(looksLikeCnpjAlphanumeric(cnpjVectors.alphanumeric.canonical)).toBe(true);
    expect(looksLikeCnpjAlphanumeric(cnpjVectors.numeric.canonical)).toBe(false);
    expect(looksLikeCnpjNumeric(cnpjVectors.numeric.canonical)).toBe(true);
    expect(looksLikeElevenDigits(cpfVectors.primary.canonical)).toBe(true);
    expect(looksLikeTituloEleitor(tituloVectors.primary.canonical)).toBe(true);
    expect(looksLikeCep(cepVectors.primary.canonical)).toBe(true);
    expect(looksLikePlaca(placaVectors.mercosul.canonical)).toBe(true);
    expect(looksLikePix(pixVectors.email.primary)).toBe(true);
    expect(looksLikePix(pixVectors.evp.primary)).toBe(true);
    expect(looksLikeTelefone(telefoneVectors.celular.canonical)).toBe(true);
    expect(looksLikeCartao(cartaoVectors.visa.masked)).toBe(true);
    expect(looksLikeEan(eanVectors.ean13.masked)).toBe(true);
    expect(looksLikeIe(ieSpVectors.golden.stripped, 'SP')).toBe(true);
    expect(looksLikeIe(ieSpRuralVectors.golden.masked, 'SP')).toBe(true);
    expect(looksLikeIe('123', undefined)).toBe(false);
    expect(looksLikePix('not-pix')).toBe(false);
  });

  it('unknown with uf uses shorter message variant', () => {
    const result = detect('not-valid-anywhere', { uf: 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('No supported document type matched the input');
    }
  });

  it('skips invalid IE produtor rural when uf SP', () => {
    const result = detect(ieSpRuralVectors.invalidCheckDigit.input, { uf: 'SP' });
    expect(result.ok).toBe(false);
  });

  it('skips invalid standard IE when uf SP', () => {
    const result = detect('123456789012', { uf: 'SP' });
    expect(result.ok).toBe(false);
  });

  it('continues when placa shape fails validation', () => {
    const result = detect('1234567');
    expect(result.ok).toBe(false);
  });

  it('continues when pix email fails validation', () => {
    const result = detect('bad@');
    expect(result.ok).toBe(false);
  });

  it('continues when boleto shape fails validation', () => {
    const result = detect('1'.repeat(47));
    expect(result.ok).toBe(false);
  });

  it('continues when numeric cnpj fails validation', () => {
    const result = detect('11111111111111');
    expect(result.ok).toBe(false);
  });

  it('continues when alphanumeric cnpj fails validation', () => {
    const result = detect('12ABC34501DE00');
    expect(result.ok).toBe(false);
  });

  it('continues when cep fails validation', () => {
    const result = detect('12345678!');
    expect(result.ok).toBe(false);
  });

  it('continues when cep shape fails validation', () => {
    const result = detect('1234567!');
    expect(result.ok).toBe(false);
  });

  it('continues when nfe chave fails validation', () => {
    const result = detect(nfeVectors.invalidCheckDigit.canonical);
    expect(result.ok).toBe(false);
  });

  it('continues when brcode fails validation', () => {
    const result = detect(brcodeVectors.negative.tamperedCrc.payload);
    expect(result.ok).toBe(false);
  });

  it('continues when titulo fails validation', () => {
    const result = detect('123456789012');
    expect(result.ok).toBe(false);
  });

  it('continues when processo judicial shape fails validation', () => {
    const result = detect(processoVectors.invalidCheckDigit.masked);
    expect(result.ok).toBe(false);
  });
});
