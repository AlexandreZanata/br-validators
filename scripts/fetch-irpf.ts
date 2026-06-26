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
  IRPF_DEFAULT_ANO,
  IRPF_FAIXAS_POR_TABELA,
  IRPF_TABELA_PROGRESSIVA_MENSAL_URL,
  IRPF_TABELAS,
  IRPF_TABELAS_URL,
  LEI_7713_URL,
  type IrpfTabelaRecord,
} from './lib/irpf-tabela-progressiva.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IRPF_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/irpf/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

interface TabelaEmbed {
  tabelas: IrpfTabelaRecord[];
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validateTabelas(tabelas: readonly IrpfTabelaRecord[]): void {
  if (tabelas.length === 0) {
    throw new SourceDataError('IRPF embed must include at least one tax year table');
  }

  for (const tabela of tabelas) {
    if (tabela.faixas.length !== IRPF_FAIXAS_POR_TABELA) {
      throw new SourceDataError(
        `IRPF ${String(tabela.ano)}: expected ${String(IRPF_FAIXAS_POR_TABELA)} faixas, got ${String(tabela.faixas.length)}`,
      );
    }

    const primeira = tabela.faixas[0];
    const ultima = tabela.faixas[tabela.faixas.length - 1];
    if (primeira.aliquota !== 0 || primeira.parcelaDeduzir !== 0) {
      throw new SourceDataError(`IRPF ${String(tabela.ano)}: first faixa must be exempt`);
    }
    if (ultima.baseCalculoMax !== null) {
      throw new SourceDataError(`IRPF ${String(tabela.ano)}: last faixa must be open-ended`);
    }
  }

  const tabela2025 = tabelas.find((entry) => entry.ano === IRPF_DEFAULT_ANO);
  if (tabela2025 === undefined) {
    throw new SourceDataError(`Golden IRPF year ${String(IRPF_DEFAULT_ANO)} missing from embed`);
  }

  const faixa3000 = tabela2025.faixas[2];
  if (faixa3000.aliquota !== 0.15 || faixa3000.parcelaDeduzir !== 381.44) {
    throw new SourceDataError('IRPF 2025 faixa 3 golden row mismatch');
  }
}

function buildEmbed(): TabelaEmbed {
  return { tabelas: IRPF_TABELAS.map((entry) => ({ ...entry, faixas: [...entry.faixas] })) };
}

async function main(): Promise<void> {
  const tabelaPath = path.join(IRPF_DATA_DIR, 'tabela-progressiva.json');
  const metadataPath = path.join(IRPF_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [IRPF_TABELAS_URL, IRPF_TABELA_PROGRESSIVA_MENSAL_URL, LEI_7713_URL];

  try {
    const embed = buildEmbed();
    validateTabelas(embed.tabelas);

    await mkdir(IRPF_DATA_DIR, { recursive: true });

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
        id: 'irpf',
        nome: 'RFB IRPF — tabela progressiva mensal',
        fonte: 'Receita Federal — Tabela progressiva mensal (static reference)',
        endpoints,
        contagens: { anos: embed.tabelas.length, faixas: totalFaixas },
        documentacao: 'docs/OFFICIAL-SOURCES.md#irpf',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(tabelaPath, `${JSON.stringify(embed, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'irpf',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Static IRPF progressive monthly table generated.',
    });

    console.log(
      `IRPF data written (${todayIsoDate()}): ${String(embed.tabelas.length)} year(s), ${String(totalFaixas)} faixas`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'irpf',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[irpf] ${outcome.message}`);
  }
}

main().catch(exitWithError);
