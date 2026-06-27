import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  BOLETO_GOLDEN_LINHA_STRIPPED,
  CARTAO_GOLDEN_VISA,
  EAN_GOLDEN_13,
  CEP_GOLDEN_PRIMARY,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_PRIMARY_MASKED,
  CPF_GOLDEN_SECONDARY,
  IE_SP_GOLDEN,
  NFE_CHAVE_GOLDEN_PRIMARY,
  PIX_GOLDEN_EMAIL,
  PLACA_GOLDEN_MERCOSUL,
  TELEFONE_GOLDEN_CELULAR,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
  RG_SP_GOLDEN,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
} from '@br-validators/core';
import { dispatchArgv, parseArgv } from '../src/argv-dispatch.js';
import { EXIT } from '../src/constants.js';

function io() {
  return { stdout: [] as string[], stderr: [] as string[] };
}

describe('parseArgv', () => {
  it('parses global flags and positional tokens', () => {
    expect(
      parseArgv([
        'cpf',
        'validate',
        CPF_GOLDEN_PRIMARY,
        '--json',
        '-q',
        '--source',
        '--masked',
        '-f',
        'input.txt',
        '--uf',
        'SP',
        '--format',
        'legacy',
        '--seed',
        '42',
        '--kind',
        'linha',
        '--type',
        'email',
        '--unknown-flag',
      ]),
    ).toEqual({
      positionals: ['cpf', 'validate', CPF_GOLDEN_PRIMARY],
      opts: {
        json: true,
        quiet: true,
        source: true,
        masked: true,
        file: 'input.txt',
        uf: 'SP',
        format: 'legacy',
        seed: 42,
        kind: 'linha',
        type: 'email',
      },
    });
  });

  it('parses --quiet long form', () => {
    const { opts } = parseArgv(['list', '--quiet']);
    expect(opts.quiet).toBe(true);
  });
});

