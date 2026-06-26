export const BACEN_PTAX_SWAGGER_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3';

export const BACEN_PTAX_COTACAO_DIA_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)';

export const BACEN_PTAX_COTACAO_PERIODO_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)';

export const PTAX_GOLDEN_USD = 'USD';
export const PTAX_GOLDEN_EUR = 'EUR';

export const PTAX_MIN_RECORDS = 10;
export const PTAX_MAX_RECORDS = 80;

export const PTAX_MIN_MOEDAS = 10;
export const PTAX_MAX_MOEDAS = 10;

export const PTAX_STALE_WARNING =
  'Embedded data. For real-time use @br-validators/adapters-ptax';

export const PTAX_EMBED_BUSINESS_DAYS = 5;
