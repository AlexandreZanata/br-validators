import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cnpj.ts', 'src/cnpj-motivos.ts', 'src/ibpt.ts', 'src/cnis.ts', 'src/cpf.ts', 'src/cep.ts', 'src/telefone.ts', 'src/cnh.ts', 'src/renavam.ts', 'src/titulo-eleitor.ts', 'src/nfe-chave.ts', 'src/nfe-cuf.ts', 'src/irpf.ts', 'src/inss.ts', 'src/selic.ts', 'src/iss-municipal.ts', 'src/processo-judicial.ts', 'src/rg.ts', 'src/inscricao-estadual-produtor-rural.ts', 'src/brcode.ts', 'src/placa.ts', 'src/pis-pasep.ts', 'src/pix.ts', 'src/boleto.ts', 'src/cartao-credito.ts', 'src/inscricao-estadual.ts', 'src/detect.ts', 'src/sanitize.ts', 'src/mask.ts', 'src/compare.ts', 'src/batch.ts', 'src/diff.ts', 'src/generate.ts', 'src/ibge.ts', 'src/bancos.ts', 'src/aeroportos.ts', 'src/tse-municipios.ts', 'src/moedas.ts', 'src/ptax.ts', 'src/paises-bacen.ts', 'src/incoterms.ts', 'src/feriados.ts', 'src/cnaes.ts', 'src/cfop.ts', 'src/natureza-juridica.ts', 'src/nbs.ts', 'src/cest.ts', 'src/cst.ts', 'src/lc116.ts', 'src/esocial.ts', 'src/simples-nacional.ts', 'src/ean.ts', 'src/ncm.ts', 'src/cbo.ts', 'src/portos.ts', 'src/anp-combustiveis.ts', 'src/pncp-reference.ts', 'src/transparencia-snapshots.ts', 'src/data-catalog.ts', 'src/lookup.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
