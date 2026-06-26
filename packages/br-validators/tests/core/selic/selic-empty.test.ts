import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/selic/data/selic.json', () => ({
  default: [],
}));

const { getSelicMeta } = await import('../../../src/selic/lookup.js');

describe('SELIC — empty embed', () => {
  it('returns undefined when observation series is empty', () => {
    expect(getSelicMeta()).toBeUndefined();
  });
});
