/* eslint-disable @typescript-eslint/no-deprecated -- verifies legacy alias delegates to getAll* until v2.0 */
import { describe, expect, it } from 'vitest';

import { getAllAeroportos, getAeroportos } from '../../src/aeroportos/index.js';
import {
  getAllAnpPrecosMedios,
  getAllAnpSemanasPesquisa,
  getAnpPrecosMediosEmbedded,
  getAnpSemanasPesquisa,
} from '../../src/anp-combustiveis/index.js';
import { getAllBancos, getBancos } from '../../src/bancos/index.js';
import { getAllCbo, getCbos } from '../../src/cbo/index.js';
import { getAllCest, getCests } from '../../src/cest/index.js';
import { getAllCfop, getCfops } from '../../src/cfop/index.js';
import { getAllCnae, getCnaes } from '../../src/cnaes/index.js';
import {
  getAllCstCofins,
  getAllCstIcms,
  getAllCstIpi,
  getAllCstPis,
  getCstCofins,
  getCstIcms,
  getCstIpi,
  getCstPis,
} from '../../src/cst/index.js';
import { getAllEsocialCategorias, getEsocialCategorias } from '../../src/esocial/index.js';
import { getAllFeriados, getFeriadosNacionais } from '../../src/feriados/index.js';
import {
  getAllEstados,
  getAllMunicipios,
  getEstados,
  getMunicipios,
} from '../../src/ibge/index.js';
import { getAllIbptCargas, getIbptCargas } from '../../src/ibpt/index.js';
import { getAllIncoterms, getIncoterms } from '../../src/incoterms/index.js';
import { getAllLc116, getLc116List } from '../../src/lc116/index.js';
import { getAllMoedas, getMoedas } from '../../src/moedas/index.js';
import { getAllNbs, getNbsList } from '../../src/nbs/index.js';
import {
  getAllNaturezaJuridica,
  getNaturezasJuridicas,
} from '../../src/natureza-juridica/index.js';
import { getAllNcm, getNcms } from '../../src/ncm/index.js';
import { getAllPaisesBacen, getPaisesBacen } from '../../src/paises-bacen/index.js';
import {
  getAllPncpAmparosLegais,
  getAllPncpModalidades,
  getAllPncpReference,
  getPncpAmparosLegais,
  getPncpModalidades,
  getPncpReferenceTable,
} from '../../src/pncp-reference/index.js';
import { getAllPortos, getPortos } from '../../src/portos/index.js';
import { getAllSimplesAnexos, getSimplesAnexos } from '../../src/simples-nacional/index.js';

type GetAllPair = {
  label: string;
  getAll: () => readonly object[];
  legacy: () => readonly object[];
};

const STATIC_LIST_PAIRS: GetAllPair[] = [
  { label: 'NCM', getAll: getAllNcm, legacy: getNcms },
  { label: 'CFOP', getAll: getAllCfop, legacy: getCfops },
  { label: 'CNAE', getAll: getAllCnae, legacy: getCnaes },
  { label: 'CBO', getAll: getAllCbo, legacy: getCbos },
  { label: 'CST ICMS', getAll: getAllCstIcms, legacy: getCstIcms },
  { label: 'CST IPI', getAll: getAllCstIpi, legacy: getCstIpi },
  { label: 'CST PIS', getAll: getAllCstPis, legacy: getCstPis },
  { label: 'CST COFINS', getAll: getAllCstCofins, legacy: getCstCofins },
  { label: 'LC 116', getAll: getAllLc116, legacy: getLc116List },
  { label: 'NBS', getAll: getAllNbs, legacy: getNbsList },
  { label: 'CEST', getAll: getAllCest, legacy: getCests },
  { label: 'Bancos', getAll: getAllBancos, legacy: getBancos },
  { label: 'Moedas', getAll: getAllMoedas, legacy: getMoedas },
  { label: 'Países Bacen', getAll: getAllPaisesBacen, legacy: getPaisesBacen },
  { label: 'Incoterms', getAll: getAllIncoterms, legacy: getIncoterms },
  { label: 'Portos', getAll: getAllPortos, legacy: getPortos },
  { label: 'Aeroportos', getAll: getAllAeroportos, legacy: getAeroportos },
  {
    label: 'Natureza jurídica',
    getAll: getAllNaturezaJuridica,
    legacy: getNaturezasJuridicas,
  },
  { label: 'eSocial', getAll: getAllEsocialCategorias, legacy: getEsocialCategorias },
  { label: 'IBGE estados', getAll: getAllEstados, legacy: getEstados },
  { label: 'Simples Nacional', getAll: getAllSimplesAnexos, legacy: getSimplesAnexos },
  { label: 'IBPT', getAll: getAllIbptCargas, legacy: getIbptCargas },
  {
    label: 'ANP semanas',
    getAll: getAllAnpSemanasPesquisa,
    legacy: getAnpSemanasPesquisa,
  },
  {
    label: 'ANP preços médios',
    getAll: getAllAnpPrecosMedios,
    legacy: getAnpPrecosMediosEmbedded,
  },
  { label: 'PNCP modalidades', getAll: getAllPncpModalidades, legacy: getPncpModalidades },
  {
    label: 'PNCP amparos legais',
    getAll: getAllPncpAmparosLegais,
    legacy: getPncpAmparosLegais,
  },
];

describe('lookup getAll* — canonical list getters', () => {
  it.each(STATIC_LIST_PAIRS)('$label returns non-empty readonly list identical to legacy alias', ({
    getAll,
    legacy,
  }) => {
    const all = getAll();
    expect(all.length).toBeGreaterThan(0);
    expect(legacy()).toBe(all);
  });

  it('IBGE getAllMunicipios matches legacy alias for full and UF-filtered lists', () => {
    const all = getAllMunicipios();
    expect(all.length).toBeGreaterThan(0);
    expect(getMunicipios()).toBe(all);
    expect(getAllMunicipios({ uf: 'SP' })).toStrictEqual(getMunicipios({ uf: 'SP' }));
    expect(getAllMunicipios({ uf: 'ZZ' })).toEqual([]);
  });

  it('Feriados getAllFeriados matches legacy alias for valid and invalid years', () => {
    const year = 2026;
    const all = getAllFeriados(year);
    expect(all.length).toBeGreaterThan(0);
    expect(getFeriadosNacionais(year)).toStrictEqual(all);
    expect(getAllFeriados(2026.5)).toEqual([]);
    expect(getFeriadosNacionais(2026.5)).toStrictEqual(getAllFeriados(2026.5));
  });

  it('PNCP getAllPncpReference matches legacy getPncpReferenceTable per table id', () => {
    const tableId = 'modalidades' as const;
    expect(getAllPncpReference(tableId)).toBe(getPncpReferenceTable(tableId));
    expect(getAllPncpReference(tableId).length).toBeGreaterThan(0);
  });
});
