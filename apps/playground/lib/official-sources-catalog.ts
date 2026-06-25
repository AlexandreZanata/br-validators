import { IE_OFFICIAL_SOURCE_URLS, RG_OFFICIAL_SOURCE_URLS, type UfCode } from '@br-validators/core';
import type { DocumentSlug } from './nav';

export type OfficialSourceRef = {
  label: string;
  href: string;
};

export type OfficialSourcesEntry = {
  title: string;
  agency: string;
  links: OfficialSourceRef[];
};

export const OFFICIAL_SOURCES_ORDER: DocumentSlug[] = [
  'cpf',
  'cnpj',
  'placa',
  'cep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'processo-judicial',
  'rg',
  'nfe-chave',
  'pix',
  'brcode',
  'boleto',
  'cartao',
  'ean',
  'pis',
  'cnis',
  'ie',
];

const UF_CODES = Object.keys(IE_OFFICIAL_SOURCE_URLS) as UfCode[];

const IE_SINTEGRA_MIRRORS: Record<UfCode, string> = {
  AC: 'http://www.sintegra.gov.br/Cad_Estados/cad_AC.html',
  AL: 'http://www.sintegra.gov.br/Cad_Estados/cad_AL.html',
  AM: 'http://www.sintegra.gov.br/Cad_Estados/cad_AM.html',
  AP: 'http://www.sintegra.gov.br/Cad_Estados/cad_AP.html',
  BA: 'http://www.sintegra.gov.br/Cad_Estados/cad_BA.html',
  CE: 'http://www.sintegra.gov.br/Cad_Estados/cad_CE.html',
  DF: 'http://www.sintegra.gov.br/Cad_Estados/cad_DF.html',
  ES: 'http://www.sintegra.gov.br/Cad_Estados/cad_ES.html',
  GO: 'http://www.sintegra.gov.br/Cad_Estados/cad_GO.html',
  MA: 'http://www.sintegra.gov.br/Cad_Estados/cad_MA.html',
  MG: 'http://www.sintegra.gov.br/Cad_Estados/cad_MG.html',
  MS: 'http://www.sintegra.gov.br/Cad_Estados/cad_MS.html',
  MT: 'http://www.sintegra.gov.br/Cad_Estados/cad_MT.html',
  PA: 'http://www.sintegra.gov.br/Cad_Estados/cad_PA.html',
  PB: 'http://www.sintegra.gov.br/Cad_Estados/cad_PB.html',
  PE: 'http://www.sintegra.gov.br/Cad_Estados/cad_PE.html',
  PI: 'http://www.sintegra.gov.br/Cad_Estados/cad_PI.html',
  PR: 'http://www.sintegra.gov.br/Cad_Estados/cad_PR.html',
  RJ: 'http://www.sintegra.gov.br/Cad_Estados/cad_RJ.html',
  RN: 'http://www.sintegra.gov.br/Cad_Estados/cad_RN.html',
  RO: 'http://www.sintegra.gov.br/Cad_Estados/cad_RO.html',
  RR: 'http://www.sintegra.gov.br/Cad_Estados/cad_RR.html',
  RS: 'http://www.sintegra.gov.br/Cad_Estados/cad_RS.html',
  SC: 'http://www.sintegra.gov.br/Cad_Estados/cad_SC.html',
  SE: 'http://www.sintegra.gov.br/Cad_Estados/cad_SE.html',
  SP: 'http://www.sintegra.gov.br/Cad_Estados/cad_SP.html',
  TO: 'http://www.sintegra.gov.br/Cad_Estados/cad_TO.html',
};

function ieLinks(): OfficialSourceRef[] {
  const links: OfficialSourceRef[] = [
    {
      label: 'SINTEGRA — national IE index',
      href: 'http://www.sintegra.gov.br/insc_est.html',
    },
    {
      label: 'SEFAZ-SP — Sintegra consistency routine',
      href: 'https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx',
    },
    {
      label: 'SEFAZ-SP — rural producer (CADESP)',
      href: 'https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Produtor-Rural-abertura,-baixa-e-outras-alteracoes.aspx',
    },
  ];

  for (const uf of UF_CODES) {
    links.push({
      label: `SEFAZ ${uf} — primary source`,
      href: IE_OFFICIAL_SOURCE_URLS[uf],
    });
    links.push({
      label: `SINTEGRA mirror (${uf})`,
      href: IE_SINTEGRA_MIRRORS[uf],
    });
  }

  return links;
}