describe('dispatchArgv', () => {
  it('prints help for empty argv and -h', () => {
    const empty = io();
    expect(dispatchArgv([], empty)).toBe(EXIT.OK);
    expect(empty.stdout.join('\n')).toContain('Usage');

    const help = io();
    expect(dispatchArgv(['--help'], help)).toBe(EXIT.OK);
    expect(help.stdout.join('\n')).toContain('generate');
  });

  it('prints version', () => {
    const out = io();
    expect(dispatchArgv(['--version'], out)).toBe(EXIT.OK);
    expect(out.stdout[0]).toMatch(/\d+\.\d+/);
  });

  it('returns usage when command missing', () => {
    const out = io();
    expect(dispatchArgv(['--json'], out)).toBe(EXIT.USAGE);
    expect(out.stderr[0]).toContain('Missing command');
  });

  it('returns usage for unknown command', () => {
    const out = io();
    expect(dispatchArgv(['not-a-command'], out)).toBe(EXIT.USAGE);
    expect(out.stderr[0]).toContain('Unknown command');
  });

  it('dispatches list', () => {
    const out = io();
    expect(dispatchArgv(['list'], out)).toBe(EXIT.OK);
    expect(out.stdout).toContain('cpf');
  });

  it('dispatches standard validate commands', () => {
    const cases: [string[], number][] = [
      [['cnpj', 'validate', CNPJ_GOLDEN_ALPHANUMERIC, '--quiet'], EXIT.OK],
      [['cpf', 'validate', CPF_GOLDEN_PRIMARY, '--quiet'], EXIT.OK],
      [['cep', 'validate', CEP_GOLDEN_PRIMARY, '--quiet'], EXIT.OK],
      [['telefone', 'validate', TELEFONE_GOLDEN_CELULAR, '--quiet'], EXIT.OK],
      [['cnh', 'validate', '62472927637', '--quiet'], EXIT.OK],
      [['renavam', 'validate', '63977791104', '--quiet'], EXIT.OK],
      [['titulo-eleitor', 'validate', TITULO_ELEITOR_GOLDEN_PRIMARY, '--quiet'], EXIT.OK],
      [['processo-judicial', 'validate', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, '--quiet'], EXIT.OK],
      [['processo-judicial', 'parse', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, '--quiet'], EXIT.OK],
      [['rg', 'validate', RG_SP_GOLDEN, '--uf', 'SP', '--quiet'], EXIT.OK],
      [['pis-pasep', 'validate', '10027230888', '--quiet'], EXIT.OK],
      [['cnis', 'validate', '01234567897', '--quiet'], EXIT.OK],
      [['cartao-credito', 'validate', CARTAO_GOLDEN_VISA, '--quiet'], EXIT.OK],
      [['ean', 'validate', EAN_GOLDEN_13, '--quiet'], EXIT.OK],
      [['ie', 'validate', IE_SP_GOLDEN, '--uf', 'SP', '--quiet'], EXIT.OK],
    ];
    for (const [tokens, expected] of cases) {
      const out = io();
      expect(dispatchArgv(tokens, out)).toBe(expected);
    }
  });

  it('returns usage for invalid standard action', () => {
    const out = io();
    expect(dispatchArgv(['cpf', 'bad-action'], out)).toBe(EXIT.USAGE);
    expect(out.stderr[0]).toContain('validate | format | strip');
  });

  it('dispatches nfe-chave actions', () => {
    const validate = io();
    expect(
      dispatchArgv(['nfe-chave', 'validate', NFE_CHAVE_GOLDEN_PRIMARY, '--quiet'], validate),
    ).toBe(EXIT.OK);

    const invalid = io();
    expect(dispatchArgv(['nfe-chave', 'bad'], invalid)).toBe(EXIT.USAGE);
  });

  it('dispatches processo-judicial actions', () => {
    const validate = io();
    expect(
      dispatchArgv(['processo-judicial', 'validate', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, '--quiet'], validate),
    ).toBe(EXIT.OK);

    const missingValue = io();
    expect(dispatchArgv(['processo-judicial', 'validate'], missingValue)).toBe(EXIT.USAGE);

    const invalid = io();
    expect(dispatchArgv(['processo-judicial', 'bad'], invalid)).toBe(EXIT.USAGE);
    expect(invalid.stderr[0]).toContain('validate | parse | format | strip');
  });

  it('dispatches rg actions', () => {
    const validate = io();
    expect(dispatchArgv(['rg', 'validate', RG_SP_GOLDEN, '--uf', 'SP', '--quiet'], validate)).toBe(EXIT.OK);

    const missingUf = io();
    expect(dispatchArgv(['rg', 'validate', RG_SP_GOLDEN, '--quiet'], missingUf)).toBe(EXIT.USAGE);

    const missingValue = io();
    expect(dispatchArgv(['rg', 'validate', '--uf', 'SP'], missingValue)).toBe(EXIT.USAGE);

    const invalid = io();
    expect(dispatchArgv(['rg', 'bad'], invalid)).toBe(EXIT.USAGE);
    expect(invalid.stderr[0]).toContain('validate | format | strip');
  });

  it('dispatches brcode actions', () => {
    const payload =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D';
    const out = io();
    expect(dispatchArgv(['brcode', 'validate', payload, '--quiet'], out)).toBe(EXIT.OK);

    const invalid = io();
    expect(dispatchArgv(['brcode', 'bad'], invalid)).toBe(EXIT.USAGE);
  });

  it('dispatches placa actions', () => {
    const out = io();
    expect(dispatchArgv(['placa', 'validate', PLACA_GOLDEN_MERCOSUL, '--quiet'], out)).toBe(EXIT.OK);

    const invalid = io();
    expect(dispatchArgv(['placa', 'bad'], invalid)).toBe(EXIT.USAGE);
  });

  it('dispatches pix actions', () => {
    const out = io();
    expect(dispatchArgv(['pix', 'detect', PIX_GOLDEN_EMAIL, '--quiet'], out)).toBe(EXIT.OK);

    const invalid = io();
    expect(dispatchArgv(['pix', 'bad'], invalid)).toBe(EXIT.USAGE);
  });

  it('dispatches boleto actions including convert', () => {
    const detect = io();
    expect(
      dispatchArgv(['boleto', 'detect', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet'], detect),
    ).toBe(EXIT.OK);

    const convert = io();
    expect(
      dispatchArgv(
        ['boleto', 'convert', 'linha-to-barras', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet'],
        convert,
      ),
    ).toBe(EXIT.OK);

    const missingDirection = io();
    expect(dispatchArgv(['boleto', 'convert'], missingDirection)).toBe(EXIT.USAGE);

    const badDirection = io();
    expect(dispatchArgv(['boleto', 'convert', 'bad-direction'], badDirection)).toBe(EXIT.USAGE);

    const badAction = io();
    expect(dispatchArgv(['boleto', 'bad'], badAction)).toBe(EXIT.USAGE);
  });

  it('dispatches cartao actions with multi-word value', () => {
    const out = io();
    expect(dispatchArgv(['cartao', 'detect', CARTAO_GOLDEN_VISA, '--quiet'], out)).toBe(EXIT.OK);

    const invalid = io();
    expect(dispatchArgv(['cartao', 'bad'], invalid)).toBe(EXIT.USAGE);
    expect(dispatchArgv(['ean', 'bad'], invalid)).toBe(EXIT.USAGE);
  });

  it('dispatches detect sanitize and generate', () => {
    const detect = io();
    expect(dispatchArgv(['detect', CPF_GOLDEN_PRIMARY, '--quiet'], detect)).toBe(EXIT.OK);

    const detectEmpty = io();
    expect(dispatchArgv(['detect'], detectEmpty)).toBe(EXIT.USAGE);

    const sanitize = io();
    expect(
      dispatchArgv(['sanitize', 'cpf', CPF_GOLDEN_PRIMARY_MASKED, '--quiet'], sanitize),
    ).toBe(EXIT.OK);

    const sanitizeEmpty = io();
    expect(dispatchArgv(['sanitize'], sanitizeEmpty)).toBe(EXIT.USAGE);

    const mask = io();
    expect(dispatchArgv(['mask', 'cpf', CPF_GOLDEN_PRIMARY, '--quiet'], mask)).toBe(EXIT.OK);

    const maskEmpty = io();
    expect(dispatchArgv(['mask'], maskEmpty)).toBe(EXIT.USAGE);

    const generate = io();
    expect(dispatchArgv(['generate', 'cpf', '--quiet', '--seed', '42', '--uf', 'SP'], generate)).toBe(
      EXIT.OK,
    );

    const generateStripped = io();
    expect(
      dispatchArgv(['generate', 'cpf', '--quiet', '--seed', '42', '--stripped'], generateStripped),
    ).toBe(EXIT.OK);

    const generateEmpty = io();
    expect(dispatchArgv(['generate'], generateEmpty)).toBe(EXIT.USAGE);
  });

  it('dispatches compare batch and diff', () => {
    const compare = io();
    expect(
      dispatchArgv(['compare', 'cpf', CPF_GOLDEN_PRIMARY_MASKED, CPF_GOLDEN_PRIMARY, '--quiet'], compare),
    ).toBe(EXIT.OK);

    const compareEmpty = io();
    expect(dispatchArgv(['compare'], compareEmpty)).toBe(EXIT.USAGE);

    const diff = io();
    expect(
      dispatchArgv(['diff', 'cpf', CPF_GOLDEN_PRIMARY, CPF_GOLDEN_SECONDARY, '--quiet'], diff),
    ).toBe(EXIT.INVALID);

    const diffEmpty = io();
    expect(dispatchArgv(['diff'], diffEmpty)).toBe(EXIT.USAGE);

    const batchEmpty = io();
    expect(dispatchArgv(['batch', 'cpf'], batchEmpty)).toBe(EXIT.USAGE);

    const batchNoType = io();
    expect(dispatchArgv(['batch'], batchNoType)).toBe(EXIT.USAGE);
  });

  it('dispatches batch with file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-batch-'));
    const file = join(dir, 'values.txt');
    writeFileSync(file, `${CPF_GOLDEN_PRIMARY}\ninvalid`, 'utf8');
    const batch = io();
    expect(dispatchArgv(['batch', 'cpf', '--file', file, '--quiet'], batch)).toBe(EXIT.INVALID);
  });

  it('parses verbose and limit flags', () => {
    expect(parseArgv(['bancos', 'list', '--verbose', '--limit', '5']).opts).toMatchObject({
      verbose: true,
      limit: 5,
    });
    expect(parseArgv(['feriados', 'list', '--year', '2026']).opts).toMatchObject({
      year: 2026,
    });
    expect(parseArgv(['inss', 'tabela', '--ano', '2025']).opts).toMatchObject({
      year: 2025,
    });
    expect(parseArgv(['irpf', 'tabela', '--ano', '2025']).opts).toMatchObject({
      year: 2025,
    });
  });

  it('allows optional values for action commands', () => {
    const nfe = io();
    expect(dispatchArgv(['nfe-chave', 'validate'], nfe)).toBe(EXIT.USAGE);

    const brcode = io();
    expect(dispatchArgv(['brcode', 'validate'], brcode)).toBe(EXIT.USAGE);

    const placa = io();
    expect(dispatchArgv(['placa', 'validate'], placa)).toBe(EXIT.USAGE);

    const pix = io();
    expect(dispatchArgv(['pix', 'validate'], pix)).toBe(EXIT.USAGE);

    const cpf = io();
    expect(dispatchArgv(['cpf', 'validate'], cpf)).toBe(EXIT.USAGE);

    const boletoConvert = io();
    expect(dispatchArgv(['boleto', 'convert', 'linha-to-barras'], boletoConvert)).toBe(EXIT.USAGE);

    const boletoDetect = io();
    expect(dispatchArgv(['boleto', 'detect'], boletoDetect)).toBe(EXIT.USAGE);
  });

  it('dispatches bancos lookup and list', () => {
    const lookup = io();
    expect(dispatchArgv(['bancos', 'lookup', '001', '--json'], lookup)).toBe(EXIT.OK);
    const parsed = JSON.parse(lookup.stdout[0]) as { ok: boolean; banco: { codigo: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.banco.codigo).toBe('001');

    const list = io();
    expect(dispatchArgv(['bancos', 'list', '--limit', '3', '--json'], list)).toBe(EXIT.OK);
    const listParsed = JSON.parse(list.stdout[0]) as { total: number };
    expect(listParsed.total).toBe(3);

    const usage = io();
    expect(dispatchArgv(['bancos', 'unknown'], usage)).toBe(EXIT.USAGE);

    const missing = io();
    expect(dispatchArgv(['bancos', 'lookup'], missing)).toBe(EXIT.USAGE);
  });

  it('dispatches reference lookup commands', () => {
    const moedas = io();
    expect(dispatchArgv(['moedas', 'lookup', 'BRL', '--json'], moedas)).toBe(EXIT.OK);
    const parsed = JSON.parse(moedas.stdout[0]) as { ok: boolean; moeda: { codigo: string } };
    expect(parsed.moeda.codigo).toBe('BRL');

    const usage = io();
    expect(dispatchArgv(['portos', 'unknown'], usage)).toBe(EXIT.USAGE);

    const missing = io();
    expect(dispatchArgv(['incoterms', 'lookup'], missing)).toBe(EXIT.USAGE);
  });

  it('dispatches ibge, feriados, tse-municipios, ddd, ptax, cep faixa, and search', () => {
    const ibge = io();
    expect(dispatchArgv(['ibge', 'lookup', '3550308', '--json'], ibge)).toBe(EXIT.OK);

    const estados = io();
    expect(dispatchArgv(['ibge', 'list', 'estados', '--limit', '2'], estados)).toBe(EXIT.OK);
    expect(estados.stdout).toHaveLength(2);

    const feriados = io();
    expect(dispatchArgv(['feriados', 'list', '--year', '2026', '--json'], feriados)).toBe(EXIT.OK);

    const inss = io();
    expect(dispatchArgv(['inss', 'tabela', '--ano', '2025', '--json'], inss)).toBe(EXIT.OK);
    expect(dispatchArgv(['inss', 'calc', '3000', '--json'], io())).toBe(EXIT.OK);

    const inssCalcMissing = io();
    expect(dispatchArgv(['inss', 'calc', '--json'], inssCalcMissing)).toBe(EXIT.USAGE);

    const irpf = io();
    expect(dispatchArgv(['irpf', 'tabela', '--ano', '2025', '--json'], irpf)).toBe(EXIT.OK);
    expect(dispatchArgv(['irpf', 'calc', '3000', '--json'], io())).toBe(EXIT.OK);

    const irpfCalcMissing = io();
    expect(dispatchArgv(['irpf', 'calc', '--json'], irpfCalcMissing)).toBe(EXIT.USAGE);

    const tse = io();
    expect(dispatchArgv(['tse-municipios', 'lookup', '71072', '--json'], tse)).toBe(EXIT.OK);

    const ddd = io();
    expect(dispatchArgv(['ddd', 'lookup', '11', '--json'], ddd)).toBe(EXIT.OK);

    const nfeCuf = io();
    expect(dispatchArgv(['nfe-cuf', 'lookup', '35', '--json'], nfeCuf)).toBe(EXIT.OK);

    const ptax = io();
    expect(dispatchArgv(['ptax', 'lookup', 'USD', '--json', '--verbose'], ptax)).toBe(EXIT.OK);
    expect(
      dispatchArgv(['ptax', 'historico', 'USD', '2026-06-23', '2026-06-24', '--json'], io()),
    ).toBe(EXIT.OK);

    const selic = io();
    expect(dispatchArgv(['selic', '--json'], selic)).toBe(EXIT.OK);
    expect(dispatchArgv(['selic', '--date', '2026-06-18', '--json'], io())).toBe(EXIT.OK);

    const issMunicipal = io();
    expect(dispatchArgv(['iss-municipal', 'lookup', '3550308', '--json'], issMunicipal)).toBe(EXIT.OK);
    expect(dispatchArgv(['iss-municipal', 'list', '--uf', 'SP', '--json'], io())).toBe(EXIT.OK);
    expect(dispatchArgv(['iss-municipal', 'resolve', 'SP', 'São Paulo', '--json'], io())).toBe(EXIT.OK);
    expect(dispatchArgv(['iss-municipal', 'search', 'campinas', '--uf', 'SP', '--json'], io())).toBe(EXIT.OK);

    const faixa = io();
    expect(dispatchArgv(['cep', 'faixa', '01310', '--json'], faixa)).toBe(EXIT.OK);

    const search = io();
    expect(dispatchArgv(['cnae', 'search', 'software', '--json', '--limit', '3'], search)).toBe(EXIT.OK);
  });

  it('dispatches fiscal validate and cst commands', () => {
    const ncmValidate = io();
    expect(dispatchArgv(['ncm', 'validate', '01012100', '--json'], ncmValidate)).toBe(EXIT.OK);
    const parsed = JSON.parse(ncmValidate.stdout[0]) as { value: string; format: string };
    expect(parsed.value).toBe('01012100');
    expect(parsed.format).toBe('0101.21.00');

    const cstValidate = io();
    expect(dispatchArgv(['cst', 'validate', '00', '--tax', 'icms', '--json'], cstValidate)).toBe(EXIT.OK);

    const cstLookup = io();
    expect(dispatchArgv(['cst', 'lookup', '00', '--tax', 'icms', '--json'], cstLookup)).toBe(EXIT.OK);

    const cstSearch = io();
    expect(dispatchArgv(['cst', 'search', 'tributada', '--tax', 'icms', '--limit', '1'], cstSearch)).toBe(EXIT.OK);

    const cfopValidate = io();
    expect(dispatchArgv(['cfop', 'validate', '5102', '--json'], cfopValidate)).toBe(EXIT.OK);

    const cstSearchMissing = io();
    expect(dispatchArgv(['cst', 'search', '--tax', 'icms'], cstSearchMissing)).toBe(EXIT.USAGE);

    const cstValidateMissing = io();
    expect(dispatchArgv(['cst', 'validate', '--tax', 'icms'], cstValidateMissing)).toBe(EXIT.USAGE);

    const cstLookupMissing = io();
    expect(dispatchArgv(['cst', 'lookup', '--tax', 'icms'], cstLookupMissing)).toBe(EXIT.USAGE);

    const ncmValidateMissing = io();
    expect(dispatchArgv(['ncm', 'validate', '--json'], ncmValidateMissing)).toBe(EXIT.USAGE);

    const ncmUsage = io();
    expect(dispatchArgv(['ncm', 'unknown'], ncmUsage)).toBe(EXIT.USAGE);
    expect(ncmUsage.stderr[0]).toContain('validate');

    const cnaeUsage = io();
    expect(dispatchArgv(['cnae', 'unknown'], cnaeUsage)).toBe(EXIT.USAGE);
    expect(cnaeUsage.stderr[0]).not.toContain('validate');

    const cstUsage = io();
    expect(dispatchArgv(['cst', 'validate', '00'], cstUsage)).toBe(EXIT.USAGE);
    expect(dispatchArgv(['cst', 'unknown'], cstUsage)).toBe(EXIT.USAGE);
  });

  it('returns usage for incomplete reference dataset commands', () => {
    const ibgeUsage = io();
    expect(dispatchArgv(['ibge', 'unknown'], ibgeUsage)).toBe(EXIT.USAGE);

    const feriadosUsage = io();
    expect(dispatchArgv(['feriados', 'unknown'], feriadosUsage)).toBe(EXIT.USAGE);

    const inssUsage = io();
    expect(dispatchArgv(['inss', 'unknown'], inssUsage)).toBe(EXIT.USAGE);

    const irpfUsage = io();
    expect(dispatchArgv(['irpf', 'unknown'], irpfUsage)).toBe(EXIT.USAGE);

    const tseUsage = io();
    expect(dispatchArgv(['tse-municipios', 'unknown'], tseUsage)).toBe(EXIT.USAGE);

    const dddUsage = io();
    expect(dispatchArgv(['ddd', 'unknown'], dddUsage)).toBe(EXIT.USAGE);

    const nfeCufUsage = io();
    expect(dispatchArgv(['nfe-cuf', 'unknown'], nfeCufUsage)).toBe(EXIT.USAGE);

    const nfeCufMissing = io();
    expect(dispatchArgv(['nfe-cuf', 'lookup'], nfeCufMissing)).toBe(EXIT.USAGE);

    const ptaxUsage = io();
    expect(dispatchArgv(['ptax', 'unknown'], ptaxUsage)).toBe(EXIT.USAGE);

    const issMunicipalUsage = io();
    expect(dispatchArgv(['iss-municipal', 'unknown'], issMunicipalUsage)).toBe(EXIT.USAGE);

    const issMunicipalResolveMissing = io();
    expect(dispatchArgv(['iss-municipal', 'resolve', 'SP'], issMunicipalResolveMissing)).toBe(EXIT.USAGE);

    const issMunicipalSearchMissing = io();
    expect(dispatchArgv(['iss-municipal', 'search'], issMunicipalSearchMissing)).toBe(EXIT.USAGE);

    const searchUsage = io();
    expect(dispatchArgv(['moedas', 'search', 'real'], searchUsage)).toBe(EXIT.USAGE);

    const cepUsage = io();
    expect(dispatchArgv(['cep', 'unknown'], cepUsage)).toBe(EXIT.USAGE);

    const cepFaixaMissing = io();
    expect(dispatchArgv(['cep', 'faixa'], cepFaixaMissing)).toBe(EXIT.USAGE);

    const cepValidateMissing = io();
    expect(dispatchArgv(['cep', 'validate'], cepValidateMissing)).toBe(EXIT.USAGE);

    const ibgeLookupMissing = io();
    expect(dispatchArgv(['ibge', 'lookup'], ibgeLookupMissing)).toBe(EXIT.USAGE);

    const ibgeMunicipios = io();
    expect(dispatchArgv(['ibge', 'list', 'municipios', '--limit', '2'], ibgeMunicipios)).toBe(EXIT.OK);

    const ibgeListUsage = io();
    expect(dispatchArgv(['ibge', 'list', 'unknown'], ibgeListUsage)).toBe(EXIT.USAGE);

    const tseMissing = io();
    expect(dispatchArgv(['tse-municipios', 'lookup'], tseMissing)).toBe(EXIT.USAGE);

    const ptaxMissing = io();
    expect(dispatchArgv(['ptax', 'lookup'], ptaxMissing)).toBe(EXIT.USAGE);

    const dddMissing = io();
    expect(dispatchArgv(['ddd', 'lookup'], dddMissing)).toBe(EXIT.USAGE);

    const cnaeSearchMissing = io();
    expect(dispatchArgv(['cnae', 'search'], cnaeSearchMissing)).toBe(EXIT.USAGE);

    const cnaeUsage = io();
    expect(dispatchArgv(['cnae', 'unknown'], cnaeUsage)).toBe(EXIT.USAGE);
    expect(cnaeUsage.stderr[0]).toContain('search');
  });
});
