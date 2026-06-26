/**
 * Synthetic document generation — test fixtures only (BR-GENERATE-001).
 * Reuses existing modulo 11 / Luhn compute helpers — never duplicates DV logic.
 * @see docs/VALIDATION-RULES.md
 */
import { computeCheckDigit } from '../core/cnpj/modulo11.js';
import { cnpjCharValue } from '../core/cnpj/ascii-value.js';
import { CNPJ_BASE_LENGTH, CNPJ_DV1_WEIGHTS, CNPJ_DV2_WEIGHTS } from '../core/cnpj/constants.js';
import { computeCnhCheckDigits } from '../core/cnh/check-digits.js';
import { CNH_BASE_LENGTH } from '../core/cnh/constants.js';
import { CPF_BASE_LENGTH, CPF_DV1_WEIGHTS, CPF_DV2_WEIGHTS } from '../core/cpf/constants.js';
import { PIS_PASEP_BASE_LENGTH, PIS_PASEP_DV_WEIGHTS } from '../core/pis-pasep/constants.js';
import { computeRenavamCheckDigit } from '../core/renavam/check-digits.js';
import { RENAVAM_BASE_LENGTH } from '../core/renavam/constants.js';
import { PLACA_LEGACY_PATTERN, PLACA_MERCOSUL_PATTERN } from '../core/placa/constants.js';
import { ANATEL_DDDS } from '../core/telefone/constants.js';
import { validateCep } from '../core/cep/index.js';
import { validatePlaca } from '../core/placa/index.js';
import { validateTelefone } from '../core/telefone/index.js';
import { applyMask } from './apply-mask.js';
import { generateBoletoValue } from './boleto.js';
import { applyArrecadacaoLinhaMask, generateBoletoArrecadacaoValue } from './boleto-arrecadacao.js';
import { generateBrcodeValue } from './brcode.js';
import { generateCartaoCreditoValue, type GeneratableCardBrand } from './cartao-credito.js';
import { assertCpfAlphanumericGenerateAllowed } from './cpf-alpha.js';
import { generateIeProdutorRuralValue } from './inscricao-estadual-produtor-rural.js';
import { generateInscricaoEstadualValue } from './inscricao-estadual.js';
import { generateNfeChaveValue } from './nfe-chave.js';
import { generatePixEvpValue } from './pix.js';
import { generateTituloEleitorValue } from './titulo-eleitor.js';
import { createRandomSource, hasRepeatedChars, type RandomSource } from './random.js';
import type { UfCode } from '../types/validation-result.js';
import { formatInscricaoEstadual } from '../core/inscricao-estadual/index.js';

export type GeneratableDocumentType =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'placa'
  | 'pis-pasep'
  | 'renavam'
  | 'cnh'
  | 'telefone'
  | 'cartao-credito'
  | 'inscricao-estadual'
  | 'titulo-eleitor'
  | 'pix'
  | 'nfe-chave'
  | 'brcode'
  | 'boleto'
  | 'boleto-arrecadacao'
  | 'inscricao-estadual-produtor-rural';

export type GenerateFormat =
  | 'numeric'
  | 'alphanumeric'
  | 'legacy'
  | 'mercosul'
  | 'celular'
  | 'fixo';

export type GenerateOptions = {
  format?: GenerateFormat;
  /** When true, return masked/formatted output. Ignored when `stripped: true`. */
  masked?: boolean;
  /** When true, return canonical stripped digits (explicit default). Wins over `masked`. */
  stripped?: boolean;
  seed?: number;
  uf?: UfCode;
  brand?: GeneratableCardBrand;
  /** Static BR Code — defaults to synthetic EVP key + test merchant fields. */
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: string;
  txid?: string;
};

/** @internal Output precedence: stripped wins over masked. */
export function shouldApplyGenerateMask(options: GenerateOptions): boolean {
  return options.masked === true && options.stripped !== true;
}

export type { GeneratableCardBrand } from './cartao-credito.js';
export {
  CPF_ALPHA_GENERATE_STUB,
  assertCpfAlphanumericGenerateAllowed,
  rejectCpfAlphanumericGenerate,
} from './cpf-alpha.js';
export { applyArrecadacaoLinhaMask } from './boleto-arrecadacao.js';

const CNPJ_ALNUM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ATTEMPTS = 50;

function digitValue(char: string): number {
  return Number(char);
}

function randomBaseDigits(rng: RandomSource, length: number): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const base = rng.digits(length);
    if (!hasRepeatedChars(base)) {
      return base;
    }
  }
  return '123456789'.slice(0, length).padEnd(length, '1');
}

function randomCnpjAlphanumericBase(rng: RandomSource): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let base = '';
    for (let i = 0; i < CNPJ_BASE_LENGTH; i++) {
      base += CNPJ_ALNUM_CHARS.charAt(rng.int(0, CNPJ_ALNUM_CHARS.length - 1));
    }
    if (!hasRepeatedChars(base)) {
      return base;
    }
  }
  return '12ABC34501DE';
}

