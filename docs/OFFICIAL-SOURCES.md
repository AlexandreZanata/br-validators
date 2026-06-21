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
| **PIX / BR Code** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf), [Anexo I — Padrões Iniciação PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf), [DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) | **Key validation (Phase 4):** five types — CPF, CNPJ, email (max 77 lowercase), phone (`+55` mobile), EVP (UUID). Golden: `pix@bcb.gov.br`, `+5510998765432`, `123e4567-e89b-12d3-a456-426655440000`. BR Code payload parsing — separate module. |
| **Boleto** | FEBRABAN | [Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) | Bank boleto: 47-digit linha digitável (modulo 10 field DVs) + 44-digit código de barras (modulo 11 general DV). **Situação 1** (v1): currency `9`, fator+valor campo 5. **Situação 2** (5b): code `988`, currency `0`, ISPB campo 5. Golden: Santander linha ↔ barcode; synthetic Situação 2 pair in `boleto.situacao2.official.json`. 48-digit arrecadação detected but not validated — Phase 5c. |
| **Credit card** | ISO/IEC 7812 | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) | PAN 8–19 digits; Luhn modulus-10 per **Annex B**. Golden: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, walkthrough `79927398713`. Brand detect (Elo/Hipercard IIN) — best-effort, non-authoritative. No CVV/expiry/authorization. |
| **PIS / PASEP / NIS** | Dataprev / INSS (CNIS) | [SIPREV Regras de Validação v1.14 — RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) | 11 digits, mask `XXX.XXXXX.XX-X`. Modulo 11 per **padrão do NIT**; weights `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits (NIT implementation). Golden: **`10027230888`** (UC-006), **`12056456402`** (cross-check). PIS (Caixa), PASEP (BB), NIS/NIT (CNIS) share the same checksum. **Caixa PIS gov.br page removed (404, June 2026).** |
| **IE — São Paulo (SP)** | SEFAZ-SP | [Sintegra rotina de consistência](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | 12 digits, dual modulo-11 DVs. Golden: **`110042490114`**. Vector: `ie.sp.official.json`. Mirror: [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html). |
| **IE — all 27 UFs** | Per-state SEFAZ | Full table: [§ Inscrição Estadual (IE)](#inscrição-estadual-ie--all-27-ufs) · Index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md) | Check digits only — no SEFAZ registration lookup. `getIeOfficialSourceUrl(uf)` / `IE_OFFICIAL_SOURCE_URLS`. SP rural `P…` out of scope. |

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

## Critical timeline: CNPJ alphanumeric

| Milestone | Date | Impact on library |
|-----------|------|-------------------|
| SEFAZ homologation window opens | April 2026 | Consumers need dual-format validation in test environments |
| Production rollout | July 2026 | Both formats must work in production |
| Alphanumeric CPF spec | TBD 2026 | Do not implement until RFB publishes official algorithm |

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
