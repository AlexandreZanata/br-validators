import {
  convertCodigoBarrasToLinhaDigitavel,
  convertLinhaToCodigoBarras,
  convertPlacaToMercosul,
  detectBoletoInputKind,
  detectCardBrand,
  detectEanFormat,
  detectPixKeyType,
  detectPlacaFormat,
  formatBoleto,
  formatCartaoCredito,
  formatEan,
  formatCep,
  formatCnh,
  formatCnpj,
  formatCpf,
  formatInscricaoEstadual,
  formatNfeChave,
  formatProcessoJudicial,
  formatNit,
  formatPisPasep,
  formatPlaca,
  formatRenavam,
  formatRg,
  formatTelefone,
  formatTituloEleitor,
  formatPixKey,
  isSpRuralIeInput,
  parseBrCode,
  sanitize,
  stripCartaoCredito,
  stripEan,
  stripCep,
  stripCnh,
  stripCnpj,
  stripCpf,
  stripInscricaoEstadual,
  stripNfeChave,
  stripProcessoJudicial,
  stripNit,
  stripPisPasep,
  stripPlaca,
  stripRenavam,
  stripRg,
  stripTelefone,
  stripTituloEleitor,
  validateBoleto,
  validateBrCode,
  validateCartaoCredito,
  validateEan,
  validateCep,
  validateCnh,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validateIeProdutorRural,
  validateNfeChave,
  validateProcessoJudicial,
  validateNit,
  validatePisPasep,
  validatePlaca,
  validatePixKey,
  validateRenavam,
  validateRg,
  validateTelefone,
  validateTituloEleitor,
  isRgUfImplemented,
  type SanitizeResult,
  type RgUfCode,
  type UfCode,
} from '@br-validators/core';
import type { DocumentSlug } from './nav';

export type DocumentResults = {
  stripped: string;
  validationLabel: string;
  validationDetail: string;
  formattedLabel: string;
  formattedValue: string;
  sanitizeResult: SanitizeResult | null;
  extraRows: { label: string; value: string; mono?: boolean }[];
};

function resolveRgUf(uf: UfCode): RgUfCode {
  if (isRgUfImplemented(uf)) {
    return uf;
  }
  return 'SP';
}

function runSanitize(slug: DocumentSlug, input: string, uf: UfCode): SanitizeResult | null {
  switch (slug) {
    case 'cpf':
      return sanitize(input, 'cpf');
    case 'cnpj':
      return sanitize(input, 'cnpj');
    case 'cep':
      return sanitize(input, 'cep');
    case 'telefone':
      return sanitize(input, 'telefone');
    case 'placa':
      return sanitize(input, 'placa');
    case 'pis':
      return sanitize(input, 'pis-pasep');
    case 'cnh':
      return sanitize(input, 'cnh');
    case 'renavam':
      return sanitize(input, 'renavam');
    case 'titulo-eleitor':
      return sanitize(input, 'titulo-eleitor');
    case 'processo-judicial':
      return sanitize(input, 'processo-judicial');
    case 'rg':
      return sanitize(input, 'rg', { uf: resolveRgUf(uf) });
    case 'nfe-chave':
      return sanitize(input, 'nfe-chave');
    case 'boleto':
      return sanitize(input, 'boleto');
    case 'cartao':
      return sanitize(input, 'cartao-credito');
    case 'ean':
      return sanitize(input, 'ean');
    case 'ie':
      return sanitize(input, 'inscricao-estadual', { uf });
    default:
      return null;
  }
}

