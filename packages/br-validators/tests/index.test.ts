import { describe, expect, it } from 'vitest';
import * as root from '../src/index.js';
import * as cnpjEntry from '../src/cnpj.js';
import * as cpfEntry from '../src/cpf.js';
import * as cepEntry from '../src/cep.js';
import * as telefoneEntry from '../src/telefone.js';
import * as cnhEntry from '../src/cnh.js';
import * as renavamEntry from '../src/renavam.js';
import * as brcodeEntry from '../src/brcode.js';
import * as placaEntry from '../src/placa.js';
import * as pisPasepEntry from '../src/pis-pasep.js';
import * as pixEntry from '../src/pix.js';
import * as boletoEntry from '../src/boleto.js';
import * as cartaoCreditoEntry from '../src/cartao-credito.js';
import * as ibgeEntry from '../src/ibge.js';
import * as bancosEntry from '../src/bancos.js';
import * as aeroportosEntry from '../src/aeroportos.js';
import * as tseMunicipiosEntry from '../src/tse-municipios.js';
import * as moedasEntry from '../src/moedas.js';
import * as ptaxEntry from '../src/ptax.js';
import * as paisesBacenEntry from '../src/paises-bacen.js';
import * as incotermsEntry from '../src/incoterms.js';
import * as feriadosEntry from '../src/feriados.js';
import * as cnaesEntry from '../src/cnaes.js';
import * as cfopEntry from '../src/cfop.js';
import * as naturezaJuridicaEntry from '../src/natureza-juridica.js';
import * as nbsEntry from '../src/nbs.js';
import * as cestEntry from '../src/cest.js';
import * as cstEntry from '../src/cst.js';
import * as lc116Entry from '../src/lc116.js';
import * as esocialEntry from '../src/esocial.js';
import * as eanEntry from '../src/ean.js';
import * as ncmEntry from '../src/ncm.js';
import * as cboEntry from '../src/cbo.js';
import * as portosEntry from '../src/portos.js';
import * as anpCombustiveisEntry from '../src/anp-combustiveis.js';
import * as pncpReferenceEntry from '../src/pncp-reference.js';
import * as transparenciaSnapshotsEntry from '../src/transparencia-snapshots.js';
import * as dataCatalogEntry from '../src/data-catalog.js';

