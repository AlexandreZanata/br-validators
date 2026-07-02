## Daily data refresh — 2026-07-02

## ⚠️ Critical source alerts

**10** dataset(s) marked as **consultation link deprecated** (2+ consecutive failure days).
See [`data/refresh-reports/CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md).

| Dataset | Records | + added | − removed | ~ changed | Fields Δ | Captured | Source |
|---------|---------|---------|-----------|-----------|----------|----------|--------|
| ibge | 27 estados / 5571 municipios | 0 | 0 | 0 | — | 2026-07-01 | [official](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| bancos | 469 bancos | 0 | 0 | 0 | — | 2026-07-02 | [official](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| aeroportos | 533 aeroportos / 87 comIata | 0 | 0 | 0 | — | 2026-07-02 | [official](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| tse-municipios | 5571 municipios | 0 | 0 | 0 | — | 2026-07-01 | [official](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| moedas | 154 moedas | 0 | 0 | 0 | — | 2026-07-02 | [official](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| ptax | 850 cotacoes / 10 moedas / 85 diasUteis | 10 | 10 | 0 | — | 2026-07-02 | [official](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)) |
| selic | 90 observacoes / 90 dias | 1 | 1 | 0 | — | 2026-07-02 | [official](https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom) |
| iss-municipal | 500 municipios / 27 capitais / 473 estimativaRows | 400 | 0 | 0 | — | 2026-06-26 | [official](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) |
| paises-bacen | 260 paises | 0 | 0 | 0 | — | 2026-07-02 | [official](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=PfPDd6dW200=) |
| incoterms | 11 incoterms | 0 | 0 | 0 | — | 2026-07-02 | [official](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| telefone-ddd | 67 ddds | 0 | 0 | 0 | — | 2026-07-02 | [official](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| feriados | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | — | 2026-06-23 | [official](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| cnaes | 1332 cnaes | 0 | 0 | 0 | — | 2026-07-01 | [official](https://servicodados.ibge.gov.br/api/v2/cnae/subclasses) |
| cfop | 689 cfop | 0 | 0 | 0 | — | 2026-07-02 | [official](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| natureza-juridica | 90 naturezas | 0 | 0 | 0 | — | 2026-07-02 | [official](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip) |
| cnpj-motivos | 61 motivos | 0 | 0 | 0 | — | 2026-07-02 | [official](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Motivos.zip) |
| ibpt | 12 cargas | 0 | 0 | 0 | — | 2026-07-02 | [official](https://deolhonoimposto.ibpt.org.br/) |
| nbs | 917 nbs | 0 | 0 | 0 | — | 2026-07-01 | [official](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx) |
| cest | 1018 cest | 0 | 0 | 0 | — | 2026-07-02 | [official](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| cst | 11 icms / 14 ipi / 33 pis / 33 cofins | 0 | 0 | 0 | — | 2026-06-24 | [official](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal) |
| lc116 | 200 lc116 | 0 | 0 | 0 | — | 2026-06-25 | [official](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) |
| esocial | 47 categorias / 208 rubricas | 208 | 0 | 0 | — | 2026-06-27 | [official](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html) |
| simples-nacional | 5 anexos / 30 faixas | 0 | 0 | 0 | — | 2026-06-25 | [official](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm) |
| ncm | 10515 ncm | 0 | 0 | 0 | — | 2026-07-01 | [official](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| cbo | 2694 cbo | 0 | 0 | 0 | — | 2026-07-01 | [official](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| cep-faixas | 24649 faixas | 0 | 0 | 0 | — | 2026-06-23 | [official](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF) |
| portos | 1094 portos | 0 | 0 | 0 | — | 2026-07-01 | [official](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| anp-combustiveis | 1 semanas / 2340 precosMedios / 384 municipios / 7 produtos / 27 ufs | 0 | 0 | 0 | — | 2026-07-01 | [official](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) |
| pncp-reference | 19 modalidades / 183 amparos-legais / 6 modos-disputa / 5 tipos-instrumentos-convocatorios / 12 tipos-contrato / 9 criterios-julgamento / 1 tipos-instrumentos-cobranca / 6 fontes-orcamentarias | 0 | 0 | 0 | — | 2026-07-01 | [official](https://pncp.gov.br/api/pncp/v1/modalidades) |
| transparencia-snapshots | 8 endpoints / 7 queryAdapter | 0 | 0 | 0 | — | 2026-07-02 | [official](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) |

**Totals:** +608 −0 ~0

### Source health alerts

- **ibge** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **tse-municipios** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **cnaes** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **nbs** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **ncm** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **cbo** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **portos** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **anp-combustiveis** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **pncp-reference** (critical/source_blocked): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-07-01 retained in the API. Embedded data from **2026-07-01** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.
- **feriados** (critical/source_unavailable): Possible link deprecation (Endpoint probe failed for 1 operational URL(s) — source may be deprecated or moved.). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-06-23 retained in the API. Embedded data from **2026-06-23** retained in the API.
  - Action: See docs/DATA-SOURCE-MAINTENANCE.md — update OFFICIAL-SOURCES.md, fetch script endpoint(s), and metadata.json, then run `pnpm data:refresh`.

### Verification

- [ ] `pnpm verify` passed
- [ ] All endpoints are official government domains
- [ ] No unresolved critical alerts (or documented in PR if retention is expected)
