# Inscrição Estadual — state algorithm index

> **No federal single norm.** Each UF (27) defines length, prefix, weights, and modulo rules.  
> **Historic consolidated reference:** [SINTEGRA `insc_est.html`](http://www.sintegra.gov.br/insc_est.html) + [`Cad_Estados/cad_XX.html`](http://www.sintegra.gov.br/Cad_Estados/) — portal discontinued; pages still mirror SEFAZ roteiros.  
> **Library delivery:** state-by-state phases — see [ROADMAP.md](ROADMAP.md).

Last reviewed: June 2026.

---

## Implementation status

| UF | Digits | DVs | Modulo | Status | Primary source |
|----|--------|-----|--------|--------|----------------|
| **SP** | 12 | 2 (pos 9, 12) | 11 (custom remainder) | **✅ Shipped** | [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) |
| **MT** | 9 (canonical) / 11 (legacy pad) | 1 | 11 | **✅ Shipped** | [SEFAZ-MT Port. Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) · [SINTEGRA MT](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html) |
| **DF** | 13 | 2 (pos 12, 13) | 11 | **✅ Shipped** | [Receita DF / CF/DF](https://www.receita.fazenda.df.gov.br/) · [SINTEGRA DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) |
| **AC** | 13 | 2 | 11 | **✅ Shipped** | [SEFAZ-AC](https://sefaz.ac.gov.br/) · [cad_AC](http://www.sintegra.gov.br/Cad_Estados/cad_AC.html) |
| **AL** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-AL cálculo DV](https://www.sefaz.al.gov.br/calculo) · [cad_AL](http://www.sintegra.gov.br/Cad_Estados/cad_AL.html) |
| **AM** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-AM](https://www.sefaz.am.gov.br/) · [cad_AM](http://www.sintegra.gov.br/Cad_Estados/cad_AM.html) |
| **AP** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-AP](https://www.sefaz.ap.gov.br/) · [cad_AP](http://www.sintegra.gov.br/Cad_Estados/cad_AP.html) |
| **BA** | 9 | 2 | 10/11 | **✅ Shipped** | [SEFAZ-BA cálculo DV](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) · [cad_BA](http://www.sintegra.gov.br/Cad_Estados/cad_BA.html) |
| **CE** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-CE](https://www.sefaz.ce.gov.br/) · [cad_CE](http://www.sintegra.gov.br/Cad_Estados/cad_CE.html) |
| **ES** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-ES](https://sitenet.es.gov.br/sefaz/) · [cad_ES](http://www.sintegra.gov.br/Cad_Estados/cad_ES.html) |
| **GO** | 9 | 1 | 11 | **✅ Shipped** | [CCE-GO](http://www.sefaz.go.gov.br/ServicosAFA/ece.html) · [cad_GO](http://www.sintegra.gov.br/Cad_Estados/cad_GO.html) |
| **MA** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-MA](https://www.sefaz.ma.gov.br/) · [cad_MA](http://www.sintegra.gov.br/Cad_Estados/cad_MA.html) |
| **MG** | 13 | 1 | 11 (alt.) | **✅ Shipped** | [SEF/MG cadastro](https://www.fazenda.mg.gov.br/empresas/Cadastro/cadastro/consultapublica.html) · [cad_MG](http://www.sintegra.gov.br/Cad_Estados/cad_MG.html) |
| **MS** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-MS](https://www.sefaz.ms.gov.br/) · [cad_MS](http://www.sintegra.gov.br/Cad_Estados/cad_MS.html) |
| **PA** | 9 | 1 | 11 | **✅ Shipped** | [SEFA-PA](https://www.sefa.pa.gov.br/) · [cad_PA](http://www.sintegra.gov.br/Cad_Estados/cad_PA.html) |
| **PB** | 9 | 1 | 11 | **✅ Shipped** | [Receita PB](https://www.receita.pb.gov.br/) · [cad_PB](http://www.sintegra.gov.br/Cad_Estados/cad_PB.html) |
| **PE** | 9 | 2 | 11 | **✅ Shipped** | [SEFAZ-PE](https://www.sefaz.pe.gov.br/) · [cad_PE](http://www.sintegra.gov.br/Cad_Estados/cad_PE.html) |
| **PI** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-PI](https://www.sefaz.pi.gov.br/) · [cad_PI](http://www.sintegra.gov.br/Cad_Estados/cad_PI.html) |
| **PR** | 10 | 2 | 11 | **✅ Shipped** | [Fazenda PR cálculo DV](https://www.fazenda.pr.gov.br/Pagina/calculo-digito-verificador) · [cad_PR](http://www.sintegra.gov.br/Cad_Estados/cad_PR.html) |
| **RJ** | 8 | 1 | 11 | **✅ Shipped** | [Portal Fazenda RJ](https://portal.fazenda.rj.gov.br/cadastro/) · [cad_RJ](http://www.sintegra.gov.br/Cad_Estados/cad_RJ.html) |
| **RN** | 9 | 1 | 11 | **✅ Shipped** | [SET-RN](https://www.set.rn.gov.br/) · [cad_RN](http://www.sintegra.gov.br/Cad_Estados/cad_RN.html) |
| **RO** | 14 | 1 | 11 | **✅ Shipped** | [SEFIN-RO](https://www.sefin.ro.gov.br/) · [cad_RO](http://www.sintegra.gov.br/Cad_Estados/cad_RO.html) |
| **RR** | 9 | 1 | mod9 | **✅ Shipped** | [SEFAZ-RR](https://www.sefaz.rr.gov.br/) · [cad_RR](http://www.sintegra.gov.br/Cad_Estados/cad_RR.html) |
| **RS** | 10 | 1 | 11 | **✅ Shipped** | [SEFAZ-RS](https://www.sefaz.rs.gov.br/) · [cad_RS](http://www.sintegra.gov.br/Cad_Estados/cad_RS.html) |
| **SC** | 9 | 1 | 11 | **✅ Shipped** | [SAT/SEF-SC](https://sat.sef.sc.gov.br/) · [cad_SC](http://www.sintegra.gov.br/Cad_Estados/cad_SC.html) |
| **SE** | 9 | 1 | 11 | **✅ Shipped** | [SEFAZ-SE](https://www.sefaz.se.gov.br/) · [cad_SE](http://www.sintegra.gov.br/Cad_Estados/cad_SE.html) |
| **TO** | 9/11 | 1 | 11 | **✅ Shipped** | [SEFAZ-TO](https://www.sefaz.to.gov.br/) · [cad_TO](http://www.sintegra.gov.br/Cad_Estados/cad_TO.html) |

> Digit counts reflect common SINTEGRA roteiros. Some states issue variable lengths by taxpayer class (e.g. SP rural `P…`). Verify against live SEFAZ before shipping each UF.

---

## Phase 8 v1 — algorithm summary (SP, MT, DF)

### São Paulo (SP)

| Field | Value |
|-------|-------|
| Golden | `110042490114` |
| Mask | `XXX.XXX.XXX.XXX` |
| Primary source | [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) |
| SINTEGRA mirror | [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) |
| Vector | `tests/vectors/ie.sp.official.json` |
| DV1 weights (pos 1–8) | `1, 3, 4, 5, 6, 7, 8, 10` |
| DV2 weights (pos 1–11) | `3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2` |
| Remainder rule | `R = sum % 11`; DV = rightmost digit of `R`; if `R = 10` → DV = `0` |

### Mato Grosso (MT)

| Field | Value |
|-------|-------|
| Golden (legacy) | `00130000019` |
| Golden (canonical) | `130000019` |
| Canonical | `13` + 6 sequential + DV (9 digits) |
| Legacy pad | 11 digits, zero-fill left |
| Primary source | [SEFAZ-MT Portaria Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) |
| SINTEGRA mirror | [cad_MT.html](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html) |
| Vector | `tests/vectors/ie.mt.official.json` |
| Weights (pos 1–10) | `3, 2, 9, 8, 7, 6, 5, 4, 3, 2` |
| Remainder rule | `R = sum % 11`; if `R ≤ 1` → DV = `0`; else DV = `11 − R` |

### Distrito Federal (DF)

| Field | Value |
|-------|-------|
| Golden | `0730000100109` |
| Mask | `073.XXXXX.XXX-XX` |
| Prefix | `07` (fixed) |
| Primary source | [Receita Fazenda DF](https://www.receita.fazenda.df.gov.br/) |
| SINTEGRA mirror | [cad_DF.html](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) |
| Vector | `tests/vectors/ie.df.official.json` |
| DV1 weights (pos 1–11) | `4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2` |
| DV2 weights | `5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2` (+ DV1×2) |
| Remainder rule | if `R ≤ 1` → DV = `0`; else DV = `11 − R` |

---

## Known cross-system pitfalls

| Topic | Detail |
|-------|--------|
| DF 12 vs 13 digits | Legacy SINTEGRA validators (Convênio 57/95) expected 12 digits; CF/DF today uses **13**. Prefer 13-digit validation. |
| MT 9 vs 11 digits | CCE/MT Art. 6º defines 9-digit IDs; file-transfer tools still zero-pad to 11. |
| SP rural IE | `P0MMMSSSSD000` (13 chars) — separate from industrial/commercial 12-digit rule. |
| SINTEGRA discontinuation | Algorithm pages may return 403; mirror content in phase `OFFICIAL-REFERENCE.md` + golden vectors. |

---

## Verification protocol (per UF)

1. Cite primary SEFAZ URL in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).
2. Add golden vector in `tests/vectors/ie.{uf}.official.json` from official walkthrough or worked example.
3. Implement validator **before** expanding to next UF.
4. Cross-check with independent open-source implementation only after primary source satisfied.

---

## References

- Official sources (all UFs): [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs)
- Phase 8 v1 archive: `.local/phases/08-inscricao-estadual/README.md`
- Phase 8b archive: `.local/phases/08b-inscricao-estadual-remaining-ufs/SHIPPED-v0.10.md`
- Glossary: [GLOSSARY.md](GLOSSARY.md#inscrição-estadual-ie)
