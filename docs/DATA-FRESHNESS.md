# Data freshness — reference datasets

> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.
> Last bot run: 2026-06-26T13:38:56.170Z

## Summary

| Dataset | Last capture | Records | + added | − removed | ~ changed | Fields Δ | Official source |
|---------|--------------|---------|---------|-----------|-----------|----------|-----------------|
| IBGE Localidades | 2026-06-26 | 27 estados / 5571 municipios | 0 | 0 | 0 | — | [IBGE API v1 /localidades](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| Bacen STR Participants | 2026-06-26 | 469 bancos | 0 | 0 | 0 | — | [Banco Central — Participantes STR](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| ANAC Public Aerodromos | 2026-06-26 | 533 aeroportos / 87 comIata | 0 | 0 | 0 | — | [ANAC — Lista de aeródromos de uso público](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| TSE ↔ IBGE Municipality Codes | 2026-06-26 | 5571 municipios | 0 | 0 | 0 | — | [TSE — Códigos oficiais de UF e municípios segundo o TSE e o IBGE](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| ISO 4217 Currencies + Bacen PTAX | 2026-06-26 | 154 moedas | 0 | 0 | 0 | — | [ISO 4217 (embedded) + Banco Central PTAX Moedas](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| Bacen PTAX Fechamento | 2026-06-27 | 860 cotacoes / 10 moedas / 86 diasUteis (janela 90 BD) | 820 | 0 | 0 | — | [Banco Central Olinda PTAX API — Fechamento PTAX](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)) |
| NF-e Bacen Country Codes | 2026-06-26 | 253 paises | 0 | 0 | 0 | — | [Portal Nacional NF-e — Tabela de Países (Bacen)](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=PfPDd6dW200=) |
| ICC Incoterms 2020 | 2026-06-26 | 11 incoterms | 0 | 0 | 0 | — | [International Chamber of Commerce — Incoterms 2020 (static reference)](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| Anatel DDD Geographic Lookup | 2026-06-26 | 67 ddds | 0 | 0 | 0 | — | [Anatel Plano de Numeração + IBGE municipios](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| Feriados Nacionais Federais | 2026-06-23 | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | — | [Lei 662/1949 + Portaria MGI (calendário federal)](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| IBGE CNAE 2.3 Subclasses | 2026-06-26 | 1332 cnaes | 0 | 0 | 0 | — | [IBGE API v2 /cnae/subclasses](https://servicodados.ibge.gov.br/api/v2/cnae/subclasses) |
| CONFAZ CFOP | 2026-06-26 | 689 cfop | 0 | 0 | 0 | — | [CONFAZ SINIEF Convênio s/nº 1970 — Anexo II](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| RFB CNPJ Naturezas Jurídicas | 2026-06-26 | 90 naturezas | 0 | 0 | 0 | — | [Receita Federal — Dados Abertos CNPJ (Naturezas.zip)](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip) |
| RFB CNPJ Motivos de Situação Cadastral | 2026-06-26 | 61 motivos | 0 | 0 | 0 | — | [Receita Federal — Dados Abertos CNPJ (Motivos.zip)](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Motivos.zip) |
| IBPT — Carga tributária aproximada por NCM (Lei 12.741/2012) | 2026-06-26 | 12 cargas | 0 | 0 | 0 | — | [IBPT — De Olho no Imposto (tabelas oficiais NCM × UF)](https://deolhonoimposto.ibpt.org.br/) |
| NFSe NBS | 2026-06-26 | 917 nbs | 0 | 0 | 0 | — | [NFSe Nacional — Anexo B NBS2 Lista Serviço Nacional](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx) |
| CONFAZ CEST | 2026-06-26 | 1018 cest | 0 | 0 | 0 | — | [CONFAZ Convênio ICMS 142/2018 — Anexos II a XXVI](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| RFB SPED — CST (ICMS, IPI, PIS, COFINS) | 2026-06-24 | 11 icms / 14 ipi / 33 pis / 33 cofins | 0 | 0 | 0 | — | [SPED Fiscal — Tabelas de Situação Tributária (IN RFB 932/2009 family)](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal) |
| LC 116/2003 — Lista de Serviços ISS | 2026-06-25 | 200 lc116 | 0 | 0 | 0 | — | [Lei Complementar 116/2003 — Anexo (Lista de Serviços)](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) |
| eSocial Tabela 01 — Categorias de Trabalhadores | 2026-06-25 | 47 categorias | 0 | 0 | 0 | — | [eSocial S-1.3 — Tabela 01 (Categorias de Trabalhadores)](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html) |
| LC 123/2006 — Simples Nacional (anexos e faixas) | 2026-06-25 | 5 anexos / 30 faixas | 0 | 0 | 0 | — | [Lei Complementar 123/2006 — Anexos I a V (redação LC 155/2016)](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm) |
| NCM — Nomenclatura Comum do Mercosul | 2026-06-26 | 10515 ncm | 0 | 0 | 0 | — | [Receita Federal / Siscomex nomenclatura JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| CBO 2002 — Brazilian Occupations | 2026-06-26 | 2694 cbo | 0 | 0 | 0 | — | [MTE CBO 2002 ocupacao.csv](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| CEP prefix lookup (IBGE CNEFE 2022) | 2026-06-23 | 24649 faixas | 0 | 0 | 0 | — | [IBGE CNEFE Censo 2022 microdata by UF](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF) |
| ANTAQ port installations | 2026-06-26 | 1094 portos | 0 | 0 | 0 | — | [ANTAQ — Instalações Portuárias Outorgadas (Portos.xlsx)](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| ANP — Levantamento de Preços de Combustíveis (LPC) | 2026-06-26 | 1 semanas / 2357 precosMedios / 386 municipios / 7 produtos / 27 ufs | 0 | 0 | 0 | — | [ANP — resumo_semanal_lpc (municipal averages)](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) |
| PNCP domain reference tables | 2026-06-26 | 19 modalidades / 183 amparos-legais / 6 modos-disputa / 5 tipos-instrumentos-convocatorios / 12 tipos-contrato / 9 criterios-julgamento / 1 tipos-instrumentos-cobranca / 6 fontes-orcamentarias | 0 | 0 | 0 | — | [PNCP Cadastro API — static domain tables (Lei 14.133 ecosystem)](https://pncp.gov.br/api/pncp/v1/modalidades) |
| Portal da Transparência endpoint registry | 2026-06-26 | 8 endpoints / 7 queryAdapter | 0 | 0 | 0 | — | [CGU Portal da Transparência — Swagger audit (query endpoints; no bulk embed in v1)](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) |

## Source health alerts

> Official source unreachable or deprecated. **Embedded data was retained** — the published API continues to serve the last successful capture.

| Dataset | Severity | Status | Embedded data from | Message |
|---------|----------|--------|--------------------|---------|
| cfop | warning | source_unavailable | 2026-06-26 | Possible link deprecation — official source unreachable after 5 attempts (2 min interval). |
| cest | warning | source_unavailable | 2026-06-26 | Possible link deprecation — official source unreachable after 5 attempts (2 min interval). |

### Maintainer action required

1. Read [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md).
2. Scan [CRITICAL-ALERTS.md](../data/refresh-reports/CRITICAL-ALERTS.md) when severity is **critical**.
3. Verify whether the official URL moved (404) or the payload schema changed.
4. Update `docs/OFFICIAL-SOURCES.md`, the relevant `scripts/fetch-*.ts` endpoint(s), and `metadata.json`.
5. Run `pnpm data:refresh` locally and confirm alerts are cleared in `data/refresh-reports/latest.json`.

## Verification

- Schedule: **daily** — 00:00 America/Sao_Paulo (`0 3 * * *` UTC in `data-refresh-bot.yml`)
- Fetch retries: **5** attempts, **2 min** apart (`scripts/lib/fetch-retry-config.ts`)
- Critical maintainer file: [`data/refresh-reports/CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md)
- On source failure: embedded JSON is **not** overwritten; daily report records retention
- Local dry run: `pnpm data:refresh`
- Library API: `getDataCatalog()` from `@br-validators/core/data-catalog`
- Maintainer guide: [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md)

## Report snapshot

```json
{
  "datasetsVerificados": 28,
  "datasetsAlterados": 0,
  "totalAdicionados": 0,
  "totalRemovidos": 0,
  "totalAlterados": 0,
  "sourceAlerts": 2,
  "criticalAlerts": 0,
  "baselinesSelados": 0
}
```

