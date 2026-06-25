/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const coreDist = path.join(playgroundRoot, '../../packages/br-validators/dist');
const cliRunCaptured = path.join(playgroundRoot, '../../apps/cli/dist/run-captured.js');

const subpaths = [
  'brcode',
  'boleto',
  'cartao-credito',
  'ean',
  'cep',
  'cnh',
  'cnpj',
  'cpf',
  'detect',
  'generate',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'nfe-chave',
  'pis-pasep',
  'cnis',
  'pix',
  'placa',
  'renavam',
  'sanitize',
  'telefone',
  'titulo-eleitor',
  'ibge',
  'bancos',
  'data-catalog',
];

const nextConfig = {
  webpack: (config) => {
    const alias =
      config.resolve.alias instanceof Array
        ? Object.fromEntries(
            config.resolve.alias.flatMap((entry) => {
              if (typeof entry === 'object' && entry !== null && 'name' in entry && 'alias' in entry) {
                return [[entry.name, entry.alias]];
              }
              return [];
            }),
          )
        : { ...(config.resolve.alias ?? {}) };

    alias['@br-validators/core$'] = path.join(coreDist, 'index.js');
    alias['@playground/cli-run-captured'] = cliRunCaptured;
    alias['node:fs'] = path.join(playgroundRoot, 'lib/cli/stubs/fs.ts');
    for (const subpath of subpaths) {
      alias[`@br-validators/core/${subpath}$`] = path.join(coreDist, `${subpath}.js`);
    }

    config.resolve.alias = alias;
    return config;
  },
};

export default nextConfig;
