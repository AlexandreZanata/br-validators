import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cnpj.ts', 'src/cpf.ts', 'src/cep.ts', 'src/telefone.ts', 'src/cnh.ts', 'src/renavam.ts', 'src/titulo-eleitor.ts', 'src/brcode.ts', 'src/placa.ts', 'src/pis-pasep.ts', 'src/pix.ts', 'src/boleto.ts', 'src/cartao-credito.ts', 'src/inscricao-estadual.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
