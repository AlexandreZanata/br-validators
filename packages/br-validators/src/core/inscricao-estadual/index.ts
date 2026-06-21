/**
 * Inscrição Estadual validation — per-UF algorithms (27 UFs).
 * @see docs/use-cases/UC-009-validate-inscricao-estadual.md
 */
import type { FormatResult, InscricaoEstadualValidationResult, UfCode } from '../../types/validation-result.js';
import { validateIeAc } from './ac.js';
import { validateIeAl } from './al.js';
import { validateIeAm } from './am.js';
import { validateIeAp } from './ap.js';
import { validateIeBa } from './ba.js';
import { validateIeCe } from './ce.js';
import { IE_OFFICIAL_SOURCE_URLS, IE_SUPPORTED_UFS } from './constants.js';
import { validateIeDf } from './df.js';
import { validateIeEs } from './es.js';
import { validateIeGo } from './go.js';
import { validateIeMa } from './ma.js';
import { validateIeMg } from './mg.js';
import { validateIeMs } from './ms.js';
import { validateIeMt } from './mt.js';
import { applyIeDfMask, applyIeSpMask } from './mask.js';
import { validateIePa } from './pa.js';
import { validateIePb } from './pb.js';
import { validateIePe } from './pe.js';
import { validateIePi } from './pi.js';
import { validateIePr } from './pr.js';
import { validateIeRj } from './rj.js';
import { validateIeRn } from './rn.js';
import { validateIeRo } from './ro.js';
import { validateIeRr } from './rr.js';
import { validateIeRs } from './rs.js';
import { validateIeSc } from './sc.js';
import { validateIeSe } from './se.js';
import { validateIeSp } from './sp.js';
import { validateIeTo } from './to.js';

export {
  IE_AC_PREFIX,
  IE_AL_PREFIX,
  IE_AM_PREFIX,
  IE_AP_PREFIX,
  IE_DF_GOLDEN,
  IE_DF_GOLDEN_MASKED,
  IE_DF_LENGTH,
  IE_DF_OFFICIAL_SOURCE_URL,
  IE_DF_PREFIX,
  IE_GO_PREFIXES,
  IE_MA_PREFIX,
  IE_MS_PREFIX,
  IE_MT_CANONICAL_LENGTH,
  IE_MT_GOLDEN_CANONICAL,
  IE_MT_GOLDEN_LEGACY,
  IE_MT_LEGACY_LENGTH,
  IE_MT_OFFICIAL_SOURCE_URL,
  IE_MT_PREFIX,
  IE_OFFICIAL_SOURCE_URL,
  IE_OFFICIAL_SOURCE_URLS,
  IE_PA_PREFIX,
  IE_RN_PREFIX,
  IE_RR_PREFIX,
  IE_SP_GOLDEN,
  IE_SP_GOLDEN_MASKED,
  IE_SP_LENGTH,
  IE_SP_OFFICIAL_SOURCE_URL,
  IE_SUPPORTED_UFS,
  IE_TO_LEGACY_PREFIXES,
} from './constants.js';
export type { UfCode } from './constants.js';
export { stripIeAc, validateIeAc } from './ac.js';
export { stripIeAl, validateIeAl } from './al.js';
export { stripIeAm, validateIeAm } from './am.js';
export { stripIeAp, validateIeAp } from './ap.js';
export { stripIeBa, validateIeBa } from './ba.js';
export { stripIeCe, validateIeCe } from './ce.js';
export { stripIeDf, validateIeDf } from './df.js';
export { stripIeEs, validateIeEs } from './es.js';
export { stripIeGo, validateIeGo } from './go.js';
export { stripIeMa, validateIeMa } from './ma.js';
export { stripIeMg, validateIeMg } from './mg.js';
export { stripIeMs, validateIeMs } from './ms.js';
export { normalizeMtToCanonical, padMtLegacy, stripIeMt, validateIeMt } from './mt.js';
export { stripIePa, validateIePa } from './pa.js';
export { stripIePb, validateIePb } from './pb.js';
export { stripIePe, validateIePe } from './pe.js';
export { stripIePi, validateIePi } from './pi.js';
export { stripIePr, validateIePr } from './pr.js';
export { stripIeRj, validateIeRj } from './rj.js';
export { stripIeRn, validateIeRn } from './rn.js';
export { stripIeRo, validateIeRo } from './ro.js';
export { stripIeRr, validateIeRr } from './rr.js';
export { stripIeRs, validateIeRs } from './rs.js';
export { stripIeSc, validateIeSc } from './sc.js';
export { stripIeSe, validateIeSe } from './se.js';
export { stripIeSp, validateIeSp } from './sp.js';
export { stripIeTo, validateIeTo } from './to.js';
export { applyIeDfMask, applyIeSpMask } from './mask.js';

export type ValidateInscricaoEstadualOptions = {
  uf: UfCode;
};

type FailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;
type ValidatorFn = (input: string) => InscricaoEstadualValidationResult;

const VALIDATORS: Record<UfCode, ValidatorFn> = {
  AC: validateIeAc,
  AL: validateIeAl,
  AM: validateIeAm,
  AP: validateIeAp,
  BA: validateIeBa,
  CE: validateIeCe,
  DF: validateIeDf,
  ES: validateIeEs,
  GO: validateIeGo,
  MA: validateIeMa,
  MG: validateIeMg,
  MS: validateIeMs,
  MT: validateIeMt,
  PA: validateIePa,
  PB: validateIePb,
  PE: validateIePe,
  PI: validateIePi,
  PR: validateIePr,
  RJ: validateIeRj,
  RN: validateIeRn,
  RO: validateIeRo,
  RR: validateIeRr,
  RS: validateIeRs,
  SC: validateIeSc,
  SE: validateIeSe,
  SP: validateIeSp,
  TO: validateIeTo,
};

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

export function getIeOfficialSourceUrl(uf: UfCode): string {
  return IE_OFFICIAL_SOURCE_URLS[uf];
}

function isSupportedUf(uf: string | undefined): uf is UfCode {
  return uf !== undefined && (IE_SUPPORTED_UFS as readonly string[]).includes(uf);
}

export function stripInscricaoEstadual(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): boolean {
  return validateInscricaoEstadual(input, options).ok;
}

export function validateInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): InscricaoEstadualValidationResult {
  if (!isSupportedUf(options.uf)) {
    return failure('UNSUPPORTED_FORMAT', `UF ${String(options.uf)} is not supported`);
  }
  return VALIDATORS[options.uf](input);
}

export function formatInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): FormatResult {
  const result = validateInscricaoEstadual(input, options);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  try {
    if (result.uf === 'SP') {
      return { ok: true, formatted: applyIeSpMask(result.value) };
    }
    if (result.uf === 'DF') {
      return { ok: true, formatted: applyIeDfMask(result.value) };
    }
    return { ok: true, formatted: result.value };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to format Inscrição Estadual';
    return { ok: false, code: 'UNSUPPORTED_FORMAT', message };
  }
}
