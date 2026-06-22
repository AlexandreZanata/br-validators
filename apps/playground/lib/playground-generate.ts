import { BRCODE_GOLDEN_STATIC_EVP, BOLETO_GOLDEN_LINHA_MASKED } from '@br-validators/core';
import {
  generate,
  type GenerateOptions,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { generatePixEvp } from './generators/pix';
import { generateIe } from './generators/ie';
import type { UfCode } from '@br-validators/core';
import type { DocumentSlug } from './nav';

const GENERATE_TYPE: Partial<Record<DocumentSlug, GeneratableDocumentType>> = {
  cpf: 'cpf',
  cnpj: 'cnpj',
  cep: 'cep',
  telefone: 'telefone',
  placa: 'placa',
  pis: 'pis-pasep',
  cnh: 'cnh',
  renavam: 'renavam',
  cartao: 'cartao-credito',
};

export type PlaygroundGenerateOptions = {
  seed?: number;
  masked?: boolean;
  format?: string;
  uf?: UfCode;
};

export function playgroundGenerate(slug: DocumentSlug, options: PlaygroundGenerateOptions = {}): string {
  if (slug === 'pix') {
    return generatePixEvp();
  }
  if (slug === 'ie' && options.uf) {
    return generateIe(options.uf);
  }

  const type = GENERATE_TYPE[slug];
  if (!type) {
    throw new Error(`Generate not supported for ${slug}`);
  }

  const coreOptions: GenerateOptions = {
    seed: options.seed,
    masked: options.masked,
  };

  if (options.format) {
    coreOptions.format = options.format as GenerateOptions['format'];
  }

  return generate(type, coreOptions);
}

export function goldenSample(slug: DocumentSlug): string | null {
  const samples: Partial<Record<DocumentSlug, string>> = {
    boleto: BOLETO_GOLDEN_LINHA_MASKED,
    brcode: BRCODE_GOLDEN_STATIC_EVP,
  };
  return samples[slug] ?? null;
}
