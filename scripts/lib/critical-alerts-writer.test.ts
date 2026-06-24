import { describe, expect, it } from 'vitest';

import {
  generateCriticalAlertsLog,
  generateCriticalAlertsMarkdown,
} from './critical-alerts-writer.js';
import type { SourceHealthState } from './source-health-tracker.js';

const criticalState: SourceHealthState = {
  datasetId: 'ibge',
  endpoints: ['https://servicodados.ibge.gov.br/api/v1/localidades/estados'],
  consecutiveFailureDays: 2,
  firstFailureDate: '2026-06-23',
  lastFailureDate: '2026-06-24',
  lastSuccessDate: '2026-06-22',
  severity: 'critical',
  message: 'Consultation link deprecated — official source unreachable for 2 or more consecutive days.',
  retainedEmbeddedDataFrom: '2026-06-22',
};

describe('critical-alerts-writer', () => {
  it('writes markdown table for critical datasets', () => {
    const md = generateCriticalAlertsMarkdown([criticalState], '2026-06-24T03:00:00.000Z');
    expect(md).toContain('# Critical data source alerts');
    expect(md).toContain('| ibge |');
    expect(md).toContain('critical');
  });

  it('writes no-critical message when healthy', () => {
    const md = generateCriticalAlertsMarkdown([], '2026-06-24T03:00:00.000Z');
    expect(md).toContain('No critical source failures');
  });

  it('writes grep-friendly log lines', () => {
    const log = generateCriticalAlertsLog([criticalState], '2026-06-24T03:00:00.000Z');
    expect(log).toContain('CRITICAL dataset=ibge');
  });
});
