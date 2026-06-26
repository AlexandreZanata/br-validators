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
import { validateRgBa, stripRgBa } from './ba.js';
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
  RG_BA_GOLDEN,
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
export { stripRgBa, validateRgBa } from './ba.js';
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

function isRgUfPending(uf: UfCode): uf is (typeof RG_PENDING_UFS)[number] {
  return (RG_PENDING_UFS as readonly string[]).includes(uf);
}

export function getRgResearchUrl(uf: UfCode): string | undefined {
  if (isRgUfImplemented(uf)) {
    return getRgOfficialSourceUrl(uf);
  }
  if (isRgUfPending(uf)) {
    return RG_RESEARCH_URLS[uf];
  }
  return undefined;
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
