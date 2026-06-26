export interface PatchReleaseResumo {
  datasetsAlterados: number;
  totalAdicionados: number;
  totalRemovidos: number;
  totalAlterados: number;
}

/** True when the daily bot should PATCH-bump and publish embedded data to npm. */
export function shouldPatchRelease(resumo: PatchReleaseResumo): boolean {
  if (resumo.datasetsAlterados <= 0) {
    return false;
  }
  return (
    resumo.totalAdicionados > 0 ||
    resumo.totalRemovidos > 0 ||
    resumo.totalAlterados > 0
  );
}

export function patchReleaseDatasetCount(resumo: PatchReleaseResumo): number {
  return shouldPatchRelease(resumo) ? resumo.datasetsAlterados : 0;
}
