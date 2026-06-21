/**
 * Inscrição Estadual — per-UF constants (27 UFs).
 * @see docs/IE-STATE-ALGORITHMS.md
 */
import type { UfCode } from '../../types/validation-result.js';

export type { UfCode };

export const IE_SUPPORTED_UFS: readonly UfCode[] = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

export const IE_OFFICIAL_SOURCE_URLS: Readonly<Record<UfCode, string>> = {
  AC: 'https://sefaz.ac.gov.br/',
  AL: 'https://www.sefaz.al.gov.br/calculo',
  AM: 'https://www.sefaz.am.gov.br/',
  AP: 'https://www.sefaz.ap.gov.br/',
  BA: 'https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/',
  CE: 'https://www.sefaz.ce.gov.br/',
  DF: 'https://www.receita.fazenda.df.gov.br/',
  ES: 'https://sitenet.es.gov.br/sefaz/',
  GO: 'http://www.sefaz.go.gov.br/ServicosAFA/ece.html',
  MA: 'https://www.sefaz.ma.gov.br/',
  MG: 'https://www.fazenda.mg.gov.br/empresas/Cadastro/cadastro/consultapublica.html',
  MS: 'https://www.sefaz.ms.gov.br/',
  MT: 'https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=',
  PA: 'https://www.sefa.pa.gov.br/',
  PB: 'https://www.receita.pb.gov.br/',
  PE: 'https://www.sefaz.pe.gov.br/',
  PI: 'https://www.sefaz.pi.gov.br/',
  PR: 'https://www.fazenda.pr.gov.br/Pagina/calculo-digito-verificador',
  RJ: 'https://portal.fazenda.rj.gov.br/cadastro/',
  RN: 'https://www.set.rn.gov.br/',
  RO: 'https://www.sefin.ro.gov.br/',
  RR: 'https://www.sefaz.rr.gov.br/',
  RS: 'https://www.sefaz.rs.gov.br/',
  SC: 'https://sat.sef.sc.gov.br/',
  SE: 'https://www.sefaz.se.gov.br/',
  SP: 'https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx',
  TO: 'https://www.sefaz.to.gov.br/',
};

export const IE_OFFICIAL_SOURCE_URL = 'docs/IE-STATE-ALGORITHMS.md';

export const IE_AC_PREFIX = '01';
export const IE_AL_PREFIX = '24';
export const IE_AM_PREFIX = '04';
export const IE_AP_PREFIX = '03';
export const IE_DF_PREFIX = '07';
export const IE_GO_PREFIXES = ['10', '11', '15', '20'] as const;
export const IE_MA_PREFIX = '12';
export const IE_MS_PREFIX = '28';
export const IE_MT_PREFIX = '13';
export const IE_PA_PREFIX = '15';
export const IE_RN_PREFIX = '20';
export const IE_RR_PREFIX = '24';
export const IE_TO_LEGACY_PREFIXES = ['01', '02', '03', '99'] as const;

export const IE_SP_LENGTH = 12;
export const IE_SP_DV1_WEIGHTS = [1, 3, 4, 5, 6, 7, 8, 10] as const;
export const IE_SP_DV2_WEIGHTS = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_SP_GOLDEN = '110042490114';
export const IE_SP_GOLDEN_MASKED = '110.042.490.114';
export const IE_SP_OFFICIAL_SOURCE_URL = IE_OFFICIAL_SOURCE_URLS.SP;

export const IE_MT_CANONICAL_LENGTH = 9;
export const IE_MT_LEGACY_LENGTH = 11;
export const IE_MT_DV_WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_MT_GOLDEN_LEGACY = '00130000019';
export const IE_MT_GOLDEN_CANONICAL = '130000019';
export const IE_MT_OFFICIAL_SOURCE_URL = IE_OFFICIAL_SOURCE_URLS.MT;

export const IE_DF_LENGTH = 13;
export const IE_DF_DV1_WEIGHTS = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_DF_DV2_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_DF_GOLDEN = '0730000100109';
export const IE_DF_GOLDEN_MASKED = '073.00001.001-09';
export const IE_DF_OFFICIAL_SOURCE_URL = IE_OFFICIAL_SOURCE_URLS.DF;
