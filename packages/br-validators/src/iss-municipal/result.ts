import { ISS_MUNICIPAL_ESTIMATION_WARNING } from './constants.js';
import type { IssMunicipalResult, IssMunicipalRow } from './types.js';

export function buildIssMunicipalResult(row: IssMunicipalRow): IssMunicipalResult {
  return {
    ...row,
    warning: ISS_MUNICIPAL_ESTIMATION_WARNING,
  };
}
