import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cpf.ts',
    'src/cnpj.ts',
    'src/cep.ts',
    'src/telefone.ts',
    'src/pix.ts',
    'src/inscricao-estadual.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['vue', '@br-validators/core'],
});
