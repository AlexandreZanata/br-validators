/**
 * Fetch CST tables from the official SPED Fiscal consultation portal (ASP.NET postback).
 * @see http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal
 */

import { USER_AGENT } from './fetch-utils.js';
import {
  normalizeCstContribRecords,
  normalizeCstIcmsRecords,
  normalizeCstIpiRecords,
  parseSpedCstGridHtml,
  type CstRecord,
  type SpedCstRow,
} from './parse-sped-cst-html.js';

export const SPED_CST_CONSULTA_URL =
  'http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal';

export const SPED_CST_PACKAGE_ID = '5';

export const SPED_CST_TABLE_IDS = {
  icms: '130',
  ipi: '26',
  pis: '27',
  cofins: '23',
} as const;

export interface SpedCstTables {
  icms: CstRecord[];
  ipi: CstRecord[];
  pis: CstRecord[];
  cofins: CstRecord[];
}

interface AspNetFormState {
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
}

function extractHiddenField(html: string, fieldId: string): string {
  const pattern = new RegExp(`id="${fieldId}" value="([^"]*)"`, 'u');
  const match = pattern.exec(html);
  if (match?.[1] === undefined) {
    throw new Error(`Missing ASP.NET field ${fieldId}`);
  }
  return match[1];
}

function parseFormState(html: string): AspNetFormState {
  return {
    viewState: extractHiddenField(html, '__VIEWSTATE'),
    viewStateGenerator: extractHiddenField(html, '__VIEWSTATEGENERATOR'),
    eventValidation: extractHiddenField(html, '__EVENTVALIDATION'),
  };
}

function mergeSetCookieHeaders(headers: Headers): string[] {
  const cookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value);
    }
  });
  return cookies;
}

function cookieHeaderFromSetCookies(setCookies: readonly string[]): string {
  const pairs: string[] = [];
  for (const raw of setCookies) {
    const segment = raw.split(';')[0].trim();
    if (segment.length > 0) {
      pairs.push(segment);
    }
  }
  return pairs.join('; ');
}

async function postSpedForm(
  url: string,
  form: Record<string, string>,
  cookieHeader: string,
): Promise<{ html: string; cookieHeader: string }> {
  const body = new URLSearchParams(form);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      ...(cookieHeader.length > 0 ? { Cookie: cookieHeader } : {}),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`SPED CST fetch failed with HTTP ${String(response.status)}`);
  }

  const html = await response.text();
  const newCookies = mergeSetCookieHeaders(response.headers);
  const mergedCookieHeader =
    newCookies.length > 0 ? cookieHeaderFromSetCookies(newCookies) : cookieHeader;

  return { html, cookieHeader: mergedCookieHeader };
}

async function loadConsultaPage(url: string): Promise<{ html: string; cookieHeader: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`SPED CST consulta page failed with HTTP ${String(response.status)}`);
  }

  const html = await response.text();
  const cookieHeader = cookieHeaderFromSetCookies(mergeSetCookieHeaders(response.headers));
  return { html, cookieHeader };
}

async function selectPackage(
  url: string,
  cookieHeader: string,
  form: AspNetFormState,
): Promise<{ html: string; cookieHeader: string }> {
  return postSpedForm(
    url,
    {
      __VIEWSTATE: form.viewState,
      __VIEWSTATEGENERATOR: form.viewStateGenerator,
      __EVENTVALIDATION: form.eventValidation,
      __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ddlPacotes',
      __EVENTARGUMENT: '',
      'ctl00$ContentPlaceHolder1$ddlPacotes': SPED_CST_PACKAGE_ID,
    },
    cookieHeader,
  );
}

async function selectTable(
  url: string,
  cookieHeader: string,
  form: AspNetFormState,
  tableId: string,
): Promise<{ html: string; cookieHeader: string }> {
  return postSpedForm(
    url,
    {
      __VIEWSTATE: form.viewState,
      __VIEWSTATEGENERATOR: form.viewStateGenerator,
      __EVENTVALIDATION: form.eventValidation,
      __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ddlTabelas',
      __EVENTARGUMENT: '',
      'ctl00$ContentPlaceHolder1$ddlPacotes': SPED_CST_PACKAGE_ID,
      'ctl00$ContentPlaceHolder1$ddlTabelas': tableId,
    },
    cookieHeader,
  );
}

async function fetchSpedCstTable(
  url: string,
  cookieHeader: string,
  packageForm: AspNetFormState,
  tableId: string,
): Promise<SpedCstRow[]> {
  const tablePage = await selectTable(url, cookieHeader, packageForm, tableId);
  return parseSpedCstGridHtml(tablePage.html);
}

export async function fetchSpedCstTables(url = SPED_CST_CONSULTA_URL): Promise<SpedCstTables> {
  const initial = await loadConsultaPage(url);
  const packagePage = await selectPackage(url, initial.cookieHeader, parseFormState(initial.html));
  const packageForm = parseFormState(packagePage.html);

  const [icmsRows, ipiRows, pisRows, cofinsRows] = await Promise.all([
    fetchSpedCstTable(url, packagePage.cookieHeader, packageForm, SPED_CST_TABLE_IDS.icms),
    fetchSpedCstTable(url, packagePage.cookieHeader, packageForm, SPED_CST_TABLE_IDS.ipi),
    fetchSpedCstTable(url, packagePage.cookieHeader, packageForm, SPED_CST_TABLE_IDS.pis),
    fetchSpedCstTable(url, packagePage.cookieHeader, packageForm, SPED_CST_TABLE_IDS.cofins),
  ]);

  return {
    icms: normalizeCstIcmsRecords(icmsRows),
    ipi: normalizeCstIpiRecords(ipiRows),
    pis: normalizeCstContribRecords(pisRows),
    cofins: normalizeCstContribRecords(cofinsRows),
  };
}