function generateCpfValue(rng: RandomSource): string {
  const base = randomBaseDigits(rng, CPF_BASE_LENGTH);
  const dv1 = String(computeCheckDigit(base, CPF_DV1_WEIGHTS, digitValue));
  const dv2 = String(computeCheckDigit(base + dv1, CPF_DV2_WEIGHTS, digitValue));
  return base + dv1 + dv2;
}

function generateCnpjValue(rng: RandomSource, format: GenerateOptions['format']): string {
  if (format === 'alphanumeric') {
    const base = randomCnpjAlphanumericBase(rng);
    const dv1 = String(computeCheckDigit(base, CNPJ_DV1_WEIGHTS, cnpjCharValue));
    const dv2 = String(computeCheckDigit(base + dv1, CNPJ_DV2_WEIGHTS, cnpjCharValue));
    return base + dv1 + dv2;
  }
  const base = randomBaseDigits(rng, CNPJ_BASE_LENGTH);
  const dv1 = String(computeCheckDigit(base, CNPJ_DV1_WEIGHTS, digitValue));
  const dv2 = String(computeCheckDigit(base + dv1, CNPJ_DV2_WEIGHTS, digitValue));
  return base + dv1 + dv2;
}

function generateCepValue(rng: RandomSource): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const value = rng.digits(8);
    if (value !== '00000000' && validateCep(value).ok) {
      return value;
    }
  }
  return '01310100';
}

function generatePlacaValue(rng: RandomSource, format: GenerateOptions['format']): string {
  const mode = format === 'legacy' ? 'legacy' : 'mercosul';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const letters = rng.letter() + rng.letter() + rng.letter();
    let candidate: string;
    if (mode === 'legacy') {
      candidate = letters + rng.digits(4);
      if (!PLACA_LEGACY_PATTERN.test(candidate)) {
        continue;
      }
    } else {
      candidate =
        letters +
        rng.digit() +
        rng.pick(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) +
        rng.digits(2);
      if (!PLACA_MERCOSUL_PATTERN.test(candidate)) {
        continue;
      }
    }
    if (validatePlaca(candidate).ok) {
      return candidate;
    }
  }
  return mode === 'legacy' ? 'ABC1234' : 'ABC1D23';
}

function generatePisValue(rng: RandomSource): string {
  const base = randomBaseDigits(rng, PIS_PASEP_BASE_LENGTH);
  const dv = String(computeCheckDigit(base, PIS_PASEP_DV_WEIGHTS, digitValue));
  return base + dv;
}

function generateRenavamValue(rng: RandomSource): string {
  const base = randomBaseDigits(rng, RENAVAM_BASE_LENGTH);
  const dv = String(computeRenavamCheckDigit(base));
  return base + dv;
}

function generateCnhValue(rng: RandomSource): string {
  const base = randomBaseDigits(rng, CNH_BASE_LENGTH);
  return base + computeCnhCheckDigits(base);
}

function generateTelefoneValue(rng: RandomSource, format: GenerateOptions['format']): string {
  const ddd = rng.pick(ANATEL_DDDS);
  const useFixo = format === 'fixo';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const local = useFixo ? String(rng.int(2, 5)) + rng.digits(7) : `9${rng.digits(8)}`;
    const candidate = ddd + local;
    if (validateTelefone(candidate).ok) {
      return candidate;
    }
  }
  return useFixo ? '1133333333' : '11999999999';
}

function generateCartaoValue(rng: RandomSource, brand?: GeneratableCardBrand): string {
  return generateCartaoCreditoValue(rng, brand);
}

function applyInscricaoEstadualGenerateMask(value: string, uf: UfCode): string {
  const formatted = formatInscricaoEstadual(value, { uf });
  return formatted.ok ? formatted.formatted : value;
}

