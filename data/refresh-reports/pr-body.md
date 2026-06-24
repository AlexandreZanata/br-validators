## Daily data refresh — 2026-06-24

| Dataset | Records | + added | − removed | ~ changed | Fields Δ | Captured | Source |
|---------|---------|---------|-----------|-----------|----------|----------|--------|
| ibge | 27 estados / 5571 municipios | 0 | 0 | 0 | — | 2026-06-24 | [official](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| bancos | 468 bancos | 0 | 0 | 0 | — | 2026-06-23 | [official](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| aeroportos | 533 aeroportos / 87 comIata | 0 | 0 | 0 | — | 2026-06-23 | [official](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) |
| tse-municipios | 5571 municipios | 0 | 0 | 0 | — | 2026-06-23 | [official](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) |
| moedas | 154 moedas | 154 | 0 | 0 | — | 2026-06-23 | [official](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) |
| paises-bacen | 252 paises | 252 | 0 | 0 | — | 2026-06-23 | [official](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=) |
| incoterms | 11 incoterms | 11 | 0 | 0 | — | 2026-06-23 | [official](https://iccwbo.org/resources-for-business/incoterms-rules/) |
| telefone-ddd | 67 ddds | 0 | 0 | 0 | — | 2026-06-23 | [official](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| feriados | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | — | 2026-06-23 | [official](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| cnaes | 1332 cnaes | 1332 | 0 | 0 | — | 2026-06-23 | [official](https://servicodados.ibge.gov.br/api/v2/cnae/subclasses) |
| cfop | 689 cfop | 689 | 0 | 0 | — | 2026-06-23 | [official](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| natureza-juridica | 90 naturezas | 90 | 0 | 0 | — | 2026-06-23 | [official](https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip) |
| nbs | 917 nbs | 917 | 0 | 0 | — | 2026-06-23 | [official](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx) |
| cest | 1018 cest | 1018 | 0 | 0 | — | 2026-06-23 | [official](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) |
| ncm | 10515 ncm | 10515 | 0 | 0 | — | 2026-06-23 | [official](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| cbo | 2694 cbo | 2694 | 0 | 0 | — | 2026-06-23 | [official](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| cep-faixas | 24649 faixas | 24649 | 0 | 0 | — | 2026-06-23 | [official](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF) |
| portos | 1094 portos | 0 | 0 | 0 | — | 2026-06-23 | [official](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) |
| pncp-reference | 19 modalidades / 183 amparos-legais / 6 modos-disputa / 5 tipos-instrumentos-convocatorios / 12 tipos-contrato / 9 criterios-julgamento / 1 tipos-instrumentos-cobranca / 6 fontes-orcamentarias | 0 | 0 | 0 | — | 2026-06-23 | [official](https://pncp.gov.br/api/pncp/v1/modalidades) |
| transparencia-snapshots | 8 endpoints / 7 queryAdapter | 0 | 0 | 0 | — | 2026-06-23 | [official](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) |

**Totals:** +42321 −0 ~0

### Source health

All official endpoints responded successfully.

### Verification

- [ ] `pnpm verify` passed
- [ ] All endpoints are official government domains
- [ ] No unresolved critical alerts (or documented in PR if retention is expected)
