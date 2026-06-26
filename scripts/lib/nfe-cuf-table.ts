/**
 * NF-e cUF table — 27 federative units per Manual NF-e Tabela de UF.
 * @see http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Il8k4BIjb48=
 */

export interface NfeCufTableRow {
  codigo: string;
  uf: string;
  nome: string;
  codigoIbge: string;
}

export const NFE_CUF_MANUAL_UF_URL =
  'http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Il8k4BIjb48=';

export const NFE_PORTAL_URL = 'http://www.nfe.fazenda.gov.br/portal/principal.aspx';

export const IBGE_UF_CODES_URL = 'https://www.ibge.gov.br/explica/codigos-dos-municipios.php';

export const NFE_CUF_COUNT = 27;

export const NFE_CUF_GOLDEN_SP = '35';

/** Authoritative static rows — verify against NF-e manual before refresh. */
export const NFE_CUF_TABLE: readonly NfeCufTableRow[] = [
  { codigo: '11', uf: 'RO', nome: 'Rondônia', codigoIbge: '11' },
  { codigo: '12', uf: 'AC', nome: 'Acre', codigoIbge: '12' },
  { codigo: '13', uf: 'AM', nome: 'Amazonas', codigoIbge: '13' },
  { codigo: '14', uf: 'RR', nome: 'Roraima', codigoIbge: '14' },
  { codigo: '15', uf: 'PA', nome: 'Pará', codigoIbge: '15' },
  { codigo: '16', uf: 'AP', nome: 'Amapá', codigoIbge: '16' },
  { codigo: '17', uf: 'TO', nome: 'Tocantins', codigoIbge: '17' },
  { codigo: '21', uf: 'MA', nome: 'Maranhão', codigoIbge: '21' },
  { codigo: '22', uf: 'PI', nome: 'Piauí', codigoIbge: '22' },
  { codigo: '23', uf: 'CE', nome: 'Ceará', codigoIbge: '23' },
  { codigo: '24', uf: 'RN', nome: 'Rio Grande do Norte', codigoIbge: '24' },
  { codigo: '25', uf: 'PB', nome: 'Paraíba', codigoIbge: '25' },
  { codigo: '26', uf: 'PE', nome: 'Pernambuco', codigoIbge: '26' },
  { codigo: '27', uf: 'AL', nome: 'Alagoas', codigoIbge: '27' },
  { codigo: '28', uf: 'SE', nome: 'Sergipe', codigoIbge: '28' },
  { codigo: '29', uf: 'BA', nome: 'Bahia', codigoIbge: '29' },
  { codigo: '31', uf: 'MG', nome: 'Minas Gerais', codigoIbge: '31' },
  { codigo: '32', uf: 'ES', nome: 'Espírito Santo', codigoIbge: '32' },
  { codigo: '33', uf: 'RJ', nome: 'Rio de Janeiro', codigoIbge: '33' },
  { codigo: '35', uf: 'SP', nome: 'São Paulo', codigoIbge: '35' },
  { codigo: '41', uf: 'PR', nome: 'Paraná', codigoIbge: '41' },
  { codigo: '42', uf: 'SC', nome: 'Santa Catarina', codigoIbge: '42' },
  { codigo: '43', uf: 'RS', nome: 'Rio Grande do Sul', codigoIbge: '43' },
  { codigo: '50', uf: 'MS', nome: 'Mato Grosso do Sul', codigoIbge: '50' },
  { codigo: '51', uf: 'MT', nome: 'Mato Grosso', codigoIbge: '51' },
  { codigo: '52', uf: 'GO', nome: 'Goiás', codigoIbge: '52' },
  { codigo: '53', uf: 'DF', nome: 'Distrito Federal', codigoIbge: '53' },
];
