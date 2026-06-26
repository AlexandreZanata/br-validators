import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  getBancoPorCodigo,
  lookupBancoPorCodigo,
} from '../../src/bancos/index.js';
import {
  getCfopPorCodigo,
  lookupCfopPorCodigo,
} from '../../src/cfop/index.js';
import {
  getCstIcmsPorCodigo,
  lookupCstIcmsPorCodigo,
} from '../../src/cst/index.js';
import {
  getMunicipioPorCodigo,
  lookupMunicipioPorCodigo,
} from '../../src/ibge/index.js';
import {
  getNcmPorCodigo,
  lookupNcmPorCodigo,
} from '../../src/ncm/index.js';
import {
  getPncpModalidadePorId,
  lookupPncpModalidadePorId,
} from '../../src/pncp-reference/index.js';
import { unwrapLookupValue } from '../../src/types/lookup-result.js';

const vectorsDir = join(dirname(fileURLToPath(import.meta.url)), '../vectors');

function loadOfficialVector(name: string): object {
  const raw = readFileSync(join(vectorsDir, `${name}.official.json`), 'utf8');
  return JSON.parse(raw) as object;
}

describe('lookupNcmPorCodigo — golden vectors', () => {
  const vectors = loadOfficialVector('ncm') as {
    golden: { cavalosReprodutores: { codigo: string; descricaoContains: string } };
  };

  it('hits official NCM code', () => {
    const codigo = vectors.golden.cavalosReprodutores.codigo;
    const result = lookupNcmPorCodigo(codigo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.descricao).toContain(vectors.golden.cavalosReprodutores.descricaoContains);
    }
  });

  it('returns NOT_FOUND for unknown code', () => {
    const result = lookupNcmPorCodigo('99999999');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_FOUND');
    }
  });

  it('returns INVALID_INPUT for empty code', () => {
    const result = lookupNcmPorCodigo('   ');
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'NCM code is required',
    });
  });

  it('returns INVALID_FORMAT for non-numeric garbage', () => {
    const result = lookupNcmPorCodigo('abc');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_FORMAT');
    }
  });

  it('getNcmPorCodigo stays undefined on lookup failure (v1.x compat)', () => {
    expect(getNcmPorCodigo('99999999')).toBeUndefined();
    expect(getNcmPorCodigo('')).toBeUndefined();
    expect(unwrapLookupValue(lookupNcmPorCodigo(vectors.golden.cavalosReprodutores.codigo))).toEqual(
      getNcmPorCodigo(vectors.golden.cavalosReprodutores.codigo),
    );
  });
});

describe('lookupCfopPorCodigo — golden vectors', () => {
  const vectors = loadOfficialVector('cfop') as {
    golden: { compraComercializacao: { codigo: string; descricaoContains: string } };
  };

  it('hits official CFOP code', () => {
    const codigo = vectors.golden.compraComercializacao.codigo;
    const result = lookupCfopPorCodigo(codigo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.descricao).toContain(
        vectors.golden.compraComercializacao.descricaoContains,
      );
    }
  });

  it('getCfopPorCodigo returns undefined when lookup fails', () => {
    expect(getCfopPorCodigo('9999')).toBeUndefined();
    expect(unwrapLookupValue(lookupCfopPorCodigo('9999'))).toBeUndefined();
  });
});

describe('lookupCstIcmsPorCodigo — golden vectors', () => {
  const vectors = loadOfficialVector('cst') as {
    golden: { icmsTributada: { codigo: string; descricaoContains: string } };
  };

  it('hits official ICMS CST', () => {
    const result = lookupCstIcmsPorCodigo(vectors.golden.icmsTributada.codigo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.descricao.toLowerCase()).toContain(
        vectors.golden.icmsTributada.descricaoContains,
      );
    }
  });

  it('getCstIcmsPorCodigo preserves undefined on miss', () => {
    expect(getCstIcmsPorCodigo('99')).toBeUndefined();
  });
});

describe('lookupBancoPorCodigo — golden vectors', () => {
  const vectors = loadOfficialVector('bancos') as {
    golden: { bb: { codigo: string; nomeContains: string } };
  };

  it('hits BB COMPE code', () => {
    const result = lookupBancoPorCodigo(vectors.golden.bb.codigo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nome).toContain(vectors.golden.bb.nomeContains);
    }
  });

  it('getBancoPorCodigo returns undefined on miss', () => {
    expect(getBancoPorCodigo('999')).toBeUndefined();
  });
});

describe('lookupMunicipioPorCodigo — IBGE golden', () => {
  const vectors = loadOfficialVector('ibge.cmunfg') as {
    golden: { saoPaulo: { codigo: number } };
  };

  it('hits São Paulo municipality', () => {
    const result = lookupMunicipioPorCodigo(vectors.golden.saoPaulo.codigo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.codigo).toBe(vectors.golden.saoPaulo.codigo);
    }
  });

  it('getMunicipioPorCodigo returns undefined on miss', () => {
    expect(getMunicipioPorCodigo(9999999)).toBeUndefined();
  });
});

describe('lookupPncpModalidadePorId — golden vectors', () => {
  const vectors = loadOfficialVector('pncp-reference') as {
    golden: { pregaoEletronico: { id: number; nomeContains: string } };
  };

  it('hits PNCP modalidade id', () => {
    const result = lookupPncpModalidadePorId(vectors.golden.pregaoEletronico.id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nome).toContain(vectors.golden.pregaoEletronico.nomeContains);
    }
  });

  it('getPncpModalidadePorId returns undefined on miss', () => {
    expect(getPncpModalidadePorId(99999)).toBeUndefined();
  });
});
