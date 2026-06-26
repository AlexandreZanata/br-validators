/**
 * RG (Registro Geral) validation — per-UF rules (phase 1).
 * @see docs/GLOSSARY.md — RG identidade
 */
import type { FormatResult, RgUfCode, UfCode } from '../../types/validation-result.js';
import {
  RG_OFFICIAL_SOURCE_URLS,
  RG_PENDING_UFS,
  RG_RESEARCH_URLS,
  RG_SUPPORTED_UFS,
  RG_UF_RULES,
} from './constants.js';
import { validateRgAc, stripRgAc } from './ac.js';
import { validateRgAl, stripRgAl } from './al.js';
import { validateRgAm, stripRgAm } from './am.js';
import { validateRgAp, stripRgAp } from './ap.js';
import { validateRgBa, stripRgBa } from './ba.js';
import { validateRgCe, stripRgCe } from './ce.js';
import { validateRgDf, stripRgDf } from './df.js';
import { validateRgEs, stripRgEs } from './es.js';
import { validateRgGo, stripRgGo } from './go.js';
import { validateRgMa, stripRgMa } from './ma.js';
import { validateRgMs, stripRgMs } from './ms.js';
import { validateRgMt, stripRgMt } from './mt.js';
import { validateRgPa, stripRgPa } from './pa.js';
import { validateRgPb, stripRgPb } from './pb.js';
import { validateRgPe, stripRgPe } from './pe.js';
import { validateRgPi, stripRgPi } from './pi.js';
import { validateRgRn, stripRgRn } from './rn.js';
import { validateRgRo, stripRgRo } from './ro.js';
import { validateRgRr, stripRgRr } from './rr.js';
import { validateRgSe, stripRgSe } from './se.js';
import { validateRgTo, stripRgTo } from './to.js';
import { validateRgMg, stripRgMg } from './mg.js';
import { applyRgMask } from './mask.js';
import { validateRgPr, stripRgPr } from './pr.js';
import { validateRgRj, stripRgRj } from './rj.js';
import { validateRgRs, stripRgRs } from './rs.js';
import { validateRgSc, stripRgSc } from './sc.js';
import { validateRgSp, stripRgSp } from './sp.js';
import type { RgValidationResult, ValidateRgOptions } from './types.js';

export {
  RG_MG_GOLDEN,
  RG_MG_GOLDEN_MASKED,
  RG_MG_GOLDEN_PREFIXED,
  RG_AC_GOLDEN,
  RG_AL_GOLDEN,
  RG_AM_GOLDEN,
  RG_AP_GOLDEN,
  RG_BA_GOLDEN,
  RG_DF_GOLDEN,
  RG_ES_GOLDEN,
  RG_GO_GOLDEN,
  RG_MA_GOLDEN,
  RG_MS_GOLDEN,
  RG_MT_GOLDEN,
  RG_PA_GOLDEN,
  RG_PB_GOLDEN,
  RG_CE_GOLDEN,
  RG_PE_GOLDEN,
  RG_PI_GOLDEN,
  RG_RN_GOLDEN,
  RG_RO_GOLDEN,
  RG_RR_GOLDEN,
  RG_SE_GOLDEN,
  RG_TO_GOLDEN,
  RG_OFFICIAL_SOURCE_URL,
  RG_OFFICIAL_SOURCE_URLS,
  RG_PENDING_UFS,
  RG_PR_GOLDEN,
  RG_RESEARCH_URLS,
  RG_RJ_GOLDEN,
  RG_RJ_GOLDEN_MASKED,
  RG_RS_GOLDEN,
  RG_SC_GOLDEN,
  RG_SP_GOLDEN,
  RG_SP_GOLDEN_MASKED,
  RG_SP_GOLDEN_X,
  RG_SP_GOLDEN_X_MASKED,
  RG_SUPPORTED_UFS,
  RG_UF_RULES,
} from './constants.js';
export { computeRgMod10AlternatingCheckDigit, computeRgSpCheckDigit } from './modulo-rg.js';
export { stripRgAc, validateRgAc } from './ac.js';
export { stripRgAl, validateRgAl } from './al.js';
export { stripRgAm, validateRgAm } from './am.js';
export { stripRgAp, validateRgAp } from './ap.js';
export { stripRgBa, validateRgBa } from './ba.js';
export { stripRgCe, validateRgCe } from './ce.js';
export { stripRgDf, validateRgDf } from './df.js';
export { stripRgEs, validateRgEs } from './es.js';
export { stripRgGo, validateRgGo } from './go.js';
export { stripRgMa, validateRgMa } from './ma.js';
export { stripRgMs, validateRgMs } from './ms.js';
export { stripRgMt, validateRgMt } from './mt.js';
export { stripRgPa, validateRgPa } from './pa.js';
export { stripRgPb, validateRgPb } from './pb.js';
export { stripRgPe, validateRgPe } from './pe.js';
export { stripRgPi, validateRgPi } from './pi.js';
export { stripRgRn, validateRgRn } from './rn.js';
export { stripRgRo, validateRgRo } from './ro.js';
export { stripRgRr, validateRgRr } from './rr.js';
export { stripRgSe, validateRgSe } from './se.js';
export { stripRgTo, validateRgTo } from './to.js';
export { stripRgMg, validateRgMg } from './mg.js';
export { applyRgMask, applyRgRjStyleMask, applyRgScMask, applyRgSpStyleMask } from './mask.js';
export { stripRgPr, validateRgPr } from './pr.js';
export { stripRgRj, validateRgRj } from './rj.js';
export { stripRgRs, validateRgRs } from './rs.js';
export { stripRgSc, validateRgSc } from './sc.js';
export { stripRgSp, validateRgSp } from './sp.js';
export type { RgDvAlgorithm, RgUfRules, RgValidationResult, ValidateRgOptions } from './types.js';

