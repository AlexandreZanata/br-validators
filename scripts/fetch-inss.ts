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
import {
  INSS_ALIQUOTAS_URL,
  INSS_DEFAULT_ANO,
  INSS_FAIXAS_POR_TABELA,
  INSS_GOLDEN_CONTRIBUICAO_3000,
  INSS_PORTARIA_DOU_URL,
  INSS_PORTARIA_PDF_URL,
  INSS_TABELAS,
  INSS_TETO_2025,
  LEI_10887_URL,
  type InssTabelaRecord,
} from './lib/inss-tabela-contribuicao.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INSS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/inss/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

interface TabelaEmbed {
  tabelas: InssTabelaRecord[];
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validateTabelas(tabelas: readonly InssTabelaRecord[]): void {
  if (tabelas.length === 0) {
    throw new SourceDataError('INSS embed must include at least one tax year table');
  }

  for (const tabela of tabelas) {
    if (tabela.faixas.length !== INSS_FAIXAS_POR_TABELA) {
      throw new SourceDataError(
        `INSS ${String(tabela.ano)}: expected ${String(INSS_FAIXAS_POR_TABELA)} faixas, got ${String(tabela.faixas.length)}`,
      );
    }

    const primeira = tabela.faixas[0];
    const ultima = tabela.faixas[tabela.faixas.length - 1];
    if (primeira.salarioMin !== 0 || primeira.aliquota !== 0.075) {
      throw new SourceDataError(`INSS ${String(tabela.ano)}: first faixa must start at 7.5%`);
    }
    if (ultima.salarioMax !== tabela.teto) {
      throw new SourceDataError(`INSS ${String(tabela.ano)}: last faixa max must equal teto`);
    }
    if (tabela.teto !== INSS_TETO_2025) {
      throw new SourceDataError(`INSS ${String(tabela.ano)}: golden teto mismatch`);
    }
  }

  const tabela2025 = tabelas.find((entry) => entry.ano === INSS_DEFAULT_ANO);
  if (tabela2025 === undefined) {
    throw new SourceDataError(`Golden INSS year ${String(INSS_DEFAULT_ANO)} missing from embed`);
  }

  const faixa3000 = tabela2025.faixas[2];
  if (faixa3000.aliquota !== 0.12 || faixa3000.salarioMax !== 4190.83) {
    throw new SourceDataError('INSS 2025 faixa 3 golden row mismatch');
  }
}

function buildEmbed(): TabelaEmbed {
  return { tabelas: INSS_TABELAS.map((entry) => ({ ...entry, faixas: [...entry.faixas] })) };
}

async function main(): Promise<void> {
  const tabelaPath = path.join(INSS_DATA_DIR, 'tabela-contribuicao.json');
  const metadataPath = path.join(INSS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [INSS_PORTARIA_DOU_URL, INSS_PORTARIA_PDF_URL, INSS_ALIQUOTAS_URL, LEI_10887_URL];

  try {
    const embed = buildEmbed();
    validateTabelas(embed.tabelas);

    await mkdir(INSS_DATA_DIR, { recursive: true });

    const previousEmbed = await readJsonIfExists<TabelaEmbed>(tabelaPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousEmbed?.tabelas ?? [],
      embed.tabelas,
      (entry) => String(entry.ano),
      comparadoCom,
    );

    const totalFaixas = embed.tabelas.reduce((sum, entry) => sum + entry.faixas.length, 0);
    const metadata = buildMetadata(
      {
        id: 'inss',
        nome: 'INSS — tabela progressiva de contribuição (empregado)',
        fonte: 'Portaria Interministerial MPS/MF nº 6/2025 — Anexo II (static reference)',
        endpoints,
        contagens: { anos: embed.tabelas.length, faixas: totalFaixas },
        documentacao: 'docs/OFFICIAL-SOURCES.md#inss',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(tabelaPath, `${JSON.stringify(embed, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'inss',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `Static INSS progressive table generated. Golden R$ 3000 → R$ ${String(INSS_GOLDEN_CONTRIBUICAO_3000)}.`,
    });

    console.log(
      `INSS data written (${todayIsoDate()}): ${String(embed.tabelas.length)} year(s), ${String(totalFaixas)} faixas`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'inss',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[inss] ${outcome.message}`);
  }
}

main().catch(exitWithError);
