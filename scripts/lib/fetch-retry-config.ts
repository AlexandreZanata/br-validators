export const FETCH_MAX_ATTEMPTS = 5;

export function resolveFetchRetryDelayMs(): number {
  const raw = process.env.DATA_REFRESH_RETRY_DELAY_MS;
  if (raw === undefined || raw === '') {
    return 120_000;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 120_000;
  }
  return parsed;
}

export const FETCH_RETRY_DELAY_MS = resolveFetchRetryDelayMs();