export const OFFICIAL_SOURCES_CATALOG: Record<DocumentSlug, OfficialSourcesEntry> = {
  cpf: {
    title: 'CPF',
    agency: 'Receita Federal',
    links: [
      { label: 'RFB CPF portal', href: 'https://www.gov.br/receitafederal/pt-br/assuntos/cpf' },
    ],
  },
  cnpj: {
    title: 'CNPJ',
    agency: 'Receita Federal',
    links: [
      {
        label: 'CNPJ alfanumérico — Perguntas e Respostas (PDF)',
        href: 'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf',
      },
      {
        label: 'SERPRO — DV calculation (PDF)',
        href: 'https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf',
      },
      {
        label: 'Simulador Nacional CNPJ',
        href: 'https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular',
      },
    ],
  },
  cep: {
    title: 'CEP',
    agency: 'Correios',
    links: [
      {
        label: 'Manual API Busca CEP',
        href: 'https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep',
      },
    ],
  },
  telefone: {
    title: 'Telefone',
    agency: 'Anatel',
    links: [
      {
        label: 'Plano de Numeração Brasileiro',
        href: 'https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro',
      },
      {
        label: 'Painel Códigos Nacionais',
        href: 'https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais',
      },
      {
        label: 'Nono dígito',
        href: 'https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito',
      },
    ],
  },
  placa: {
    title: 'License plate (Mercosul)',
    agency: 'CONTRAN / DENATRAN',
    links: [
      {
        label: 'Resolução CONTRAN 729/2018 (consolidada)',
        href: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf',
      },
      {
        label: 'Anexo I — Resolução 969/2022',
        href: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf',
      },
    ],
  },
  pis: {
    title: 'PIS / PASEP / NIS',
    agency: 'Dataprev / INSS (CNIS)',
    links: [
      {
        label: 'SIPREV Regras de Validação v1.14 — RV_03 (PDF)',
        href: 'https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf',
      },
    ],
  },
  cnis: {
    title: 'CNIS / NIT (worker ID)',
    agency: 'INSS / Caixa (CNIS)',
    links: [
      {
        label: 'SIPREV RV_03 — PIS/PASEP/NIT checksum (PDF)',
        href: 'https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf',
      },
      {
        label: 'INSS — Obter NIT',
        href: 'https://www.gov.br/pt-br/servicos/obter-numero-de-inscricao-no-inss-nit',
      },
    ],
  },
  cnh: {
    title: 'CNH (Registro Nacional)',
    agency: 'CONTRAN / SENATRAN',
    links: [
      {
        label: 'CONTRAN Resolução 511/2014',
        href: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf',
      },
      {
        label: 'CONTRAN Resolução 886/2021',
        href: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao8862021.pdf',
      },
      {
        label: 'SENATRAN — Validar CNH (gov.br)',
        href: 'https://www.gov.br/pt-br/servicos/validar-cnh',
      },
      {
        label: 'AdvPL — Validação de CNH (cross-check)',
        href: 'https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-cnh/',
      },
      {
        label: 'GeraValida — Validador de CNH (cross-check)',
        href: 'https://www.geravalida.com.br/validador-cnh',
      },
      {
        label: 'GeradorBR — Validador de CNH (cross-check)',
        href: 'https://geradorbr.com/validador-de-cnh/',
      },
    ],
  },
  renavam: {
    title: 'RENAVAM',
    agency: 'DENATRAN / SENATRAN',
    links: [
      {
        label: 'Portaria DENATRAN 27/2013',
        href: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf',
      },
      {
        label: 'SENATRAN — Consultar veículo RENAVAM',
        href: 'https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam',
      },
      {
        label: 'AdvPL — Validação de RENAVAM (cross-check)',
        href: 'https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/',
      },
      {
        label: 'GeraValida — Gerador de RENAVAM (cross-check)',
        href: 'https://www.geravalida.com.br/gerador-de-renavam',
      },
      {
        label: 'GeradorFácil — Gerador de RENAVAM (cross-check)',
        href: 'https://geradorfacil.com/geradores/renavam',
      },
    ],
  },
  'titulo-eleitor': {
    title: 'Título de Eleitor',
    agency: 'TSE',
    links: [
      {
        label: 'Resolução TSE 20.132/1998 — Art. 10',
        href: 'https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998',
      },
      {
        label: 'Resolução TSE 23.659/2021',
        href: 'https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-659-de-26-de-outubro-de-2021',
      },
      {
        label: 'Wikipedia PT — Cálculo do DV (weights)',
        href: 'https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador',
      },
      {
        label: 'Ghiorzi — DV Título Eleitoral (cross-check)',
        href: 'http://ghiorzi.org/DVnew.htm#e',
      },
      { label: 'TSE — Portal', href: 'https://www.tse.jus.br/' },
      { label: 'TSE — e-Título', href: 'https://www.tse.jus.br/eleitor/servicos/aplicativo-e-titulo' },
    ],
  },
  'processo-judicial': {
    title: 'Processo judicial (número único CNJ)',
    agency: 'CNJ',
    links: [
      {
        label: 'Resolução CNJ 65/2008',
        href: 'https://atos.cnj.jus.br/atos/detalhar/119',
      },
      {
        label: 'Anexo VIII — Módulo 97 Base 10',
        href: 'https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf',
      },
    ],
  },
  rg: {
    title: 'RG (Registro Geral)',
    agency: 'State civil identification (per UF)',
    links: [
      {
        label: 'Ghiorzi — SSP-SP / IFP-RJ / MaSP-MG check digits',
        href: RG_OFFICIAL_SOURCE_URLS.SP,
      },
      {
        label: 'IIPAR — Paraná civil identification',
        href: RG_OFFICIAL_SOURCE_URLS.PR,
      },
      {
        label: 'IGP-RS — Rio Grande do Sul',
        href: RG_OFFICIAL_SOURCE_URLS.RS,
      },
      {
        label: 'CIASC — Santa Catarina',
        href: RG_OFFICIAL_SOURCE_URLS.SC,
      },
    ],
  },
  'nfe-chave': {
    title: 'NF-e / NFC-e chave de acesso',
    agency: 'ENCAT / SEFAZ',
    links: [
      {
        label: 'Portal Nacional NF-e — MOC 7.0',
        href: 'https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D',
      },
      {
        label: 'MOC 7.0 Visão Geral (CONFAZ PDF) — §2.2.6',
        href: 'https://www.confaz.fazenda.gov.br/legislacao/arquivo-manuais/moc7-visao-geral.pdf',
      },
      {
        label: 'MOC espelho SEFAZ-PR — §2.2.6',
        href: 'http://moc.sped.fazenda.pr.gov.br/',
      },
      {
        label: 'MOC §2.2.6.2 — Cálculo do DV',
        href: 'http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e',
      },
      {
        label: 'DFe Portal SVRS — NTs / Anexos',
        href: 'https://dfe-portal.svrs.rs.gov.br/NFe/Documentos',
      },
      {
        label: 'MOC DANFE NFC-e QR Code (illustrative only)',
        href: 'http://moc.sped.fazenda.pr.gov.br/DanfeQrCodeNFCe.html',
      },
    ],
  },
  ie: {
    title: 'Inscrição Estadual (IE)',
    agency: 'Per-state SEFAZ',
    links: ieLinks(),
  },
  pix: {
    title: 'PIX key',
    agency: 'Banco Central',
    links: [
      {
        label: 'Manual BR Code (PDF)',
        href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf',
      },
      {
        label: 'Anexo I — Padrões Iniciação PIX (PDF)',
        href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf',
      },
      {
        label: 'DICT API v2.9',
        href: 'https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html',
      },
    ],
  },
  brcode: {
    title: 'BR Code payload',
    agency: 'Banco Central',
    links: [
      {
        label: 'Manual BR Code (PDF)',
        href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf',
      },
      {
        label: 'Manual de Padrões PIX (PDF)',
        href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf',
      },
    ],
  },
  boleto: {
    title: 'Boleto',
    agency: 'FEBRABAN',
    links: [
      {
        label: 'Convenção da Cobrança FB-0061/2021 (PDF)',
        href: 'https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf',
      },
    ],
  },
  cartao: {
    title: 'Credit card',
    agency: 'ISO/IEC 7812',
    links: [
      { label: 'ISO/IEC 7812-1:2017', href: 'https://www.iso.org/standard/70484.html' },
    ],
  },
  ean: {
    title: 'EAN barcode',
    agency: 'GS1',
    links: [
      { label: 'GS1 EAN/UPC barcodes', href: 'https://www.gs1.org/standards/barcodes/ean-upc' },
    ],
  },
};

export const ALL_OFFICIAL_SOURCES: OfficialSourcesEntry[] = OFFICIAL_SOURCES_ORDER.map(
  (slug) => OFFICIAL_SOURCES_CATALOG[slug],
);

export function officialSourcesForSlug(slug: string): OfficialSourcesEntry | null {
  if (slug in OFFICIAL_SOURCES_CATALOG) {
    return OFFICIAL_SOURCES_CATALOG[slug as DocumentSlug];
  }
  return null;
}