describe('package exports', () => {
  it('re-exports CNPJ API from index', () => {
    expect(root.validateCnpj).toBeTypeOf('function');
    expect(root.stripCnpj).toBeTypeOf('function');
    expect(root.formatCnpj).toBeTypeOf('function');
  });

  it('re-exports CPF API from index', () => {
    expect(root.validateCpf).toBeTypeOf('function');
    expect(root.stripCpf).toBeTypeOf('function');
    expect(root.formatCpf).toBeTypeOf('function');
  });

  it('re-exports CEP API from index', () => {
    expect(root.validateCep).toBeTypeOf('function');
    expect(root.stripCep).toBeTypeOf('function');
    expect(root.formatCep).toBeTypeOf('function');
  });

  it('re-exports Telefone API from index', () => {
    expect(root.validateTelefone).toBeTypeOf('function');
    expect(root.stripTelefone).toBeTypeOf('function');
    expect(root.formatTelefone).toBeTypeOf('function');
  });

  it('re-exports CNH API from index', () => {
    expect(root.validateCnh).toBeTypeOf('function');
    expect(root.stripCnh).toBeTypeOf('function');
    expect(root.formatCnh).toBeTypeOf('function');
  });

  it('re-exports RENAVAM API from index', () => {
    expect(root.validateRenavam).toBeTypeOf('function');
    expect(root.stripRenavam).toBeTypeOf('function');
    expect(root.formatRenavam).toBeTypeOf('function');
  });

  it('re-exports BR Code API from index', () => {
    expect(root.parseBrCode).toBeTypeOf('function');
    expect(root.validateBrCode).toBeTypeOf('function');
    expect(root.isValidBrCode).toBeTypeOf('function');
  });

  it('re-exports Placa API from index', () => {
    expect(root.validatePlaca).toBeTypeOf('function');
    expect(root.stripPlaca).toBeTypeOf('function');
    expect(root.formatPlaca).toBeTypeOf('function');
    expect(root.convertPlacaToMercosul).toBeTypeOf('function');
    expect(root.detectPlacaFormat).toBeTypeOf('function');
  });

  it('re-exports PIS/PASEP API from index', () => {
    expect(root.validatePisPasep).toBeTypeOf('function');
    expect(root.stripPisPasep).toBeTypeOf('function');
    expect(root.formatPisPasep).toBeTypeOf('function');
  });

  it('re-exports PIX API from index', () => {
    expect(root.validatePixKey).toBeTypeOf('function');
    expect(root.detectPixKeyType).toBeTypeOf('function');
    expect(root.isValidPixKey).toBeTypeOf('function');
  });

  it('re-exports Boleto API from index', () => {
    expect(root.validateBoleto).toBeTypeOf('function');
    expect(root.detectBoletoInputKind).toBeTypeOf('function');
    expect(root.isValidBoleto).toBeTypeOf('function');
    expect(root.convertLinhaToCodigoBarras).toBeTypeOf('function');
    expect(root.formatLinhaDigitavel).toBeTypeOf('function');
  });

  it('re-exports Credit card API from index', () => {
    expect(root.validateCartaoCredito).toBeTypeOf('function');
    expect(root.isValidLuhn).toBeTypeOf('function');
    expect(root.detectCardBrand).toBeTypeOf('function');
    expect(root.stripCartaoCredito).toBeTypeOf('function');
    expect(root.formatCartaoCredito).toBeTypeOf('function');
  });

  it('re-exports format pipeline from index', () => {
    expect(root.formatDocument).toBeTypeOf('function');
    expect(root.formatPixKey).toBeTypeOf('function');
    expect(root.formatBoleto).toBeTypeOf('function');
    expect(root.isFormattableDocumentType('cpf')).toBe(true);
  });

  it('re-exports mask pipeline from index', () => {
    expect(root.mask).toBeTypeOf('function');
    expect(root.maskRuntime).toBeTypeOf('function');
    expect(root.isMaskableDocumentType('telefone')).toBe(true);
    expect(root.MASKABLE_DOCUMENT_TYPES).toContain('cpf');
  });

  it('re-exports compare, batch, diff from index', () => {
    expect(root.compare).toBeTypeOf('function');
    expect(root.compareRuntime).toBeTypeOf('function');
    expect(root.batch).toBeTypeOf('function');
    expect(root.diff).toBeTypeOf('function');
  });

  it('re-exports CNPJ API from cnpj entry', () => {
    expect(cnpjEntry.validateCnpj).toBe(root.validateCnpj);
  });

  it('re-exports CPF API from cpf entry', () => {
    expect(cpfEntry.validateCpf).toBe(root.validateCpf);
  });

  it('re-exports CEP API from cep entry', () => {
    expect(cepEntry.validateCep).toBe(root.validateCep);
    expect(cepEntry.getCepFaixaInfo).toBeTypeOf('function');
    expect(cepEntry.CEP_FAIXA_DATA_VERSION.id).toBe('cep-faixas');
  });

  it('re-exports Telefone API from telefone entry', () => {
    expect(telefoneEntry.validateTelefone).toBe(root.validateTelefone);
    expect(telefoneEntry.getDddInfo).toBeTypeOf('function');
  });

  it('re-exports CNH API from cnh entry', () => {
    expect(cnhEntry.validateCnh).toBe(root.validateCnh);
  });

  it('re-exports RENAVAM API from renavam entry', () => {
    expect(renavamEntry.validateRenavam).toBe(root.validateRenavam);
  });

  it('re-exports BR Code API from brcode entry', () => {
    expect(brcodeEntry.parseBrCode).toBe(root.parseBrCode);
    expect(brcodeEntry.validateBrCode).toBe(root.validateBrCode);
    expect(brcodeEntry.buildStaticPixBrCode).toBe(root.buildStaticPixBrCode);
  });

  it('re-exports Placa API from placa entry', () => {
    expect(placaEntry.validatePlaca).toBe(root.validatePlaca);
  });

  it('re-exports PIS/PASEP API from pis-pasep entry', () => {
    expect(pisPasepEntry.validatePisPasep).toBe(root.validatePisPasep);
  });

  it('re-exports PIX API from pix entry', () => {
    expect(pixEntry.validatePixKey).toBe(root.validatePixKey);
    expect(pixEntry.detectPixKeyType).toBe(root.detectPixKeyType);
    expect(pixEntry.isValidPixKey).toBe(root.isValidPixKey);
  });

  it('re-exports Boleto API from boleto entry', () => {
    expect(boletoEntry.validateBoleto).toBe(root.validateBoleto);
    expect(boletoEntry.detectBoletoInputKind).toBe(root.detectBoletoInputKind);
    expect(boletoEntry.isValidBoleto).toBe(root.isValidBoleto);
  });

  it('re-exports Credit card API from cartao-credito entry', () => {
    expect(cartaoCreditoEntry.validateCartaoCredito).toBe(root.validateCartaoCredito);
    expect(cartaoCreditoEntry.detectCardBrand).toBe(root.detectCardBrand);
    expect(cartaoCreditoEntry.isValidLuhn).toBe(root.isValidLuhn);
  });

  it('re-exports IBGE API from ibge entry', () => {
    expect(ibgeEntry.getEstados).toBeTypeOf('function');
    expect(ibgeEntry.getMunicipios).toBeTypeOf('function');
    expect(ibgeEntry.getMunicipioPorCodigo).toBeTypeOf('function');
    expect(ibgeEntry.IBGE_DATA_VERSION.id).toBe('ibge');
  });

  it('re-exports Bancos API from bancos entry', () => {
    expect(bancosEntry.getBancos).toBeTypeOf('function');
    expect(bancosEntry.getBancoPorCodigo).toBeTypeOf('function');
    expect(bancosEntry.getBancoPorIspb).toBeTypeOf('function');
    expect(bancosEntry.BANCOS_DATA_VERSION.id).toBe('bancos');
  });

  it('re-exports Aeroportos API from aeroportos entry', () => {
    expect(aeroportosEntry.getAeroportos).toBeTypeOf('function');
    expect(aeroportosEntry.getAeroportoPorIata).toBeTypeOf('function');
    expect(aeroportosEntry.getAeroportoPorIcao).toBeTypeOf('function');
    expect(aeroportosEntry.getAeroportosPorMunicipio).toBeTypeOf('function');
    expect(aeroportosEntry.AEROPORTOS_DATA_VERSION.id).toBe('aeroportos');
  });

  it('re-exports TSE municipios API from tse-municipios entry', () => {
    expect(tseMunicipiosEntry.getMapeamentoTseIbge).toBeTypeOf('function');
    expect(tseMunicipiosEntry.getMunicipioIbgePorCodigoTse).toBeTypeOf('function');
    expect(tseMunicipiosEntry.getCodigosTsePorMunicipio).toBeTypeOf('function');
    expect(tseMunicipiosEntry.TSE_MUNICIPIOS_DATA_VERSION.id).toBe('tse-municipios');
  });

  it('re-exports Moedas API from moedas entry', () => {
    expect(moedasEntry.getMoedas).toBeTypeOf('function');
    expect(moedasEntry.getMoedaPorCodigo).toBeTypeOf('function');
    expect(moedasEntry.searchMoedas).toBeTypeOf('function');
    expect(moedasEntry.MOEDAS_DATA_VERSION.id).toBe('moedas');
  });

  it('re-exports PTAX API from ptax entry', () => {
    expect(ptaxEntry.getPtaxCotacao).toBeTypeOf('function');
    expect(ptaxEntry.getPtaxUltimoDiaUtil).toBeTypeOf('function');
    expect(ptaxEntry.getPtaxCotacoesPorMoeda).toBeTypeOf('function');
    expect(ptaxEntry.PTAX_DATA_VERSION.id).toBe('ptax');
  });

  it('re-exports Paises Bacen API from paises-bacen entry', () => {
    expect(paisesBacenEntry.getPaisesBacen).toBeTypeOf('function');
    expect(paisesBacenEntry.getPaisPorCodigoBacen).toBeTypeOf('function');
    expect(paisesBacenEntry.PAISES_BACEN_DATA_VERSION.id).toBe('paises-bacen');
  });

  it('re-exports Incoterms API from incoterms entry', () => {
    expect(incotermsEntry.getIncoterms).toBeTypeOf('function');
    expect(incotermsEntry.getIncotermPorCodigo).toBeTypeOf('function');
    expect(incotermsEntry.INCOTERMS_DATA_VERSION.id).toBe('incoterms');
  });

  it('re-exports Feriados API from feriados entry', () => {
    expect(feriadosEntry.isFeriadoNacional).toBeTypeOf('function');
    expect(feriadosEntry.getFeriadosNacionais).toBeTypeOf('function');
    expect(feriadosEntry.getProximoDiaUtil).toBeTypeOf('function');
    expect(feriadosEntry.FERIADOS_DATA_VERSION.id).toBe('feriados');
  });

  it('re-exports CNAE API from cnaes entry', () => {
    expect(cnaesEntry.getCnaes).toBeTypeOf('function');
    expect(cnaesEntry.getCnaePorCodigo).toBeTypeOf('function');
    expect(cnaesEntry.searchCnaes).toBeTypeOf('function');
    expect(cnaesEntry.CNAES_DATA_VERSION.id).toBe('cnaes');
  });

  it('re-exports CFOP API from cfop entry', () => {
    expect(cfopEntry.getCfops).toBeTypeOf('function');
    expect(cfopEntry.getCfopPorCodigo).toBeTypeOf('function');
    expect(cfopEntry.searchCfop).toBeTypeOf('function');
    expect(cfopEntry.CFOP_DATA_VERSION.id).toBe('cfop');
  });

  it('re-exports Natureza juridica API from natureza-juridica entry', () => {
    expect(naturezaJuridicaEntry.getNaturezasJuridicas).toBeTypeOf('function');
    expect(naturezaJuridicaEntry.getNaturezaJuridicaPorCodigo).toBeTypeOf('function');
    expect(naturezaJuridicaEntry.NATUREZA_JURIDICA_DATA_VERSION.id).toBe('natureza-juridica');
  });

  it('re-exports NBS API from nbs entry', () => {
    expect(nbsEntry.getNbsList).toBeTypeOf('function');
    expect(nbsEntry.getNbsPorCodigo).toBeTypeOf('function');
    expect(nbsEntry.searchNbs).toBeTypeOf('function');
    expect(nbsEntry.NBS_DATA_VERSION.id).toBe('nbs');
  });

  it('re-exports CEST API from cest entry', () => {
    expect(cestEntry.getCests).toBeTypeOf('function');
    expect(cestEntry.getCestPorCodigo).toBeTypeOf('function');
    expect(cestEntry.getCestPorNcm).toBeTypeOf('function');
    expect(cestEntry.searchCest).toBeTypeOf('function');
    expect(cestEntry.CEST_DATA_VERSION.id).toBe('cest');
  });

  it('re-exports CST API from cst entry', () => {
    expect(cstEntry.getCstIcmsPorCodigo).toBeTypeOf('function');
    expect(cstEntry.getCstIpiPorCodigo).toBeTypeOf('function');
    expect(cstEntry.getCstPisPorCodigo).toBeTypeOf('function');
    expect(cstEntry.getCstCofinsPorCodigo).toBeTypeOf('function');
    expect(cstEntry.searchCstIcms).toBeTypeOf('function');
    expect(cstEntry.CST_DATA_VERSION.id).toBe('cst');
  });

  it('re-exports LC 116 API from lc116 entry', () => {
    expect(lc116Entry.getLc116List).toBeTypeOf('function');
    expect(lc116Entry.getLc116PorCodigo).toBeTypeOf('function');
    expect(lc116Entry.searchLc116).toBeTypeOf('function');
    expect(lc116Entry.LC116_DATA_VERSION.id).toBe('lc116');
  });

  it('re-exports eSocial API from esocial entry', () => {
    expect(esocialEntry.getEsocialCategorias).toBeTypeOf('function');
    expect(esocialEntry.getEsocialCategoriaPorCodigo).toBeTypeOf('function');
    expect(esocialEntry.searchEsocialCategorias).toBeTypeOf('function');
    expect(esocialEntry.ESOCIAL_DATA_VERSION.id).toBe('esocial');
  });

  it('re-exports EAN API from ean entry', () => {
    expect(eanEntry.validateEan).toBeTypeOf('function');
    expect(eanEntry.formatEan).toBeTypeOf('function');
    expect(eanEntry.stripEan).toBeTypeOf('function');
    expect(eanEntry.detectEanFormat).toBeTypeOf('function');
    expect(eanEntry.EAN_OFFICIAL_SOURCE_URL).toContain('gs1.org');
  });

  it('re-exports NCM API from ncm entry', () => {
    expect(ncmEntry.getNcms).toBeTypeOf('function');
    expect(ncmEntry.getNcmPorCodigo).toBeTypeOf('function');
    expect(ncmEntry.searchNcm).toBeTypeOf('function');
    expect(ncmEntry.NCM_DATA_VERSION.id).toBe('ncm');
  });

  it('re-exports CBO API from cbo entry', () => {
    expect(cboEntry.getCbos).toBeTypeOf('function');
    expect(cboEntry.getCboPorCodigo).toBeTypeOf('function');
    expect(cboEntry.searchCbo).toBeTypeOf('function');
    expect(cboEntry.CBO_DATA_VERSION.id).toBe('cbo');
  });

  it('re-exports Portos API from portos entry', () => {
    expect(portosEntry.getPortos).toBeTypeOf('function');
    expect(portosEntry.getPortoPorCodigo).toBeTypeOf('function');
    expect(portosEntry.getPortosPorMunicipio).toBeTypeOf('function');
    expect(portosEntry.searchPortos).toBeTypeOf('function');
    expect(portosEntry.PORTOS_DATA_VERSION.id).toBe('portos');
  });

  it('re-exports ANP combustíveis API from anp-combustiveis entry', () => {
    expect(anpCombustiveisEntry.getAnpPrecosMedios).toBeTypeOf('function');
    expect(anpCombustiveisEntry.getAnpPrecosMediosPorIbge).toBeTypeOf('function');
    expect(anpCombustiveisEntry.getAnpSemanaAtual).toBeTypeOf('function');
    expect(anpCombustiveisEntry.getAnpSemanasPesquisa).toBeTypeOf('function');
    expect(anpCombustiveisEntry.ANP_COMBUSTIVEIS_DATA_VERSION.id).toBe('anp-combustiveis');
  });

  it('re-exports PNCP reference API from pncp-reference entry', () => {
    expect(pncpReferenceEntry.getPncpModalidades).toBeTypeOf('function');
    expect(pncpReferenceEntry.getPncpModalidadePorId).toBeTypeOf('function');
    expect(pncpReferenceEntry.getPncpReferenceTable).toBeTypeOf('function');
    expect(pncpReferenceEntry.normalizePncpCnpj).toBeTypeOf('function');
    expect(pncpReferenceEntry.PNCP_REFERENCE_DATA_VERSION.id).toBe('pncp-reference');
  });

  it('re-exports Transparencia snapshots API from transparencia-snapshots entry', () => {
    expect(transparenciaSnapshotsEntry.getTransparenciaEndpoints).toBeTypeOf('function');
    expect(transparenciaSnapshotsEntry.getTransparenciaEndpointPorId).toBeTypeOf('function');
    expect(transparenciaSnapshotsEntry.getTransparenciaRegistry).toBeTypeOf('function');
    expect(transparenciaSnapshotsEntry.normalizeTransparenciaCpf).toBeTypeOf('function');
    expect(transparenciaSnapshotsEntry.normalizeTransparenciaCnpj).toBeTypeOf('function');
    expect(transparenciaSnapshotsEntry.TRANSPARENCIA_SNAPSHOTS_DATA_VERSION.id).toBe(
      'transparencia-snapshots',
    );
  });

  it('re-exports data catalog API from data-catalog entry', () => {
    expect(dataCatalogEntry.getDataCatalog).toBeTypeOf('function');
    expect(dataCatalogEntry.getDatasetMetadata).toBeTypeOf('function');
    expect(dataCatalogEntry.DATA_CATALOG_VERSION.totalDatasets).toBeGreaterThan(0);
  });
});
