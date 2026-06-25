import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { fetchJsonWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  BACEN_PTAX_COTACAO_PERIODO_URL,
  BACEN_PTAX_SWAGGER_URL,
  PTAX_ROLLING_BUSINESS_DAYS,
  buildPtaxPeriodoRequestUrl,
  mergePtaxRecords,
  parsePtaxFechamentoRows,
  resolvePtaxPeriodBounds,
  type BacenPtaxApiResponse,
  type PtaxCotacaoRecord,
} from './lib/ptax-bacen-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PTAX_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/ptax/data');
const MOEDAS_DATA_PATH = path.join(ROOT, 'packages/br-validators/src/moedas/data/moedas.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const PTAX_MIN_RECORDS = 10;
const PTAX_MAX_RECORDS = 80;

interface MoedaRecord {
  codigo: string;
  tipoBacen: 'A' | 'B' | null;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadPtaxMoedas(moedas: readonly MoedaRecord[]): string[] {
  return moedas
    .filter((moeda) => moeda.tipoBacen === 'A' || moeda.tipoBacen === 'B')
    .map((moeda) => moeda.codigo.trim().toUpperCase())
    .sort((left, right) => left.localeCompare(right));
}

async function fetchMoedaPtaxRecords(
  moeda: string,
  dataInicial: string,
  dataFinal: string,
): Promise<PtaxCotacaoRecord[]> {
  const url = buildPtaxPeriodoRequestUrl(moeda, dataInicial, dataFinal);
  if (url.length === 0) {
    return [];
  }

  const response = await fetchJsonWithRetry<BacenPtaxApiResponse>(url, FETCH_MAX_ATTEMPTS);
  return parsePtaxFechamentoRows(moeda, response.value);
}

async function main(): Promise<void> {
  const ptaxPath = path.join(PTAX_DATA_DIR, 'ptax.json');
  const metadataPath = path.join(PTAX_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [BACEN_PTAX_COTACAO_PERIODO_URL, BACEN_PTAX_SWAGGER_URL];

  try {
    const moedas = await readJsonIfExists<MoedaRecord[]>(MOEDAS_DATA_PATH);
    if (moedas === null || moedas.length === 0) {
      throw new SourceDataError('Moedas dataset missing — run fetch:data:moedas first');
    }

    const ptaxMoedas = loadPtaxMoedas(moedas);
    if (ptaxMoedas.length === 0) {
      throw new SourceDataError('No Bacen PTAX currencies found in moedas dataset');
    }

    const periodBounds = resolvePtaxPeriodBounds(new Date(), PTAX_ROLLING_BUSINESS_DAYS);
    if (periodBounds === null) {
      throw new SourceDataError('Unable to resolve PTAX business-day window');
    }

    const records: PtaxCotacaoRecord[] = [];
    for (const moeda of ptaxMoedas) {
      const moedaRecords = await fetchMoedaPtaxRecords(
        moeda,
        periodBounds.dataInicial,
        periodBounds.dataFinal,
      );
      records.push(...moedaRecords);
    }

    const ptax = mergePtaxRecords(records);
    if (ptax.length < PTAX_MIN_RECORDS || ptax.length > PTAX_MAX_RECORDS) {
      throw new SourceDataError(
        `Expected ${String(PTAX_MIN_RECORDS)}–${String(PTAX_MAX_RECORDS)} PTAX rows, got ${String(ptax.length)}`,
      );
    }

    await mkdir(PTAX_DATA_DIR, { recursive: true });

    const previousPtax = await readJsonIfExists<PtaxCotacaoRecord[]>(ptaxPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousPtax ?? [],
      ptax,
      (record) => `${record.moeda}:${record.data}`,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'ptax',
        nome: 'Bacen PTAX Fechamento',
        fonte: 'Banco Central Olinda PTAX API — Fechamento PTAX',
        endpoints,
        contagens: {
          cotacoes: ptax.length,
          moedas: ptaxMoedas.length,
          diasUteis: new Set(ptax.map((record) => record.data)).size,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#ptax-cotacoes',
        agendamento: 'diario',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(ptaxPath, `${JSON.stringify(ptax, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'ptax',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `Bacen PTAX Fechamento embedded for ${String(ptaxMoedas.length)} currencies (${periodBounds.dataInicial}..${periodBounds.dataFinal}).`,
    });

    console.log(
      `PTAX data written (${todayIsoDate()}): ${String(ptax.length)} Fechamento rows for ${String(ptaxMoedas.length)} currencies`,
    );
    console.log(
      `Window: ${periodBounds.dataInicial} .. ${periodBounds.dataFinal} (${String(PTAX_ROLLING_BUSINESS_DAYS)} business days target)`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'ptax',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[ptax] ${outcome.message}`);
  }
}

main().catch(exitWithError);
