import { describe, expect, it } from 'vitest';

import {
  applyFetchOutcomeToHealth,
  collectHealthAlerts,
} from './source-health-tracker.js';
import type { SourceFetchOutcome } from './source-fetch-outcome.js';

function failureOutcome(datasetId: string): SourceFetchOutcome {
  return {
    datasetId,
    status: 'source_unavailable',
    endpoints: ['https://example.gov.br/x'],
    attempts: 5,
    checkedAt: '2026-06-24T03:00:00.000Z',
    retainedEmbeddedDataFrom: '2026-06-20',
    message: 'fetch failed',
  };
}

describe('source-health-tracker', () => {
  it('warns on first failure day', () => {
    const state = applyFetchOutcomeToHealth(null, failureOutcome('ibge'), '2026-06-24');
    expect(state.severity).toBe('warning');
    expect(state.consecutiveFailureDays).toBe(1);
    expect(state.message).toContain('Possible link deprecation');
  });

  it('escalates to critical on second consecutive failure day', () => {
    const day1 = applyFetchOutcomeToHealth(null, failureOutcome('ibge'), '2026-06-24');
    const day2 = applyFetchOutcomeToHealth(day1, failureOutcome('ibge'), '2026-06-25');

    expect(day2.severity).toBe('critical');
    expect(day2.consecutiveFailureDays).toBe(2);
    expect(day2.message).toContain('Consultation link deprecated');
  });

  it('resets streak after success', () => {
    const day1 = applyFetchOutcomeToHealth(null, failureOutcome('ibge'), '2026-06-24');
    const ok: SourceFetchOutcome = {
      ...failureOutcome('ibge'),
      status: 'ok',
      message: 'ok',
    };
    const recovered = applyFetchOutcomeToHealth(day1, ok, '2026-06-25');

    expect(recovered.severity).toBe('ok');
    expect(recovered.consecutiveFailureDays).toBe(0);
  });

  it('does not double-increment on same calendar day', () => {
    const day1 = applyFetchOutcomeToHealth(null, failureOutcome('ibge'), '2026-06-24');
    const day1Again = applyFetchOutcomeToHealth(day1, failureOutcome('ibge'), '2026-06-24');
    expect(day1Again.consecutiveFailureDays).toBe(1);
  });

  it('collectHealthAlerts skips ok severity', () => {
    const ok = applyFetchOutcomeToHealth(null, {
      ...failureOutcome('ibge'),
      status: 'ok',
      message: 'ok',
    }, '2026-06-24');
    expect(collectHealthAlerts([ok])).toHaveLength(0);
  });
});
