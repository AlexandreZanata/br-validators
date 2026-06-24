import path from 'node:path';

/** Embedded JSON paths per dataset id (excluding metadata.json). */
export const DATASET_JSON_FILES: Readonly<Record<string, readonly string[]>> = {
  ibge: ['packages/br-validators/src/ibge/data/estados.json', 'packages/br-validators/src/ibge/data/municipios.json'],
  bancos: ['packages/br-validators/src/bancos/data/bancos.json'],
  aeroportos: ['packages/br-validators/src/aeroportos/data/aeroportos.json'],
  'tse-municipios': ['packages/br-validators/src/tse-municipios/data/tse-municipios.json'],
  moedas: ['packages/br-validators/src/moedas/data/moedas.json'],
  'paises-bacen': ['packages/br-validators/src/paises-bacen/data/paises-bacen.json'],
  incoterms: ['packages/br-validators/src/incoterms/data/incoterms.json'],
  'telefone-ddd': ['packages/br-validators/src/core/telefone/data/ddd-municipios.json'],
  cnaes: ['packages/br-validators/src/cnaes/data/cnaes.json'],
  cfop: ['packages/br-validators/src/cfop/data/cfop.json'],
  'natureza-juridica': ['packages/br-validators/src/natureza-juridica/data/natureza-juridica.json'],
  nbs: ['packages/br-validators/src/nbs/data/nbs.json'],
  cest: ['packages/br-validators/src/cest/data/cest.json'],
  ncm: ['packages/br-validators/src/ncm/data/ncm.json'],
  cbo: ['packages/br-validators/src/cbo/data/cbo.json'],
  portos: ['packages/br-validators/src/portos/data/portos.json'],
  'pncp-reference': [
    'packages/br-validators/src/pncp-reference/data/modalidades.json',
    'packages/br-validators/src/pncp-reference/data/modos-disputa.json',
    'packages/br-validators/src/pncp-reference/data/criterios-julgamento.json',
    'packages/br-validators/src/pncp-reference/data/amparos-legais.json',
    'packages/br-validators/src/pncp-reference/data/tipos-contrato.json',
    'packages/br-validators/src/pncp-reference/data/fontes-orcamentarias.json',
    'packages/br-validators/src/pncp-reference/data/tipos-instrumentos-cobranca.json',
    'packages/br-validators/src/pncp-reference/data/tipos-instrumentos-convocatorios.json',
  ],
  'transparencia-snapshots': [
    'packages/br-validators/src/transparencia-snapshots/data/endpoints.json',
  ],
  feriados: ['packages/br-validators/src/feriados/data/portaria-extras.json'],
  'cep-faixas': ['packages/br-validators/src/core/cep/data/faixas.json'],
};

export function resolveDatasetJsonPaths(root: string, datasetId: string): string[] {
  if (!(datasetId in DATASET_JSON_FILES)) {
    return [];
  }
  return DATASET_JSON_FILES[datasetId].map((relativePath) => path.join(root, relativePath));
}
