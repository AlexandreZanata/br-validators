import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const coreDist = path.join(playgroundRoot, '../../packages/br-validators/dist');
const cliRunCaptured = path.join(playgroundRoot, '../cli/dist/run-captured.js');

const coreSubpaths = [
  'aeroportos',
  'bancos',
  'boleto',
  'brcode',
  'cartao-credito',
  'cep',
  'cbo',
  'cest',
  'cfop',
  'cnaes',
  'cnh',
  'cnis',
  'cnpj',
  'cpf',
  'cst',
  'csosn',
  'data-catalog',
  'detect',
  'feriados',
  'generate',
  'ibge',
  'incoterms',
  'inss',
  'irpf',
  'iss-municipal',
  'lookup',
  'moedas',
  'natureza-juridica',
  'nbs',
  'ncm',
  'nfe-cuf',
  'paises-bacen',
  'pis-pasep',
  'pix',
  'placa',
  'portos',
  'processo-judicial',
  'ptax',
  'renavam',
  'rg',
  'sanitize',
  'selic',
  'telefone',
  'titulo-eleitor',
  'tse-municipios',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'nfe-chave',
];

const coreAliases = coreSubpaths.map((subpath) => ({
  find: `@br-validators/core/${subpath}`,
  replacement: path.join(coreDist, `${subpath}.js`),
}));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: playgroundRoot },
      { find: '@playground/cli-run-captured', replacement: cliRunCaptured },
      ...coreAliases,
      { find: '@br-validators/core', replacement: path.join(coreDist, 'index.js') },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
