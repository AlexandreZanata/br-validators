export type DocumentFormat =
  | 'numeric'
  | 'alphanumeric'
  | 'legacy'
  | 'mercosul'
  | 'email'
  | 'phone'
  | 'evp'
  | 'linha-digitavel'
  | 'codigo-barras'
  | 'cartao-credito'
  | 'ean-8'
  | 'ean-13'
  | 'inscricao-estadual'
  | 'inscricao-estadual-produtor-rural'
  | 'telefone'
  | 'brcode'
  | 'arrecadacao'
  | 'rg';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export type TelefoneTipo = 'celular' | 'fixo';

export type BoletoInputKind = 'linha-digitavel' | 'codigo-barras' | 'arrecadacao-linha' | 'arrecadacao-codigo-barras';

export type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTER'
  | 'INVALID_CHECK_DIGIT'
  | 'KNOWN_INVALID_PATTERN'
  | 'UNSUPPORTED_FORMAT'
  | 'EMPTY_INPUT'
  | 'UF_NOT_IMPLEMENTED';

export type ValidationResult<T extends string = string> =
  | { ok: true; value: T; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };

export type FormatResult =
  | { ok: true; formatted: string }
  | { ok: false; code: ValidationErrorCode; message: string };

export type Cnpj = string & { readonly __brand: 'Cnpj' };
export type Cpf = string & { readonly __brand: 'Cpf' };
export type Cnh = string & { readonly __brand: 'Cnh' };
export type Renavam = string & { readonly __brand: 'Renavam' };
export type TituloEleitor = string & { readonly __brand: 'TituloEleitor' };
export type NfeChave = string & { readonly __brand: 'NfeChave' };
export type ProcessoJudicial = string & { readonly __brand: 'ProcessoJudicial' };
export type Cep = string & { readonly __brand: 'Cep' };
export type Placa = string & { readonly __brand: 'Placa' };
export type PisPasep = string & { readonly __brand: 'PisPasep' };
export type Nit = string & { readonly __brand: 'Nit' };

export type NitIssuer = 'inss' | 'caixa';
export type NitTipo = 'nit' | 'pis' | 'nis';

export type NitValidationResult =
  | { ok: true; value: Nit; format: 'numeric'; issuer: NitIssuer; tipo: NitTipo }
  | { ok: false; code: ValidationErrorCode; message: string };
export type PixKey = string & { readonly __brand: 'PixKey' };
export type LinhaDigitavel = string & { readonly __brand: 'LinhaDigitavel' };
export type CodigoBarras = string & { readonly __brand: 'CodigoBarras' };
export type Arrecadacao = string & { readonly __brand: 'Arrecadacao' };
export type CartaoCredito = string & { readonly __brand: 'CartaoCredito' };
export type Ean = string & { readonly __brand: 'Ean' };
export type InscricaoEstadual = string & { readonly __brand: 'InscricaoEstadual' };
export type InscricaoEstadualProdutorRural = string & { readonly __brand: 'InscricaoEstadualProdutorRural' };
export type Rg = string & { readonly __brand: 'Rg' };
export type Telefone = string & { readonly __brand: 'Telefone' };
export type BrCodePayload = string & { readonly __brand: 'BrCodePayload' };

export type UfCode =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT'
  | 'PA' | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO';

/** Phase-1 RG UFs with implemented validators. */
export type RgUfCode =
  | 'SP'
  | 'RJ'
  | 'MG'
  | 'PR'
  | 'RS'
  | 'SC'
  | 'BA'
  | 'AC'
  | 'AL'
  | 'AM'
  | 'AP'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MS'
  | 'MT'
  | 'PA'
  | 'PB'
  | 'CE'
  | 'PE'
  | 'PI'
  | 'RN'
  | 'RO'
  | 'RR'
  | 'SE'
  | 'TO';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

export type CartaoCreditoValidationResult =
  | { ok: true; value: CartaoCredito; format: 'cartao-credito'; brand: CardBrand }
  | { ok: false; code: ValidationErrorCode; message: string; brand?: CardBrand };

export type EanValidationResult =
  | { ok: true; value: Ean; format: 'ean-8' | 'ean-13' }
  | { ok: false; code: ValidationErrorCode; message: string };

export type PixValidationResult =
  | { ok: true; value: PixKey; keyType: PixKeyType; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; keyType?: PixKeyType };

export type BoletoSituacao = '1' | '2';

export type CobrancaBoletoValidationResult =
  | {
      ok: true;
      value: LinhaDigitavel;
      inputKind: 'linha-digitavel';
      format: 'linha-digitavel';
      situacao: BoletoSituacao;
    }
  | {
      ok: true;
      value: CodigoBarras;
      inputKind: 'codigo-barras';
      format: 'codigo-barras';
      situacao: BoletoSituacao;
    }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

type CobrancaBoletoFailureResult = Extract<CobrancaBoletoValidationResult, { ok: false }>;

