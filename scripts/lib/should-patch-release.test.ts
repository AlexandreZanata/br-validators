import { describe, expect, it } from 'vitest';

import { patchReleaseDatasetCount, shouldPatchRelease } from './should-patch-release.js';

describe('shouldPatchRelease', () => {
  it('returns false when no datasets changed', () => {
    expect(
      shouldPatchRelease({
        datasetsAlterados: 0,
        totalAdicionados: 0,
        totalRemovidos: 0,
        totalAlterados: 0,
      }),
    ).toBe(false);
  });

  it('returns true when rows are added', () => {
    expect(
      shouldPatchRelease({
        datasetsAlterados: 1,
        totalAdicionados: 1,
        totalRemovidos: 0,
        totalAlterados: 0,
      }),
    ).toBe(true);
  });

  it('returns true when only field-level alterados drift (no net adds)', () => {
    expect(
      shouldPatchRelease({
        datasetsAlterados: 1,
        totalAdicionados: 0,
        totalRemovidos: 0,
        totalAlterados: 247,
      }),
    ).toBe(true);
  });

  it('returns false when datasetsAlterados is set but all counts are zero', () => {
    expect(
      shouldPatchRelease({
        datasetsAlterados: 1,
        totalAdicionados: 0,
        totalRemovidos: 0,
        totalAlterados: 0,
      }),
    ).toBe(false);
  });

  it('returns dataset count only when publish is warranted', () => {
    expect(
      patchReleaseDatasetCount({
        datasetsAlterados: 2,
        totalAdicionados: 0,
        totalRemovidos: 5,
        totalAlterados: 0,
      }),
    ).toBe(2);
    expect(
      patchReleaseDatasetCount({
        datasetsAlterados: 3,
        totalAdicionados: 0,
        totalRemovidos: 0,
        totalAlterados: 0,
      }),
    ).toBe(0);
  });
});
