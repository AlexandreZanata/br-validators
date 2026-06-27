import { sanitize, type SanitizableDocumentType, type SanitizeResult, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';

export type SanitizeOptions = {
  json: boolean;
  quiet: boolean;
  uf?: string;
  file?: string;
};

const SANITIZABLE_TYPES: SanitizableDocumentType[] = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'ean',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'pix',
];

export function isSanitizableType(type: string): type is SanitizableDocumentType {
  return (SANITIZABLE_TYPES as string[]).includes(type);
}

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printSanitize(
  result: SanitizeResult,
  options: Pick<SanitizeOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push('valid: yes');
    io.stdout.push(`value: ${result.value}`);
    io.stdout.push(`fixes: ${result.fixes.join(', ')}`);
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function runSanitize(
  type: string,
  value: string | undefined,
  options: SanitizeOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isSanitizableType(type)) {
    io.stderr.push(`Unsupported sanitize type: ${type}`);
    return EXIT.USAGE;
  }

  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const result = sanitize(input, type, uf ? { uf } : {});
  return printSanitize(result, options, io);
}
