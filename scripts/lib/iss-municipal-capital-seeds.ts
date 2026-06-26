/**
 * ISS rate seeds for Brazilian state capitals — municipal legislation portals.
 * Rates reflect LC 116 Art. 8 band (2%–5%); per-service alíquotas vary by municipal law.
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm#art8
 */

export interface IssMunicipalRateSeed {
  codigoIbge: number;
  aliquotaMin: number;
  aliquotaMax: number;
  leiUrl: string;
}

export const ISS_MUNICIPAL_CAPITAL_SEEDS: readonly IssMunicipalRateSeed[] = [
  { codigoIbge: 1200401, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.riobranco.ac.gov.br/' },
  { codigoIbge: 2704302, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.maceio.al.gov.br/' },
  { codigoIbge: 1600303, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://macapa.ap.gov.br/' },
  { codigoIbge: 1302603, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.manaus.am.gov.br/' },
  { codigoIbge: 2927408, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.salvador.ba.gov.br/' },
  { codigoIbge: 2304400, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.fortaleza.ce.gov.br/' },
  { codigoIbge: 5300108, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.gov.br/planalto/pt-br' },
  { codigoIbge: 3205309, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.vitoria.es.gov.br/' },
  { codigoIbge: 5208707, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.goiania.go.gov.br/' },
  { codigoIbge: 2111300, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.saoluis.ma.gov.br/' },
  { codigoIbge: 5103403, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.cuiaba.mt.gov.br/' },
  { codigoIbge: 5002704, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.campogrande.ms.gov.br/' },
  { codigoIbge: 3106200, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://prefeitura.pbh.gov.br/' },
  { codigoIbge: 1501402, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.belem.pa.gov.br/' },
  { codigoIbge: 2507507, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.joaopessoa.pb.gov.br/' },
  { codigoIbge: 4106902, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.curitiba.pr.gov.br/' },
  { codigoIbge: 2611606, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.recife.pe.gov.br/' },
  { codigoIbge: 2211001, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.teresina.pi.gov.br/' },
  { codigoIbge: 3304557, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.rio.rj.gov.br/' },
  { codigoIbge: 2408102, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.natal.rn.gov.br/' },
  { codigoIbge: 4314902, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.portoalegre.rs.gov.br/' },
  { codigoIbge: 1100205, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.portovelho.ro.gov.br/' },
  { codigoIbge: 1400100, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.boavista.rr.gov.br/' },
  { codigoIbge: 4205407, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.pmf.sc.gov.br/' },
  { codigoIbge: 3550308, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://legislacao.prefeitura.sp.gov.br/' },
  { codigoIbge: 2800308, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.aracaju.se.gov.br/' },
  { codigoIbge: 1721000, aliquotaMin: 2, aliquotaMax: 5, leiUrl: 'https://www.palmas.to.gov.br/' },
];

export const ISS_MUNICIPAL_CAPITAL_IBGE_CODES: readonly number[] = ISS_MUNICIPAL_CAPITAL_SEEDS.map(
  (entry) => entry.codigoIbge,
);