export function generate(type: GeneratableDocumentType, options: GenerateOptions = {}): string {
  const rng = createRandomSource(options.seed);
  let value: string;

  switch (type) {
    case 'cpf':
      if (options.format === 'alphanumeric') {
        assertCpfAlphanumericGenerateAllowed();
      }
      value = generateCpfValue(rng);
      break;
    case 'cnpj':
      value = generateCnpjValue(rng, options.format);
      break;
    case 'cep':
      value = generateCepValue(rng);
      break;
    case 'placa':
      value = generatePlacaValue(rng, options.format);
      break;
    case 'pis-pasep':
      value = generatePisValue(rng);
      break;
    case 'renavam':
      value = generateRenavamValue(rng);
      break;
    case 'cnh':
      value = generateCnhValue(rng);
      break;
    case 'telefone':
      value = generateTelefoneValue(rng, options.format);
      break;
    case 'cartao-credito':
      value = generateCartaoValue(rng, options.brand);
      break;
    case 'inscricao-estadual': {
      if (!options.uf) {
        throw new Error('UF is required for inscricao-estadual generation');
      }
      value = generateInscricaoEstadualValue(options.uf, rng);
      break;
    }
    case 'titulo-eleitor': {
      if (!options.uf) {
        throw new Error('UF is required for titulo-eleitor generation');
      }
      value = generateTituloEleitorValue(options.uf, rng);
      break;
    }
    case 'pix':
      value = generatePixEvpValue(rng);
      break;
    case 'nfe-chave':
      value = generateNfeChaveValue(rng);
      break;
    case 'brcode':
      value = generateBrcodeValue(rng, {
        pixKey: options.pixKey,
        merchantName: options.merchantName,
        merchantCity: options.merchantCity,
        amount: options.amount,
        txid: options.txid,
      });
      break;
    case 'boleto':
      value = generateBoletoValue(rng);
      break;
    case 'boleto-arrecadacao':
      value = generateBoletoArrecadacaoValue(rng);
      break;
    case 'inscricao-estadual-produtor-rural':
      value = generateIeProdutorRuralValue(rng);
      break;
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unsupported generatable type: ${String(_exhaustive)}`);
    }
  }

  if (shouldApplyGenerateMask(options) && type === 'inscricao-estadual') {
    return applyInscricaoEstadualGenerateMask(value, options.uf!);
  }

  if (shouldApplyGenerateMask(options) && type === 'boleto-arrecadacao') {
    return applyArrecadacaoLinhaMask(value);
  }

  return shouldApplyGenerateMask(options) ? applyMask(type, value) : value;
}

const repeatingRng: RandomSource = {
  next: () => 0,
  int: (min: number) => min,
  digit: () => '1',
  digits: (count: number) => '1'.repeat(count),
  letter: () => 'A',
  pick: <T>(items: readonly T[]) => items[0],
};

const zeroRng: RandomSource = {
  ...repeatingRng,
  digits: (count: number) => '0'.repeat(count),
};

/** Always fails placa pattern checks so fallback constants are returned. */
const exhaustPlacaLegacyRng: RandomSource = {
  ...repeatingRng,
  digits: (count: number) => '1'.repeat(Math.max(0, count - 1)),
};

const exhaustPlacaMercosulRng: RandomSource = {
  ...repeatingRng,
  digits: () => '1',
};

/** Always fails telefone validation so fallback constants are returned. */
const exhaustTelefoneRng: RandomSource = {
  ...repeatingRng,
  int: () => 0,
  digits: () => '0',
};

/** @internal Test hooks for generator fallback branches. */
export const __generateTesting = {
  randomBaseDigits: (length: number) => randomBaseDigits(repeatingRng, length),
  randomCnpjAlphanumericBase: () => randomCnpjAlphanumericBase(repeatingRng),
  generateCpfValue: () => generateCpfValue(repeatingRng),
  generateCnpjValue: (format?: GenerateOptions['format']) => generateCnpjValue(repeatingRng, format),
  generateCepValue: () => generateCepValue(zeroRng),
  generateCartaoValue: () => generateCartaoValue(repeatingRng),
  generateCartaoValueForBrand: (brand: GeneratableCardBrand) => generateCartaoValue(repeatingRng, brand),
  generatePlacaValue: (format?: GenerateOptions['format']) =>
    generatePlacaValue(format === 'legacy' ? exhaustPlacaLegacyRng : exhaustPlacaMercosulRng, format),
  generateTelefoneValue: (format?: GenerateOptions['format']) =>
    generateTelefoneValue(exhaustTelefoneRng, format),
  generatePisValue: () => generatePisValue(repeatingRng),
  generateRenavamValue: () => generateRenavamValue(repeatingRng),
  generateCnhValue: () => generateCnhValue(repeatingRng),
  generateInscricaoEstadualValue: (uf: UfCode) => generateInscricaoEstadualValue(uf, repeatingRng),
  generateTituloEleitorValue: (uf: UfCode) => generateTituloEleitorValue(uf, repeatingRng),
  generatePixEvpValue: () => generatePixEvpValue(repeatingRng),
  generateNfeChaveValue: () => generateNfeChaveValue(repeatingRng),
  generateBrcodeValue: () => generateBrcodeValue(repeatingRng),
  generateBoletoValue: () => generateBoletoValue(repeatingRng),
  generateBoletoArrecadacaoValue: () => generateBoletoArrecadacaoValue(repeatingRng),
  generateIeProdutorRuralValue: () => generateIeProdutorRuralValue(repeatingRng),
  applyArrecadacaoLinhaMask,
  applyInscricaoEstadualGenerateMask: (value: string, uf: UfCode) =>
    applyInscricaoEstadualGenerateMask(value, uf),
  touchAllRngMethods: () => {
    for (const rng of [repeatingRng, zeroRng, exhaustPlacaLegacyRng, exhaustPlacaMercosulRng, exhaustTelefoneRng]) {
      rng.next();
      rng.int(1, 2);
      rng.digit();
      rng.digits(3);
      rng.letter();
      rng.pick(['a']);
    }
  },
};
