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
import { fetchTextWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { parseCsv } from './lib/parse-csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BANCOS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/bancos/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const STR_PARTICIPANTES_URL =
  'https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv';
const MIN_BANCOS = 250;
const MAX_BANCOS = 500;

interface BancoRecord {
  codigo: string;
  ispb: string;
  nome: string;
  nomeReduzido: string;
  participaCompe: boolean;
}

function isValidCompeCode(value: string): boolean {
  return /^\d{3}$/.test(value);
}

function normalizeCompe(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.padStart(3, '0').slice(-3);
}

function normalizeIspb(value: string): string {
  return value.replace(/\D/g, '').padStart(8, '0');
}

function parseStrCsv(csvText: string): BancoRecord[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    throw new Error('STR CSV is empty');
  }
  const header = rows[0];

  const ispbIndex = header.indexOf('ISPB');
  const nomeReduzidoIndex = header.indexOf('Nome_Reduzido');
  const codigoIndex = header.indexOf('Número_Código');
  const compeIndex = header.indexOf('Participa_da_Compe');
  const nomeExtensoIndex = header.indexOf('Nome_Extenso');

  if (
    ispbIndex === -1 ||
    nomeReduzidoIndex === -1 ||
    codigoIndex === -1 ||
    compeIndex === -1 ||
    nomeExtensoIndex === -1
  ) {
    throw new Error('STR CSV header missing expected columns');
  }

  const bancos: BancoRecord[] = [];

  for (const row of rows.slice(1)) {
    const rawCodigo = row[codigoIndex] ?? '';
    if (!isValidCompeCode(rawCodigo)) {
      continue;
    }

    bancos.push({
      codigo: normalizeCompe(rawCodigo),
      ispb: normalizeIspb(row[ispbIndex] ?? ''),
      nome: row[nomeExtensoIndex] ?? '',
      nomeReduzido: row[nomeReduzidoIndex] ?? '',
      participaCompe: (row[compeIndex] ?? '').toLowerCase() === 'sim',
    });
  }

  return bancos.sort((left, right) => left.codigo.localeCompare(right.codigo));
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const bancosPath = path.join(BANCOS_DATA_DIR, 'bancos.json');
  const metadataPath = path.join(BANCOS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [STR_PARTICIPANTES_URL];

  try {
    const csvText = await fetchTextWithRetry(STR_PARTICIPANTES_URL, FETCH_MAX_ATTEMPTS);
    if (csvText.trim().length === 0) {
      throw new SourceDataError('Bacen STR CSV returned an empty body');
    }

    const bancos = parseStrCsv(csvText);

    if (bancos.length < MIN_BANCOS || bancos.length > MAX_BANCOS) {
      throw new SourceDataError(
        `Expected ${String(MIN_BANCOS)}–${String(MAX_BANCOS)} banks, got ${String(bancos.length)}`,
      );
    }

    const codigoSet = new Set(bancos.map((banco) => banco.codigo));
    const ispbSet = new Set(bancos.map((banco) => banco.ispb));
    if (codigoSet.size !== bancos.length) {
      throw new SourceDataError('Duplicate COMPE codes detected in STR dataset');
    }
    if (ispbSet.size !== bancos.length) {
      throw new SourceDataError('Duplicate ISPB values detected in STR dataset');
    }

    await mkdir(BANCOS_DATA_DIR, { recursive: true });

    const previousBancos = await readJsonIfExists<BancoRecord[]>(bancosPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;

    const changes = diffRecordsByKey(
      previousBancos ?? [],
      bancos,
      (banco) => banco.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'bancos',
        nome: 'Bacen STR Participants',
        fonte: 'Banco Central — Participantes STR',
        endpoints,
        contagens: { bancos: bancos.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#bacen-banks',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(bancosPath, `${JSON.stringify(bancos, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'bancos',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official Bacen STR CSV fetch succeeded.',
    });

    console.log(
      `Bacen data written (${todayIsoDate()}): ${String(bancos.length)} institutions with COMPE codes`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'bancos',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[bancos] ${outcome.message}`);
  }
}

main().catch(exitWithError);
