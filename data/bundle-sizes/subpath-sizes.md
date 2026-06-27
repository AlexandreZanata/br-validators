# @br-validators/core subpath bundle sizes

> Measured with `pnpm measure:bundle-sizes` — esbuild ESM bundle, gzip level default.
> Sizes **include embedded JSON** for reference-data subpaths.

| Subpath | Raw (esbuild) | Gzip | Notes |
|---------|---------------|------|-------|
| `@br-validators/core` | 3114.8 KB | 245.4 KB | full barrel (all subpaths) |
| `@br-validators/core/generate` | 2997.0 KB | 223.6 KB | platform utilities |
| `@br-validators/core/batch` | 3001.3 KB | 221.4 KB | platform utilities |
| `@br-validators/core/diff` | 3003.6 KB | 221.3 KB | platform utilities |
| `@br-validators/core/compare` | 3001.9 KB | 220.9 KB | platform utilities |
| `@br-validators/core/mask` | 2994.0 KB | 220.1 KB | platform utilities |
| `@br-validators/core/sanitize` | 2995.5 KB | 219.4 KB | platform utilities |
| `@br-validators/core/detect` | 2976.8 KB | 218.8 KB | platform utilities |
| `@br-validators/core/cep` | 2340.8 KB | 161.8 KB | validator only |
| `@br-validators/core/ncm` | 914.6 KB | 142.2 KB | includes embed |
| `@br-validators/core/anp-combustiveis` | 895.6 KB | 91.5 KB | includes embed |
| `@br-validators/core/tse-municipios` | 544.2 KB | 84.9 KB | includes embed |
| `@br-validators/core/ibge` | 392.6 KB | 60.5 KB | includes embed |
| `@br-validators/core/telefone` | 537.3 KB | 39.3 KB | validator only |
| `@br-validators/core/cbo` | 231.3 KB | 36.2 KB | includes embed |
| `@br-validators/core/portos` | 280.8 KB | 36.1 KB | includes embed |
| `@br-validators/core/cest` | 245.4 KB | 35.6 KB | includes embed |
| `@br-validators/core/cnaes` | 147.8 KB | 24.4 KB | includes embed |
| `@br-validators/core/ptax` | 214.2 KB | 22.4 KB | includes embed |
| `@br-validators/core/pncp-reference` | 81.9 KB | 17.3 KB | includes embed |
| `@br-validators/core/nbs` | 122.7 KB | 16.4 KB | includes embed |
| `@br-validators/core/aeroportos` | 82.5 KB | 16.2 KB | includes embed |
| `@br-validators/core/bancos` | 85.6 KB | 14.6 KB | includes embed |
| `@br-validators/core/esocial` | 78.4 KB | 13.7 KB | includes embed |
| `@br-validators/core/iss-municipal` | 134.6 KB | 12.1 KB | includes embed |
| `@br-validators/core/cfop` | 100.3 KB | 9.4 KB | includes embed |
| `@br-validators/core/lc116` | 33.5 KB | 9.0 KB | includes embed |
| `@br-validators/core/data-catalog` | 31.0 KB | 6.5 KB | includes embed |
| `@br-validators/core/inscricao-estadual` | 40.5 KB | 6.4 KB | validator only |
| `@br-validators/core/brcode` | 23.7 KB | 5.7 KB | validator only |
| `@br-validators/core/rg` | 34.6 KB | 5.5 KB | validator only |
| `@br-validators/core/boleto` | 22.7 KB | 4.8 KB | validator only |
| `@br-validators/core/paises-bacen` | 17.6 KB | 4.4 KB | includes embed |
| `@br-validators/core/moedas` | 19.1 KB | 4.1 KB | includes embed |
| `@br-validators/core/pix` | 17.6 KB | 3.9 KB | validator only |
| `@br-validators/core/selic` | 15.5 KB | 3.8 KB | includes embed |
| `@br-validators/core/cst` | 19.1 KB | 3.4 KB | includes embed |
| `@br-validators/core/natureza-juridica` | 12.2 KB | 2.9 KB | includes embed |
| `@br-validators/core/feriados` | 9.5 KB | 2.9 KB | includes embed |
| `@br-validators/core/cnpj-motivos` | 9.8 KB | 2.8 KB | includes embed |
| `@br-validators/core/titulo-eleitor` | 10.5 KB | 2.7 KB | validator only |
| `@br-validators/core/simples-nacional` | 10.8 KB | 2.6 KB | includes embed |
| `@br-validators/core/nfe-chave` | 7.8 KB | 2.5 KB | validator only |
| `@br-validators/core/ibpt` | 9.2 KB | 2.3 KB | includes embed |
| `@br-validators/core/processo-judicial` | 8.1 KB | 2.0 KB | validator only |
| `@br-validators/core/inscricao-estadual-produtor-rural` | 6.2 KB | 2.0 KB | validator only |
| `@br-validators/core/nfe-cuf` | 6.4 KB | 2.0 KB | includes embed |
| `@br-validators/core/csosn` | 6.3 KB | 2.0 KB | includes embed |
| `@br-validators/core/cnpj` | 6.8 KB | 2.0 KB | validator only |
| `@br-validators/core/cartao-credito` | 6.2 KB | 1.9 KB | validator only |
| `@br-validators/core/inss` | 6.1 KB | 1.9 KB | includes embed |
| `@br-validators/core/cnis` | 5.2 KB | 1.8 KB | validator only |
| `@br-validators/core/cnh` | 4.7 KB | 1.7 KB | validator only |
| `@br-validators/core/transparencia-snapshots` | 5.9 KB | 1.7 KB | includes embed |
| `@br-validators/core/irpf` | 5.2 KB | 1.7 KB | includes embed |
| `@br-validators/core/renavam` | 4.5 KB | 1.6 KB | validator only |
| `@br-validators/core/pis-pasep` | 4.2 KB | 1.5 KB | validator only |
| `@br-validators/core/ean` | 4.7 KB | 1.5 KB | validator only |
| `@br-validators/core/cpf` | 4.0 KB | 1.5 KB | validator only |
| `@br-validators/core/incoterms` | 4.3 KB | 1.4 KB | includes embed |
| `@br-validators/core/placa` | 4.3 KB | 1.4 KB | validator only |
| `@br-validators/core/lookup` | 3.8 KB | 1.1 KB | platform utilities |
