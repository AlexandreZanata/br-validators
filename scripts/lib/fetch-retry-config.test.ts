import { describe, expect, it } from 'vitest';

import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';

describe('fetch-retry-config', () => {
  it('uses 5 attempts and 2 minute default interval', () => {
    expect(FETCH_MAX_ATTEMPTS).toBe(5);
    expect(FETCH_RETRY_DELAY_MS).toBe(120_000);
  });
});
