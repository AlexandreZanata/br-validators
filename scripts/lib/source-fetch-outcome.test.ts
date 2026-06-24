import { describe, expect, it } from 'vitest';

import { buildFailureOutcome, FETCH_MAX_ATTEMPTS } from './source-fetch-outcome.js';
import { FetchError } from './fetch-utils.js';

describe('source-fetch-outcome', () => {
  it('builds possible link deprecation message after 5 attempts', () => {
    const outcome = buildFailureOutcome(
      'ibge',
      ['https://example.gov.br/data'],
      '2026-06-23',
      new FetchError('HTTP 404', 'https://example.gov.br/data', 404),
      FETCH_MAX_ATTEMPTS,
    );

    expect(outcome.attempts).toBe(5);
    expect(outcome.status).toBe('source_unavailable');
    expect(outcome.message).toContain('Possible link deprecation');
    expect(outcome.message).toContain('5 attempts');
    expect(outcome.message).toContain('120000ms');
  });
});
