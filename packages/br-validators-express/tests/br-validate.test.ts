import { describe, expect, it } from 'vitest';
import {
  listBrValidateFields,
  resolveBrValidateUf,
  createBrValidateHandler,
} from '../src/br-validate.js';
import { BR_VALIDATOR_TYPE_IDS, isBrValidatorTypeId } from '../src/types.js';
import { requiresUf, runBrValidator } from '../src/validator-registry.js';
import { GOLDEN, runHandler } from './test-helpers.js';

describe('types', () => {
  it('lists 18 validator type ids', () => {
    expect(BR_VALIDATOR_TYPE_IDS).toHaveLength(18);
    expect(isBrValidatorTypeId('cpf')).toBe(true);
    expect(isBrValidatorTypeId('unknown')).toBe(false);
  });
});

describe('listBrValidateFields', () => {
  it('collects body, query, and params schemas', () => {
    const fields = listBrValidateFields({
      body: { cpf: 'cpf' },
      query: { cep: 'cep' },
      params: { id: 'cnpj' },
    });
    expect(fields).toEqual([
      { location: 'body', field: 'cpf', typeId: 'cpf' },
      { location: 'query', field: 'cep', typeId: 'cep' },
      { location: 'params', field: 'id', typeId: 'cnpj' },
    ]);
  });
});

describe('resolveBrValidateUf', () => {
  it('reads static and dynamic UF sources', () => {
    expect(resolveBrValidateUf({ value: 'SP' }, {})).toBe('SP');
    expect(resolveBrValidateUf({ from: 'body', field: 'uf' }, { body: { uf: 'rj' } })).toBe('RJ');
    expect(resolveBrValidateUf({ from: 'query', field: 'uf' }, { query: { uf: '  ' } })).toBeUndefined();
    expect(resolveBrValidateUf(undefined, {})).toBeUndefined();
  });

  it('reads uf from params and ignores non-string uf values', () => {
    expect(resolveBrValidateUf({ from: 'params', field: 'uf' }, { params: { uf: 'sp' } })).toBe('SP');
    expect(resolveBrValidateUf({ from: 'body', field: 'uf' }, { body: { uf: 1 } })).toBeUndefined();
  });
});

describe('listBrValidateFields empty', () => {
  it('returns empty field list for empty options', () => {
    expect(listBrValidateFields({})).toEqual([]);
  });
});

describe('requiresUf', () => {
  it('marks UF-dependent validator types', () => {
    expect(requiresUf('inscricao-estadual')).toBe(true);
    expect(requiresUf('rg')).toBe(true);
    expect(requiresUf('cpf')).toBe(false);
  });
});

describe('runBrValidator', () => {
  it('validates cpf via core', () => {
    expect(runBrValidator('cpf', GOLDEN.cpf, {}).ok).toBe(true);
    expect(runBrValidator('cpf', '00000000000', {}).ok).toBe(false);
  });

  it('requires uf for ie and rg', () => {
    expect(runBrValidator('inscricao-estadual', GOLDEN.ie, {}).ok).toBe(false);
    expect(runBrValidator('inscricao-estadual', GOLDEN.ie, { uf: 'SP' }).ok).toBe(true);
    expect(runBrValidator('rg', GOLDEN.rg, { uf: 'SP' }).ok).toBe(true);
    expect(runBrValidator('rg', '123456', { uf: 'AC' }).ok).toBe(true);
    expect(runBrValidator('rg', '1234567', { uf: 'AL' }).ok).toBe(true);
    expect(runBrValidator('rg', '123456789', { uf: 'AM' }).ok).toBe(true);
    expect(runBrValidator('rg', '123456789', { uf: 'AP' }).ok).toBe(true);
    expect(runBrValidator('rg', '1234567', { uf: 'DF' }).ok).toBe(true);
    expect(runBrValidator('rg', GOLDEN.rg, { uf: 'CE' }).ok).toBe(false);
    expect(runBrValidator('inscricao-estadual-produtor-rural', GOLDEN.ieRural, { uf: 'SP' }).ok).toBe(true);
  });
});

