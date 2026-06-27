# Official sources by data type

> **Rule:** No validator ships without a row in this table and at least one test vector from the cited source.
> **Reference data freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) (auto-generated weekly by `data-refresh-bot.yml`).
> Last reviewed: June 2026.

---

## Summary table

| Data type | Agency | Official source | Notes |
|-----------|--------|-----------------|-------|
| **CPF** | Receita Federal | [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) | 11 digits, mask `XXX.XXX.XXX-DD`. Modulo 11 weights `10…2` / `11…2`. Golden vectors: **`12345678909`** (UC-001), **`11144477735`** (cross-check). **Alphanumeric CPF planned for 2026 — no official spec yet.** |
| **CNPJ (numeric, current)** | Receita Federal | [CNPJ alfanumérico — Perguntas e Respostas (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) | Traditional modulo 11, 14 digits. Still valid alongside alphanumeric. |
| **CNPJ (alphanumeric, NEW)** | RFB — **IN RFB nº 2.229/2024** | [RFB CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) + [SERPRO DV PDF](https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf) | Q14 golden vector: **`12ABC34501DE35`**. ASCII−48, weights per Q14. **VARCHAR(14).** Homologation: [Simulador Nacional CNPJ](https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular) (Q47). Letters: accept A–Z (Q45). |
| **License plate (Mercosul)** | CONTRAN / DENATRAN | [Resolução CONTRAN 729/2018 (consolidada)](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf), [Anexo I — Resolução 969/2022](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf) | Format `LLLNLNN` (7 alphanumeric). Legacy `LLLNNNN` still valid — lib must accept both + converter. |
| **CEP** | Correios | [Manual API Busca CEP](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) | 8 digits, mask `XXXXX-XXX`. **No check digit.** Golden vectors: **`01310100`** (TECH-STACK), **`20040020`** (cross-check). Format/mask only in core; HTTP lookup in `@br-validators/adapters-correios` (planned). |
| **Telefone** | Anatel | [Plano de Numeração Brasileiro](https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro) · [Painel Códigos Nacionais](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) · [Nono dígito](https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito) | 67 DDDs; fixo 8-digit (starts 2–5); celular 9-digit (starts with 9). Golden: **`11999999999`**, **`1133333333`**. |
| **CNH (Registro Nacional)** | CONTRAN / SENATRAN | [Resolução CONTRAN 511/2014 (PDF)](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf) · [Validar CNH — gov.br](https://www.gov.br/pt-br/servicos/validar-cnh) · Full index: [§ CNH](#cnh--reference-index) | 9 base + 2 DVs = **11 contiguous digits**. Modulo 11 + **desconto**. Golden: **`62472927637`**. |
| **RENAVAM** | DENATRAN / SENATRAN | [Portaria DENATRAN 27/2013 (PDF)](https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf) · [Consultar veículo RENAVAM — gov.br](https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam) · Full index: [§ RENAVAM](#renavam--reference-index) | 10 base + 1 DV = **11 digits**. Modulo 11 **peso 9**. Golden: **`63977791104`**, **`72176426415`**. |
| **Título de Eleitor** | TSE | [Resolução TSE 20.132/1998](https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998) · [Res. 23.659/2021](https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-659-de-26-de-outubro-de-2021) · Full index: [§ Título de Eleitor](#título-de-eleitor--reference-index) | 8 seq + 2 UF + 2 DV = **12 digits** (13 for SP/MG). Modulo 11 per Art. 10. Golden: **`004356870906`**. **Weights/SP-MG rule:** [Wikipedia PT](https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador) + [Ghiorzi](http://ghiorzi.org/DVnew.htm#e). |
| **Processo judicial (número único CNJ)** | CNJ | [Resolução 65/2008](https://atos.cnj.jus.br/atos/detalhar/119) · [Anexo VIII (PDF)](https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf) · Full index: [§ Processo judicial](#processo-judicial--reference-index) | **20 digits** — mask `NNNNNNN-DD.AAAA.J.TR.OOOO`. Modulo **97-10** (ISO 7064:2003). Golden: **`0000100-34.2008.9.21.0000`**. Vector: `processo-judicial.official.json`. |
| **RG (Registro Geral)** | Per-state SSP/IGP | Full table: [§ RG](#rg--reference-index) | **UF required** — no federal algorithm. **27/27 UFs** shipped. SP/RJ/MG: Ghiorzi DV tables; others: format-only (DV unpublished by state issuers); SC: format-only + mask. Vectors: `rg.<uf>.official.json` for all UFs. |
| **NF-e chave de acesso** | ENCAT / SEFAZ | [Portal NF-e — MOC index](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D) · Full index: [§ NF-e chave](#nf-e--nfc-e-chave-de-acesso--reference-index) | **44 digits** — structure + modulo-11 DV on first 43. Models **55** (NF-e) / **65** (NFC-e). Golden: **`52060433009911002506550120000007800267301615`** (MOC §2.2.6.2 worked example, sum=644, DV=5). |
| **NF-e cUF** | SEFAZ / NF-e | [Manual NF-e — Tabela de UF](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Il8k4BIjb48=) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · Full index: [§ NF-e cUF](#nfe-cuf) | 27 federative unit codes for NF-e field `cUF`. Golden: **`35`** (SP), **`53`** (DF). Vector: `nfe-cuf.official.json`. IBGE UF cross-ref embedded. Manual refresh. |
| **PIX key** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf), [Anexo I — Padrões Iniciação PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf), [DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) | **Key validation (Phase 4):** five types — CPF, CNPJ, email (max 77 lowercase), phone (`+55` mobile), EVP (UUID). Golden: `pix@bcb.gov.br`, `+5510998765432`, `123e4567-e89b-12d3-a456-426655440000`. |
| **BR Code payload** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Manual de Padrões PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) | EMV TLV + CRC16-CCITT (tag 63). `parseBrCode` / `validateBrCode` / `buildStaticPixBrCode` (static PIX QR; omit `amount` for permanent QR). Golden: `tests/vectors/brcode.official.json` (≥5 manual examples + `BRCODE_GOLDEN_STATIC_*`). Static EVP CRC `1D3D`. Rule: BR-BRC-005. |
| **Boleto (cobrança)** | FEBRABAN | [Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) | Bank boleto: 47-digit linha digitável (modulo 10 field DVs) + 44-digit código de barras (modulo 11 general DV). **Situação 1** (v1): currency `9`, fator+valor campo 5. **Situação 2** (5b): code `988`, currency `0`, ISPB campo 5. Golden: Santander linha ↔ barcode; synthetic Situação 2 pair in `boleto.situacao2.official.json`. |
| **Boleto (arrecadação)** | FEBRABAN | [Layout Padrão de Arrecadação/Recebimento v7 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%207%20-%2001_03_2023_mn.pdf) | 48-digit linha (4×11 + field DVs) or 44-digit código de barras; product id `8`; value types `6`/`7` (modulo 10) or `8`/`9` (modulo 11). Golden: `tests/vectors/boleto-arrecadacao.official.json` (Layout v7 §07 modulo 10 walkthrough, §09–10 modulo 11). |
| **Credit card** | ISO/IEC 7812 | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) | PAN 8–19 digits; Luhn modulus-10 per **Annex B**. Golden: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, walkthrough `79927398713`. Brand detect (Elo/Hipercard IIN) — best-effort, non-authoritative. No CVV/expiry/authorization. |
| **PIS / PASEP / NIS** | Dataprev / INSS (CNIS) | [SIPREV Regras de Validação v1.14 — RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) | 11 digits, mask `XXX.XXXXX.XX-X`. Modulo 11 per **padrão do NIT**; weights `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits. Golden: **`10027230888`** (UC-006). Checksum-only — no issuer metadata. |
| **CNIS / NIT** | INSS / Caixa (CNIS) | [SIPREV RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) · [INSS NIT enrollment](https://www.gov.br/pt-br/servicos/obter-numero-de-inscricao-no-inss-nit) | Same RV_03 checksum as PIS/PASEP; `@br-validators/core/cnis` adds `issuer: inss \| caixa` + `tipo` metadata. Golden: **`01234567897`** (INSS NIT), **`10027230888`** (Caixa PIS cross-check). Vector: `cnis.official.json`. Issuer inference is heuristic — not a CNIS lookup. |
| **IE — São Paulo (SP)** | SEFAZ-SP | [Sintegra rotina de consistência](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | 12 digits, dual modulo-11 DVs. Golden: **`110042490114`**. Vector: `ie.sp.official.json`. Mirror: [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html). |
| **IE — SP produtor rural** | SEFAZ-SP / SINTEGRA | [cad_SP.html Bloco II](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) | 13 chars `P0MMMSSSSD000`; DV at position 10; weights `1,3,4,5,6,7,8,10` on `0MMMSSSS`. Golden: **`P-01100424.3/002`**. Vector: `inscricao-estadual-produtor-rural.official.json`. Cadastro: [CADESP produtor rural](https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Produtor-Rural-abertura,-baixa-e-outras-alteracoes.aspx). |
| **IE — all 27 UFs** | Per-state SEFAZ | Full table: [§ Inscrição Estadual (IE)](#inscrição-estadual-ie--all-27-ufs) · Index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md) | Check digits only — no SEFAZ registration lookup. `getIeOfficialSourceUrl(uf)` / `IE_OFFICIAL_SOURCE_URLS`. SP produtor rural: `validateIeProdutorRural` / `getIeProdutorRuralOfficialSourceUrl()`. |
| **IBGE localities** | IBGE | [Serviço de Dados — localidades](https://servicodados.ibge.gov.br/api/docs/localidades) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Estados + municípios embedded offline. Golden: **`3550308`** (São Paulo/SP), **`5107925`** (Sorriso/MT), **`5300108`** (Brasília/DF), **`5101837`** (Boa Esperança do Norte/MT — null `microrregiao` fallback). Vector: `ibge.official.json`. **cMunFG** helpers (`toCmunFg`, `parseCmunFg`) — vector: `ibge.cmunfg.official.json`. Weekly refresh via `data-refresh-bot.yml`. |
| **CNAE** | IBGE CONCLA | [IBGE CNAE API v2](https://servicodados.ibge.gov.br/api/docs/cnae) · [RFB Cnaes.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Economic activity subclasses (CNAE 2.3). Primary embed from IBGE API; RFB `Cnaes.zip` complementary parity. Golden: **`6201501`** (software development). Vector: `cnaes.official.json`. |
| **CNPJ motivos** | RFB CNPJ | [Dados Abertos CNPJ — Motivos.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Motivos de situação cadastral (estabelecimentos layout). Golden: **`01`** (extinção voluntária), **`02`** (incorporação). Vector: `cnpj-motivos.official.json`. No empresa/sócio embed. Monthly refresh. |
| **CFOP** | CONFAZ | [CFOP SINIEF vigente](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Fiscal operation codes. Golden: **`1102`** (purchase for resale), **`5102`** (third-party sale). Vector: `cfop.official.json`. |
| **Natureza jurídica** | RFB CNPJ | [Dados Abertos CNPJ — Naturezas.zip](https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | CNPJ legal nature codes. Golden: **`2062`** (Ltda.). Vector: `natureza-juridica.official.json`. Dev fallback mirror documented in `fetch-natureza-juridica.ts`. |
| **NBS** | NFSe Nacional | [Anexo B NBS2 xlsx](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Brazilian Services Nomenclature leaf codes. Golden: **`1.1502.50.00`** (TI systems integration). Vector: `nbs.official.json`. Parsed from xlsx without extra deps. |
| **CEST** | CONFAZ | [Convênio ICMS 142/2018](https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | ST specifier codes (7 digits) linked to NCM prefixes. Golden: **`0302100`** (returnable beer bottle); NCM **`22030000`** cross-ref. Vector: `cest.official.json`. |
| **CST** | RFB SPED | [SPED Fiscal — Tabelas de Situação Tributária](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | NF-e CST codes for ICMS, IPI, PIS, COFINS. Golden: ICMS **`00`** / **`10`**, IPI **`50`** / **`00`**, PIS **`01`** / **`07`**, COFINS **`01`** / **`07`**. Vector: `cst.official.json`. Manual refresh (`agendamento: manual`). |
| **CSOSN** | CONFAZ SINIEF | [Ajuste SINIEF 03/10](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Simples Nacional CSOSN (10 codes). Golden: **`101`**, **`102`**, **`201`**, **`500`**. Vector: `csosn.official.json`. Manual refresh. |
| **LC 116** | Planalto / NFSe | [LC 116/2003 — Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) · [NFSe LC 116 list](https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | ISS national service list (~200 items). Golden: **`1.01`** (análise e desenvolvimento de sistemas), **`7.02`** (obras de construção civil). Vector: `lc116.official.json`. Municipal ISS **rates**: partial embed `@br-validators/core/iss-municipal` (500 cities). Manual refresh. |
| **eSocial** | eSocial / MTE | [eSocial S-1.3 Tabelas](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Tabela 01 worker categories (~47) + Tabela 03 payroll rubricas (~208). Golden categorias: **`101`**, **`103`**, **`901`**. Golden rubricas: **`1000`** (salário), **`5001`** (13º), **`1016`** (férias), **`9908`** (FGTS). Vectors: `esocial.official.json`, `esocial-rubricas.official.json`. Manual refresh. Leave types (Tabela 18) deferred v2. |
| **Simples Nacional** | Planalto / RFB | [LC 123/2006 — Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm) · [Receita Anexo I](http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=48430) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Anexos I–V rate tables (6 faixas each, LC 155/2016). Golden: Anexo **`I`** RBT12 **`700000`** (alíquota efetiva **7,52%**), Anexo **`III`** faixa 1, Anexo **`V`** RBT12 **`200000`**. Vector: `simples-nacional.official.json`. CNAE→anexo mapping deferred. Manual refresh. |
| **IRPF (tabela progressiva mensal)** | RFB | [Tabelas IRPF](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas) · [Tabela progressiva mensal](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/tabela-progressiva-mensal) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · Full index: [§ IRPF](#irpf) | Monthly withholding brackets (5 faixas). Golden: base **`3000`** → imposto **`68.56`**; **`2826.65`** → **`42.56`**; **`5000`** → **`479`**. Vector: `irpf.official.json`. Annual declaration / 13º IRRF deferred. Manual refresh (`agendamento: manual`). |
| **INSS (contribuição empregado)** | MPS/MF / INSS | [Portaria MPS/MF nº 6/2025](https://www.in.gov.br/web/dou/-/portaria-interministerial-mps/mf-n-6-de-10-de-janeiro-de-2025-606526848) · [INSS alíquotas 2025](https://www.gov.br/inss/pt-br/noticias/confira-como-ficaram-as-aliquotas-de-contribuicao-ao-inss) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · Full index: [§ INSS](#inss) | Employee progressive brackets (4 faixas, teto **`8157.41`**). Golden: **`1518`** → **`113.85`**; **`3000`** → **`253.41`**; **`8157.41`** → **`951.63`**. Vector: `inss.official.json`. RPPS / MEI deferred. Manual refresh (`agendamento: manual`). |
| **NCM** | Receita / Siscomex | [NCM JSON download](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Mercosur nomenclature leaf codes (8 digits). Golden: **`01012100`** (purebred horses). Vector: `ncm.official.json`. **IBPT** approximate burden: `@br-validators/core/ibpt`. |
| **IBPT carga tributária** | IBPT | [De Olho no Imposto](https://deolhonoimposto.ibpt.org.br/) · [Lei 12.741/2012](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Approximate federal + state + municipal burden per NCM×UF (golden subset embed). Golden: **`01012100`/SP** total **31,45%** nacional. Vector: `ibpt.official.json`. Full matrix out of scope. |
| **CBO** | MTE | [CBO 2002 downloads](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Occupation codes (eSocial / HR). Golden: **`212405`** (systems analyst). Vector: `cbo.official.json`. |
| **CEP prefix lookup** | IBGE CNEFE | [CNEFE Censo 2022 UF CSV](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF/) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | 5-digit prefix → UF + IBGE municipality. Golden: **`01310`** (São Paulo/SP), **`20040`** (Rio/RJ). Extends `@br-validators/core/cep`. Vector: `cep-faixa.official.json`. |
| **Aeroportos (ANAC)** | ANAC | [Lista aeródromos públicos CSV](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Public aerodromos (ICAO/OACI + IATA where assigned). Golden: **`GRU`/`SBGR`**, **`GIG`/`SBGL`**, **`BSB`/`SBBR`**, **`SSA`/`SBSV`**, **`CGB`/`SBCY`**. Vector: `aeroportos.official.json`. IATA enrichment from ICAO standard assignment (supplemental to ANAC). |
| **TSE ↔ IBGE municipios** | TSE | [municipio_tse_ibge.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip) · [Portal dados abertos](https://dadosabertos.tse.jus.br/dataset/codigos-oficiais-de-uf-e-municipios-segundo-o-tse-e-o-ibge) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Electoral municipality codes cross-walk to IBGE `codigo`. Golden: TSE **`71072`** → IBGE **`3550308`** (São Paulo/SP). Vector: `tse-municipios.official.json`. Lookup-only — does not change `titulo-eleitor` validation. |
| **Moedas (ISO 4217 + Bacen)** | ISO / Bacen | [Bacen PTAX Moedas API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | ISO 4217 embedded baseline merged with Bacen PTAX `tipoMoeda` (A/B). Golden: **`BRL`**, **`USD`**, **`EUR`**. Vector: `moedas.official.json`. |
| **PTAX cotações** | Bacen | [Bacen Olinda PTAX API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Fechamento PTAX for Bacen tipo A/B currencies (~10). Rolling **5 business days** embedded. Golden: USD último dia útil **`2026-06-25`**, EUR último dia útil. Vector: `ptax.official.json`. **`isStale` / `dataReferencia` / `warning`** on lookup hits. Pairs with `@br-validators/core/moedas`. Daily refresh. |
| **SELIC meta (SGS 432)** | Bacen | [SGS série 432](https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · Full index: [§ SELIC](#selic-meta-sgs-432) | Copom target rate (% a.a.). Rolling **90 calendar days** embedded. Golden: **`2026-06-26`** → **`14.25`**; COPOM **`2026-06-18`**. Vector: `selic.official.json`. **`isStale` / `dataReferencia` / `warning`**. Pairs with `@br-validators/core/ptax`. Daily refresh. |
| **Países Bacen (NF-e)** | RFB / Bacen | [NF-e Diversos — Tabela de Países](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/NJarYc9nus=) · [Bacen FTP paises.txt](https://www.bcb.gov.br/ftp/paises.txt) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | 4-digit Bacen country codes for NF-e `cPais`. Golden: **`1058`** → Brasil. Vector: `paises-bacen.official.json`. Fetch chain: NF-e ODS (NT 2018.003 v1.01) → Bacen FTP merge → embedded fallback. |
| **Incoterms 2020** | ICC | [Incoterms rules](https://iccwbo.org/resources-for-business/incoterms-rules/) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Static ICC 2020 list (11 terms, code + name only). Golden: **`FOB`**. Vector: `incoterms.official.json`. |
| **Portos (ANTAQ)** | ANTAQ | [Instalações portuárias shape/xlsx zip](https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Outorged port installations (`Portos.xlsx`). Golden: **`BRSSZ`** (Santos), **`BRADR`**, **`BRPNG`**. Vector: `portos.official.json`. IBGE municipality cross-ref via `idcidade`. |
| **ANP combustíveis (LPC)** | ANP | [Levantamento semanal LPC](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Weekly municipal fuel averages (`resumo_semanal_lpc` MUNICIPIOS sheet). Golden: **São Paulo/SP `GASOLINE_REGULAR`**, **Adamantina/SP `ETHANOL`**, **Campo Grande/MS `LPG_P13`**. Vector: `anp-combustiveis.official.json`. Product normalization ported from [TABELA-ANP-COMBUSTIVEIS](https://github.com/AlexandreZanata/TABELA-ANP-COMBUSTIVEIS) (MIT). |
| **PNCP reference** | PNCP / Serpro | [Cadastro API domain tables](https://pncp.gov.br/api/pncp/v1/modalidades) · [OpenAPI](https://pncp.gov.br/api/pncp/v3/api-docs) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Static procurement domain tables (modalidades, amparos legais, etc.). Golden: modalidade **`6`** (Pregão Eletrônico). Vector: `pncp-reference.official.json`. Live contract lookup → `@br-validators/adapters-pncp` (RFC). |
| **Portal da Transparência registry** | CGU | [Swagger UI](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) · [OpenAPI](https://api.portaldatransparencia.gov.br/v3/api-docs) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Endpoint classification embed (query-adapter vs out-of-scope). Golden: **`ceis`**, **`peps`**. Vector: `transparencia.official.json`. No live API in core — `@br-validators/adapters-transparencia` (RFC). |

---

## Inscrição Estadual (IE) — all 27 UFs

> **Rule:** Each UF cites a **primary SEFAZ URL** + **SINTEGRA mirror** (`cad_XX.html`) for algorithm cross-check.  
> **Vectors:** `packages/br-validators/tests/vectors/ie.{uf}.official.json`  
> **API:** `getIeOfficialSourceUrl(uf)` · constant map `IE_OFFICIAL_SOURCE_URLS`  
> **National index (discontinued):** [SINTEGRA insc_est.html](http://www.sintegra.gov.br/insc_est.html)

| UF | Agency | Primary source | SINTEGRA mirror | Golden (stripped) | Vector |
|----|--------|----------------|-----------------|-------------------|--------|
| **AC** | SEFAZ-AC | [sefaz.ac.gov.br](https://sefaz.ac.gov.br/) | [cad_AC.html](http://www.sintegra.gov.br/Cad_Estados/cad_AC.html) | `0113253877910` | `ie.ac.official.json` |
| **AL** | SEFAZ-AL | [Cálculo DV](https://www.sefaz.al.gov.br/calculo) | [cad_AL.html](http://www.sintegra.gov.br/Cad_Estados/cad_AL.html) | `248682954` | `ie.al.official.json` |
| **AM** | SEFAZ-AM | [sefaz.am.gov.br](https://www.sefaz.am.gov.br/) | [cad_AM.html](http://www.sintegra.gov.br/Cad_Estados/cad_AM.html) | `917050150` | `ie.am.official.json` |
| **AP** | SEFAZ-AP | [sefaz.ap.gov.br](https://www.sefaz.ap.gov.br/) | [cad_AP.html](http://www.sintegra.gov.br/Cad_Estados/cad_AP.html) | `039045820` | `ie.ap.official.json` |
| **BA** | SEFAZ-BA | [Cálculo DV](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) | [cad_BA.html](http://www.sintegra.gov.br/Cad_Estados/cad_BA.html) | `63984300` | `ie.ba.official.json` |
| **CE** | SEFAZ-CE | [sefaz.ce.gov.br](https://www.sefaz.ce.gov.br/) | [cad_CE.html](http://www.sintegra.gov.br/Cad_Estados/cad_CE.html) | `836182316` | `ie.ce.official.json` |
| **DF** | Receita DF | [receita.fazenda.df.gov.br](https://www.receita.fazenda.df.gov.br/) | [cad_DF.html](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) | `0730000100109` | `ie.df.official.json` |
| **ES** | SEFAZ-ES | [sitenet.es.gov.br/sefaz](https://sitenet.es.gov.br/sefaz/) | [cad_ES.html](http://www.sintegra.gov.br/Cad_Estados/cad_ES.html) | `463921810` | `ie.es.official.json` |
| **GO** | SEFAZ-GO | [CCE-GO](http://www.sefaz.go.gov.br/ServicosAFA/ece.html) | [cad_GO.html](http://www.sintegra.gov.br/Cad_Estados/cad_GO.html) | `112237118` | `ie.go.official.json` |
| **MA** | SEFAZ-MA | [sefaz.ma.gov.br](https://www.sefaz.ma.gov.br/) | [cad_MA.html](http://www.sintegra.gov.br/Cad_Estados/cad_MA.html) | `123517680` | `ie.ma.official.json` |
| **MG** | SEF/MG | [Consulta cadastro](https://www.fazenda.mg.gov.br/empresas/Cadastro/cadastro/consultapublica.html) | [cad_MG.html](http://www.sintegra.gov.br/Cad_Estados/cad_MG.html) | `2490944173923` | `ie.mg.official.json` |
| **MS** | SEFAZ-MS | [sefaz.ms.gov.br](https://www.sefaz.ms.gov.br/) | [cad_MS.html](http://www.sintegra.gov.br/Cad_Estados/cad_MS.html) | `282570926` | `ie.ms.official.json` |
| **MT** | SEFAZ-MT | [Portaria Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) | [cad_MT.html](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html) | `130000019` / `00130000019` | `ie.mt.official.json` |
| **PA** | SEFA-PA | [sefa.pa.gov.br](https://www.sefa.pa.gov.br/) | [cad_PA.html](http://www.sintegra.gov.br/Cad_Estados/cad_PA.html) | `153662476` | `ie.pa.official.json` |
| **PB** | Receita PB | [receita.pb.gov.br](https://www.receita.pb.gov.br/) | [cad_PB.html](http://www.sintegra.gov.br/Cad_Estados/cad_PB.html) | `312029063` | `ie.pb.official.json` |
| **PE** | SEFAZ-PE | [sefaz.pe.gov.br](https://www.sefaz.pe.gov.br/) | [cad_PE.html](http://www.sintegra.gov.br/Cad_Estados/cad_PE.html) | `064970639` | `ie.pe.official.json` |
| **PI** | SEFAZ-PI | [sefaz.pi.gov.br](https://www.sefaz.pi.gov.br/) | [cad_PI.html](http://www.sintegra.gov.br/Cad_Estados/cad_PI.html) | `465180426` | `ie.pi.official.json` |
| **PR** | Fazenda PR | [Cálculo DV](https://www.fazenda.pr.gov.br/Pagina/calculo-digito-verificador) | [cad_PR.html](http://www.sintegra.gov.br/Cad_Estados/cad_PR.html) | `0031595584` | `ie.pr.official.json` |
| **RJ** | Fazenda RJ | [Portal cadastro](https://portal.fazenda.rj.gov.br/cadastro/) | [cad_RJ.html](http://www.sintegra.gov.br/Cad_Estados/cad_RJ.html) | `06540481` | `ie.rj.official.json` |
| **RN** | SET-RN | [set.rn.gov.br](https://www.set.rn.gov.br/) | [cad_RN.html](http://www.sintegra.gov.br/Cad_Estados/cad_RN.html) | `204502292` | `ie.rn.official.json` |
| **RO** | SEFIN-RO | [sefin.ro.gov.br](https://www.sefin.ro.gov.br/) | [cad_RO.html](http://www.sintegra.gov.br/Cad_Estados/cad_RO.html) | `39206839474860` | `ie.ro.official.json` |
| **RR** | SEFAZ-RR | [sefaz.rr.gov.br](https://www.sefaz.rr.gov.br/) | [cad_RR.html](http://www.sintegra.gov.br/Cad_Estados/cad_RR.html) | `247681047` | `ie.rr.official.json` |
| **RS** | SEFAZ-RS | [sefaz.rs.gov.br](https://www.sefaz.rs.gov.br/) | [cad_RS.html](http://www.sintegra.gov.br/Cad_Estados/cad_RS.html) | `3288345503` | `ie.rs.official.json` |
| **SC** | SAT/SEF-SC | [sat.sef.sc.gov.br](https://sat.sef.sc.gov.br/) | [cad_SC.html](http://www.sintegra.gov.br/Cad_Estados/cad_SC.html) | `632480718` | `ie.sc.official.json` |
| **SE** | SEFAZ-SE | [sefaz.se.gov.br](https://www.sefaz.se.gov.br/) | [cad_SE.html](http://www.sintegra.gov.br/Cad_Estados/cad_SE.html) | `826594042` | `ie.se.official.json` |
| **SP** | SEFAZ-SP | [Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) | `110042490114` | `ie.sp.official.json` |
| **TO** | SEFAZ-TO | [sefaz.to.gov.br](https://www.sefaz.to.gov.br/) | [cad_TO.html](http://www.sintegra.gov.br/Cad_Estados/cad_TO.html) | `27035910938` | `ie.to.official.json` |

Negative cross-UF cases: `ie.negative.official.json`.

---

## CNH — reference index

> **Vectors:** `packages/br-validators/tests/vectors/cnh.official.json`  
> **Caveat:** CONTRAN 511/2014 defines structure (9 base + 2 DVs) but not the step-by-step DV formula. Algorithm sources below are **cross-checks**, not normative acts.

| Role | Source | URL |
|------|--------|-----|
| **Normative** | CONTRAN Resolução 511/2014 | https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf |
| **Normative** | CONTRAN Resolução 886/2021 | https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao8862021.pdf |
| **System** | SENATRAN — Validar CNH (gov.br) | https://www.gov.br/pt-br/servicos/validar-cnh |
| **Algorithm cross-check** | AdvPL — Validação de CNH | https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-cnh/ |
| **Implementation cross-check** | GeraValida — Validador de CNH | https://www.geravalida.com.br/validador-cnh |
| **Implementation cross-check** | GeradorBR — Validador de CNH | https://geradorbr.com/validador-de-cnh/ |

---

## RENAVAM — reference index

> **Vectors:** `packages/br-validators/tests/vectors/renavam.official.json`  
> **Caveat:** Portaria DENATRAN 27/2013 defines structure and “módulo 11, peso 9” but not the step-by-step DV formula. Algorithm sources below are **cross-checks**, not normative acts.

| Role | Source | URL |
|------|--------|-----|
| **Normative** | Portaria DENATRAN 27/2013 | https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf |
| **System** | SENATRAN — Consultar veículo na base RENAVAM | https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam |
| **Algorithm cross-check** | AdvPL — Validação de RENAVAM | https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/ |
| **Implementation cross-check** | GeraValida — Gerador de RENAVAM | https://www.geravalida.com.br/gerador-de-renavam |
| **Implementation cross-check** | GeradorFácil — Gerador de RENAVAM | https://geradorfacil.com/geradores/renavam |

---

## Título de Eleitor — reference index

> **Vectors:** `packages/br-validators/tests/vectors/titulo-eleitor.official.json`  
> **Caveat:** Resolução TSE 20.132/1998 (Art. 10) defines structure and modulo 11 but **not** exact weights or the SP/MG remainder-zero rule. Those come from algorithm cross-checks below.

| Role | Source | URL |
|------|--------|-----|
| **Normative** | Resolução TSE 20.132/1998 — Art. 10 | https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998 |
| **Normative** | Resolução TSE 23.659/2021 — Cadastro Eleitoral | https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-659-de-26-de-outubro-de-2021 |
| **Algorithm weights** | Wikipedia PT — Cálculo do DV | https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador |
| **Algorithm cross-check** | Ghiorzi — DV Título Eleitoral | http://ghiorzi.org/DVnew.htm#e |
| **Institutional** | TSE — Portal | https://www.tse.jus.br/ |
| **System** | TSE — e-Título | https://www.tse.jus.br/eleitor/servicos/aplicativo-e-titulo |

### Normative vs. algorithm detail

| Aspect | Res. 20.132/1998 | Implementation source |
|--------|------------------|------------------------|
| 12 digits (up to) | ✅ Art. 10 | `TITULO_ELEITOR_LENGTH` |
| 8 seq + 2 UF + 2 DV | ✅ Art. 10 | `parseTituloEleitorParts` |
| Modulo 11 | ✅ Art. 10 | `check-digits.ts` |
| DV1 on sequential | ✅ Art. 10 | `computeTituloEleitorFirstCheckDigit` |
| DV2 on UF + DV1 | ✅ Art. 10 | `computeTituloEleitorSecondCheckDigit` |
| Weights `[2…9]` / `[7,8,9]` | ❌ Not in text | Wikipedia PT + Ghiorzi |
| SP/MG remainder 0 → DV=1 | ❌ Not in text | Wikipedia PT + Ghiorzi |
| UF code table 01–28 | ❌ Referenced, not reproduced | Wikipedia PT + Ghiorzi |

---

## RG — reference index

> **Vectors:** `packages/br-validators/tests/vectors/rg.<uf>.official.json` (all 27 UFs)  
> **Caveat:** No single federal RG algorithm — each state issues its own format. `validateRg(raw, { uf })` requires UF; `detect()` does **not** auto-classify RG (too ambiguous without UF). **27/27 UFs shipped** — format-only rules cite state issuers where DV is unpublished; SP/RJ/MG use Ghiorzi walkthroughs.  
> **Source rules** (same as [CONTRIBUTING-UF.md](../packages/br-validators/src/core/rg/CONTRIBUTING-UF.md)): cite an **official SSP/IGP walkthrough** — **not** SEFAZ-IE calculators (those validate Inscrição Estadual, not RG). Ghiorzi documents RG DV only for **SP, RJ, MG**; other states need state-specific sources; **most UFs have no consistent official legacy RG/DV doc**. Contributor workflow: [RG-CONTRIBUTOR-GUIDE.md](community/RG-CONTRIBUTOR-GUIDE.md).

| UF | Coverage | Algorithm | Official / reference source | Golden vector |
|----|----------|-----------|----------------------------|---------------|
| **SP** | ✅ Shipped | Modulo 11 remainder (weights 9–2); DV `X` when remainder=10 | [Ghiorzi — SSP-SP](http://ghiorzi.org/DVnew.htm) | `120300011` / `12.030.001-1` |
| **RJ** | ✅ Shipped | Modulo 10 alternating 2,1 + noves fora | [Ghiorzi — IFP-RJ](http://ghiorzi.org/DVnew.htm) | `27998111` / `2.799.811-1` |
| **MG** | ✅ Shipped | Same as RJ; optional `M` prefix | [Ghiorzi — MaSP-MG](http://ghiorzi.org/DVnew.htm) | `27998111` / `M27998111` |
| **PR** | ✅ Shipped | Format-only (8 digits) | [IIPAR](https://www.iipar.pr.gov.br/) | `12345678` |
| **RS** | ✅ Shipped | Format-only (10 digits) | [IGP-RS](https://www.estado.rs.gov.br/) | `1234567890` |
| **SC** | ✅ Shipped | Format-only (9 digits) | [CIASC](https://www.ciasc.sc.gov.br/) | `123456789` |
| **BA** | ✅ Shipped | Format-only (10 digits; legacy IIPM — DV not published by SSP-BA) | [IIPM/DPT](https://www.ba.gov.br/policiatecnica/972/instituto-de-identificacao-pedro-mello-iipm) | `1234567800` |
| **AC** | ✅ Shipped | Format-only (6 digits; legacy SSP-AC — DV not published) | [PCivil AC](https://www.policiacivil.ac.gov.br/) | `123456` |
| **AL** | ✅ Shipped | Format-only (7 digits; legacy IIEAL/POLCAL — DV not published; not SEFAZ-AL IE) | [Alagoas Digital — CIN](https://alagoasdigital.al.gov.br/servico/8) | `1234567` |
| **AM** | ✅ Shipped | Format-only (9 digits; legacy IIACM/SSP-AM — DV not published) | [SSP-AM — IIACM](https://www.ssp.am.gov.br/instituto-de-identificacao-tira-duvidas-sobre-emissao-de-documentos/) | `123456789` |
| **AP** | ✅ Shipped | Format-only (9 digits; legacy PCA/SSP-AP — DV not published) | [AP Digital — PCA CIN](https://apdigital.portal.ap.gov.br/carta-de-servico/solicitacao-de-agendamento-para-emissao-da-1o-via-da-carteira-de-identidade-nacional-cin1) | `123456789` |
| **DF** | ✅ Shipped | Format-only (7 digits; legacy PCDF — DV not published) | [PCDF / Na Hora DF](https://www.nahora.df.gov.br/policia_civil/) | `1234567` |
| **ES** | ✅ Shipped | Format-only (9 digits; legacy PCIES/SESP-ES — DV not published) | [PCIES — FAQ](https://pci.es.gov.br/perguntas-frequentes) | `123456789` |
| **GO** | ✅ Shipped | Format-only (9 digits; legacy PCGO — DV not published) | [PCGO — Identificação](https://identificacao.policiacivil.go.gov.br/1a-via-do-rg-goias/) | `123456789` |
| **MA** | ✅ Shipped | Format-only (9 digits; legacy Ident-MA — DV not published) | [Ident-MA — agendamento RG](https://www.ma.gov.br/servicos/obter-1-via-do-rg-agendamento-on-line) | `123456789` |
| **MS** | ✅ Shipped | Format-only (9 digits; legacy SEJUSP/PCMS — DV not published) | [SEJUSP MS — serviços](https://servicos.sejusp.ms.gov.br/) | `123456789` |
| **MT** | ✅ Shipped | Format-only (9 digits; legacy POLITEC/PCMT — DV not published) | [POLITEC MT](https://www.politec.mt.gov.br/) | `123456789` |
| **PA** | ✅ Shipped | Format-only (9 digits; legacy PC-PA — DV not published) | [PCivil PA](https://www.policiacivil.pa.gov.br/) | `123456789` |
| **PB** | ✅ Shipped | Format-only (9 digits; legacy IPC/PB — DV not published) | [IPC PB — agendamentos](https://agendamentos.pb.gov.br/SAA/ipc/home) | `123456789` |
| **CE** | ✅ Shipped | Format-only (9 digits; legacy IPC-CE — DV not published) | [PCivil CE](https://www.policiacivil.ce.gov.br/) | `123456789` |
| **PE** | ✅ Shipped | Format-only (9 digits; legacy IIP-PE — DV not published) | [PCivil PE](https://www.policiacivil.pe.gov.br/) | `123456789` |
| **PI** | ✅ Shipped | Format-only (9 digits; legacy IIP-PI — DV not published) | [PCivil PI](https://www.policiacivil.pi.gov.br/) | `123456789` |
| **RN** | ✅ Shipped | Format-only (9 digits; legacy IIRN — DV not published) | [PCivil RN](https://www.policiacivil.rn.gov.br/) | `123456789` |
| **RO** | ✅ Shipped | Format-only (9 digits; legacy IIRP/PC-RO — DV not published) | [PCivil RO](https://www.policiacivil.ro.gov.br/) | `123456789` |
| **RR** | ✅ Shipped | Format-only (9 digits; legacy IIR-RR — DV not published) | [PCivil RR](https://www.policiacivil.rr.gov.br/) | `123456789` |
| **SE** | ✅ Shipped | Format-only (9 digits; legacy IIRSE — DV not published) | [PCivil SE](https://www.policiacivil.se.gov.br/) | `123456789` |
| **TO** | ✅ Shipped | Format-only (9 digits; legacy IIR-TO — DV not published) | [PCivil TO](https://www.policiacivil.to.gov.br/) | `123456789` |

`getRgPendingUfs()` returns `[]` when all UFs are shipped · `getRgResearchUrl(uf)` returns official source URL for implemented UFs.

---

## Processo judicial — reference index

> **Vectors:** `packages/br-validators/tests/vectors/processo-judicial.official.json`  
> **Caveat:** Resolução 65/2008 annex examples use illustrative DVs (e.g. `15`) that fail Anexo VIII mod97. Golden vectors use field values from the annex with **computed** DVs.

| Role | Source | URL |
|------|--------|-----|
| **Normative** | Resolução CNJ 65/2008 — Art. 1º (structure) | https://atos.cnj.jus.br/atos/detalhar/119 |
| **Normative** | Anexo VIII — Módulo 97 Base 10 | https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf |

### Segment map

| Field | Digits | Meaning |
|-------|--------|---------|
| NNNNNNN | 7 | Sequential number per origin unit (year) |
| DD | 2 | Check digits (mod97-10) |
| AAAA | 4 | Filing year |
| J | 1 | Justice segment (1–9) |
| TR | 2 | Tribunal code |
| OOOO | 4 | Origin unit (comarca / vara) |

---

## NF-e / NFC-e chave de acesso — reference index

> **Vectors:** `packages/br-validators/tests/vectors/nfe-chave.official.json`  
> **Caveat:** MOC DANFE NFC-e QR page chave `281708…0824` is illustrative only — DV fails §2.2.6.2 (computed DV=8, stored=4). Use MOC §2.2.6.2 worked example as primary golden.

| Role | Source | URL |
|------|--------|-----|
| **Normative index** | Portal Nacional NF-e — MOC 7.0 | https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D |
| **Normative** | MOC 7.0 Visão Geral (CONFAZ PDF) — §2.2.6.1–2.2.6.2 | https://www.confaz.fazenda.gov.br/legislacao/arquivo-manuais/moc7-visao-geral.pdf |
| **Normative (online)** | MOC espelho SEFAZ-PR — §2.2.6 | http://moc.sped.fazenda.pr.gov.br/ |
| **Algorithm** | MOC §2.2.6.2 — Cálculo do DV | http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e |
| **Supplementary** | DFe Portal SVRS — NTs / Anexos | https://dfe-portal.svrs.rs.gov.br/NFe/Documentos |
| **Illustrative only** | MOC DANFE NFC-e QR Code page | http://moc.sped.fazenda.pr.gov.br/DanfeQrCodeNFCe.html |

### Golden vectors

| Vector | Chave (44 digits) | Source |
|--------|-------------------|--------|
| **Primary** | `52060433009911002506550120000007800267301615` | MOC §2.2.6.2 — sum=644, remainder=6, DV=5 |
| **Secondary** | `41180678393592000146558900000006041028190697` | MOC online valid example |

---

## NF-e cUF (SEFAZ UF code) {#nfe-cuf}

> **Vectors:** `packages/br-validators/tests/vectors/nfe-cuf.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| Manual NF-e — Tabela de UF | Portal Nacional NF-e | http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Il8k4BIjb48= |
| Portal NF-e | SEFAZ | http://www.nfe.fazenda.gov.br/portal/principal.aspx |
| IBGE UF codes (cross-ref) | IBGE | https://www.ibge.gov.br/explica/codigos-dos-municipios.php |

Golden: `35` (São Paulo/SP), `53` (Distrito Federal), `11` (Rondônia). All **27** UFs embedded.

`getCufPorCodigo` / `getCufPorUf` — lookup only. Numeric values coincide with IBGE UF codes but NF-e `cUF` field semantics differ from `@br-validators/core/ibge` locality API.

---

## IRPF progressive monthly table {#irpf}

> **Vectors:** `packages/br-validators/tests/vectors/irpf.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual` (annual probe in January)

| Role | Source | URL |
|------|--------|-----|
| RFB — Tabelas IRPF | Receita Federal | https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas |
| Tabela progressiva mensal | Receita Federal | https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/tabela-progressiva-mensal |
| Lei 7.713/1988 (base legal) | Planalto | https://www.planalto.gov.br/ccivil_03/leis/l7713.htm |

Golden: base **`2000`** → **`0`**; **`2826.65`** → **`42.56`**; **`3000`** → **`68.56`** (faixa 3); **`5000`** → **`479`**. Tax year **2025** embedded (5 faixas).

`calcularIrpfMensal` — progressive monthly withholding estimate only. Annual IRPF declaration and automatic 13º IRRF out of scope v1.

---

## INSS employee contribution table {#inss}

> **Vectors:** `packages/br-validators/tests/vectors/inss.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual` (annual probe in January)

| Role | Source | URL |
|------|--------|-----|
| Portaria Interministerial MPS/MF nº 6/2025 | DOU | https://www.in.gov.br/web/dou/-/portaria-interministerial-mps/mf-n-6-de-10-de-janeiro-de-2025-606526848 |
| PDF oficial | Previdência | https://www.gov.br/previdencia/pt-br/assuntos/rpps/legislacao-dos-rpps/2025/PortariaInterministerialMPSMFn6de10jan2025.pdf |
| INSS — alíquotas 2025 | INSS | https://www.gov.br/inss/pt-br/noticias/confira-como-ficaram-as-aliquotas-de-contribuicao-ao-inss |
| Lei 10.887/2004 (alíquotas progressivas) | Planalto | https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10887.htm |

Golden: **`1518`** → **`113.85`**; **`2793.88`** → **`228.68`**; **`3000`** → **`253.41`** (faixa 3); **`8157.41`** → **`951.63`** (teto). Competência year **2025** embedded (4 faixas).

`calcularInssMensal` — progressive employee contribution estimate (Anexo II). RPPS Anexo III and MEI fixed % out of scope v1.

---

## Critical timeline: CNPJ alphanumeric

| Milestone | Date | Impact on library |
|-----------|------|-------------------|
| SEFAZ homologation window opens | April 2026 | Consumers need dual-format validation in test environments |
| Production rollout | July 2026 | Both formats must work in production |
| Alphanumeric CPF spec | TBD 2026 | `generate('cpf', { format: 'alphanumeric' })` throws `CPF_ALPHA_SPEC_PENDING`; validation numeric-only until RFB publishes algorithm |

---

## `generate()` — synthetic fixtures (BR-GENERATE-001)

> Test fixtures only — each output passes the matching `validate*` before return. Normative DV/CRC sources:

| Generatable type | Official source for algorithm |
|------------------|-------------------------------|
| `cpf`, `cnpj` | [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) · [CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) |
| `cep` | [Correios Busca CEP](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) |
| `placa` | [CONTRAN 729/2018](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf) |
| `telefone` | [Anatel Plano de Numeração](https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro) |
| `cnh`, `renavam` | [CONTRAN 511/2014](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf) · [DENATRAN 27/2013](https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf) |
| `titulo-eleitor` | [TSE Res. 20.132/1998](https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998) |
| `pis-pasep` | [SIPREV RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) |
| `cnis` | [SIPREV RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) · [INSS NIT](https://www.gov.br/pt-br/servicos/obter-numero-de-inscricao-no-inss-nit) |
| `cartao-credito` | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) (Luhn) |
| `ean` | [GS1 EAN/UPC barcodes](https://www.gs1.org/standards/barcodes/ean-upc) (modulo-10 weights 1/3) |
| `inscricao-estadual` | Per-UF SEFAZ — [IE table](#inscrição-estadual-ie--all-27-ufs) |
| `inscricao-estadual-produtor-rural` | [SINTEGRA cad_SP.html Bloco II](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) |
| `pix` | [Bacen DICT API](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) (EVP UUID) |
| `nfe-chave` | [MOC §2.2.6.2 DV](http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e) |
| `brcode` | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) |
| `boleto` | [FEBRABAN Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) |
| `boleto-arrecadacao` | [FEBRABAN Arrecadação Layout v7 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%207%20-%2001_03_2023_mn.pdf) |

---

## Alphanumeric CNPJ — official clarifications (RFB FAQ)

| Topic | RFB answer | Library behavior |
|-------|------------|------------------|
| Excluded letters | Q45: systems accept **all A–Z**; RFB blocks bad combos at issuance | No client-side letter blocklist |
| Coexistence | Q6–Q7, Q20: numeric + alphanumeric both valid | Dual-path validator |
| Mask | Q21: same `XX.XXX.XXX/XXXX-DD` for both | Single formatter |
| Golden test | Q14: `12ABC34501DE35` | Mandatory unit test vector |
| QA tool | Q47: Simulador Nacional CNPJ | Manual homologation only |

---

## Source verification protocol

Before merging a validator:

1. Add or update row in this table with URL and access date.
2. Add test vectors from the official example or worked calculation.
3. Cross-check with at least one independent implementation **only after** primary source is satisfied.
4. Document known edge cases (e.g. CPF/CNPJ with all equal digits — traditionally rejected as invalid).

---

## IBGE localities {#ibge-localities}

> **Vectors:** `packages/br-validators/tests/vectors/ibge.official.json` · **cMunFG:** `packages/br-validators/tests/vectors/ibge.cmunfg.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) (auto-generated weekly)

| Role | Source | URL |
|------|--------|-----|
| API docs | IBGE Serviço de Dados | https://servicodados.ibge.gov.br/api/docs/localidades |
| Estados | IBGE API v1 | https://servicodados.ibge.gov.br/api/v1/localidades/estados |
| Municípios | IBGE API v1 | https://servicodados.ibge.gov.br/api/v1/localidades/municipios |
| Municipality code structure (7th DV) | IBGE explica | https://www.ibge.gov.br/explica/codigos-dos-municipios.php |
| NF-e field B12 `cMunFG` | NF-e / SEFAZ MOC 7.0 Anexo I | https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w= |

**cMunFG helpers** (`toCmunFg`, `parseCmunFg`, `computeCmunFgCheckDigit`): build/validate 7-digit IBGE municipality codes for NF-e field B12. Golden: base **`355030`** → **`3550308`** (São Paulo); exception **`220191`** → **`2201919`** (Bom Princípio do Piauí — non-algorithmic DV). Nine IBGE exceptions embedded per official tables.

**Edge case:** municipality `5101837` (Boa Esperança do Norte, MT) returns `microrregiao: null` — UF resolved via `regiao-imediata.regiao-intermediaria.UF` in fetch script.

---

## Bacen banks {#bacen-banks}

> **Vectors:** `packages/br-validators/tests/vectors/bancos.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| STR participants | Banco Central | https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv |

Golden: COMPE `001` / ISPB `00000000` (Banco do Brasil), `341` / `60701190` (Itaú), `260` / `18236120` (Nubank).

---

## Aeroportos {#aeroportos}

> **Vectors:** `packages/br-validators/tests/vectors/aeroportos.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Public aerodromos CSV | ANAC | https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv |
| Municipality cross-ref | IBGE (embedded) | https://servicodados.ibge.gov.br/api/v1/localidades/municipios |

Golden: IATA **`GRU`** (ICAO `SBGR`, Guarulhos/SP), **`GIG`** (`SBGL`), **`BSB`** (`SBBR`), **`SSA`** (`SBSV`), **`CGB`** (`SBCY`). IATA codes are enriched from ICAO location identifiers where ANAC CSV provides OACI only.

---

## TSE municipality codes {#tse-municipios}

> **Vectors:** `packages/br-validators/tests/vectors/tse-municipios.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| TSE ↔ IBGE zip | TSE CDN | https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip |
| Dataset page | TSE dados abertos | https://dadosabertos.tse.jus.br/dataset/codigos-oficiais-de-uf-e-municipios-segundo-o-tse-e-o-ibge |

Golden: TSE **`71072`** → IBGE **`3550308`** (São Paulo/SP); also verified for RJ, DF, BA, MT capitals in vector file. **Lookup-only** — `@br-validators/core/titulo-eleitor` check-digit validation is unchanged.

---

## Moedas (ISO 4217 + Bacen) {#moedas}

> **Vectors:** `packages/br-validators/tests/vectors/moedas.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| ISO 4217 baseline | Embedded (scripts/lib/iso4217-base.ts) | — |
| Bacen PTAX Moedas | Banco Central Olinda API | https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas |

Golden: **`BRL`** (Real brasileiro, `R$`), **`USD`** (Dólar dos Estados Unidos, Bacen tipo `A`), **`EUR`** (Euro, Bacen tipo `B`). `searchMoedas` matches ISO code or Portuguese name fragment.

---

## PTAX Bacen cotações {#ptax-cotacoes}

> **Vectors:** `packages/br-validators/tests/vectors/ptax.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: diario`

| Role | Source | URL |
|------|--------|-----|
| PTAX Olinda API (swagger) | Banco Central | https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3 |
| CotacaoMoedaPeriodo (fetch) | Banco Central Olinda OData | https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao) |
| CotacaoMoedaDia (reference) | Banco Central Olinda OData | https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao) |

> **Note:** The bare `CotacaoMoedaPeriodo` OData URL returns HTTP 500 (`Erro desconhecido`) without `@moeda`, `@dataInicial`, and `@dataFinalCotacao` query parameters. Use the [Swagger UI](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3) **Try it out** or `scripts/lib/ptax-bacen-api.ts` (`buildPtaxPeriodoRequestUrl`).

Fetch embeds **Fechamento PTAX** closing rates for Bacen `tipoMoeda` **A/B** currencies from `@br-validators/core/moedas` (USD, EUR, GBP, …). Rolling window: **5 business days** (`scripts/lib/ptax-bacen-api.ts`). Parser accepts `tipoBoletim` **`Fechamento PTAX`** (daily endpoint) and **`Fechamento`** (period endpoint).

**Staleness API (v1.9+):** `getPtaxCotacao` / `getPtaxUltimoDiaUtil` return `dataReferencia`, `isStale` (more than **1 business day** before Brazil local today), and `warning` when stale — live rates via `@br-validators/adapters-ptax` (adapter package). `PTAX_DATA_VERSION.capturadoEm` is the embed capture calendar day.

Golden: USD último dia útil **`2026-06-25`**; USD histórico **`2026-06-23`**; EUR último dia útil **`2026-06-25`**. `getPtaxCotacao('USD')` without date returns latest embedded Fechamento with staleness metadata; dates accept ISO `YYYY-MM-DD` or Bacen `MM-DD-YYYY`.

---

## SELIC meta (SGS 432) {#selic-meta-sgs-432}

> **Vectors:** `packages/br-validators/tests/vectors/selic.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: diario`

| Role | Source | URL |
|------|--------|-----|
| BCB Dados Abertos — Série 432 | Bacen | https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom |
| SGS API (JSON) | Bacen | https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json |
| SGS consulta gráfico | Bacen | https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432 |
| Bacen — conceito Selic / COPOM | Bacen | https://www.bcb.gov.br/controleinflacao/copom |

Fetch embeds **Meta Selic** (% a.a.) from SGS série **432**. Rolling window: **90 calendar days** (`scripts/lib/selic-sgs-api.ts`). Dates stored as ISO `YYYY-MM-DD`; API input uses `DD/MM/YYYY`.

**Staleness API:** `getSelicMeta` / `getSelicMetaPorData` return `dataReferencia`, `isStale` (more than **1 business day** before Brazil local today), and `warning` when stale — live series via `@br-validators/adapters-selic` (adapter package).

Golden: latest **`2026-06-26`** → **`14.25`**; COPOM **`2026-06-18`** → **`14.25`**; before COPOM **`2026-06-17`** → **`14.50`**. Selic diária (11) and CDI (12) out of scope v1.

---

## Países Bacen (NF-e) {#paises-bacen}

> **Vectors:** `packages/br-validators/tests/vectors/paises-bacen.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| NF-e Diversos listing | Portal Nacional NF-e | http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/NJarYc9nus= |
| NF-e country table (NT 2018.003 v1.01 ODS) | Portal Nacional NF-e | http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=PfPDd6dW200= |
| Bacen FTP fallback | Banco Central | https://www.bcb.gov.br/ftp/paises.txt |

Fetch discovers país-table links from **Documentos → Diversos**, downloads the **ODS** spreadsheet (v1.01 preferred), and parses active rows (`EXCLUÍDO` skipped). When NF-e is unreachable, **Bacen FTP** is merged with the embedded NF-e supplemental codes. Legacy `FOXZNFX/p50=` redirects to the portal homepage — do not use.

Golden: Bacen **`1058`** → **Brasil** (NF-e domestic operations). Non-significant leading zeros accepted (`01058` → `1058`).

---

## Incoterms 2020 {#incoterms}

> **Vectors:** `packages/br-validators/tests/vectors/incoterms.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| ICC Incoterms 2020 | International Chamber of Commerce | https://iccwbo.org/resources-for-business/incoterms-rules/ |

Static list of 11 ICC 2020 terms: **EXW**, **FCA**, **CPT**, **CIP**, **DAP**, **DPU**, **DDP**, **FAS**, **FOB**, **CFR**, **CIF**. Code + English name only (no ICC copyrighted descriptions). Golden: **`FOB`** → Free On Board.

---

## Anatel DDD lookup {#anatel-ddd-lookup}

> **Vectors:** `packages/br-validators/tests/vectors/telefone-ddd.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| DDD panel | Anatel | https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais |
| Municipality names | IBGE (embedded) | https://servicodados.ibge.gov.br/api/v1/localidades/municipios |

`getDddInfo` validates DDD against `ANATEL_DDD_SET` — same 67 codes as `validateTelefone`.

---

## National holidays {#feriados-nacionais}

> **Vectors:** `packages/br-validators/tests/vectors/feriados.official.json`  
> **Scope:** federal calendar per Lei 662 (fixed) + Portaria MGI annual (Paixão de Cristo + pontos facultativos).

| Role | Source | URL |
|------|--------|-----|
| Fixed national holidays | Lei 662/1949 | https://www.planalto.gov.br/ccivil_03/leis/l0662.htm |
| Consolidation | Lei 10.607/2002 | https://www.planalto.gov.br/ccivil_03/leis/l10607.htm |
| Nossa Senhora Aparecida | Lei 6.802/1980 | https://www.planalto.gov.br/ccivil_03/leis/l6802.htm |
| Consciência Negra (from 2024) | Lei 14.759/2023 | https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/L14759.htm |
| Official 2026 calendar | Portaria MGI 11.460/2025 (Gov.br) | https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026 |

**National holidays (10 in 2026):** nine Lei 662 fixed dates + Paixão de Cristo (3 Apr 2026).

**Pontos facultativos federais (9 in 2026, `getPontosFacultativosFederais`):** Carnaval (16–17 Feb), Quarta de Cinzas (18 Feb, until 14:00), 20 Apr, Corpus Christi (4 Jun), 5 Jun, Dia do Servidor (28 Oct), Véspera Natal (24 Dec after 13:00), Véspera Ano Novo (31 Dec after 13:00). Year-specific bridge days come from embedded portaria data (`portaria-extras.json`).

Out of scope: state/municipal holidays, BACEN banking calendar.

---

## CNAE economic activity {#cnae-economic-activity}

> **Vectors:** `packages/br-validators/tests/vectors/cnaes.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| API docs | IBGE Serviço de Dados | https://servicodados.ibge.gov.br/api/docs/cnae |
| Subclasses (primary embed) | IBGE API v2 | https://servicodados.ibge.gov.br/api/v2/cnae/subclasses |
| CNAE fiscal table (parity) | RFB Dados Abertos CNPJ | https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/ (`Cnaes.zip`) |
| Layout | RFB metadados | https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf |

Golden: `6201501` (custom software development), `6201502` (web design). IBGE embed is authoritative; RFB `Cnaes.zip` must stay aligned on 7-digit subclass codes.

---

## CNPJ motivos de situação cadastral {#cnpj-motivos-situacao-cadastral}

> **Vectors:** `packages/br-validators/tests/vectors/cnpj-motivos.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — monthly RFB release

| Role | Source | URL |
|------|--------|-----|
| Motivos table | RFB Dados Abertos CNPJ | https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/ (`Motivos.zip`) |
| Layout | RFB metadados | https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf |

Golden: **`00`** (sem motivo), **`01`** (extinção por encerramento liquidação voluntária), **`02`** (incorporação).

**Scope:** code→label reference for `motivo_situacao_cadastral` in estabelecimentos layout. **Out of scope:** `Empresas*.zip`, `Estabelecimentos*.zip`, `Socios*.zip` (~GB dumps), per-CNPJ cadastro lookup.

**LGPD:** no natural-person fields — reference codes only.

---

## CFOP fiscal operations {#cfop-fiscal-operations}

> **Vectors:** `packages/br-validators/tests/vectors/cfop.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| CFOP table | CONFAZ SINIEF | https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente |

Golden: `1102` (purchase for resale), `5102` (sale of goods acquired from third parties).

`validateCfop(raw)` — 4-digit format + embedded table (`FiscalCodeValidationResult`). CFOP **business-rule** validation (e.g. operation type vs. document) remains out of scope.

---

## Natureza jurídica (CNPJ) {#natureza-juridica}

> **Vectors:** `packages/br-validators/tests/vectors/natureza-juridica.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Naturezas.zip | RFB Dados Abertos CNPJ | https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/{YYYY-MM}/Naturezas.zip |

Golden: `2062` (Sociedade Empresária Limitada).

CSV inside zip uses semicolon-delimited quoted fields (`"2062";"Sociedade Empresária Limitada"`). When the official host times out, `scripts/fetch-natureza-juridica.ts` documents a dev-only community mirror fallback and retains embedded data on failure.

---

## NBS services nomenclature {#nbs}

> **Vectors:** `packages/br-validators/tests/vectors/nbs.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Anexo B NBS2 xlsx | NFSe Nacional | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx |
| Anexo VIII (correlation, xlsx only) | NFSe Nacional | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/anexoviii-correlacaoitemnbsindopcclasstrib_ibscbs_v1-00-00.xlsx |

Golden: `1.1502.50.00` (TI systems integration services).

Leaf codes are parsed from sheet 2 of the official xlsx (no xlsx npm dependency — unzip + XML). IBS/CBS correlation (Anexo VIII) is reference-only and not embedded.

---

## CEST (substituição tributária) {#cest}

> **Vectors:** `packages/br-validators/tests/vectors/cest.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Convênio ICMS 142/2018 | CONFAZ | https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18 |

Golden: `0302100` (returnable beer bottle). Cross-ref: NCM `22030000` maps to multiple CEST rows; NCM `01012100` (purebred horses) has no CEST (not subject to ST).

`getCestPorNcm` matches 8-digit NCM codes against embedded prefix lists from the annex tables.

---

## CST (situação tributária) {#cst-situacao-tributaria}

> **Vectors:** `packages/br-validators/tests/vectors/cst.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| SPED Fiscal — Tabelas de Situação Tributária | RFB SPED | http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal |
| CST-PIS table (Word, supplemental) | RFB SPED | http://sped.rfb.gov.br/arquivo/download/1629 |
| CST-COFINS table (Word, supplemental) | RFB SPED | http://sped.rfb.gov.br/arquivo/download/1630 |
| Legal basis | IN RFB 932/2009 family | https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/sped-sistema-publico-de-escrituracao-digital/escrituracao-fiscal-digital-efd/escrituracao-fiscal-digital-efd |

SPED table ids embedded at fetch time: ICMS `130`, IPI `26`, PIS `27`, COFINS `23` (package `5` — Tabelas de Situação Tributária).

Golden: ICMS `00` (tributada integralmente), `10` (ST); IPI `50` (saída tributada), `00` (entrada com crédito); PIS `01` / `07`; COFINS `01` / `07`.

`validateCst(raw, { tax })` — 2-digit format + per-tax embedded table (`FiscalCodeValidationResult`); `tax`: `icms` | `ipi` | `pis` | `cofins`.

**Scope v1:** NF-e 2-digit CST for ICMS (Nacional/Estrangeira origins from SPED 3-digit rows). **CSOSN** (Simples Nacional): see [§ CSOSN](#csosn).

---

## CSOSN Simples Nacional {#csosn}

> **Vectors:** `packages/br-validators/tests/vectors/csosn.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| Ajuste SINIEF 03/10 — CSOSN table | CONFAZ | https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10 |

Golden: **`101`** (tributada com crédito), **`102`** (sem crédito), **`201`** (ST), **`500`** (ICMS cobrado anteriormente).

`validateCsosn(raw)` — 3-digit format + embedded table (`FiscalCodeValidationResult`).

---

## LC 116 ISS service list {#lc116-iss-servicos}

> **Vectors:** `packages/br-validators/tests/vectors/lc116.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| LC 116/2003 — Lista de Serviços (primary) | Planalto | https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm |
| LC 116 republication (fetch fallback) | NFSe Nacional | https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs |

Golden: `1.01` (análise e desenvolvimento de sistemas), `7.02` (execução de obras de construção civil).

**Scope v1:** National LC 116 item codes + descriptions only. **Per-municipio ISS alíquotas:** partial embed (~500 cities) at `@br-validators/core/iss-municipal` — see [§ ISS municipal](#iss-municipal). Full 5.570-municipality table remains deferred (ROADMAP S-09). Optional v2: LC 116 ↔ NBS cross-reference.

---

## ISS municipal alíquotas (partial embed) {#iss-municipal}

> **Vectors:** `packages/br-validators/tests/vectors/iss-municipal.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual` (annual; **not** in daily refresh bot)

| Role | Source | URL |
|------|--------|-----|
| LC 116/2003 — ISS framework (2%–5% band) | Planalto | https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm#art8 |
| IBGE SIDRA — PIB municipal ranking (primary fetch) | IBGE SIDRA API | https://apisidra.ibge.gov.br/values/t/5938/n6/all/v/37/p/2022 |
| IBGE — PIB municipal (reference) | IBGE Contas Regionais | https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html |
| IBGE — PIB Table 1 xlsx (optional cross-check) | IBGE FTP | https://ftp.ibge.gov.br/Pib_Municipios/2022_2023/xlsx/tabelas_completas_2022.xlsx |
| IBGE — municipality codes | IBGE | https://www.ibge.gov.br/explica/codigos-dos-municipios.php |
| CNM — municipal legislation index | CNM | https://www.cnm.org.br/ |
| NFSe Nacional | gov.br | https://www.gov.br/nfse/pt-br |

Golden: IBGE **`3550308`** (São Paulo/SP — alíquota band 2%–5%, `legislacao.prefeitura.sp.gov.br`), **`3304557`** (Rio de Janeiro/RJ), **`3106200`** (Belo Horizonte/MG), **`3509502`** (Campinas/SP — high-PIB non-capital, `estimativa: true`).

`getIssMunicipalPorIbge`, `getIssMunicipalPorUf`, `getIssMunicipalPorUfMunicipio`, `searchIssMunicipal(query, { uf?, limit? })`, `getIssMunicipalUfsDisponiveis`, `getAllIssMunicipal` — every `IssMunicipalResult` includes `fonte` (`'oficial'` | `'estimativa'`), `warning` (estimation / quoting only; **not** NFSe emission), and legacy `estimativa` boolean.

**Scope v1:** 27 state capitals + top PIB municipalities (SIDRA 5938, PIB 2022) deduplicated to **500 rows**. Fields: `aliquotaMin`, `aliquotaMax`, `leiUrl`, `capturadoEm`, `fonte`, `estimativa`. `fonte: 'oficial'` — capital seed with verified municipal legislation URL; `fonte: 'estimativa'` — LC 116 Art. 8 band fallback (**473 rows**). Capital rows cite municipal portals; non-capital rows use LC 116 Art. 8 band with `estimativa: true` — **not** verified municipal legislation. **Out of scope:** all 5.570 municipalities, per-LC-116-item municipal rates, NFSe emission validation.

---

## eSocial {#esocial}

> **Vectors:** `packages/br-validators/tests/vectors/esocial.official.json`, `packages/br-validators/tests/vectors/esocial-rubricas.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| eSocial S-1.3 layout tables (Tabela 01 + Tabela 03) | gov.br / eSocial | https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html |
| Manual de Orientação (reference) | eSocial / MTE | https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-02-2024-com-marcacoes.pdf |

### Tabela 01 — Categorias de Trabalhadores {#esocial-categorias-trabalhadores}

Golden: **`101`** (empregado geral — CLT), **`103`** (aprendiz), **`901`** (estagiário). Each row includes `grupo`, `inicio`, and `termino` (`null` when still active).

### Tabela 03 — Natureza das Rubricas da Folha de Pagamento {#esocial-rubricas-folha}

Golden: **`1000`** (salário, vencimento, soldo), **`5001`** (13º salário), **`1016`** (férias), **`9908`** (FGTS — depósito). Each row includes `natureza`, `descricao`, `inicio`, `termino` (`null` when still active), and `codIncCP` (incidence for S-1010 `codIncCP` values 15/16).

**Scope v1:** Tabelas **01** and **03** only. **Leave types** (Tabela 18) deferred to v2.

---

## Simples Nacional annex tables {#simples-nacional-anexos}

> **Vectors:** `packages/br-validators/tests/vectors/simples-nacional.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — `agendamento: manual`

| Role | Source | URL |
|------|--------|-----|
| LC 123/2006 (consolidated) | Planalto | https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm |
| Anexo I — Comércio (rates + repartição) | Receita Federal / normas | http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=48430 |
| Resolução CGSN 140/2018 (regulation) | Receita Federal / normas | http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=115262 |

Golden: Anexo **`I`** RBT12 **`700000`** → faixa 3, alíquota nominal **9,5%**, parcela **R$ 13.860**, alíquota efetiva **7,52%**; Anexo **`III`** RBT12 **`180000`** → faixa 1 (**6%**); Anexo **`V`** RBT12 **`200000`** → faixa 2, alíquota efetiva **15,75%**.

**Scope v1:** Anexos **I–V** progressive rate tables (6 faixas each, LC 155/2016 redação). **CNAE→anexo** mapping and **tributo repartição** percentages deferred v2. Receita **Anexo VI** (CNAE impeditivos) is a separate exclusion list — out of scope.

---

## NCM Mercosur nomenclature {#ncm-mercosur-nomenclature}

> **Vectors:** `packages/br-validators/tests/vectors/ncm.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| JSON download | Siscomex / Receita Federal | https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json |
| Official page | Receita Federal | https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul |

Golden: `01012100` (purebred horse breeders), `12011000` (soybean seeds for sowing).

`validateNcm(raw)` — 8-digit format + embedded table (`FiscalCodeValidationResult`). Tax rates (IPI/ICMS) are out of scope — pair with `@br-validators/core/ibpt` for Lei 12.741/2012 approximate total burden.

---

## IBPT approximate tax burden (NCM) {#ibpt-carga-tributaria-ncm}

> **Vectors:** `packages/br-validators/tests/vectors/ibpt.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — semestral IBPT release

| Role | Source | URL |
|------|--------|-----|
| De Olho no Imposto (official tables) | IBPT | https://deolhonoimposto.ibpt.org.br/ |
| Legal basis | Planalto | https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm |
| Layout / integration | IBPT portal | https://deolhonoimposto.ibpt.org.br/ |

Golden: NCM **`01012100`** / UF **`SP`** — nacional federal **13,45%** + estadual **18%** = **31,45%** total; UF **`RJ`** same NCM → estadual **14%** (**27,45%** total). NCM **`22030000`** / **`SP`** (malt beer) — **35,91%** nacional / **39,77%** importado.

**Scope v1:** golden NCM×UF subset embedded (~5 rows). **Out of scope:** full ~11k NCM × 27 UF matrix in core bundle. Rates are **approximate** per Lei 12.741/2012 — not a substitute for SEFAZ calculation.

**Fetch:** `pnpm fetch:data:ibpt` — refreshes golden subset from latest IBPT table (dev mirror documented in `fetch-ibpt.ts`).

---

## CBO occupations {#cbo-occupations}

> **Vectors:** `packages/br-validators/tests/vectors/cbo.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Occupations CSV | MTE CBO 2002 | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv |

Golden: `212405` (systems development analyst), `010105` (air force general officer).

---

## CEP prefix ranges {#cep-prefix-ranges}

> **Vectors:** `packages/br-validators/tests/vectors/cep-faixa.official.json`  
> **Scope:** extends `@br-validators/core/cep` — structural validation unchanged; adds offline prefix lookup.

| Role | Source | URL |
|------|--------|-----|
| CNEFE microdata (UF CSV) | IBGE | https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF/ |
| CNEFE product page | IBGE | https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html |
| Municipality names | IBGE localidades (embedded) | https://servicodados.ibge.gov.br/api/v1/localidades/municipios |

Golden: prefix `01310` → São Paulo/SP (`3550308`), prefix `20040` → Rio de Janeiro/RJ (`3304557`).

Prefix resolution aggregates IBGE CNEFE 2022 address records by 5-digit CEP prefix (dominant IBGE municipality code). Not a Correios DNE commercial dump — no runtime HTTP to Correios.

---

## Portos (ANTAQ) {#portos}

> **Vectors:** `packages/br-validators/tests/vectors/portos.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Geographic open data zip | ANTAQ | https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip |
| Informações geográficas page | ANTAQ | https://www.gov.br/antaq/pt-br/central-de-conteudos/informacoes-geograficas |

Golden: **`BRSSZ`** (Santos organized port), **`BRADR`** (Angra dos Reis), **`BRPNG`** (Paranaguá). `getPortosPorMunicipio(ibgeCodigo)` uses ANTAQ `idcidade` normalized to 7-digit IBGE municipality codes.

---

## ANP combustíveis (LPC) {#anp-combustiveis}

> **Vectors:** `packages/br-validators/tests/vectors/anp-combustiveis.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)  
> **Sibling reference (MIT):** [TABELA-ANP-COMBUSTIVEIS](https://github.com/AlexandreZanata/TABELA-ANP-COMBUSTIVEIS) — product label normalization and XLSX column layout

| Role | Source | URL |
|------|--------|-----|
| Weekly LPC listing page | ANP | https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas |
| `resumo_semanal_lpc` XLSX | ANP | `https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/{YEAR}/resumo_semanal_lpc_{start}_{end}.xlsx` |

Embedded v1: **latest survey week only**, `MUNICIPIOS` sheet (municipal averages). Station detail (`revendas_lpc`) deferred to Phase 31b.

Golden: **São Paulo/SP `GASOLINE_REGULAR`**, **Adamantina/SP `ETHANOL`**, **Campo Grande/MS `LPG_P13`**. `getAnpPrecosMediosPorIbge(ibge, produto)` uses IBGE municipality codes resolved at fetch time.

---

## PNCP reference {#pncp-reference} {#pncp}

> **Vectors:** `packages/br-validators/tests/vectors/pncp-reference.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Cadastro domain tables | PNCP API | https://pncp.gov.br/api/pncp/v1/modalidades (and sibling `/v1/*` tables) |
| Cadastro OpenAPI | Serpro / PNCP | https://pncp.gov.br/api/pncp/v3/api-docs |
| Consulta API (adapter) | PNCP | https://pncp.gov.br/api/consulta/swagger-ui/index.html |
| Consulta OpenAPI | Serpro / PNCP | https://pncp.gov.br/api/consulta/v3/api-docs |

Golden: modalidade id **`6`** → Pregão Eletrônico. CNPJ adapter normalization: `normalizePncpCnpj` (RFB FAQ Q14 example). Embedded tables: modalidades, amparos legais, modos de disputa, tipos de instrumento convocatório, tipos de contrato, critérios de julgamento, tipos de instrumento de cobrança, fontes orçamentárias.

Live contract/procurement queries belong in `@br-validators/adapters-pncp` — see [ADAPTERS-PNCP-RFC.md](ADAPTERS-PNCP-RFC.md).

---

## Portal da Transparência {#portal-transparencia}

> **Vectors:** `packages/br-validators/tests/vectors/transparencia.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Role | Source | URL |
|------|--------|-----|
| Swagger UI | CGU | https://api.portaldatransparencia.gov.br/swagger-ui/index.html |
| OpenAPI | CGU | https://api.portaldatransparencia.gov.br/v3/api-docs |
| API key registration | Portal da Transparência | https://portaldatransparencia.gov.br/ |

Core embeds endpoint registry only (CEIS, CNEP, CEAF, PEP, social programs classified as query-adapter). No bulk sanctions/PEP snapshots in v1 — no open bulk export suitable for weekly embed.

Live CPF/CNPJ queries belong in `@br-validators/adapters-transparencia` — see [ADAPTERS-TRANSPARENCIA-RFC.md](ADAPTERS-TRANSPARENCIA-RFC.md). API key via env `TRANSPARENCIA_API_KEY` only (never in repo).

---

## References index

- RFB CPF: https://www.gov.br/receitafederal/pt-br/assuntos/cpf
- RFB CNPJ FAQ PDF: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
- SERPRO DV calculation: https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf
- RFB Simulador CNPJ: https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular
- Correios CEP API manual: https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
- CONTRAN 729/2018: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
- CONTRAN 969/2022 Anexo I: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf
- SIPREV PIS/PASEP RV_03: https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf
- Bacen BR Code: https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf
- Bacen PIX initiation: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
- Bacen DICT API v2.9: https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html
- FEBRABAN Convenção da Cobrança: https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf
- ISO/IEC 7812-1:2017: https://www.iso.org/standard/70484.html
- IE state index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md)
- IE all UFs table: [OFFICIAL-SOURCES.md § IE](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs)
- SINTEGRA national index: http://www.sintegra.gov.br/insc_est.html
