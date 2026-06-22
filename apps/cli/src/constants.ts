export const SUPPORTED_TYPES = ['cnpj', 'cpf', 'cep', 'telefone', 'cnh', 'renavam', 'titulo-eleitor', 'brcode', 'placa', 'pis-pasep', 'pix', 'boleto', 'cartao', 'ie'] as const;

export type SupportedType = (typeof SUPPORTED_TYPES)[number];

export const EXIT = {
  OK: 0,
  INVALID: 1,
  USAGE: 2,
} as const;