type FailedResult = Extract<RgValidationResult, { ok: false }>;
type ValidatorFn = (input: string) => RgValidationResult;
type StripperFn = (input: string) => string;

const VALIDATORS: Record<RgUfCode, ValidatorFn> = {
  SP: validateRgSp,
  RJ: validateRgRj,
  MG: validateRgMg,
  PR: validateRgPr,
  RS: validateRgRs,
  SC: validateRgSc,
  BA: validateRgBa,
  AC: validateRgAc,
  AL: validateRgAl,
  AM: validateRgAm,
  AP: validateRgAp,
  DF: validateRgDf,
  ES: validateRgEs,
  GO: validateRgGo,
  MA: validateRgMa,
  MS: validateRgMs,
  MT: validateRgMt,
  PA: validateRgPa,
  PB: validateRgPb,
  CE: validateRgCe,
  PE: validateRgPe,
  PI: validateRgPi,
  RN: validateRgRn,
  RO: validateRgRo,
  RR: validateRgRr,
  SE: validateRgSe,
  TO: validateRgTo,
};

const STRIPPERS: Record<RgUfCode, StripperFn> = {
  SP: stripRgSp,
  RJ: stripRgRj,
  MG: stripRgMg,
  PR: stripRgPr,
  RS: stripRgRs,
  SC: stripRgSc,
  BA: stripRgBa,
  AC: stripRgAc,
  AL: stripRgAl,
  AM: stripRgAm,
  AP: stripRgAp,
  DF: stripRgDf,
  ES: stripRgEs,
  GO: stripRgGo,
  MA: stripRgMa,
  MS: stripRgMs,
  MT: stripRgMt,
  PA: stripRgPa,
  PB: stripRgPb,
  CE: stripRgCe,
  PE: stripRgPe,
  PI: stripRgPi,
  RN: stripRgRn,
  RO: stripRgRo,
  RR: stripRgRr,
  SE: stripRgSe,
  TO: stripRgTo,
};

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function isSupportedRgUf(uf: string | undefined): uf is RgUfCode {
  return uf !== undefined && (RG_SUPPORTED_UFS as readonly string[]).includes(uf);
}

export function getRgOfficialSourceUrl(uf: RgUfCode): string {
  return RG_OFFICIAL_SOURCE_URLS[uf];
}

export function getRgUfSupport(): readonly RgUfCode[] {
  return RG_SUPPORTED_UFS;
}

export function getRgPendingUfs(): readonly (typeof RG_PENDING_UFS)[number][] {
  return RG_PENDING_UFS;
}

export function isRgUfImplemented(uf: string): uf is RgUfCode {
  return (RG_SUPPORTED_UFS as readonly string[]).includes(uf);
}

export function getRgResearchUrl(uf: UfCode): string | undefined {
  if (isRgUfImplemented(uf)) {
    return getRgOfficialSourceUrl(uf);
  }
  const research = RG_RESEARCH_URLS as Readonly<Partial<Record<UfCode, string>>>;
  return research[uf];
}

export function getRgUfRules(uf: RgUfCode) {
  return RG_UF_RULES[uf];
}

export function stripRg(input: string, options: ValidateRgOptions): string {
  if (!isSupportedRgUf(options.uf)) {
    return input.replace(/\D/g, '');
  }
  return STRIPPERS[options.uf](input);
}

export function isValidRg(input: string, options: ValidateRgOptions): boolean {
  return validateRg(input, options).ok;
}

export function validateRg(input: string, options: ValidateRgOptions): RgValidationResult {
  if (!isSupportedRgUf(options.uf)) {
    return failure('UF_NOT_IMPLEMENTED', `UF ${String(options.uf)} is not implemented for RG validation`);
  }
  return VALIDATORS[options.uf](input);
}

export function formatRg(input: string, options: ValidateRgOptions): FormatResult {
  const result = validateRg(input, options);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  const rules = RG_UF_RULES[options.uf];
  if (!rules.supportsMask) {
    return { ok: true, formatted: result.value };
  }

  return { ok: true, formatted: applyRgMask(result.value, options.uf) };
}
