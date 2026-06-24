import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const USER_AGENT = 'br-validators-data-refresh/1.0 (+https://github.com/AlexandreZanata/br-validators)';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class FetchError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchText(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/csv,text/plain,*/*',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
  } finally {
    clearTimeout(timer);
  }
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchWithRetry<T>(
  fetchOnce: () => Promise<T>,
  attempts: number,
  delayMs: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchOnce();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

export async function fetchTextWithRetry(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  return fetchWithRetry(() => fetchText(url, timeoutMs), attempts, delayMs);
}

export async function fetchJsonWithRetry<T>(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  return fetchWithRetry(() => fetchJson<T>(url, timeoutMs), attempts, delayMs);
}

export async function probeUrl(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    await fetchWithRetry(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: '*/*',
            'User-Agent': USER_AGENT,
          },
        });
        if (!response.ok) {
          throw new FetchError(`HTTP ${String(response.status)} probing ${url}`, url, response.status);
        }
      } finally {
        clearTimeout(timer);
      }
    }, attempts, delayMs);
    return { ok: true };
  } catch (error) {
    if (error instanceof FetchError) {
      return { ok: false, status: error.status, error: error.message };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown probe error',
    };
  }
}
