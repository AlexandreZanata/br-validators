# BR Validators

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![core](https://img.shields.io/npm/v/@br-validators/core?label=core)](https://www.npmjs.com/package/@br-validators/core)
[![cli](https://img.shields.io/npm/v/@br-validators/cli?label=cli)](https://www.npmjs.com/package/@br-validators/cli)
[![zod](https://img.shields.io/npm/v/@br-validators/zod?label=zod)](https://www.npmjs.com/package/@br-validators/zod)
[![rhf](https://img.shields.io/npm/v/@br-validators/react-hook-form?label=rhf)](https://www.npmjs.com/package/@br-validators/react-hook-form)
[![express](https://img.shields.io/npm/v/@br-validators/express?label=express)](https://www.npmjs.com/package/@br-validators/express)
[![vue](https://img.shields.io/npm/v/@br-validators/vue?label=vue)](https://www.npmjs.com/package/@br-validators/vue)
[![npm downloads](https://img.shields.io/npm/dm/@br-validators/core?label=downloads)](https://www.npmjs.com/package/@br-validators/core)
[![OpenSSF Best Practices](https://img.shields.io/badge/OpenSSF%20Best%20Practices-self--certify-blue)](https://www.bestpractices.dev/en/projects)
[![GitHub release](https://img.shields.io/github/v/release/open-data-brazil/br-validators)](https://github.com/open-data-brazil/br-validators/releases)

**100% open-source** (MIT) monorepo — TypeScript library, terminal CLI, and web playground for formatting and validating Brazilian document identifiers. Algorithms trace to official primary sources (Receita Federal, Bacen, CONTRAN, Correios, SEFAZ).

| Surface | Package / URL |
|---------|---------------|
| **Library** | [`@br-validators/core`](https://www.npmjs.com/package/@br-validators/core) on npm |
| **CLI** | [`@br-validators/cli`](https://www.npmjs.com/package/@br-validators/cli) on npm |
| **Zod** | [`@br-validators/zod`](https://www.npmjs.com/package/@br-validators/zod) on npm |
| **React Hook Form** | [`@br-validators/react-hook-form`](https://www.npmjs.com/package/@br-validators/react-hook-form) on npm |
| **Express / Fastify** | [`@br-validators/express`](https://www.npmjs.com/package/@br-validators/express) on npm |
| **Vue 3** | [`@br-validators/vue`](https://www.npmjs.com/package/@br-validators/vue) on npm |
| **Documentation** | [docs.br-validators.dev](https://docs.br-validators.dev/) — VitePress deep reference (README = quick start) |
| **Playground** | [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/) — client-side only, no PII sent to server |

Reference datasets (IBGE, Bacen banks, DDD lookup, national holidays, CNAE, CFOP, CST, LC 116, eSocial categorias, NCM, CBO, natureza jurídica, NBS, CEST, moedas, PTAX cotações, países Bacen, NF-e cUF, IRPF / INSS tables, SELIC meta, ISS municipal top 500 PIB, Incoterms, portos, aeroportos, ANP fuel prices) are embedded offline and refreshed **daily** (00:00 Brasília) — see [docs/DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md). CST, LC 116, eSocial, and ISS municipal use **manual** maintainer refresh (`pnpm fetch:data:cst`, `pnpm fetch:data:lc116`, `pnpm fetch:data:esocial`, `pnpm fetch:data:iss-municipal`). Critical source failures: [data/refresh-reports/CRITICAL-ALERTS.md](data/refresh-reports/CRITICAL-ALERTS.md).

> **Note:** The unscoped npm name [`br-validators`](https://www.npmjs.com/package/br-validators) belongs to another project. Install **`@br-validators/core`** or **`@br-validators/cli`**.

---

## Install

### Library (Node, Bun, bundlers)

```bash
npm install @br-validators/core
# or
pnpm add @br-validators/core
```

### CLI

```bash
npm install -g @br-validators/cli
# or one-off
npx @br-validators/cli --help
```

---

## Use in your project

### Validate and format (barrel import)

```typescript
import { validateCnpj, formatCnpj, validateCpf } from '@br-validators/core';

const cnpj = validateCnpj('12ABC34501DE35'); // RFB FAQ Q14 golden vector
if (cnpj.ok) {
  console.log(cnpj.value); // canonical stripped value
}

const formatted = formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35' }

validateCpf('12345678909'); // never throws — check result.ok
```

### Tree-shake with subpath imports

```typescript
import { validateCep } from '@br-validators/core/cep';
import { validatePixKey } from '@br-validators/core/pix';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

validateCep('01310100');
validatePixKey('pix@bcb.gov.br');
validateInscricaoEstadual('110042490114', { uf: 'SP' });
```

### Form handler pattern (never trust client input)

```typescript
import { validateCpf, stripCpf } from '@br-validators/core/cpf';

function parseCpfField(raw: string) {
  const result = validateCpf(raw);
  if (!result.ok) {
    return { error: result.message, code: result.code };
  }
  return { cpf: result.value, display: stripCpf(raw) };
}
```

### Next.js / React (client or server)

```tsx
'use client';

import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';
import { useState } from 'react';

export function CnpjField() {
  const [input, setInput] = useState('');
  const result = input ? validateCnpj(input) : null;
  const formatted = result?.ok ? formatCnpj(result.value) : null;

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      {formatted?.ok && <p>Valid: {formatted.formatted}</p>}
      {result && !result.ok && <p>{result.message}</p>}
    </div>
  );
}
```

### CI / shell scripts

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
br-validators ie validate "$IE" --uf SP --json
```

Requires Node ≥ 18. ESM only (`"type": "module"`). Zero runtime dependencies.

---

## Supported document types

| Type | Library import | CLI | Playground |
|------|----------------|-----|------------|
| CNPJ (numeric + alphanumeric) | `@br-validators/core/cnpj` | `br-validators cnpj …` | `/cnpj` |
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | `/cpf` |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | `/cep` |
| Telefone (Anatel) | `@br-validators/core/telefone` | `br-validators telefone …` | `/telefone` |
| CNH | `@br-validators/core/cnh` | `br-validators cnh …` | `/cnh` |
| RENAVAM | `@br-validators/core/renavam` | `br-validators renavam …` | `/renavam` |
| Título de eleitor | `@br-validators/core/titulo-eleitor` | `br-validators titulo …` | `/titulo-eleitor` |
| Processo judicial CNJ | `@br-validators/core/processo-judicial` | `br-validators processo-judicial …` | `/processo-judicial` |
| RG (identity card, per-UF) | `@br-validators/core/rg` | `br-validators rg … --uf SP` | `/rg` |
| NF-e chave de acesso | `@br-validators/core/nfe-chave` | `br-validators nfe …` | `/nfe-chave` |
| License plate (Mercosul + legacy) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| BR Code (PIX QR) | `@br-validators/core/brcode` | `br-validators brcode …` | `/brcode` |
| Boleto cobrança (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Boleto arrecadação (48/44, product `8`) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Credit card (Luhn / ISO 7812) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |
| IE SP produtor rural | `@br-validators/core/inscricao-estadual-produtor-rural` | `br-validators ie …` (auto `P`) | `/ie` |
| **Platform APIs** | see below | partial | partial |

### Platform APIs (`@br-validators/core`)

| API | Subpath | CLI | Playground | Purpose |
|-----|---------|-----|------------|---------|
| `detect()` | `/detect` | `br-validators detect …` | `/detect` | Auto-classify raw input |
| `sanitize()` | `/sanitize` | `br-validators sanitize <type> …` | `/sanitize` | ETL fixes + validate |
| `mask()` | `/mask` | `br-validators mask <type> …` | via `format` actions | Unified display mask |
| `compare()` | `/compare` | `br-validators compare <type> …` | `/compare` | Normalized equality |
| `batch()` | `/batch` | `br-validators batch <type> …` | `/batch` | Bulk validate + summary |
| `diff()` | `/diff` | `br-validators diff <type> …` | `/diff` | Field-level structural diff |
| `generate()` | `/generate` | `br-validators generate …` | `/generate` | Synthetic test fixtures — **17/18** document types (alphanumeric CPF blocked until RFB spec) |

```typescript
import { compare, batch, diff, mask } from '@br-validators/core';

compare('123.456.789-09', '12345678909', 'cpf'); // { equal: true }
batch(['12345678909', 'bad'], 'cpf');             // { valid, invalid, summary }
diff('12345678909', '12345678901', 'cpf');        // { changed, fields: [{ field: 'dv', … }] }
mask('12345678909', 'cpf');                       // { ok: true, formatted: '123.456.789-09' }
```

### PIX static QR Code (playground)

The **[playground `/pix`](https://doc-raiz-playground.vercel.app/pix)** builds **static PIX BR Code** payloads (Bacen EMV TLV + CRC16) from a validated PIX key:

| Mode | Amount field | Use case |
|------|--------------|----------|
| **Permanent (static)** | Leave empty | Payer chooses the amount at payment time |
| **Fixed value** | e.g. `10.50` | QR encodes tag `54` with the transaction amount |

Payload is validated with `validateBrCode` before rendering the QR image. Official sources: [Bacen Manual BR Code](docs/OFFICIAL-SOURCES.md), [Manual de Padrões PIX](docs/OFFICIAL-SOURCES.md).

Core library ships **`buildStaticPixBrCode`**, **`validateBrCode` / `parseBrCode`**, and **`computeCrc16Ccitt`** via `@br-validators/core/brcode`. QR image rendering remains playground-only (`QrCodePanel` on `/pix`).

Official sources per type: [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

### Reference data (offline lookup)

Government classification tables embedded in the library — **zero runtime fetch**, tree-shakeable subpaths, **daily** freshness (ANP LPC **weekly**).

| Dataset | Library import | CLI | Playground | Key APIs | Official source |
|---------|----------------|-----|------------|----------|-----------------|
| IBGE states + municipalities | `@br-validators/core/ibge` | `ibge lookup` · `ibge list` | `/data/ibge` | `getEstados`, `getMunicipios`, `getMunicipioPorCodigo` | [IBGE localidades](https://servicodados.ibge.gov.br/api/docs/localidades) |
| Bacen STR banks | `@br-validators/core/bancos` | `bancos lookup` · `bancos list` | `/data/bancos` | `getBancos`, `getBancoPorCodigo`, `getBancoPorIspb` | [Bacen STR CSV](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| ANAC public aerodromos | `@br-validators/core/aeroportos` | `aeroportos lookup` | `/data/logistics` | `getAeroportos`, `getAeroportoPorIata`, `getAeroportoPorIcao`, `getAeroportosPorMunicipio` | [ANAC aeródromos CSV](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| ANTAQ port installations | `@br-validators/core/portos` | `portos lookup` | `/data/logistics` | `getPortoPorCodigo`, `searchPortos`, `getPortosPorMunicipio` | [ANTAQ instalações portuárias zip](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| ANP fuel prices (LPC) | `@br-validators/core/anp-combustiveis` | — | `/data/logistics` | `getAnpPrecosMedios`, `getAnpPrecosMediosPorIbge`, `getAnpSemanaAtual` | [ANP levantamento LPC](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) |
| TSE ↔ IBGE municipality codes | `@br-validators/core/tse-municipios` | `tse-municipios lookup` | `/data/ibge` (cross-ref) | `getMunicipioIbgePorCodigoTse`, `getCodigosTsePorMunicipio` | [TSE municipio_tse_ibge.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| DDD geographic lookup | `@br-validators/core/telefone` | `ddd lookup` | — | `getDddInfo` | [Anatel DDD panel](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| National holidays | `@br-validators/core/feriados` | `feriados list --year` | `/data/calendar` | `isFeriadoNacional`, `getFeriadosNacionais`, `getProximoDiaUtil` | [Lei 662/1949](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| CNAE 2.3 subclasses | `@br-validators/core/cnaes` | `cnae lookup` · `cnae search` | `/data/fiscal` | `getCnaePorCodigo`, `searchCnaes` | [IBGE CNAE API](https://servicodados.ibge.gov.br/api/docs/cnae) |
| CFOP fiscal operations | `@br-validators/core/cfop` | `cfop lookup` · `cfop search` | `/data/fiscal` | `getCfopPorCodigo`, `searchCfop` | [CONFAZ CFOP](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| CST (ICMS, IPI, PIS, COFINS) | `@br-validators/core/cst` | — | `/data/fiscal` | `getCstIcmsPorCodigo`, `getCstIpiPorCodigo`, `searchCstIcms` | [RFB SPED CST tables](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal) |
| LC 116 ISS services | `@br-validators/core/lc116` | — | `/data/fiscal` | `getLc116PorCodigo`, `searchLc116` | [LC 116/2003 Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) |
| eSocial (categorias + rubricas) | `@br-validators/core/esocial` | — | `/data/payroll` | `getEsocialCategoriaPorCodigo`, `getEsocialRubricaPorCodigo`, `searchEsocialRubricas` | [eSocial S-1.3 Tabelas](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html) |
| NCM Mercosur codes | `@br-validators/core/ncm` | `ncm lookup` · `ncm search` | `/data/fiscal` | `getNcmPorCodigo`, `searchNcm` | [Siscomex NCM JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| Natureza jurídica (CNPJ) | `@br-validators/core/natureza-juridica` | `natureza-juridica lookup` | `/data/fiscal` | `getNaturezaJuridicaPorCodigo` | [RFB Naturezas.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) |
| NBS (NFSe) | `@br-validators/core/nbs` | `nbs lookup` | `/data/fiscal` | `getNbsPorCodigo`, `searchNbs` | [NFSe Anexo B NBS2 xlsx](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx) |
| CEST (ST) | `@br-validators/core/cest` | `cest lookup` | `/data/fiscal` | `getCestPorCodigo`, `getCestPorNcm`, `searchCest` | [CONFAZ ICMS 142/2018](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| ISO 4217 + Bacen PTAX moedas | `@br-validators/core/moedas` | `moedas lookup` | `/data/trade` | `getMoedaPorCodigo`, `searchMoedas` | [Bacen PTAX Moedas API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| Bacen PTAX Fechamento | `@br-validators/core/ptax` | `ptax lookup` | `/data/trade` | `getPtaxCotacao`, `getPtaxUltimoDiaUtil` (+ `dataReferencia`, `isStale`) | [Bacen Olinda PTAX API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3) |
| NF-e Bacen country codes | `@br-validators/core/paises-bacen` | `paises-bacen lookup` | `/data/trade` | `getPaisPorCodigoBacen`, `getPaisesBacen` | [NF-e country table](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| NF-e cUF (IBGE state codes) | `@br-validators/core/nfe-cuf` | `nfe-cuf lookup` | `/data/fiscal` | `getCufPorCodigo`, `lookupCufPorCodigo` | [NF-e cUF table](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| IRPF progressive brackets | `@br-validators/core/irpf` | `irpf tabela` · `irpf calc` | `/data/payroll` | `getIrpfTabelaProgressiva`, `calcularIrpfMensal` | [RFB IRPF tables](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas) |
| INSS contribution brackets | `@br-validators/core/inss` | `inss tabela` · `inss calc` | `/data/payroll` | `getInssTabelaContribuicao`, `calcularInssMensal` | [INSS contribution rates](https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabelas-de-contribuicao) |
| Bacen SELIC meta | `@br-validators/core/selic` | `selic` | `/data/finance` | `getSelicMeta`, `getSelicMetaPorData` | [Bacen SGS série 432](https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries) |
| ISS municipal rates (top 500 PIB) | `@br-validators/core/iss-municipal` | `iss-municipal lookup` · `list` · `search [--uf]` | `/data/fiscal` | `getIssMunicipalPorIbge` — check `fonte` + `warning` (**473/500** `estimativa`) | [IBGE SIDRA PIB 5938](https://apisidra.ibge.gov.br/values/t/5938/n6/all/v/37/p/2022) |
| ICC Incoterms 2020 | `@br-validators/core/incoterms` | `incoterms lookup` | `/data/trade` | `getIncotermPorCodigo`, `getIncoterms` | [ICC Incoterms rules](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| CBO 2002 occupations | `@br-validators/core/cbo` | `cbo lookup` · `cbo search` | `/data/fiscal` | `getCboPorCodigo`, `searchCbo` | [MTE CBO CSV](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| CEP prefix lookup | `@br-validators/core/cep` | `cep faixa` | — | `getCepFaixaInfo`, `getCepFaixas` | [IBGE CNEFE 2022](https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html) |
| Transparency catalog | `@br-validators/core/data-catalog` | — | `/data/catalog` | `getDataCatalog`, `getDatasetMetadata` | See [DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md) |

> **PTAX embed:** last **5 business days** only — not live Bacen. Every cotacao includes `dataReferencia` and `isStale`; when stale, `warning` advises against settlement without a live fetch. Details: [DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md) (row **Bacen PTAX Fechamento**).
>
> **`getAll*()`:** lookup modules export `getAll<Type>()` for full embedded tables — see [Listing reference data](#listing-reference-data) below. Full API list: [docs.br-validators.dev/api-reference](https://docs.br-validators.dev/api-reference/).

```typescript
import { getNcmPorCodigo } from '@br-validators/core/ncm';
import { getCfopPorCodigo } from '@br-validators/core/cfop';
import { getCstIcmsPorCodigo } from '@br-validators/core/cst';
import { getLc116PorCodigo } from '@br-validators/core/lc116';
import { getEsocialCategoriaPorCodigo } from '@br-validators/core/esocial';
import { getCnaePorCodigo } from '@br-validators/core/cnaes';
import { getNaturezaJuridicaPorCodigo } from '@br-validators/core/natureza-juridica';
import { getNbsPorCodigo } from '@br-validators/core/nbs';
import { getCestPorCodigo } from '@br-validators/core/cest';
import { getMoedaPorCodigo } from '@br-validators/core/moedas';
import { getPtaxUltimoDiaUtil } from '@br-validators/core/ptax';
import { getIssMunicipalPorIbge } from '@br-validators/core/iss-municipal';
import { getPaisPorCodigoBacen } from '@br-validators/core/paises-bacen';
import { getIncotermPorCodigo } from '@br-validators/core/incoterms';
import { getAeroportoPorIata } from '@br-validators/core/aeroportos';
import { getPortoPorCodigo } from '@br-validators/core/portos';
import { getAnpPrecosMedios } from '@br-validators/core/anp-combustiveis';
import { getDataCatalog } from '@br-validators/core/data-catalog';

getNcmPorCodigo('01012100');   // NCM leaf code lookup
getCfopPorCodigo('1102');      // fiscal operation code
getCstIcmsPorCodigo('00');     // ICMS CST — tributada integralmente
getLc116PorCodigo('1.01');    // ISS — análise e desenvolvimento de sistemas
getEsocialCategoriaPorCodigo('101'); // eSocial — empregado geral (CLT)
getCnaePorCodigo('6201501');   // economic activity (CNPJ complement)
getNaturezaJuridicaPorCodigo('2062'); // Ltda. legal nature
getNbsPorCodigo('1.1502.50.00');      // NFSe service code
getCestPorCodigo('0302100');          // ST specifier
getMoedaPorCodigo('BRL');             // Real Brasileiro

const ptax = getPtaxUltimoDiaUtil('USD');
ptax.dataReferencia;                 // '2026-06-25' — always expose to callers
ptax.isStale;                        // true when embed > 1 business day old
ptax.warning;                        // present when stale — not for settlement without live fetch

const iss = getIssMunicipalPorIbge(3509502); // Campinas — estimativa row
if (iss?.fonte === 'estimativa') {
  console.warn(iss.warning);       // do not use estimated alíquota for NFSe emission
}

getPaisPorCodigoBacen('1058');        // Brasil (NF-e cPais)
getIncotermPorCodigo('FOB');          // Free On Board
getAeroportoPorIata('GRU');            // Guarulhos — SP
getPortoPorCodigo('BRSSZ');           // Santos organized port
getAnpPrecosMedios({ uf: 'SP', municipio: 'São Paulo', produto: 'GASOLINE_REGULAR' });
getDataCatalog();              // all dataset metadata + capture dates
```

### Listing reference data (`getAll*`)

Every lookup module exposes `getAll*()` to iterate the full embedded table (tree-shakeable per subpath):

```typescript
import { getAllNcm } from '@br-validators/core/ncm';
import { getAllCfop } from '@br-validators/core/cfop';
import { getAllCstIcms } from '@br-validators/core/cst';

const allNcm = getAllNcm();       // readonly NcmRow[]
const allCfop = getAllCfop();
const allIcms = getAllCstIcms();
```

Other examples: `getAllBancos`, `getAllEsocialCategorias`, `getAllIssMunicipal`, `getAllAeroportos`. Deprecated plural names (`getNcms`, `getCfops`) remain until v2.0 — see [MIGRATION.md](MIGRATION.md).

---

## Develop from source

```bash
git clone https://github.com/open-data-brazil/br-validators.git
cd br-validators
pnpm install          # builds @br-validators/core via prepare
pnpm verify           # lint + typecheck + 100% coverage + build
pnpm --filter @br-validators/playground dev   # http://localhost:3000
```

---

## Monorepo layout

```
packages/br-validators/   # @br-validators/core — npm library
apps/cli/                 # @br-validators/cli — terminal
apps/playground/          # Web UI (Vercel)
```

Every shipped type exists in **library + CLI + playground**. See [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md).

---

## Help wanted — contribute

BR Validators is **100% MIT open source**. We need community help to close coverage gaps with **official sources only** — no guessed algorithms.

| Area | Gap | How to help |
|------|-----|-------------|
| **ISS municipal rates** | ~5.070 municipalities not in embed; 473 estimation-only rows | Issue template [`iss-municipal-contribution`](.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml) · [docs/COVERAGE-GAPS.md](docs/COVERAGE-GAPS.md) |
| **RG check digits** | 24 UFs format-only (no published official DV) | Issue template [`rg-dv-upgrade`](.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) · [RG contributor guide](docs/community/RG-CONTRIBUTOR-GUIDE.md) |
| **Data sources** | Endpoint moves / fetch failures | Issue template [`data_source`](.github/ISSUE_TEMPLATE/data_source.yml) · [CRITICAL-ALERTS.md](data/refresh-reports/CRITICAL-ALERTS.md) |

**Before opening a PR:** read [CONTRIBUTING.md](CONTRIBUTING.md), [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md), and [AGENTS.md](AGENTS.md). Every change needs golden test vectors, `CHANGELOG.md` entry, and `pnpm verify` passing (lint, typecheck, 100% coverage on `packages/br-validators/src/**`).

Regenerate gap lists after ISS/IBGE updates: `pnpm generate:coverage-gaps`

---

## Documentation

| Doc | Description |
|-----|-------------|
| [packages/br-validators/README.md](packages/br-validators/README.md) | Library install + API quick start |
| [apps/cli/README.md](apps/cli/README.md) | CLI commands |
| [docs/LIBRARY-API.md](docs/LIBRARY-API.md) | Public API contract |
| [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) | RFB, Bacen, CONTRAN, SEFAZ sources |
| [apps/docs/](apps/docs/) | VitePress site — [docs.br-validators.dev](https://docs.br-validators.dev/) (API synced from `LIBRARY-API.md`) |
| [docs/community/RG-GOOD-FIRST-ISSUES.md](docs/community/RG-GOOD-FIRST-ISSUES.md) | RG 27/27 UFs shipped — DV algorithm upgrades (`good first issue`) |
| [docs/COVERAGE-GAPS.md](docs/COVERAGE-GAPS.md) | Municipalities without ISS embed / official municipal rate; RG DV gaps |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [MIGRATION.md](MIGRATION.md) | v1.x → v2.0 breaking-change guide (lookup + deprecated getters) |
| [docs/VERSIONING.md](docs/VERSIONING.md) | SemVer policy and deprecation windows |
| [docs.br-validators.dev/api-reference](https://docs.br-validators.dev/api-reference/) | Auto-generated TypeDoc signatures (`pnpm docs:api`) |

---

## Current release

| Package | npm | Version |
|---------|-----|---------|
| `@br-validators/core` | [npm](https://www.npmjs.com/package/@br-validators/core) | `1.9.0` |
| `@br-validators/cli` | [npm](https://www.npmjs.com/package/@br-validators/cli) | `1.9.0` |
| `@br-validators/zod` | [npm](https://www.npmjs.com/package/@br-validators/zod) | `1.9.0` |
| `@br-validators/react-hook-form` | [npm](https://www.npmjs.com/package/@br-validators/react-hook-form) | `1.9.0` |
| `@br-validators/express` | [npm](https://www.npmjs.com/package/@br-validators/express) | `1.9.0` |
| `@br-validators/vue` | [npm](https://www.npmjs.com/package/@br-validators/vue) | `1.9.0` |

**v1.9.0** — Phase 33 maturity: `LookupResult` API, fiscal validators (`validateNcm` / `validateCfop` / `validateCst`), IRPF / INSS / SELIC / ISS municipal / NF-e cUF datasets, platform CLI (`compare` / `batch` / `diff` / `mask`), RG 27/27 UFs, `MIGRATION.md`, TypeDoc API reference, security audit CI, E2E subpath import tests. See [CHANGELOG.md](CHANGELOG.md#190---2026-06-26).

See [CHANGELOG.md](CHANGELOG.md) for release notes.

### Known gaps

See [docs/COVERAGE-GAPS.md](docs/COVERAGE-GAPS.md) for the full index (machine-readable JSON under `data/coverage-gaps/`).

| Gap | Status |
|-----|--------|
| ISS municipal — 5.071 municipalities not embedded | [Help wanted](#help-wanted--contribute) — cite municipal legislation |
| ISS municipal — 473 estimation-only rows | Same — replace LC 116 band with verified `leiUrl` |
| RG DV — 24 UFs format-only | [RG contributor guide](docs/community/RG-CONTRIBUTOR-GUIDE.md) |
| Alphanumeric CPF | Blocked — RFB spec not published |
| `@br-validators/adapters-correios` | Planned — CEP HTTP lookup |

---

## License

[MIT](LICENSE) — permanently free and open source. See [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).
