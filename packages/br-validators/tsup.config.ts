import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cnpj.ts', 'src/cpf.ts', 'src/cep.ts', 'src/telefone.ts', 'src/cnh.ts', 'src/renavam.ts', 'src/titulo-eleitor.ts', 'src/nfe-chave.ts', 'src/inscricao-estadual-produtor-rural.ts', 'src/brcode.ts', 'src/placa.ts', 'src/pis-pasep.ts', 'src/pix.ts', 'src/boleto.ts', 'src/cartao-credito.ts', 'src/inscricao-estadual.ts', 'src/detect.ts', 'src/sanitize.ts', 'src/mask.ts', 'src/compare.ts', 'src/batch.ts', 'src/diff.ts', 'src/generate.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
