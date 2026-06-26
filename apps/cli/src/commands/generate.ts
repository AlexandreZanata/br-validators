import { generate, type GeneratableDocumentType, type GenerateOptions as CoreGenerateOptions, type UfCode, isGeneratableCardBrand } from '@br-validators/core';
import { EXIT } from '../constants.js';

export type GenerateCliOptions = {
  json: boolean;
  quiet: boolean;
  masked?: boolean;
  stripped?: boolean;
  format?: string;
  seed?: number;
  uf?: string;
  brand?: string;
};

const GENERATABLE_TYPES: GeneratableDocumentType[] = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'renavam',
  'cnh',
  'telefone',
  'cartao-credito',
  'inscricao-estadual',
  'titulo-eleitor',
  'pix',
  'nfe-chave',
  'brcode',
  'boleto',
  'boleto-arrecadacao',
  'inscricao-estadual-produtor-rural',
];

export function isGeneratableType(type: string): type is GeneratableDocumentType {
  return (GENERATABLE_TYPES as string[]).includes(type);
}

export function buildGenerateOptions(options: GenerateCliOptions): CoreGenerateOptions {
  const core: CoreGenerateOptions = {};
  if (options.masked) {
    core.masked = true;
  }
  if (options.stripped) {
    core.stripped = true;
  }
  if (options.seed !== undefined) {
    core.seed = options.seed;
  }
  if (options.format) {
    core.format = options.format as CoreGenerateOptions['format'];
  }
  if (options.uf) {
    core.uf = options.uf.toUpperCase() as UfCode;
  }
  if (options.brand && isGeneratableCardBrand(options.brand)) {
    core.brand = options.brand;
  }
  return core;
}

export function printGenerate(
  value: string,
  options: Pick<GenerateCliOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: true, value }, null, 2));
    return EXIT.OK;
  }

  if (options.quiet) {
    return EXIT.OK;
  }

  io.stdout.push(value);
  return EXIT.OK;
}

export function runGenerate(
  type: string,
  options: GenerateCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isGeneratableType(type)) {
    io.stderr.push(`Unsupported generate type: ${type}`);
    return EXIT.USAGE;
  }

  const value = generate(type, buildGenerateOptions(options));
  return printGenerate(value, options, io);
}
