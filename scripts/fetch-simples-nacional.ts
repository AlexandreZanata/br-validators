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
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/simples-nacional/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const PLANALTO_LC123_URL = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm';
const RECEITA_SIMPLES_ANEXO_I_URL =
  'http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=48430';
const CGSN_RESOLUCAO_140_URL =
  'http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=115262';

const ENDPOINTS = [PLANALTO_LC123_URL, RECEITA_SIMPLES_ANEXO_I_URL, CGSN_RESOLUCAO_140_URL];

const EXPECTED_ANEXOS = 5;
const FAIXAS_POR_ANEXO = 6;
const MAX_RBT12 = 4_800_000;

interface SimplesFaixaRecord {
  faixa: number;
  receitaBrutaMin: number;
  receitaBrutaMax: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
}

interface SimplesAnexoRecord {
  id: string;
  nome: string;
  descricao: string;
  cppForaSimples: boolean;
  faixas: SimplesFaixaRecord[];
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validateAnexos(anexos: SimplesAnexoRecord[]): void {
  if (anexos.length !== EXPECTED_ANEXOS) {
    throw new SourceDataError(
      `Expected ${String(EXPECTED_ANEXOS)} Simples Nacional annexes, got ${String(anexos.length)}`,
    );
  }

  const ids = new Set(anexos.map((entry) => entry.id));
  if (ids.size !== anexos.length) {
    throw new SourceDataError('Duplicate Simples Nacional annex ids detected');
  }

  for (const anexo of anexos) {
    if (anexo.faixas.length !== FAIXAS_POR_ANEXO) {
      throw new SourceDataError(
        `Anexo ${anexo.id}: expected ${String(FAIXAS_POR_ANEXO)} faixas, got ${String(anexo.faixas.length)}`,
      );
    }

    const lastFaixa = anexo.faixas[anexo.faixas.length - 1];
    if (lastFaixa.receitaBrutaMax !== MAX_RBT12) {
      throw new SourceDataError(`Anexo ${anexo.id}: last faixa must cap at R$ ${String(MAX_RBT12)}`);
    }
  }
}

async function main(): Promise<void> {
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const anexosPath = path.join(DATA_DIR, 'anexos.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);

  try {
    const anexos = await readJsonIfExists<SimplesAnexoRecord[]>(anexosPath);
    if (anexos === null) {
      throw new SourceDataError('Embedded anexos.json is missing — maintainer must seed from LC 123/Receita tables');
    }

    validateAnexos(anexos);

    const previousAnexos = await readJsonIfExists<SimplesAnexoRecord[]>(anexosPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousAnexos ?? [],
      anexos,
      (record) => record.id,
      comparadoCom,
    );

    const totalFaixas = anexos.reduce((sum, entry) => sum + entry.faixas.length, 0);

    await mkdir(DATA_DIR, { recursive: true });
    const metadata = buildMetadata(
      {
        id: 'simples-nacional',
        nome: 'LC 123/2006 — Simples Nacional (anexos e faixas)',
        fonte: 'Lei Complementar 123/2006 — Anexos I a V (redação LC 155/2016)',
        endpoints: ENDPOINTS,
        contagens: { anexos: anexos.length, faixas: totalFaixas },
        documentacao: 'docs/OFFICIAL-SOURCES.md#simples-nacional-anexos',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'simples-nacional',
      status: 'ok',
      endpoints: ENDPOINTS,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `Simples Nacional tables validated (${String(anexos.length)} annexes, ${String(totalFaixas)} faixas).`,
    });

    console.log(
      `Simples Nacional metadata refreshed (${todayIsoDate()}): ${String(anexos.length)} annexes`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'simples-nacional',
      ENDPOINTS,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[simples-nacional] ${outcome.message}`);
  }
}

main().catch(exitWithError);