describe('createBrValidateHandler', () => {
  const handler = createBrValidateHandler({
    body: { cpf: 'cpf', ie: 'inscricao-estadual' },
    query: { cep: 'cep' },
    params: { pixKey: 'pix' },
    uf: { from: 'body', field: 'uf' },
  });

  it('calls next when all fields are valid', () => {
    const result = runHandler(handler, {
      body: { cpf: GOLDEN.cpf, ie: GOLDEN.ie, uf: 'SP' },
      query: { cep: '01310100' },
      params: { pixKey: GOLDEN.pix },
    });
    expect(result.nextCalled).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  it('returns structured 400 for missing field', () => {
    const result = runHandler(handler, {
      body: { ie: GOLDEN.ie, uf: 'SP' },
      query: { cep: '01310100' },
      params: { pixKey: GOLDEN.pix },
    });
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.payload).toEqual({
      ok: false,
      field: 'cpf',
      code: 'EMPTY_INPUT',
      message: 'Field is required',
    });
  });

  it('returns structured 400 for invalid cpf', () => {
    const result = runHandler(handler, {
      body: { cpf: '00000000000', ie: GOLDEN.ie, uf: 'SP' },
      query: { cep: '01310100' },
      params: { pixKey: GOLDEN.pix },
    });
    expect(result.statusCode).toBe(400);
    expect(result.payload).toMatchObject({ ok: false, field: 'cpf' });
  });

  it('returns structured 400 for non-string value', () => {
    const result = runHandler(handler, {
      body: { cpf: 123, ie: GOLDEN.ie, uf: 'SP' },
      query: { cep: '01310100' },
      params: { pixKey: GOLDEN.pix },
    });
    expect(result.payload).toEqual({
      ok: false,
      field: 'cpf',
      code: 'UNSUPPORTED_FORMAT',
      message: 'Value must be a string',
    });
  });

  it('returns structured 400 for empty string', () => {
    const result = runHandler(handler, {
      body: { cpf: '   ', ie: GOLDEN.ie, uf: 'SP' },
      query: { cep: '01310100' },
      params: { pixKey: GOLDEN.pix },
    });
    expect(result.payload).toMatchObject({
      ok: false,
      field: 'cpf',
      code: 'EMPTY_INPUT',
    });
  });

  it('returns structured 400 when uf is missing for ie', () => {
    const ieHandler = createBrValidateHandler({
      body: { ie: 'inscricao-estadual' },
    });
    const result = runHandler(ieHandler, { body: { ie: GOLDEN.ie } });
    expect(result.payload).toMatchObject({
      ok: false,
      field: 'ie',
      code: 'UNSUPPORTED_FORMAT',
    });
  });

  it('validates params location', () => {
    const paramsHandler = createBrValidateHandler({
      params: { cpf: 'cpf' },
    });
    const bad = runHandler(paramsHandler, { params: {} });
    expect(bad.payload).toMatchObject({ field: 'cpf', code: 'EMPTY_INPUT' });
  });

  it('returns structured 400 when body location is missing', () => {
    const bodyHandler = createBrValidateHandler({ body: { cpf: 'cpf' } });
    const result = runHandler(bodyHandler, {});
    expect(result.payload).toMatchObject({ field: 'cpf', code: 'EMPTY_INPUT' });
  });

  it('returns structured 400 for null value', () => {
    const result = runHandler(createBrValidateHandler({ body: { cpf: 'cpf' } }), {
      body: { cpf: null },
    });
    expect(result.payload).toMatchObject({ field: 'cpf', code: 'EMPTY_INPUT' });
  });

  it('validates query location', () => {
    const queryHandler = createBrValidateHandler({ query: { cpf: 'cpf' } });
    const ok = runHandler(queryHandler, { query: { cpf: GOLDEN.cpf } });
    expect(ok.nextCalled).toBe(true);
    const bad = runHandler(queryHandler, { query: {} });
    expect(bad.payload).toMatchObject({ field: 'cpf', code: 'EMPTY_INPUT' });
  });
});

describe('all validator types', () => {
  const cases = [
    ['cpf', GOLDEN.cpf, {}],
    ['cnpj', GOLDEN.cnpj, {}],
    ['cep', '01310100', {}],
    ['placa', 'ABC1D23', {}],
    ['pis-pasep', '10027230888', {}],
    ['pix', GOLDEN.pix, {}],
    ['telefone', '11999999999', {}],
    ['boleto', GOLDEN.boleto, {}],
    ['cartao-credito', '4111111111111111', {}],
    ['cnh', GOLDEN.cnh, {}],
    ['renavam', GOLDEN.renavam, {}],
    ['nfe-chave', GOLDEN.nfe, {}],
    ['titulo-eleitor', GOLDEN.titulo, {}],
    ['processo-judicial', GOLDEN.processo, {}],
    ['inscricao-estadual', GOLDEN.ie, { uf: 'SP' as const }],
    ['inscricao-estadual-produtor-rural', GOLDEN.ieRural, { uf: 'SP' as const }],
    ['brcode', GOLDEN.brcode, {}],
    ['rg', GOLDEN.rg, { uf: 'SP' as const }],
  ] as const;

  it.each(cases)('validates %s', (typeId, value, context) => {
    expect(runBrValidator(typeId, value, context).ok).toBe(true);
  });
});
