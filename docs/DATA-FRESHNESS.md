# Data freshness — reference datasets

> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.
> Last bot run: 2026-06-24T14:55:30.442Z

## Summary

| Dataset | Last capture | Records | + added | − removed | ~ changed | Fields Δ | Official source |
|---------|--------------|---------|---------|-----------|-----------|----------|-----------------|
| IBGE Localidades | 2026-06-24 | 27 estados / 5571 municipios | 0 | 0 | 0 | — | [IBGE API v1 /localidades](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| Bacen STR Participants | 2026-06-23 | 468 bancos | 0 | 0 | 0 | — | [Banco Central — Participantes STR](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| ANAC Public Aerodromos | 2026-06-23 | 533 aeroportos / 87 comIata | 0 | 0 | 0 | — | [ANAC — Lista de aeródromos de uso público](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| TSE ↔ IBGE Municipality Codes | 2026-06-23 | 5571 municipios | 0 | 0 | 0 | — | [TSE — Códigos oficiais de UF e municípios segundo o TSE e o IBGE](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| ISO 4217 Currencies + Bacen PTAX | 2026-06-23 | 154 moedas | 154 | 0 | 0 | — | [ISO 4217 (embedded) + Banco Central PTAX Moedas](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| NF-e Bacen Country Codes | 2026-06-23 | 252 paises | 252 | 0 | 0 | — | [Portal Nacional NF-e — Tabela de Países (Bacen)](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| ICC Incoterms 2020 | 2026-06-23 | 11 incoterms | 11 | 0 | 0 | — | [International Chamber of Commerce — Incoterms 2020 (static reference)](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| Anatel DDD Geographic Lookup | 2026-06-23 | 67 ddds | 0 | 0 | 0 | — | [Anatel Plano de Numeração + IBGE municipios](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| Feriados Nacionais Federais | 2026-06-23 | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | — | [Lei 662/1949 + Portaria MGI (calendário federal)](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| IBGE CNAE 2.3 Subclasses | 2026-06-23 | 1332 cnaes | 1332 | 0 | 0 | — | [IBGE API v2 /cnae/subclasses](https://servicodados.ibge.gov.br/api/v2/cnae/subclasses) |
| CONFAZ CFOP | 2026-06-23 | 689 cfop | 689 | 0 | 0 | — | [CONFAZ SINIEF Convênio s/nº 1970 — Anexo II](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| RFB CNPJ Naturezas Jurídicas | 2026-06-23 | 90 naturezas | 90 | 0 | 0 | — | [Receita Federal — Dados Abertos CNPJ (Naturezas.zip)](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip) |
| NFSe NBS | 2026-06-23 | 917 nbs | 917 | 0 | 0 | — | [NFSe Nacional — Anexo B NBS2 Lista Serviço Nacional](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx) |
| CONFAZ CEST | 2026-06-23 | 1018 cest | 1018 | 0 | 0 | — | [CONFAZ Convênio ICMS 142/2018 — Anexos II a XXVI](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| NCM — Nomenclatura Comum do Mercosul | 2026-06-23 | 10515 ncm | 10515 | 0 | 0 | — | [Receita Federal / Siscomex nomenclatura JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| CBO 2002 — Brazilian Occupations | 2026-06-23 | 2694 cbo | 2694 | 0 | 0 | — | [MTE CBO 2002 ocupacao.csv](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| CEP prefix lookup (IBGE CNEFE 2022) | 2026-06-23 | 24649 faixas | 24649 | 0 | 0 | — | [IBGE CNEFE Censo 2022 microdata by UF](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF) |
| ANTAQ port installations | 2026-06-23 | 1094 portos | 0 | 0 | 0 | — | [ANTAQ — Instalações Portuárias Outorgadas (Portos.xlsx)](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| PNCP domain reference tables | 2026-06-23 | 19 modalidades / 183 amparos-legais / 6 modos-disputa / 5 tipos-instrumentos-convocatorios / 12 tipos-contrato / 9 criterios-julgamento / 1 tipos-instrumentos-cobranca / 6 fontes-orcamentarias | 0 | 0 | 0 | — | [PNCP Cadastro API — static domain tables (Lei 14.133 ecosystem)](https://pncp.gov.br/api/pncp/v1/modalidades) |
| Portal da Transparência endpoint registry | 2026-06-23 | 8 endpoints / 7 queryAdapter | 0 | 0 | 0 | — | [CGU Portal da Transparência — Swagger audit (query endpoints; no bulk embed in v1)](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) |

## Source health

All official endpoints responded successfully. No embedded-data retention warnings.

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
  "datasetsVerificados": 20,
  "datasetsAlterados": 11,
  "totalAdicionados": 42321,
  "totalRemovidos": 0,
  "totalAlterados": 0,
  "sourceAlerts": 0,
  "criticalAlerts": 0
}
```

