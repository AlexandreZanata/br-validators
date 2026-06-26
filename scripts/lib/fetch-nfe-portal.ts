import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';
import { FetchError, sleep, USER_AGENT } from './fetch-utils.js';
import { parsePaisesFromPayload } from './parse-paises-payload.js';
import { parseNfePaisesTable } from './parse-nfe-paises.js';

export const NFE_PORTAL_ORIGIN = 'http://www.nfe.fazenda.gov.br';

export const NFE_DIVERSOS_LIST_URL =
  'http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/NJarYc9nus=';

function readSetCookieHeaders(response: Response): string[] {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }
  const single = response.headers.get('set-cookie');
  return single === null ? [] : [single];
}

function applySetCookies(jar: Map<string, string>, response: Response): void {
  const setCookies = readSetCookieHeaders(response);
  for (const raw of setCookies) {
    const [pair] = raw.split(';');
    const eq = pair.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader(jar: Map<string, string>): string {
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
}

export function resolvePortalRedirect(baseUrl: string, location: string): string {
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return location;
  }
  const origin = new URL(baseUrl).origin;
  return location.startsWith('/') ? `${origin}${location}` : `${origin}/${location}`;
}

export function isHtmlPayload(text: string): boolean {
  return /^\s*<\s*(!DOCTYPE\s+)?html/i.test(text.slice(0, 500));
}

export function discoverNfeConteudoUrls(html: string): string[] {
  const discovered = new Set<string>();
  const pattern = /exibirArquivo\.aspx\?conteudo=([A-Za-z0-9+/=_%-]+)/g;
  for (const match of html.matchAll(pattern)) {
    const conteudo = match[1];
    if (conteudo.length === 0) {
      continue;
    }
    discovered.add(`${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=${conteudo}`);
  }
  return [...discovered];
}

interface RankedUrl {
  url: string;
  priority: number;
}

export function discoverNfePaisesTableUrls(html: string): string[] {
  const ranked: RankedUrl[] = [];
  const pattern =
    /Tabela de Pa[ií]ses[\s\S]{0,500}?exibirArquivo\.aspx\?conteudo=([A-Za-z0-9+/=_%-]+)/gi;

  for (const match of html.matchAll(pattern)) {
    const conteudo = match[1].trim();
    if (conteudo.length === 0) {
      continue;
    }
    const context = match[0];
    let priority = 10;
    if (/v1\.01/i.test(context)) {
      priority = 100;
    } else if (/v1\.00/i.test(context)) {
      priority = 50;
    }
    ranked.push({
      url: `${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=${conteudo}`,
      priority,
    });
  }

  const byUrl = new Map<string, number>();
  for (const entry of ranked) {
    const current = byUrl.get(entry.url) ?? 0;
    if (entry.priority > current) {
      byUrl.set(entry.url, entry.priority);
    }
  }

  return [...byUrl.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([url]) => url);
}

export async function fetchAspNetPortalPayload(
  url: string,
  timeoutMs = 30_000,
  maxRedirects = 10,
): Promise<{ payload: Uint8Array; finalUrl: string }> {
  const jar = new Map<string, string>();
  let current = url;

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: 'text/csv,text/plain,application/*,*/*',
        'User-Agent': USER_AGENT,
      };
      const cookie = cookieHeader(jar);
      if (cookie.length > 0) {
        headers.Cookie = cookie;
      }

      const response = await fetch(current, {
        signal: controller.signal,
        headers,
        redirect: 'manual',
      });
      applySetCookies(jar, response);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location === null || location.length === 0) {
          throw new FetchError('Redirect without location header', current, response.status);
        }
        current = resolvePortalRedirect(current, location);
        continue;
      }

      if (!response.ok) {
        throw new FetchError(`HTTP ${String(response.status)} fetching ${current}`, current, response.status);
      }

      const payload = new Uint8Array(await response.arrayBuffer());
      return { payload, finalUrl: current };
    } catch (error) {
      if (error instanceof FetchError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, current);
      }
      throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', current);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new FetchError(`Max redirects (${String(maxRedirects)}) exceeded`, url);
}

export async function fetchTextAspNetPortal(
  url: string,
  timeoutMs = 30_000,
  maxRedirects = 10,
): Promise<{ text: string; finalUrl: string }> {
  const { payload, finalUrl } = await fetchAspNetPortalPayload(url, timeoutMs, maxRedirects);
  return { text: new TextDecoder('utf-8').decode(payload), finalUrl };
}

function appendCandidateUrls(candidateUrls: string[], urls: readonly string[]): void {
  for (const url of urls) {
    if (!candidateUrls.includes(url)) {
      candidateUrls.push(url);
    }
  }
}

export async function discoverNfePaisesCandidateUrls(primaryUrl: string): Promise<string[]> {
  const candidateUrls = [primaryUrl];

  try {
    const { text } = await fetchTextAspNetPortal(NFE_DIVERSOS_LIST_URL);
    appendCandidateUrls(candidateUrls, discoverNfePaisesTableUrls(text));
    appendCandidateUrls(candidateUrls, discoverNfeConteudoUrls(text));
  } catch {
    // Discovery is best-effort — primary URL and retries still run.
  }

  return candidateUrls;
}

export async function fetchNfePaisesPayload(
  primaryUrl: string,
  minRecords: number,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
): Promise<{ payload: Uint8Array; attemptsUsed: number; finalUrl: string }> {
  const candidateUrls = await discoverNfePaisesCandidateUrls(primaryUrl);
  let lastError: FetchError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    for (const url of candidateUrls) {
      try {
        const { payload, finalUrl } = await fetchAspNetPortalPayload(url);
        const paises = parsePaisesFromPayload(payload);
        if (paises.length < minRecords) {
          const text = new TextDecoder('utf-8').decode(payload);
          if (isHtmlPayload(text)) {
            appendCandidateUrls(candidateUrls, discoverNfeConteudoUrls(text));
            throw new FetchError('Portal returned HTML instead of a country table file', finalUrl);
          }
          throw new FetchError(
            `Portal payload has ${String(paises.length)} countries; expected at least ${String(minRecords)}`,
            finalUrl,
          );
        }

        return { payload, attemptsUsed: attempt, finalUrl };
      } catch (error) {
        lastError =
          error instanceof FetchError
            ? error
            : new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
      }
    }

    if (attempt < attempts) {
      await sleep(delayMs);
    }
  }

  throw lastError ?? new FetchError('NF-e portal fetch failed', primaryUrl);
}

/** @deprecated Use {@link fetchNfePaisesPayload} — kept for tests and legacy callers. */
export async function fetchNfePaisesTableText(
  primaryUrl: string,
  minRecords: number,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
): Promise<{ text: string; attemptsUsed: number }> {
  const { payload, attemptsUsed } = await fetchNfePaisesPayload(
    primaryUrl,
    minRecords,
    attempts,
    delayMs,
  );
  return { text: new TextDecoder('utf-8').decode(payload), attemptsUsed };
}

export function countPaisesPayload(payload: string | Uint8Array): number {
  if (typeof payload === 'string') {
    return parseNfePaisesTable(payload).length;
  }
  return parsePaisesFromPayload(payload).length;
}
