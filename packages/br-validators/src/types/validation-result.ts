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
  | 'inscricao-estadual';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export type BoletoInputKind = 'linha-digitavel' | 'codigo-barras';

export type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTER'
  | 'INVALID_CHECK_DIGIT'
  | 'KNOWN_INVALID_PATTERN'
  | 'UNSUPPORTED_FORMAT'
  | 'EMPTY_INPUT';

export type ValidationResult<T extends string = string> =
  | { ok: true; value: T; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };

export type FormatResult =
  | { ok: true; formatted: string }
  | { ok: false; code: ValidationErrorCode; message: string };

export type Cnpj = string & { readonly __brand: 'Cnpj' };
export type Cpf = string & { readonly __brand: 'Cpf' };
export type Cep = string & { readonly __brand: 'Cep' };
export type Placa = string & { readonly __brand: 'Placa' };
export type PisPasep = string & { readonly __brand: 'PisPasep' };
export type PixKey = string & { readonly __brand: 'PixKey' };
export type LinhaDigitavel = string & { readonly __brand: 'LinhaDigitavel' };
export type CodigoBarras = string & { readonly __brand: 'CodigoBarras' };
export type CartaoCredito = string & { readonly __brand: 'CartaoCredito' };
export type InscricaoEstadual = string & { readonly __brand: 'InscricaoEstadual' };

export type UfCode =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT'
  | 'PA' | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

export type CartaoCreditoValidationResult =
  | { ok: true; value: CartaoCredito; format: 'cartao-credito'; brand: CardBrand }
  | { ok: false; code: ValidationErrorCode; message: string; brand?: CardBrand };

export type PixValidationResult =
  | { ok: true; value: PixKey; keyType: PixKeyType; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; keyType?: PixKeyType };

export type BoletoSituacao = '1' | '2';

export type BoletoValidationResult =
  | {
      ok: true;
      value: LinhaDigitavel | CodigoBarras;
      inputKind: BoletoInputKind;
      format: DocumentFormat;
      situacao: BoletoSituacao;
    }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

export type InscricaoEstadualValidationResult =
  | { ok: true; value: InscricaoEstadual; uf: UfCode; format: 'inscricao-estadual' }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };

export function brandCnpj(value: string): Cnpj {
  return value as Cnpj;
}

export function brandCpf(value: string): Cpf {
  return value as Cpf;
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

export function brandPixKey(value: string): PixKey {
  return value as PixKey;
}

export function brandLinhaDigitavel(value: string): LinhaDigitavel {
  return value as LinhaDigitavel;
}

export function brandCodigoBarras(value: string): CodigoBarras {
  return value as CodigoBarras;
}

export function brandCartaoCredito(value: string): CartaoCredito {
  return value as CartaoCredito;
}

export function brandInscricaoEstadual(value: string): InscricaoEstadual {
  return value as InscricaoEstadual;
}