export type LinhaDigitavelValidationResult =
  | Extract<CobrancaBoletoValidationResult, { ok: true; inputKind: 'linha-digitavel' }>
  | CobrancaBoletoFailureResult;

export type CodigoBarrasValidationResult =
  | Extract<CobrancaBoletoValidationResult, { ok: true; inputKind: 'codigo-barras' }>
  | CobrancaBoletoFailureResult;

export type BoletoValidationResult =
  | {
      ok: true;
      value: LinhaDigitavel;
      inputKind: 'linha-digitavel';
      format: 'linha-digitavel';
      situacao: BoletoSituacao;
    }
  | {
      ok: true;
      value: CodigoBarras;
      inputKind: 'codigo-barras';
      format: 'codigo-barras';
      situacao: BoletoSituacao;
    }
  | {
      ok: true;
      value: Arrecadacao;
      inputKind: 'arrecadacao-linha' | 'arrecadacao-codigo-barras';
      format: 'arrecadacao';
      segment: string;
      valueType: '6' | '7' | '8' | '9';
    }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

export type InscricaoEstadualValidationResult =
  | { ok: true; value: InscricaoEstadual; uf: UfCode; format: 'inscricao-estadual' }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };

export type IeProdutorRuralValidationResult =
  | { ok: true; value: InscricaoEstadualProdutorRural; uf: 'SP'; format: 'inscricao-estadual-produtor-rural' }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };

export type RgValidationResult =
  | {
      ok: true;
      value: Rg;
      uf: RgUfCode;
      format: DocumentFormat;
      checkDigitValidated: boolean;
    }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: RgUfCode };

export type TituloEleitorValidationResult =
  | {
      ok: true;
      value: TituloEleitor;
      format: 'numeric';
      ufCode: number;
      uf?: UfCode;
      exterior?: true;
    }
  | { ok: false; code: ValidationErrorCode; message: string; ufCode?: number };

export type NfeChaveParsed = {
  cUF: string;
  aamm: string;
  cnpj: string;
  mod: string;
  serie: string;
  nNF: string;
  tpEmis: string;
  cNF: string;
  cDV: string;
};

export type NfeChaveValidationResult =
  | { ok: true; value: NfeChave; format: 'numeric'; parsed: NfeChaveParsed; uf?: UfCode }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };

export type TelefoneValidationResult =
  | { ok: true; value: Telefone; tipo: TelefoneTipo; format: 'telefone' }
  | { ok: false; code: ValidationErrorCode; message: string };

export type BrCodeValidationResult =
  | {
      ok: true;
      value: BrCodePayload;
      format: 'brcode';
      merchantName: string;
      merchantCity: string;
      amount?: string;
      txid?: string;
      pixKey?: PixKey;
      pixKeyType?: PixKeyType;
      pixInitiationUrl?: string;
    }
  | { ok: false; code: ValidationErrorCode; message: string };

export function brandCnpj(value: string): Cnpj {
  return value as Cnpj;
}

export function brandCpf(value: string): Cpf {
  return value as Cpf;
}

export function brandCnh(value: string): Cnh {
  return value as Cnh;
}

export function brandRenavam(value: string): Renavam {
  return value as Renavam;
}

export function brandTituloEleitor(value: string): TituloEleitor {
  return value as TituloEleitor;
}

export function brandNfeChave(value: string): NfeChave {
  return value as NfeChave;
}

export function brandProcessoJudicial(value: string): ProcessoJudicial {
  return value as ProcessoJudicial;
}

export function brandCep(value: string): Cep {
  return value as Cep;
}

export function brandPlaca(value: string): Placa {
  return value as Placa;
}

export function brandPisPasep(value: string): PisPasep {
  return value as PisPasep;
}

export function brandNit(value: string): Nit {
  return value as Nit;
}

export function brandPixKey(value: string): PixKey {
  return value as PixKey;
}

export function brandLinhaDigitavel(value: string): LinhaDigitavel {
  return value as LinhaDigitavel;
}

export function brandCodigoBarras(value: string): CodigoBarras {
  return value as CodigoBarras;
}

export function brandArrecadacao(value: string): Arrecadacao {
  return value as Arrecadacao;
}

export function brandCartaoCredito(value: string): CartaoCredito {
  return value as CartaoCredito;
}

export function brandEan(value: string): Ean {
  return value as Ean;
}

export function brandInscricaoEstadual(value: string): InscricaoEstadual {
  return value as InscricaoEstadual;
}

export function brandInscricaoEstadualProdutorRural(value: string): InscricaoEstadualProdutorRural {
  return value as InscricaoEstadualProdutorRural;
}

export function brandRg(value: string): Rg {
  return value as Rg;
}

export function brandTelefone(value: string): Telefone {
  return value as Telefone;
}

export function brandBrCodePayload(value: string): BrCodePayload {
  return value as BrCodePayload;
}
