# @br-validators/core

> **The** Brazilian document validation library for TypeScript.  
> Validate, format, and generate CPF, CNPJ (including the new alphanumeric format), NF-e, BR Code PIX, boleto, IE (all 27 states), EAN barcodes, CNIS/NIT, ANP fuel prices, and 20+ more — zero dependencies, fully typed, never throws.

[![npm](https://img.shields.io/npm/v/@br-validators/core)](https://www.npmjs.com/package/@br-validators/core)
[![npm downloads](https://img.shields.io/npm/dm/@br-validators/core?label=downloads)](https://www.npmjs.com/package/@br-validators/core)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/open-data-brazil/br-validators/blob/main/LICENSE)
[![Node ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)]()
[![GitHub release](https://img.shields.io/github/v/release/open-data-brazil/br-validators)](https://github.com/open-data-brazil/br-validators/releases)

```bash
npm install @br-validators/core
```

**Try it now → [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app)**  
**CLI → `npm install -g @br-validators/cli`**

> ⚠️ The unscoped `br-validators` on npm is a different package. Use **`@br-validators/core`**.

---

## Why this library

Every Brazilian SaaS eventually reinvents CPF validation — usually wrong.  
`@br-validators/core` implements each algorithm from its **official primary source**
(Receita Federal, Bacen, CONTRAN, TSE, SEFAZ, FEBRABAN, Anatel) so you don't have to.

- ✅ **CNPJ alfanumérico** — new RFB format (effective July 2026), ready now
- ✅ **21+ document types** — CPF, CNPJ, CEP, NF-e chave, processo judicial CNJ, BR Code PIX, boleto (cobrança + arrecadação), CNH, RENAVAM, placa, PIS/PASEP, CNIS/NIT, EAN-8/EAN-13, PIX key, cartão de crédito, IE (27 UFs), IE produtor rural, título de eleitor, telefone, + platform APIs above
- ✅ **Zero runtime dependencies** — pure TypeScript logic, no HTTP calls
- ✅ **Never throws** — every function returns `{ ok: true, value } | { ok: false, message, code }`
- ✅ **Tree-shakeable** — subpath imports per document type
- ✅ **Reference data** — IBGE (municipalities + NF-e `cMunFG`), Bacen banks, DDD lookup, national holidays, CNAE, CFOP, CST, LC 116, NCM, IBPT tax burden, Simples Nacional, CBO, natureza jurídica, NBS, CEST, eSocial categorias, CNPJ motivos, moedas, PTAX cotações, países Bacen, NF-e cUF, IRPF / INSS tables, SELIC meta, ISS municipal (sample), Incoterms, portos, aeroportos, **ANP fuel prices (LPC)** — embedded offline with daily freshness ([DATA-FRESHNESS.md](../../docs/DATA-FRESHNESS.md); ANP weekly)
- ✅ **ESM only**, Node ≥ 18, works in browser, Bun, Deno

---

## Quick start

```typescript
import { validateCpf, formatCpf } from '@br-validators/core';

validateCpf('123.456.789-09');
// { ok: true, value: '12345678909' }

formatCpf('12345678909');
// { ok: true, formatted: '123.456.789-09' }

validateCpf('111.111.111-11');
// { ok: false, message: 'CPF with all identical digits is invalid', code: 'KNOWN_INVALID_PATTERN' }
```

### CNPJ — numeric and alphanumeric (new RFB format)

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';

// Numeric (current format)
validateCnpj('11.222.333/0001-81');
// { ok: true, value: '11222333000181', format: 'numeric' }

// Alphanumeric (new format — effective July 2026)
validateCnpj('12ABC34501DE35');
// { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' }

formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35' }
```

### Auto-detect document type

```typescript
import { detect } from '@br-validators/core';

detect('123.456.789-09');
// { type: 'cpf', ok: true, value: '12345678909' }

detect('ABC1D23');
// { type: 'placa', ok: true, format: 'mercosul' }

detect('110042490114', { uf: 'SP' });
// { type: 'inscricao-estadual', ok: true }
```

### Generate valid documents for tests

```typescript
import { generate } from '@br-validators/core';

generate('cpf', { seed: 42 });           // reproducible, always valid
generate('cnpj', { format: 'alphanumeric', masked: true });
generate('placa', { format: 'mercosul' });
generate('renavam');
generate('cnh');
generate('inscricao-estadual', { uf: 'SP', seed: 42 });
generate('titulo-eleitor', { uf: 'SC', seed: 42 });
generate('cartao-credito', { brand: 'visa', seed: 42 });
generate('pix', { seed: 42 });           // EVP UUID — Bacen DICT
generate('nfe-chave', { seed: 42 });     // MOC §2.2.6 modulo-11 DV
generate('brcode', { seed: 42 });        // static PIX EMV + CRC16
generate('boleto', { masked: true });    // FEBRABAN cobrança Situação 1
generate('boleto-arrecadacao');          // FEBRABAN Layout v7
generate('inscricao-estadual-produtor-rural', { masked: true }); // SP SINTEGRA Bloco II
```

> `generate()` is for test fixtures and seed data only — never use in production.  
> Alphanumeric CPF: `generate('cpf', { format: 'alphanumeric' })` throws `CPF_ALPHA_SPEC_PENDING` until RFB publishes the official algorithm ([OFFICIAL-SOURCES.md](https://github.com/open-data-brazil/br-validators/blob/main/docs/OFFICIAL-SOURCES.md)).

### ETL / data cleanup

```typescript
import { sanitize } from '@br-validators/core';

sanitize(' 123.456.789-09 ', 'cpf');
// { ok: true, value: '12345678909', fixes: ['trimmed', 'removed_non_digits'] }

sanitize('110.042.490.114', 'inscricao-estadual', { uf: 'SP' });
// { ok: true, value: '110042490114', fixes: [...] }
```

### NF-e chave de acesso (44 digits)

```typescript
import { validateNfeChave, parseNfeChave } from '@br-validators/core/nfe-chave';

const result = validateNfeChave('52060433009911002506550120000007800267301615');
// { ok: true, parsed: { cUF: '52', cnpj: '33009911002506', mod: '55', ... }, uf: 'GO' }
```

### BR Code (PIX QR payload)

```typescript
import {
  buildStaticPixBrCode,
  parseBrCode,
  validateBrCode,
} from '@br-validators/core/brcode';

// Permanent static QR (no amount — payer sets value at payment time)
const payload = buildStaticPixBrCode({
  pixKey: 'pix@bcb.gov.br',
  merchantName: 'Fulano de Tal',
  merchantCity: 'BRASILIA',
});
validateBrCode(payload).ok; // true

// Fixed-value static QR
buildStaticPixBrCode({
  pixKey: 'pix@bcb.gov.br',
  merchantName: 'Fulano de Tal',
  merchantCity: 'BRASILIA',
  amount: '10.50',
});

parseBrCode(payload);
// { ok: true, pixKey, pixKeyType, merchantName, merchantCity, amount, txid }
```

**Playground:** [doc-raiz-playground.vercel.app/pix](https://doc-raiz-playground.vercel.app/pix) renders the QR image from `buildStaticPixBrCode` output. Official sources: [Bacen Manual BR Code](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Manual de Padrões PIX](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf).

### Boleto — cobrança + arrecadação

```typescript
import { validateBoleto, validateArrecadacao } from '@br-validators/core/boleto';

validateBoleto('03399.02579 08991.834006 71742.301014 6 14500000099668');
// cobrança Situação 1/2 — FEBRABAN FB-0061/2021

validateArrecadacao('846300000003812345678906123456789015234567890129');
// arrecadação 48-digit — FEBRABAN Layout v7
```

### Platform APIs — mask, compare, batch, diff

```typescript
import { mask, compare, batch, diff } from '@br-validators/core';

mask('12345678909', 'cpf');
// { ok: true, formatted: '123.456.789-09' }

compare('123.456.789-09', '12345678909', 'cpf');
// { equal: true }

batch(['12345678909', 'invalid'], 'cpf');
// { valid: [...], invalid: [...], summary: { total: 2, valid: 1, invalid: 1 } }

diff('12345678909', '12345678901', 'cpf');
// { changed: true, fields: [{ field: 'dv', a: '09', b: '01' }] }
```

### Fiscal code validators (NCM, CFOP, CST)

```typescript
import { validateNcm } from '@br-validators/core/ncm';
import { validateCfop } from '@br-validators/core/cfop';
import { validateCst } from '@br-validators/core/cst';
import { lookupNcmPorCodigo } from '@br-validators/core/ncm';

validateNcm('01012100');   // { ok: true, value: '01012100', row: { ... } }
validateCfop('1102');      // dotted or plain CONFAZ codes
validateCst('00', { tax: 'icms' });

lookupNcmPorCodigo('01012100'); // LookupResult — ok / not-found / invalid-format
```

Per-type rules and official sources: [docs/OFFICIAL-SOURCES.md](https://github.com/open-data-brazil/br-validators/blob/main/docs/OFFICIAL-SOURCES.md) · API contract: [docs/LIBRARY-API.md](https://github.com/open-data-brazil/br-validators/blob/main/docs/LIBRARY-API.md)

> **Backend / form integration:** `format*` and `mask()` validate first — they **never** left-pad partial input (`"0"` will not become `000.000.000-00`). Do not combine `padStart` with display formatting in `onChange`; pad to full width only at submit if your API requires it. Details: [LIBRARY-API.md — display vs backend normalization](https://github.com/open-data-brazil/br-validators/blob/main/docs/LIBRARY-API.md#consumer-warning--display-formatting-vs-backend-normalization).

### Form handler (React / Next.js)

```typescript
'use client';
import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';
import { useState } from 'react';

export function CnpjField() {
  const [input, setInput] = useState('');
  const result = input ? validateCnpj(input) : null;
  const formatted = result?.ok ? formatCnpj(result.value) : null;

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      {formatted?.ok && <p>✅ {formatted.formatted}</p>}
      {result && !result.ok && <p>❌ {result.message}</p>}
    </div>
  );
}
```

### Shell / CI

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
br-validators ie validate "$IE" --uf SP --json
br-validators detect '123.456.789-09' --json
br-validators generate cpf --seed 42 --masked
br-validators generate pix --seed 42
br-validators generate nfe-chave --seed 42
br-validators generate brcode --seed 42
br-validators generate boleto --masked --seed 42
br-validators generate boleto-arrecadacao --seed 42
br-validators generate inscricao-estadual-produtor-rural --masked --seed 42
```

---

## All supported types

| Document | Subpath import | CLI | Playground |
|---|---|---|---|
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | `/cpf` |
| CNPJ (numeric + alphanumeric) | `@br-validators/core/cnpj` | `br-validators cnpj …` | `/cnpj` |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | `/cep` (+ `getCepFaixaInfo` prefix lookup) |
| Telefone | `@br-validators/core/telefone` | `br-validators telefone …` | `/telefone` |
| CNH | `@br-validators/core/cnh` | `br-validators cnh …` | `/cnh` |
| RENAVAM | `@br-validators/core/renavam` | `br-validators renavam …` | `/renavam` |
| Título de Eleitor | `@br-validators/core/titulo-eleitor` | `br-validators titulo-eleitor …` | `/titulo-eleitor` |
| Processo judicial CNJ | `@br-validators/core/processo-judicial` | `br-validators processo-judicial …` | `/processo-judicial` |
| RG (27 UFs — identity card) | `@br-validators/core/rg` | `br-validators rg … --uf SP` | `/rg` |
| Placa (Mercosul + legada) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| CNIS / NIT (worker ID) | `@br-validators/core/cnis` | `br-validators cnis …` | `/cnis` |
| EAN-8 / EAN-13 (barcode) | `@br-validators/core/ean` | `br-validators ean …` | `/ean` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| BR Code (PIX QR payload + builder) | `@br-validators/core/brcode` | `br-validators brcode …` | `/brcode` |
| Boleto cobrança (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Boleto arrecadação (48/44) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| NF-e / NFC-e chave (44 digits) | `@br-validators/core/nfe-chave` | `br-validators nfe-chave …` | `/nfe-chave` |
| Cartão de crédito (Luhn) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |
| IE Produtor Rural | `@br-validators/core/inscricao-estadual-produtor-rural` | `br-validators ie …` (auto `P`) | `/ie` |
| **detect()** | `@br-validators/core/detect` | `br-validators detect …` | `/detect` |
| **sanitize()** | `@br-validators/core/sanitize` | `br-validators sanitize …` | `/sanitize` |
| **mask()** | `@br-validators/core/mask` | `br-validators mask …` | via per-type `format` |
| **compare()** | `@br-validators/core/compare` | `br-validators compare …` | `/compare` |
| **batch()** | `@br-validators/core/batch` | `br-validators batch …` | `/batch` |
| **diff()** | `@br-validators/core/diff` | `br-validators diff …` | `/diff` |
| **generate()** | `@br-validators/core/generate` | `br-validators generate …` | `/generate` |
| **buildStaticPixBrCode()** | `@br-validators/core/brcode` | — | `/pix` (QR panel) |

### Reference data (offline lookup)

Embedded JSON from official `.gov.br` sources — **no runtime HTTP**. Each module exports `*_DATA_VERSION` with capture date, row counts, and source URLs. Aggregated via `@br-validators/core/data-catalog`.

| Dataset | Subpath | CLI | Playground | Key APIs | Official source |
|---------|---------|-----|------------|----------|-----------------|
| IBGE states + municipalities + NF-e cMunFG | `@br-validators/core/ibge` | `ibge lookup` · `list` | `/data/ibge` | `getEstados`, `getMunicipios`, `getMunicipioPorCodigo`, `toCmunFg`, `parseCmunFg` | [IBGE localidades API](https://servicodados.ibge.gov.br/api/docs/localidades) |
| Bacen STR banks (COMPE / ISPB) | `@br-validators/core/bancos` | `bancos lookup` · `list` | `/data/bancos` | `getBancos`, `getBancoPorCodigo`, `getBancoPorIspb` | [Bacen Participantes STR](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| ANAC public aerodromos | `@br-validators/core/aeroportos` | `aeroportos lookup` | `/data/logistics` | `getAeroportos`, `getAeroportoPorIata`, `getAeroportoPorIcao`, `getAeroportosPorMunicipio` | [ANAC aeródromos públicos CSV](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| ANTAQ port installations | `@br-validators/core/portos` | `portos lookup` | `/data/logistics` | `getPortoPorCodigo`, `searchPortos`, `getPortosPorMunicipio` | [ANTAQ instalações portuárias zip](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| ANP fuel prices (LPC) | `@br-validators/core/anp-combustiveis` | — | `/data/logistics` | `getAnpPrecosMedios`, `getAnpPrecosMediosPorIbge`, `getAnpSemanaAtual` | [ANP levantamento LPC](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) |
| TSE ↔ IBGE municipality codes | `@br-validators/core/tse-municipios` | `tse-municipios lookup` | `/data/ibge` (cross-ref) | `getMapeamentoTseIbge`, `getMunicipioIbgePorCodigoTse`, `getCodigosTsePorMunicipio` | [TSE municipio_tse_ibge.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| DDD geographic lookup | `@br-validators/core/telefone` | `ddd lookup` | — | `getDddInfo` (extends telefone validator) | [Anatel DDD panel](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| National holidays | `@br-validators/core/feriados` | `feriados list --year` | `/data/calendar` | `isFeriadoNacional`, `getFeriadosNacionais`, `getProximoDiaUtil` | [Lei 662/1949](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) + annual Portaria MGI |
| CNAE 2.3 subclasses | `@br-validators/core/cnaes` | `cnae lookup` · `search` | `/data/fiscal` | `getCnaePorCodigo`, `searchCnaes` | [IBGE CNAE API v2](https://servicodados.ibge.gov.br/api/docs/cnae) |
| CFOP fiscal operations | `@br-validators/core/cfop` | `cfop lookup` · `search` | `/data/fiscal` | `getCfopPorCodigo`, `searchCfop` | [CONFAZ CFOP SINIEF](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| CST (ICMS, IPI, PIS, COFINS) | `@br-validators/core/cst` | — | `/data/fiscal` | `getCstIcmsPorCodigo`, `getCstIpiPorCodigo`, `searchCstIcms` | [RFB SPED CST tables](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal) |
| LC 116 ISS services | `@br-validators/core/lc116` | — | `/data/fiscal` | `getLc116PorCodigo`, `searchLc116` | [LC 116/2003 Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) |
| eSocial worker categories | `@br-validators/core/esocial` | — | `/data/fiscal` | `getEsocialCategoriaPorCodigo`, `searchEsocialCategorias` | [eSocial S-1.3 Tabelas](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html) |
| NCM Mercosur nomenclature | `@br-validators/core/ncm` | `ncm lookup` · `search` | `/data/fiscal` | `getNcmPorCodigo`, `searchNcm` | [Siscomex NCM JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| IBPT approximate NCM tax burden | `@br-validators/core/ibpt` | — | `/data/fiscal` | `getIbptCargaPorNcmUf`, `computeIbptCargaTotal` | [IBPT Lei 12.741/2012](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm) |
| Simples Nacional annex tables | `@br-validators/core/simples-nacional` | — | `/data/fiscal` | `getSimplesAnexo`, `getSimplesFaixa`, `computeSimplesAliquotaEfetiva` | [LC 123/2006 Planalto](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2006/lei/l123.htm) |
| CNPJ motivos situação cadastral | `@br-validators/core/cnpj-motivos` | — | `/data/fiscal` | `getMotivosSituacaoCadastral`, `getMotivoSituacaoCadastralPorCodigo` | [RFB Motivos.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) |
| Natureza jurídica (CNPJ) | `@br-validators/core/natureza-juridica` | `natureza-juridica lookup` | `/data/fiscal` | `getNaturezaJuridicaPorCodigo` | [RFB Naturezas.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) |
| NBS (NFSe Nacional) | `@br-validators/core/nbs` | `nbs lookup` | `/data/fiscal` | `getNbsPorCodigo`, `searchNbs` | [NFSe Anexo B NBS2 xlsx](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx) |
| CEST (substituição tributária) | `@br-validators/core/cest` | `cest lookup` | `/data/fiscal` | `getCestPorCodigo`, `getCestPorNcm`, `searchCest` | [CONFAZ ICMS 142/2018](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| ISO 4217 + Bacen PTAX moedas | `@br-validators/core/moedas` | `moedas lookup` | `/data/trade` | `getMoedaPorCodigo`, `searchMoedas` | [Bacen PTAX Moedas API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| Bacen PTAX Fechamento | `@br-validators/core/ptax` | — | `/data/trade` | `getPtaxCotacao`, `getPtaxUltimoDiaUtil` | [Bacen Olinda PTAX API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3) |
| NF-e Bacen country codes | `@br-validators/core/paises-bacen` | `paises-bacen lookup` | `/data/trade` | `getPaisPorCodigoBacen`, `getPaisesBacen` | [NF-e country table](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| NF-e cUF (IBGE state codes) | `@br-validators/core/nfe-cuf` | `nfe-cuf lookup` | `/data/fiscal` | `getCufPorCodigo`, `lookupCufPorCodigo` | [NF-e cUF table](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| IRPF progressive brackets | `@br-validators/core/irpf` | `irpf tabela` · `irpf calc` | `/data/payroll` | `getIrpfTabelaProgressiva`, `calcularIrpfMensal` | [RFB IRPF tables](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas) |
| INSS contribution brackets | `@br-validators/core/inss` | `inss tabela` · `inss calc` | `/data/payroll` | `getInssTabelaContribuicao`, `calcularInssMensal` | [INSS contribution rates](https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabelas-de-contribuicao) |
| Bacen SELIC meta | `@br-validators/core/selic` | `selic` | `/data/finance` | `getSelicMeta`, `getSelicMetaPorData` | [Bacen SGS série 432](https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries) |
| ISS municipal rates (sample) | `@br-validators/core/iss-municipal` | `iss-municipal lookup` · `search` | `/data/fiscal` | `getIssMunicipalPorIbge`, `searchIssMunicipal` | [IBGE PIB municipal 2022](https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/19567-pib-dos-municipios.html) |
| ICC Incoterms 2020 | `@br-validators/core/incoterms` | `incoterms lookup` | `/data/trade` | `getIncotermPorCodigo`, `getIncoterms` | [ICC Incoterms rules](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| CBO 2002 occupations | `@br-validators/core/cbo` | `cbo lookup` · `search` | `/data/fiscal` | `getCboPorCodigo`, `searchCbo` | [MTE CBO downloads](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads) |
| CEP prefix lookup | `@br-validators/core/cep` | `cep faixa` | — | `getCepFaixaInfo`, `getCepFaixas` | [IBGE CNEFE 2022](https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html) |
| Data transparency catalog | `@br-validators/core/data-catalog` | — | `/data/catalog` | `getDataCatalog`, `getDatasetMetadata` | Aggregates all `metadata.json` entries |

```typescript
import { getMunicipioPorCodigo } from '@br-validators/core/ibge';
import { getBancoPorCodigo } from '@br-validators/core/bancos';
import { getDddInfo } from '@br-validators/core/telefone';
import { isFeriadoNacional } from '@br-validators/core/feriados';
import { getCnaePorCodigo } from '@br-validators/core/cnaes';
import { getCfopPorCodigo } from '@br-validators/core/cfop';
import { getCstIcmsPorCodigo } from '@br-validators/core/cst';
import { getLc116PorCodigo } from '@br-validators/core/lc116';
import { getNcmPorCodigo } from '@br-validators/core/ncm';
import { getCboPorCodigo } from '@br-validators/core/cbo';
import { getNaturezaJuridicaPorCodigo } from '@br-validators/core/natureza-juridica';
import { getNbsPorCodigo } from '@br-validators/core/nbs';
import { getCestPorCodigo } from '@br-validators/core/cest';
import { getMoedaPorCodigo } from '@br-validators/core/moedas';
import { getPaisPorCodigoBacen } from '@br-validators/core/paises-bacen';
import { getIncotermPorCodigo } from '@br-validators/core/incoterms';
import { getAeroportoPorIata } from '@br-validators/core/aeroportos';
import { getPortoPorCodigo } from '@br-validators/core/portos';
import { getAnpPrecosMedios } from '@br-validators/core/anp-combustiveis';
import { getSelicMeta } from '@br-validators/core/selic';
import { getIrpfTabelaProgressiva } from '@br-validators/core/irpf';
import { getInssTabelaContribuicao } from '@br-validators/core/inss';
import { getCufPorCodigo } from '@br-validators/core/nfe-cuf';
import { getIssMunicipalPorIbge } from '@br-validators/core/iss-municipal';
import { getDataCatalog } from '@br-validators/core/data-catalog';

getMunicipioPorCodigo(3550308)?.nome; // São Paulo
getBancoPorCodigo('001')?.nome;       // Banco do Brasil
getDddInfo('11')?.uf;                 // SP
isFeriadoNacional('2026-01-01');      // true — Confraternização Universal
getCnaePorCodigo('6201501');          // custom software development
getCfopPorCodigo('1.102');            // accepts CONFAZ dotted format
getNcmPorCodigo('01012100');          // purebred horses (8-digit leaf)
getCboPorCodigo('212405');            // systems development analyst
getNaturezaJuridicaPorCodigo('2062'); // Sociedade Empresária Limitada
getNbsPorCodigo('1.1502.50.00');      // TI systems integration (NFSe)
getCestPorCodigo('0302100');          // returnable beer bottle (ST)
getMoedaPorCodigo('BRL')?.nome;       // Real Brasileiro
getPaisPorCodigoBacen('1058')?.nome;  // Brasil (NF-e cPais)
getIncotermPorCodigo('FOB')?.nome;    // Free On Board
getAeroportoPorIata('GRU')?.nome;     // Guarulhos — SP
getPortoPorCodigo('BRSSZ')?.nome;     // Santos organized port
getAnpPrecosMedios({ uf: 'SP', municipio: 'São Paulo', produto: 'GASOLINE_REGULAR' })?.precoMedio;
getSelicMeta()?.valor;              // latest Bacen SELIC meta (% a.a.)
getIrpfTabelaProgressiva(2026);     // progressive monthly brackets
getInssTabelaContribuicao(2026);    // INSS contribution table
getCufPorCodigo('35')?.uf;          // SP (NF-e cUF)
getIssMunicipalPorIbge(3550308);    // São Paulo ISS sample row
getDataCatalog().length;              // registered datasets
```

Freshness table (auto-updated daily; ANP weekly): [docs/DATA-FRESHNESS.md](https://github.com/open-data-brazil/br-validators/blob/main/docs/DATA-FRESHNESS.md) · Per-type official URLs: [docs/OFFICIAL-SOURCES.md](https://github.com/open-data-brazil/br-validators/blob/main/docs/OFFICIAL-SOURCES.md)

---

## Current release

**v1.9.0** — Phase 33 maturity: `LookupResult` API, fiscal validators, IRPF / INSS / SELIC / ISS municipal / NF-e cUF datasets, platform CLI (`compare` / `batch` / `diff` / `mask`), RG 27/27 UFs, `MIGRATION.md`, TypeDoc API reference. [CHANGELOG](https://github.com/open-data-brazil/br-validators/blob/main/CHANGELOG.md#190---2026-06-26)

---

## Tree-shaking

```typescript
// Only ships the CPF module — nothing else
import { validateCpf } from '@br-validators/core/cpf';

// Only ships NF-e module
import { parseNfeChave } from '@br-validators/core/nfe-chave';
```

---

## Related packages

| Package | npm |
|---|---|
| [`@br-validators/cli`](https://www.npmjs.com/package/@br-validators/cli) | Terminal — validate, format, detect, generate |
| [`@br-validators/zod`](https://www.npmjs.com/package/@br-validators/zod) | Zod 3/4 schemas |
| [`@br-validators/react-hook-form`](https://www.npmjs.com/package/@br-validators/react-hook-form) | RHF rules + resolvers |
| [`@br-validators/express`](https://www.npmjs.com/package/@br-validators/express) | Express + Fastify middleware |
| [`@br-validators/vue`](https://www.npmjs.com/package/@br-validators/vue) | Vue 3 composables |

---

## Contributing

Issues, corrections, and new document types are welcome.  
See [CONTRIBUTING.md](https://github.com/open-data-brazil/br-validators/blob/main/CONTRIBUTING.md) and open `good first issue` items.

---

## License

[MIT](https://github.com/open-data-brazil/br-validators/blob/main/LICENSE) — permanently free and open source.
