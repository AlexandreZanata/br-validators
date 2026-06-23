# Official sources by data type

> **Rule:** No validator ships without a row in this table and at least one test vector from the cited source.
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
| **NF-e chave de acesso** | ENCAT / SEFAZ | [Portal NF-e — MOC index](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D) · Full index: [§ NF-e chave](#nf-e--nfc-e-chave-de-acesso--reference-index) | **44 digits** — structure + modulo-11 DV on first 43. Models **55** (NF-e) / **65** (NFC-e). Golden: **`52060433009911002506550120000007800267301615`** (MOC §2.2.6.2 worked example, sum=644, DV=5). |
| **PIX key** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf), [Anexo I — Padrões Iniciação PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf), [DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) | **Key validation (Phase 4):** five types — CPF, CNPJ, email (max 77 lowercase), phone (`+55` mobile), EVP (UUID). Golden: `pix@bcb.gov.br`, `+5510998765432`, `123e4567-e89b-12d3-a456-426655440000`. |
| **BR Code payload** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Manual de Padrões PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) | EMV TLV + CRC16-CCITT (tag 63). `parseBrCode` / `validateBrCode` / `buildStaticPixBrCode` (static PIX QR; omit `amount` for permanent QR). Golden: `tests/vectors/brcode.official.json` (≥5 manual examples + `BRCODE_GOLDEN_STATIC_*`). Static EVP CRC `1D3D`. Rule: BR-BRC-005. |
| **Boleto (cobrança)** | FEBRABAN | [Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) | Bank boleto: 47-digit linha digitável (modulo 10 field DVs) + 44-digit código de barras (modulo 11 general DV). **Situação 1** (v1): currency `9`, fator+valor campo 5. **Situação 2** (5b): code `988`, currency `0`, ISPB campo 5. Golden: Santander linha ↔ barcode; synthetic Situação 2 pair in `boleto.situacao2.official.json`. |
| **Boleto (arrecadação)** | FEBRABAN | [Layout Padrão de Arrecadação/Recebimento v7 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%207%20-%2001_03_2023_mn.pdf) | 48-digit linha (4×11 + field DVs) or 44-digit código de barras; product id `8`; value types `6`/`7` (modulo 10) or `8`/`9` (modulo 11). Golden: `tests/vectors/boleto-arrecadacao.official.json` (Layout v7 §07 modulo 10 walkthrough, §09–10 modulo 11). |
| **Credit card** | ISO/IEC 7812 | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) | PAN 8–19 digits; Luhn modulus-10 per **Annex B**. Golden: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, walkthrough `79927398713`. Brand detect (Elo/Hipercard IIN) — best-effort, non-authoritative. No CVV/expiry/authorization. |
| **PIS / PASEP / NIS** | Dataprev / INSS (CNIS) | [SIPREV Regras de Validação v1.14 — RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) | 11 digits, mask `XXX.XXXXX.XX-X`. Modulo 11 per **padrão do NIT**; weights `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits (NIT implementation). Golden: **`10027230888`** (UC-006), **`12056456402`** (cross-check). PIS (Caixa), PASEP (BB), NIS/NIT (CNIS) share the same checksum. **Caixa PIS gov.br page removed (404, June 2026).** |
| **IE — São Paulo (SP)** | SEFAZ-SP | [Sintegra rotina de consistência](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | 12 digits, dual modulo-11 DVs. Golden: **`110042490114`**. Vector: `ie.sp.official.json`. Mirror: [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html). |
| **IE — SP produtor rural** | SEFAZ-SP / SINTEGRA | [cad_SP.html Bloco II](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) | 13 chars `P0MMMSSSSD000`; DV at position 10; weights `1,3,4,5,6,7,8,10` on `0MMMSSSS`. Golden: **`P-01100424.3/002`**. Vector: `inscricao-estadual-produtor-rural.official.json`. Cadastro: [CADESP produtor rural](https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Produtor-Rural-abertura,-baixa-e-outras-alteracoes.aspx). |
| **IE — all 27 UFs** | Per-state SEFAZ | Full table: [§ Inscrição Estadual (IE)](#inscrição-estadual-ie--all-27-ufs) · Index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md) | Check digits only — no SEFAZ registration lookup. `getIeOfficialSourceUrl(uf)` / `IE_OFFICIAL_SOURCE_URLS`. SP produtor rural: `validateIeProdutorRural` / `getIeProdutorRuralOfficialSourceUrl()`. |
| **IBGE localities** | IBGE | [Serviço de Dados — localidades](https://servicodados.ibge.gov.br/api/docs/localidades) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) | Estados + municípios embedded offline. Golden: **`3550308`** (São Paulo/SP), **`5107925`** (Sorriso/MT), **`5300108`** (Brasília/DF), **`5101837`** (Boa Esperança do Norte/MT — null `microrregiao` fallback). Vector: `ibge.official.json`. Weekly refresh via `data-refresh-bot.yml`. |

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
| `cartao-credito` | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) (Luhn) |
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

> **Vectors:** `packages/br-validators/tests/vectors/ibge.official.json`  
> **Freshness:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) (auto-generated weekly)

| Role | Source | URL |
|------|--------|-----|
| API docs | IBGE Serviço de Dados | https://servicodados.ibge.gov.br/api/docs/localidades |
| Estados | IBGE API v1 | https://servicodados.ibge.gov.br/api/v1/localidades/estados |
| Municípios | IBGE API v1 | https://servicodados.ibge.gov.br/api/v1/localidades/municipios |

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
