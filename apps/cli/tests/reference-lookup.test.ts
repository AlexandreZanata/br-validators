import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  isReferenceLookupCommand,
  isReferenceSearchCommand,
  REFERENCE_LOOKUP_COMMANDS,
  REFERENCE_LOOKUP_MODULES,
  type ReferenceLookupCommand,
} from '../src/commands/reference-lookup/registry.js';
import {
  runReferenceLookup,
  runReferenceLookupCommand,
} from '../src/commands/reference-lookup/lookup.js';

describe('isReferenceLookupCommand', () => {
  it('accepts all registered commands', () => {
    for (const command of REFERENCE_LOOKUP_COMMANDS) {
      expect(isReferenceLookupCommand(command)).toBe(true);
    }
    expect(isReferenceLookupCommand('bancos')).toBe(false);
  });
});

describe('isReferenceSearchCommand', () => {
  it('accepts searchable commands only', () => {
    expect(isReferenceSearchCommand('cnae')).toBe(true);
    expect(isReferenceSearchCommand('moedas')).toBe(false);
  });
});

describe('runReferenceLookupCommand — fiscal modules', () => {
  it('resolves natureza juridica 2062', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('natureza-juridica', '2062', { json: true, verbose: true }, io)).toBe(
      EXIT.OK,
    );
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      naturezaJuridica: { codigo: string };
      capturadoEm?: string;
    };
    expect(parsed.naturezaJuridica.codigo).toBe('2062');
    expect(parsed.capturadoEm).toBe(REFERENCE_LOOKUP_MODULES['natureza-juridica'].capturadoEm);
  });

  it('resolves NBS code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('nbs', '1.1502.50.00', { json: true, verbose: false }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { nbs: { codigo: string } };
    expect(parsed.nbs.codigo).toBe('1.1502.50.00');
  });

  it('resolves CEST code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('cest', '0302100', { json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('0302100');
  });

  it('resolves CNAE, CFOP, NCM, and CBO codes', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('cnae', '6201501', { json: true, verbose: false }, io)).toBe(EXIT.OK);
    const cnae = JSON.parse(io.stdout[0]) as { cnae: { codigo: string } };
    expect(cnae.cnae.codigo).toBe('6201501');

    io.stdout.length = 0;
    runReferenceLookupCommand('cfop', '1102', { json: true, verbose: false }, io);
    const cfop = JSON.parse(io.stdout[0]) as { cfop: { codigo: string } };
    expect(cfop.cfop.codigo).toBe('1102');

    io.stdout.length = 0;
    runReferenceLookupCommand('ncm', '12011000', { json: true, verbose: false }, io);
    const ncm = JSON.parse(io.stdout[0]) as { ncm: { codigo: string } };
    expect(ncm.ncm.codigo).toBe('12011000');

    io.stdout.length = 0;
    runReferenceLookupCommand('cbo', '212405', { json: false, verbose: false }, io);
    expect(io.stdout[0]).toContain('212405');
  });
});

describe('runReferenceLookupCommand — trade modules', () => {
  it('resolves moeda BRL', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('moedas', 'BRL', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { moeda: { codigo: string } };
    expect(parsed.moeda.codigo).toBe('BRL');
  });

  it('resolves pais bacen 1058', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('paises-bacen', '1058', { json: false, verbose: true }, io);
    expect(io.stdout[0]).toContain('1058');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('resolves incoterm FOB', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('incoterms', 'FOB', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { incoterm: { codigo: string } };
    expect(parsed.incoterm.codigo).toBe('FOB');
  });
});

describe('runReferenceLookupCommand — logistics modules', () => {
  it('resolves porto BRSSZ', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('portos', 'BRSSZ', { json: false, verbose: false }, io);
    expect(io.stdout[0]).toContain('BRSSZ');
  });

  it('resolves aeroporto by IATA GRU', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('aeroportos', 'GRU', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { aeroporto: { icao: string } };
    expect(parsed.aeroporto.icao).toBe('SBGR');
  });

  it('resolves aeroporto by ICAO SBGR', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceLookupCommand('aeroportos', 'SBGR', { json: false, verbose: false }, io);
    expect(io.stdout[0]).toContain('SBGR');
  });
});

describe('runReferenceLookupCommand — errors', () => {
  it('returns usage for empty input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('moedas', '  ', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing code');
  });

  it('returns invalid for unknown code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('incoterms', 'ZZZ', { json: false, verbose: false }, io)).toBe(
      EXIT.INVALID,
    );
    expect(io.stderr[0]).toContain('not in embedded table');
  });

  it('emits JSON failure shape', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('incoterms', 'ZZZ', { json: true, verbose: false }, io)).toBe(
      EXIT.INVALID,
    );
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; code: string; message: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBe('NOT_FOUND');
    expect(parsed.message).toContain('not in embedded table');
  });

  it('emits JSON failure for invalid aeroporto code shape', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookupCommand('aeroportos', 'ZZZZZ', { json: true, verbose: false }, io)).toBe(
      EXIT.INVALID,
    );
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; code: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBe('INVALID_FORMAT');
  });
});

describe('runReferenceLookup', () => {
  it('dispatches known command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookup('portos', 'BRSSZ', { json: true, verbose: false }, io)).toBe(EXIT.OK);
  });

  it('rejects unknown command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookup('unknown', 'x', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('rejects missing value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceLookup('moedas', undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('REFERENCE_LOOKUP_MODULES formatters', () => {
  it('formats human lines for each module registry entry', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const humanCases: Array<[ReferenceLookupCommand, string]> = [
      ['natureza-juridica', '2062'],
      ['nbs', '1.1502.50.00'],
      ['cnae', '6201501'],
      ['cfop', '1102'],
      ['ncm', '12011000'],
      ['cbo', '212405'],
      ['moedas', 'BRL'],
      ['incoterms', 'CIF'],
    ];

    for (const [command, code] of humanCases) {
      expect(runReferenceLookupCommand(command, code, { json: false, verbose: true }, io)).toBe(EXIT.OK);
      expect(io.stdout.at(-1)).toContain('capturadoEm:');
    }
  });

  it('formats aeroporto human line and rejects invalid airport codes', () => {
    const aeroportos = REFERENCE_LOOKUP_MODULES.aeroportos;
    const gru = aeroportos.lookup('GRU');
    expect(gru.ok).toBe(true);
    if (gru.ok) {
      expect(aeroportos.formatHuman(gru.value)).toContain('GRU');
    }
    expect(aeroportos.lookup('ZZ').ok).toBe(false);
    expect(aeroportos.lookup('ZZZZZ').ok).toBe(false);
    const empty = aeroportos.lookup('');
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.code).toBe('INVALID_INPUT');
    }
    expect(
      aeroportos.formatHuman({
        iata: null,
        icao: 'SDXX',
        nome: 'Test Field',
        uf: 'SP',
        municipioIbge: null,
        municipioNome: null,
      }),
    ).toContain('—/SDXX');
  });

  it('formats moeda without symbol', () => {
    const moedas = REFERENCE_LOOKUP_MODULES.moedas;
    expect(
      moedas.formatHuman({
        codigo: 'XXX',
        nome: 'Test Currency',
        simbolo: null,
        tipoBacen: null,
      }),
    ).toContain('(—)');
  });
});