export function computeDocumentResults(
  slug: DocumentSlug,
  input: string,
  uf: UfCode = 'SP',
): DocumentResults | null {
  if (!input) return null;

  const extraRows: DocumentResults['extraRows'] = [];
  let stripped = '';
  let validationLabel = 'Valid';
  let validationDetail = '—';
  let formattedLabel = 'Format';
  let formattedValue = '—';
  let sanitizeResult: SanitizeResult | null = null;

  const sanitizer = runSanitize(slug, input, uf);
  sanitizeResult = sanitizer;

  switch (slug) {
    case 'cpf': {
      stripped = stripCpf(input);
      const validation = validateCpf(input);
      const formatted = formatCpf(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      break;
    }
    case 'cnpj': {
      stripped = stripCnpj(input);
      const validation = validateCnpj(input);
      const formatted = formatCnpj(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      break;
    }
    case 'cep': {
      stripped = stripCep(input);
      const validation = validateCep(input);
      const formatted = formatCep(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      break;
    }
    case 'telefone': {
      stripped = stripTelefone(input);
      const validation = validateTelefone(input);
      const formatted = formatTelefone(input);
      validationDetail = validation.ok ? `yes (${validation.tipo})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) extraRows.push({ label: 'Tipo', value: validation.tipo });
      break;
    }
    case 'placa': {
      stripped = stripPlaca(input);
      const detected = detectPlacaFormat(input);
      const validation = validatePlaca(input);
      const formatted = formatPlaca(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      extraRows.push({ label: 'Detected', value: detected !== 'unknown' ? detected : '—' });
      if (detected === 'legacy') {
        const converted = convertPlacaToMercosul(input);
        extraRows.push({
          label: '→ Mercosul',
          value: converted.ok ? converted.formatted : converted.message,
        });
      }
      break;
    }
    case 'pis': {
      stripped = stripPisPasep(input);
      const validation = validatePisPasep(input);
      const formatted = formatPisPasep(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      break;
    }
    case 'cnis': {
      stripped = stripNit(input);
      const validation = validateNit(input);
      const formatted = formatNit(input);
      validationDetail = validation.ok
        ? `yes — issuer ${validation.issuer} / tipo ${validation.tipo}`
        : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) {
        extraRows.push({ label: 'Issuer', value: validation.issuer });
        extraRows.push({ label: 'Tipo', value: validation.tipo });
      }
      break;
    }
    case 'cnh': {
      stripped = stripCnh(input);
      const validation = validateCnh(input);
      const formatted = formatCnh(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) extraRows.push({ label: 'Canonical', value: validation.value, mono: true });
      break;
    }
    case 'renavam': {
      stripped = stripRenavam(input);
      const validation = validateRenavam(input);
      const formatted = formatRenavam(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) extraRows.push({ label: 'Canonical', value: validation.value, mono: true });
      break;
    }
    case 'titulo-eleitor': {
      stripped = stripTituloEleitor(input);
      const validation = validateTituloEleitor(input);
      const formatted = formatTituloEleitor(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
  if (validation.ok && 'ufCode' in validation) {
        extraRows.push({ label: 'UF code', value: String(validation.ufCode) });
      }
      break;
    }
    case 'processo-judicial': {
      stripped = stripProcessoJudicial(input);
      const validation = validateProcessoJudicial(input);
      const formatted = formatProcessoJudicial(input);
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) {
        for (const [key, value] of Object.entries(validation.segments)) {
          extraRows.push({ label: key, value, mono: true });
        }
      }
      break;
    }
    case 'rg': {
      const rgUf = resolveRgUf(uf);
      stripped = stripRg(input, { uf: rgUf });
      const validation = validateRg(input, { uf: rgUf });
      const formatted = formatRg(input, { uf: rgUf });
      validationDetail = validation.ok
        ? `yes (${validation.uf}, checkDigit: ${validation.checkDigitValidated ? 'yes' : 'no'})`
        : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) {
        extraRows.push({ label: 'UF', value: validation.uf });
        extraRows.push({ label: 'Value', value: validation.value, mono: true });
      }
      break;
    }
    case 'nfe-chave': {
      stripped = stripNfeChave(input);
      const validation = validateNfeChave(input);
      const formatted = formatNfeChave(input);
      validationDetail = validation.ok ? 'yes' : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (validation.ok) {
        for (const [key, value] of Object.entries(validation.parsed)) {
          extraRows.push({ label: key, value, mono: true });
        }
      }
      break;
    }
    case 'ie': {
      stripped = stripInscricaoEstadual(input);
      const rural = isSpRuralIeInput(input);
      const validation = rural
        ? validateIeProdutorRural('SP', input)
        : validateInscricaoEstadual(input, { uf });
      const formatted = formatInscricaoEstadual(input, { uf });
      validationDetail = validation.ok
        ? rural
          ? 'yes (SP produtor rural)'
          : `yes (${'uf' in validation ? validation.uf : uf})`
        : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      if (rural) extraRows.push({ label: 'Kind', value: 'SP produtor rural' });
      if (validation.ok && 'value' in validation) {
        extraRows.push({ label: 'Value', value: validation.value, mono: true });
      }
      break;
    }
    case 'pix': {
      const detected = detectPixKeyType(input);
      const validation = validatePixKey(input);
      const formatted = formatPixKey(input);
      validationDetail = validation.ok ? `yes (${validation.keyType})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      extraRows.push({ label: 'Detect', value: detected });
      if (validation.ok) extraRows.push({ label: 'Value', value: validation.value, mono: true });
      break;
    }
    case 'brcode': {
      const parsed = parseBrCode(input);
      const validated = validateBrCode(input);
      validationLabel = 'Validate';
      validationDetail = validated.ok ? 'ok (static key)' : `no — ${validated.code}`;
      formattedLabel = 'Parse';
      formattedValue = parsed.ok ? 'ok' : `no — ${parsed.code}`;
      if (parsed.ok) {
        extraRows.push(
          { label: 'Merchant', value: parsed.merchantName },
          { label: 'City', value: parsed.merchantCity },
          { label: 'Amount', value: parsed.amount ?? '—' },
          { label: 'TXID', value: parsed.txid ?? '—' },
          {
            label: 'PIX key',
            value: parsed.pixKey ?? parsed.pixInitiationUrl ?? '—',
            mono: true,
          },
          { label: 'Key type', value: parsed.pixKeyType ?? 'url' },
        );
      }
      break;
    }
    case 'boleto': {
      const detected = detectBoletoInputKind(input);
      const validation = validateBoleto(input);
      const formatted = formatBoleto(input);
      validationDetail = validation.ok ? `yes (${validation.inputKind})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      extraRows.push({ label: 'Detect', value: detected });
      if (validation.ok) {
        extraRows.push({ label: 'Value', value: validation.value, mono: true });
        if (validation.format === 'arrecadacao') {
          extraRows.push(
            { label: 'Segment', value: validation.segment },
            { label: 'Value type', value: validation.valueType },
          );
        } else {
          extraRows.push({ label: 'Situação', value: validation.situacao });
          const converted =
            validation.inputKind === 'linha-digitavel'
              ? convertLinhaToCodigoBarras(input)
              : convertCodigoBarrasToLinhaDigitavel(input);
          extraRows.push({
            label: 'Converted',
            value: converted.ok ? `${converted.inputKind}: ${converted.value}` : '—',
            mono: true,
          });
        }
      }
      break;
    }
    case 'cartao': {
      stripped = stripCartaoCredito(input);
      const validation = validateCartaoCredito(input);
      const formatted = formatCartaoCredito(input);
      const brand = stripped ? detectCardBrand(stripped) : null;
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      extraRows.push({ label: 'Brand', value: brand ?? '—' });
      break;
    }
    case 'ean': {
      stripped = stripEan(input);
      const validation = validateEan(input);
      const formatted = formatEan(input);
      const detected = stripped ? detectEanFormat(stripped) : null;
      validationDetail = validation.ok ? `yes (${validation.format})` : `no — ${validation.code}`;
      formattedValue = formatted.ok ? formatted.formatted : formatted.message;
      extraRows.push({ label: 'Format', value: detected ?? '—' });
      break;
    }
    default:
      return null;
  }

  return {
    stripped,
    validationLabel,
    validationDetail,
    formattedLabel,
    formattedValue,
    sanitizeResult,
    extraRows,
  };
}

export function buildCliCommand(
  slug: DocumentSlug,
  tab: string,
  input: string,
  stripped: string,
  uf: UfCode,
): string {
  const meta = {
    cpf: 'cpf',
    cnpj: 'cnpj',
    cep: 'cep',
    telefone: 'telefone',
    placa: 'placa',
    pis: 'pis-pasep',
    cnis: 'cnis',
    cnh: 'cnh',
    renavam: 'renavam',
    'titulo-eleitor': 'titulo-eleitor',
    'processo-judicial': 'processo-judicial',
    rg: 'rg',
    'nfe-chave': 'nfe-chave',
    ie: 'ie',
    pix: 'pix',
    brcode: 'brcode',
    boleto: 'boleto',
    cartao: 'cartao-credito',
    ean: 'ean',
  } as const;

  const cliSlug = meta[slug];
  const quoted = input.includes(' ') ? `"${input}"` : input;
  const value = stripped || '<value>';

  switch (tab) {
    case 'sanitize':
      if (slug === 'ie') {
        return `br-validators sanitize ${quoted} --type inscricao-estadual --uf ${uf}`;
      }
      if (slug === 'rg') {
        return `br-validators sanitize ${quoted} --type rg --uf ${uf}`;
      }
      return `br-validators sanitize ${quoted} --type ${cliSlug}`;
    case 'format':
      if (slug === 'pix' || slug === 'boleto' || slug === 'brcode') {
        return `br-validators ${cliSlug} format ${quoted}`;
      }
      if (slug === 'rg') {
        return `br-validators rg format ${value} --uf ${uf}`;
      }
      return `br-validators ${cliSlug} format ${value}`;
    case 'strip':
      return slug === 'rg'
        ? `br-validators rg strip ${quoted} --uf ${uf}`
        : `br-validators ${cliSlug} strip ${quoted}`;
    default:
      if (slug === 'ie') return `br-validators ie validate ${value} --uf ${uf}`;
      if (slug === 'rg') return `br-validators rg validate ${value} --uf ${uf} --json`;
      if (slug === 'brcode') return `br-validators brcode parse ${quoted} --json`;
      if (slug === 'telefone') return `br-validators telefone validate ${quoted} --json`;
      if (slug === 'pix' || slug === 'boleto') return `br-validators ${cliSlug} validate ${quoted} --json`;
      return `br-validators ${cliSlug} validate ${value} --json`;
  }
}
