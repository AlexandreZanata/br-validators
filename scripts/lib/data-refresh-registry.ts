import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

/** Datasets refreshed manually — metadata tracked, no daily fetch script. */
export const MANUAL_FETCH_DATASET_IDS = [
  'cst',
  'lc116',
  'esocial',
  'simples-nacional',
  'iss-municipal',
] as const;

export const DATASET_METADATA_PATHS = [
  path.join(ROOT, 'packages/br-validators/src/ibge/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/bancos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/aeroportos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/tse-municipios/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/moedas/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ptax/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/selic/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/iss-municipal/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/paises-bacen/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/incoterms/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/telefone/data/ddd-metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/feriados/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cnaes/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cfop/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/natureza-juridica/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cnpj-motivos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ibpt/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/nbs/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cest/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cst/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/lc116/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/esocial/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/simples-nacional/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ncm/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cbo/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/cep/data/faixa-metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/portos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/anp-combustiveis/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/pncp-reference/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/transparencia-snapshots/data/metadata.json'),
] as const;

export const FETCH_DATASET_IDS = [
  'ibge',
  'bancos',
  'aeroportos',
  'tse-municipios',
  'moedas',
  'ptax',
  'selic',
  'paises-bacen',
  'incoterms',
  'telefone-ddd',
  'cnaes',
  'cfop',
  'natureza-juridica',
  'cnpj-motivos',
  'ibpt',
  'nbs',
  'cest',
  'ncm',
  'cbo',
  'portos',
  'anp-combustiveis',
  'pncp-reference',
  'transparencia-snapshots',
] as const;

export const FIELD_CHANGE_DATASET_IDS = [
  ...FETCH_DATASET_IDS,
  'feriados',
  'cep-faixas',
] as const;

export const PROBE_ONLY_METADATA_PATHS = [
  path.join(ROOT, 'packages/br-validators/src/feriados/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/cep/data/faixa-metadata.json'),
] as const;

export const FETCH_SCRIPTS = [
  'scripts/fetch-ibge.ts',
  'scripts/fetch-bancos.ts',
  'scripts/fetch-aeroportos.ts',
  'scripts/fetch-tse-municipios.ts',
  'scripts/fetch-moedas.ts',
  'scripts/fetch-ptax.ts',
  'scripts/fetch-selic.ts',
  'scripts/fetch-paises-bacen.ts',
  'scripts/fetch-incoterms.ts',
  'scripts/fetch-ddd.ts',
  'scripts/fetch-cnaes.ts',
  'scripts/fetch-cfop.ts',
  'scripts/fetch-natureza-juridica.ts',
  'scripts/fetch-cnpj-motivos.ts',
  'scripts/fetch-ibpt.ts',
  'scripts/fetch-nbs.ts',
  'scripts/fetch-cest.ts',
  'scripts/fetch-ncm.ts',
  'scripts/fetch-cbo.ts',
  'scripts/fetch-portos.ts',
  'scripts/fetch-anp-combustiveis.ts',
  'scripts/fetch-pncp-reference.ts',
  'scripts/fetch-transparencia-snapshots.ts',
] as const;

const SCRIPT_BASENAME_TO_DATASET_ID: Record<string, string> = {
  'fetch-ibge.ts': 'ibge',
  'fetch-bancos.ts': 'bancos',
  'fetch-aeroportos.ts': 'aeroportos',
  'fetch-tse-municipios.ts': 'tse-municipios',
  'fetch-moedas.ts': 'moedas',
  'fetch-ptax.ts': 'ptax',
  'fetch-selic.ts': 'selic',
  'fetch-paises-bacen.ts': 'paises-bacen',
  'fetch-incoterms.ts': 'incoterms',
  'fetch-ddd.ts': 'telefone-ddd',
  'fetch-cnaes.ts': 'cnaes',
  'fetch-cfop.ts': 'cfop',
  'fetch-natureza-juridica.ts': 'natureza-juridica',
  'fetch-cnpj-motivos.ts': 'cnpj-motivos',
  'fetch-ibpt.ts': 'ibpt',
  'fetch-nbs.ts': 'nbs',
  'fetch-cest.ts': 'cest',
  'fetch-ncm.ts': 'ncm',
  'fetch-cbo.ts': 'cbo',
  'fetch-portos.ts': 'portos',
  'fetch-anp-combustiveis.ts': 'anp-combustiveis',
  'fetch-pncp-reference.ts': 'pncp-reference',
  'fetch-transparencia-snapshots.ts': 'transparencia-snapshots',
};

export function datasetIdFromFetchScript(scriptPath: string): string {
  const basename = path.basename(scriptPath);
  if (!Object.hasOwn(SCRIPT_BASENAME_TO_DATASET_ID, basename)) {
    throw new Error(`Unknown fetch script mapping: ${scriptPath}`);
  }
  return SCRIPT_BASENAME_TO_DATASET_ID[basename];
}
