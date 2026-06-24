import { describe, expect, it } from 'vitest';

import { diffRecordsByKeyWithFields } from './field-change-detail.js';

interface BancoRow {
  ispb: string;
  nome: string;
}

describe('field-change-detail', () => {
  it('lists changed field names when nome changes', () => {
    const previous: BancoRow[] = [{ ispb: '1', nome: 'Old Bank' }];
    const next: BancoRow[] = [{ ispb: '1', nome: 'New Bank' }];

    const detail = diffRecordsByKeyWithFields(
      previous,
      next,
      (row) => row.ispb,
      '2026-06-23',
    );

    expect(detail.alterados).toBe(1);
    expect(detail.camposAlterados).toContain('nome');
    expect(detail.amostraChavesAlteradas).toContain('1');
  });

  it('counts added and removed rows', () => {
    const previous: BancoRow[] = [{ ispb: '1', nome: 'A' }];
    const next: BancoRow[] = [
      { ispb: '1', nome: 'A' },
      { ispb: '2', nome: 'B' },
    ];

    const detail = diffRecordsByKeyWithFields(previous, next, (row) => row.ispb, null);
    expect(detail.adicionados).toBe(1);
    expect(detail.removidos).toBe(0);
  });
});

describe('diff-dataset — diffRecordsByKeyWithFields re-export', () => {
  it('re-exports from diff-dataset barrel', async () => {
    const mod = await import('./diff-dataset.js');
    expect(mod.diffRecordsByKeyWithFields).toBeTypeOf('function');
  });
});
