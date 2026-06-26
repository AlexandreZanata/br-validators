/**
 * RG (Registro Geral) — per-UF rules (phase 1: SP, RJ, MG, RS, PR, SC).
 * @see http://ghiorzi.org/DVnew.htm — SSP-SP, IFP-RJ, MaSP-MG check digits
 */
import type { RgUfCode, UfCode } from '../../types/validation-result.js';
import type { RgUfRules } from './types.js';

export const RG_OFFICIAL_SOURCE_URL = 'http://ghiorzi.org/DVnew.htm';

export const RG_OFFICIAL_SOURCE_URLS: Record<RgUfCode, string> = {
  SP: 'http://ghiorzi.org/DVnew.htm',
  RJ: 'http://ghiorzi.org/DVnew.htm',
  MG: 'http://ghiorzi.org/DVnew.htm',
  PR: 'https://www.iipar.pr.gov.br/',
  RS: 'https://www.estado.rs.gov.br/',
  SC: 'https://www.ciasc.sc.gov.br/',
  BA: 'https://www.ba.gov.br/policiatecnica/972/instituto-de-identificacao-pedro-mello-iipm',
  AC: 'https://www.policiacivil.ac.gov.br/',
  AL: 'https://alagoasdigital.al.gov.br/servico/8',
  AM: 'https://www.ssp.am.gov.br/instituto-de-identificacao-tira-duvidas-sobre-emissao-de-documentos/',
  AP: 'https://apdigital.portal.ap.gov.br/carta-de-servico/solicitacao-de-agendamento-para-emissao-da-1o-via-da-carteira-de-identidade-nacional-cin1',
  DF: 'https://www.nahora.df.gov.br/policia_civil/',
};

export const RG_SUPPORTED_UFS = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'AC', 'AL', 'AM', 'AP', 'DF'] as const satisfies readonly RgUfCode[];

/** Brazilian UFs without RG validator yet — community contributions (phase 33c). */
export const RG_PENDING_UFS = [
  'CE',
  'ES',
  'GO',
  'MA',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'RN',
  'RO',
  'RR',
  'SE',
  'TO',
] as const satisfies readonly UfCode[];

/** SSP / Polícia Civil entry points for pending UF research — not algorithm sources. */
export const RG_RESEARCH_URLS: Record<(typeof RG_PENDING_UFS)[number], string> = {
  CE: 'https://www.policiacivil.ce.gov.br/',
  ES: 'https://www.policiacivil.es.gov.br/',
  GO: 'https://www.policiacivil.go.gov.br/',
  MA: 'https://www.policiacivil.ma.gov.br/',
  MS: 'https://www.pc.ms.gov.br/',
  MT: 'https://www.policiacivil.mt.gov.br/',
  PA: 'https://www.policiacivil.pa.gov.br/',
  PB: 'https://www.policiacivil.pb.gov.br/',
  PE: 'https://www.policiacivil.pe.gov.br/',
  PI: 'https://www.policiacivil.pi.gov.br/',
  RN: 'https://www.policiacivil.rn.gov.br/',
  RO: 'https://www.policiacivil.ro.gov.br/',
  RR: 'https://www.policiacivil.rr.gov.br/',
  SE: 'https://www.policiacivil.se.gov.br/',
  TO: 'https://www.policiacivil.to.gov.br/',
};

export const RG_SP_GOLDEN = '120300011';
export const RG_SP_GOLDEN_MASKED = '12.030.001-1';
export const RG_SP_GOLDEN_X = '00000005X';
export const RG_SP_GOLDEN_X_MASKED = '00.000.005-X';

export const RG_RJ_GOLDEN = '27998111';
export const RG_RJ_GOLDEN_MASKED = '2.799.811-1';

export const RG_MG_GOLDEN = '27998111';
export const RG_MG_GOLDEN_MASKED = '2.799.811-1';
export const RG_MG_GOLDEN_PREFIXED = 'M27998111';

export const RG_PR_GOLDEN = '12345678';

export const RG_RS_GOLDEN = '1234567890';

export const RG_SC_GOLDEN = '123456789';

export const RG_BA_GOLDEN = '1234567800';

export const RG_AC_GOLDEN = '123456';

export const RG_AL_GOLDEN = '1234567';

export const RG_AM_GOLDEN = '123456789';

export const RG_AP_GOLDEN = '123456789';

export const RG_DF_GOLDEN = '1234567';

export const RG_UF_RULES: Record<RgUfCode, RgUfRules> = {
  SP: {
    uf: 'SP',
    canonicalLength: 9,
    baseLength: 8,
    dvAlgorithm: 'mod11-remainder',
    allowsCheckDigitX: true,
    supportsMask: true,
  },
  RJ: {
    uf: 'RJ',
    canonicalLength: 8,
    baseLength: 7,
    dvAlgorithm: 'mod10-alternating',
    allowsCheckDigitX: false,
    supportsMask: true,
  },
  MG: {
    uf: 'MG',
    canonicalLength: 8,
    baseLength: 7,
    dvAlgorithm: 'mod10-alternating',
    allowsCheckDigitX: false,
    allowsLetterPrefix: 'M',
    supportsMask: true,
  },
  PR: {
    uf: 'PR',
    canonicalLength: 8,
    baseLength: 8,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  RS: {
    uf: 'RS',
    canonicalLength: 10,
    baseLength: 10,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  SC: {
    uf: 'SC',
    canonicalLength: 9,
    baseLength: 9,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: true,
  },
  BA: {
    uf: 'BA',
    canonicalLength: 10,
    baseLength: 10,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  AC: {
    uf: 'AC',
    canonicalLength: 6,
    baseLength: 6,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  AL: {
    uf: 'AL',
    canonicalLength: 7,
    baseLength: 7,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  AM: {
    uf: 'AM',
    canonicalLength: 9,
    baseLength: 9,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  AP: {
    uf: 'AP',
    canonicalLength: 9,
    baseLength: 9,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  DF: {
    uf: 'DF',
    canonicalLength: 7,
    baseLength: 7,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
};
