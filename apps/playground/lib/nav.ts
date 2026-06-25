export type DocumentRoute = {
  slug: string;
  label: string;
  description: string;
  group: 'documents';
};

export type PlatformRoute = {
  slug: string;
  label: string;
  description: string;
  group: 'platform';
};

export type ReferenceDataRoute = {
  slug: string;
  label: string;
  description: string;
  group: 'reference-data';
};

export const DOCUMENT_ROUTES = [
  { slug: 'cpf', label: 'CPF', description: 'RFB modulo 11', group: 'documents' },
  { slug: 'cnpj', label: 'CNPJ', description: 'RFB modulo 11 (numeric + alpha)', group: 'documents' },
  { slug: 'cep', label: 'CEP', description: 'Correios postal code', group: 'documents' },
  { slug: 'telefone', label: 'Telefone', description: 'DDD + 8/9 digits', group: 'documents' },
  { slug: 'placa', label: 'Placa', description: 'Legacy + Mercosul', group: 'documents' },
  { slug: 'pis', label: 'PIS/PASEP', description: 'CNIS modulo 11', group: 'documents' },
  { slug: 'cnis', label: 'CNIS / NIT', description: 'Worker ID + issuer metadata', group: 'documents' },
  { slug: 'cnh', label: 'CNH', description: 'RENACH modulo 11', group: 'documents' },
  { slug: 'renavam', label: 'RENAVAM', description: 'DENATRAN modulo 11', group: 'documents' },
  { slug: 'titulo-eleitor', label: 'Título de Eleitor', description: 'TSE modulo 11', group: 'documents' },
  { slug: 'processo-judicial', label: 'Processo judicial', description: 'CNJ número único mod 97', group: 'documents' },
  { slug: 'rg', label: 'RG', description: 'Per-UF identity card (6 states)', group: 'documents' },
  { slug: 'nfe-chave', label: 'NF-e Chave', description: '44-digit access key', group: 'documents' },
  { slug: 'ie', label: 'Inscrição Estadual', description: '27 UFs', group: 'documents' },
  { slug: 'pix', label: 'PIX Key', description: 'Bacen DICT — 5 types', group: 'documents' },
  { slug: 'brcode', label: 'BR Code', description: 'Pix EMV payload', group: 'documents' },
  { slug: 'boleto', label: 'Boleto', description: 'FEBRABAN cobrança', group: 'documents' },
  { slug: 'cartao', label: 'Cartão de Crédito', description: 'Luhn algorithm', group: 'documents' },
  { slug: 'ean', label: 'EAN', description: 'GS1 EAN-8 / EAN-13', group: 'documents' },
] as const satisfies readonly DocumentRoute[];

export const PLATFORM_ROUTES = [
  { slug: 'detect', label: 'Detect', description: 'Auto-identify document type', group: 'platform' },
  { slug: 'sanitize', label: 'Sanitize', description: 'ETL fixes + validate', group: 'platform' },
  { slug: 'generate', label: 'Generate', description: 'Synthetic test fixtures', group: 'platform' },
  { slug: 'official-sources', label: 'Official sources', description: 'Normative references by data type', group: 'platform' },
] as const satisfies readonly PlatformRoute[];

export const REFERENCE_DATA_ROUTES = [
  { slug: 'data/ibge', label: 'IBGE', description: 'States + municipalities', group: 'reference-data' },
  { slug: 'data/calendar', label: 'Calendar', description: 'National holidays by year', group: 'reference-data' },
  { slug: 'data/bancos', label: 'Bancos', description: 'Bacen STR participants', group: 'reference-data' },
  { slug: 'data/fiscal', label: 'Fiscal', description: 'Natureza jurídica, NBS, CEST, CNAE, CFOP, NCM, CBO', group: 'reference-data' },
  { slug: 'data/trade', label: 'Trade', description: 'Moedas, países Bacen, Incoterms', group: 'reference-data' },
  { slug: 'data/logistics', label: 'Logistics', description: 'Portos ANTAQ, aeroportos ANAC', group: 'reference-data' },
  { slug: 'data/catalog', label: 'Data catalog', description: 'Embedded dataset metadata', group: 'reference-data' },
] as const satisfies readonly ReferenceDataRoute[];

export const ALL_ROUTES = [...DOCUMENT_ROUTES, ...PLATFORM_ROUTES, ...REFERENCE_DATA_ROUTES] as const;

export type DocumentSlug = (typeof DOCUMENT_ROUTES)[number]['slug'];
export type PlatformSlug = (typeof PLATFORM_ROUTES)[number]['slug'];
export type ReferenceDataSlug = (typeof REFERENCE_DATA_ROUTES)[number]['slug'];

/** @deprecated Use DOCUMENT_ROUTES */
export const ROUTES = DOCUMENT_ROUTES;
