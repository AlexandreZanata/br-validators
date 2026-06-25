import { EXIT } from './constants.js';
import { isReferenceLookupCommand, isReferenceSearchCommand } from './commands/reference-lookup/registry.js';
import {
  handleBoletoCli,
  handleBrCodeCli,
  handleCartaoCli,
  handleCartaoCreditoCli,
  handleEanCli,
  handleCepCli,
  handleCnhCli,
  handleCnpjCli,
  handleCpfCli,
  handleDetectCli,
  handleGenerateCli,
  handleIeCli,
  handleRgCli,
  handleBancosListCli,
  handleBancosLookupCli,
  handleReferenceLookupCli,
  handleReferenceSearchCli,
  handleIbgeLookupCli,
  handleIbgeListCli,
  handleFeriadosListCli,
  handleTseMunicipiosLookupCli,
  handleCepFaixaCli,
  handleDddLookupCli,
  handleListCli,
  handleNfeChaveCli,
  handleProcessoJudicialCli,
  handlePisPasepCli,
  handleCnisCli,
  handlePixCli,
  handlePlacaCli,
  handleRenavamCli,
  handleSanitizeCli,
  handleTelefoneCli,
  handleTituloEleitorCli,
  type BoletoCliOptions,
  type CnpjCliOptions,
  type GenerateCliOptions,
  type IeCliOptions,
  type PixCliOptions,
  type CliIo,
} from './handlers.js';
import type { BoletoConvertDirection } from './commands/boleto.js';

type CommonOpts = CnpjCliOptions;

export type ParsedArgv = {
  positionals: string[];
  opts: CommonOpts &
    PixCliOptions &
    BoletoCliOptions &
    IeCliOptions &
    GenerateCliOptions & { verbose?: boolean; limit?: number; year?: number };
};

const STANDARD_ACTIONS = ['validate', 'format', 'strip'] as const;
const NFE_ACTIONS = ['validate', 'parse', 'format', 'strip'] as const;
const PROCESSO_JUDICIAL_ACTIONS = ['validate', 'parse', 'format', 'strip'] as const;
const BRCODE_ACTIONS = ['parse', 'validate'] as const;
const PLACA_ACTIONS = ['validate', 'format', 'strip', 'convert'] as const;
const PIX_ACTIONS = ['detect', 'validate', 'format'] as const;
const BOLETO_CONVERT = ['linha-to-barras', 'barras-to-linha'] as const;

function usage(io: CliIo, message: string): number {
  io.stderr.push(message);
  return EXIT.USAGE;
}

export function parseArgv(tokens: string[]): ParsedArgv {
  const positionals: string[] = [];
  const opts: ParsedArgv['opts'] = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '--json') {
      opts.json = true;
      continue;
    }
    if (token === '-q' || token === '--quiet') {
      opts.quiet = true;
      continue;
    }
    if (token === '--source') {
      opts.source = true;
      continue;
    }
    if (token === '--masked') {
      opts.masked = true;
      continue;
    }
    if (token === '-f' || token === '--file') {
      opts.file = tokens[index + 1];
      index += 1;
      continue;
    }
    if (token === '--uf') {
      opts.uf = tokens[index + 1];
      index += 1;
      continue;
    }
    if (token === '--format') {
      opts.format = tokens[index + 1];
      index += 1;
      continue;
    }
    if (token === '--seed') {
      opts.seed = Number(tokens[index + 1]);
      index += 1;
      continue;
    }
    if (token === '--kind') {
      opts.kind = tokens[index + 1] as BoletoCliOptions['kind'];
      index += 1;
      continue;
    }
    if (token === '--type') {
      opts.type = tokens[index + 1] as PixCliOptions['type'];
      index += 1;
      continue;
    }
    if (token === '--verbose') {
      opts.verbose = true;
      continue;
    }
    if (token === '--limit') {
      opts.limit = Number(tokens[index + 1]);
      index += 1;
      continue;
    }
    if (token === '--year') {
      opts.year = Number(tokens[index + 1]);
      index += 1;
      continue;
    }
    if (token.startsWith('-')) {
      continue;
    }
    positionals.push(token);
  }

  return { positionals, opts };
}

function pickValue(rest: string[]): string | undefined {
  return rest.slice(1).join(' ') || undefined;
}

function dispatchStandard(
  rest: string[],
  opts: CommonOpts,
  io: CliIo,
  handler: (action: 'validate' | 'format' | 'strip', value: string | undefined, opts: CommonOpts, io: CliIo) => number,
): number {
  const action = rest[0];
  if (!action || !STANDARD_ACTIONS.includes(action as (typeof STANDARD_ACTIONS)[number])) {
    return usage(io, 'Expected action: validate | format | strip');
  }
  const value = rest.slice(1).join(' ') || undefined;
  return handler(action as 'validate' | 'format' | 'strip', value, opts, io);
}

export function dispatchArgv(tokens: string[], io: CliIo): number {
  if (tokens.length === 0 || tokens.includes('--help') || tokens.includes('-h')) {
    io.stdout.push('br-validators — 100% open-source Brazilian document validators');
    io.stdout.push('Usage: br-validators <command> ...');
    io.stdout.push('Commands: list · cpf · cnpj · cep · telefone · cnh · renavam · titulo-eleitor · processo-judicial · rg · nfe-chave · brcode · placa · pis-pasep · cnis · pix · boleto · cartao · cartao-credito · ean · ie · bancos · ibge · feriados · tse-municipios · ddd · natureza-juridica · nbs · cest · cnae · cfop · ncm · cbo · moedas · paises-bacen · incoterms · portos · aeroportos · detect · sanitize · generate');
    return EXIT.OK;
  }

  if (tokens.includes('--version') || tokens.includes('-V')) {
    io.stdout.push('0.12.0-alpha.1');
    return EXIT.OK;
  }

  const { positionals, opts } = parseArgv(tokens);
  const [root, ...rest] = positionals;

  if (!root) {
    return usage(io, 'Missing command');
  }

  switch (root) {
    case 'list':
      return handleListCli(io);
    case 'cnpj':
      return dispatchStandard(rest, opts, io, handleCnpjCli);
    case 'cpf':
      return dispatchStandard(rest, opts, io, handleCpfCli);
    case 'cep': {
      const action = rest[0];
      if (action === 'faixa') {
        const value = rest.slice(1).join(' ') || undefined;
        return handleCepFaixaCli(value, opts, io);
      }
      if (!action || !STANDARD_ACTIONS.includes(action as (typeof STANDARD_ACTIONS)[number])) {
        return usage(io, 'Expected action: validate | format | strip | faixa <prefix>');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handleCepCli(action as 'validate' | 'format' | 'strip', value, opts, io);
    }
    case 'telefone':
      return dispatchStandard(rest, opts, io, handleTelefoneCli);
    case 'cnh':
      return dispatchStandard(rest, opts, io, handleCnhCli);
    case 'renavam':
      return dispatchStandard(rest, opts, io, handleRenavamCli);
    case 'titulo-eleitor':
      return dispatchStandard(rest, opts, io, handleTituloEleitorCli);
    case 'processo-judicial': {
      const action = rest[0];
      if (!action || !PROCESSO_JUDICIAL_ACTIONS.includes(action as (typeof PROCESSO_JUDICIAL_ACTIONS)[number])) {
        return usage(io, 'Expected action: validate | parse | format | strip');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handleProcessoJudicialCli(
        action as 'validate' | 'parse' | 'format' | 'strip',
        value,
        opts,
        io,
      );
    }
    case 'nfe-chave': {
      const action = rest[0];
      if (!action || !NFE_ACTIONS.includes(action as (typeof NFE_ACTIONS)[number])) {
        return usage(io, 'Expected action: validate | parse | format | strip');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handleNfeChaveCli(action as 'validate' | 'parse' | 'format' | 'strip', value, opts, io);
    }
    case 'brcode': {
      const action = rest[0];
      if (!action || !BRCODE_ACTIONS.includes(action as (typeof BRCODE_ACTIONS)[number])) {
        return usage(io, 'Expected action: parse | validate');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handleBrCodeCli(action as 'parse' | 'validate', value, opts, io);
    }
    case 'placa': {
      const action = rest[0];
      if (!action || !PLACA_ACTIONS.includes(action as (typeof PLACA_ACTIONS)[number])) {
        return usage(io, 'Expected action: validate | format | strip | convert');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handlePlacaCli(action as 'validate' | 'format' | 'strip' | 'convert', value, opts, io);
    }
    case 'pis-pasep':
      return dispatchStandard(rest, opts, io, handlePisPasepCli);
    case 'cnis':
      return dispatchStandard(rest, opts, io, handleCnisCli);
    case 'pix': {
      const action = rest[0];
      if (!action || !PIX_ACTIONS.includes(action as (typeof PIX_ACTIONS)[number])) {
        return usage(io, 'Expected action: detect | validate | format');
      }
      const value = rest.slice(1).join(' ') || undefined;
      return handlePixCli(action as 'detect' | 'validate' | 'format', value, opts, io);
    }
    case 'boleto': {
      const action = rest[0];
      if (action === 'convert') {
        const direction = rest[1] as BoletoConvertDirection | undefined;
        if (!direction || !BOLETO_CONVERT.includes(direction)) {
          return usage(io, 'Expected: boleto convert linha-to-barras|barras-to-linha <value>');
        }
        const value = rest.slice(2).join(' ') || undefined;
        return handleBoletoCli('convert', value, opts, direction, io);
      }
      if (!action || !['detect', 'validate', 'format', 'strip'].includes(action)) {
        return usage(io, 'Expected action: detect | validate | format | strip | convert');
      }
      const value = pickValue(rest);
      return handleBoletoCli(
        action as 'detect' | 'validate' | 'format' | 'strip',
        value,
        opts,
        undefined,
        io,
      );
    }
    case 'cartao': {
      const action = rest[0];
      if (!action || !['detect', 'validate', 'format', 'strip'].includes(action)) {
        return usage(io, 'Expected action: detect | validate | format | strip');
      }
      const value = pickValue(rest);
      return handleCartaoCli(action as 'detect' | 'validate' | 'format' | 'strip', value, opts, io);
    }
    case 'cartao-credito':
      return dispatchStandard(rest, opts, io, handleCartaoCreditoCli);
    case 'ean': {
      const action = rest[0];
      if (!action || !['detect', 'validate', 'format', 'strip'].includes(action)) {
        return usage(io, 'Expected action: detect | validate | format | strip');
      }
      const value = pickValue(rest);
      return handleEanCli(action as 'detect' | 'validate' | 'format' | 'strip', value, opts, io);
    }
    case 'ie':
      return dispatchStandard(rest, opts, io, (action, value, ieOpts, ioArg) =>
        handleIeCli(action, value, ieOpts, ioArg),
      );
    case 'rg':
      return dispatchStandard(rest, opts, io, (action, value, rgOpts, ioArg) =>
        handleRgCli(action, value, rgOpts, ioArg),
      );
    case 'bancos': {
      const action = rest[0];
      if (action === 'lookup') {
        const value = rest.slice(1).join(' ') || undefined;
        return handleBancosLookupCli(value, opts, io);
      }
      if (action === 'list') {
        return handleBancosListCli(opts, io);
      }
      return usage(io, 'Expected: bancos lookup <codigo|ispb> | bancos list [--limit n]');
    }
    case 'ibge': {
      const action = rest[0];
      if (action === 'lookup') {
        const value = rest.slice(1).join(' ') || undefined;
        return handleIbgeLookupCli(value, opts, io);
      }
      if (action === 'list') {
        const target = rest[1];
        if (target === 'estados') {
          return handleIbgeListCli('estados', opts, io);
        }
        if (target === 'municipios') {
          return handleIbgeListCli('municipios', opts, io);
        }
        return usage(io, 'Expected: ibge list estados | ibge list municipios [--uf UF] [--limit n]');
      }
      return usage(io, 'Expected: ibge lookup <codigo> | ibge list estados | ibge list municipios');
    }
    case 'feriados': {
      const action = rest[0];
      if (action === 'list') {
        return handleFeriadosListCli(opts, io);
      }
      return usage(io, 'Expected: feriados list [--year YYYY]');
    }
    case 'tse-municipios': {
      const action = rest[0];
      if (action === 'lookup') {
        const value = rest.slice(1).join(' ') || undefined;
        return handleTseMunicipiosLookupCli(value, opts, io);
      }
      return usage(io, 'Expected: tse-municipios lookup <codigo-tse|codigo-ibge>');
    }
    case 'ddd': {
      const action = rest[0];
      if (action === 'lookup') {
        const value = rest.slice(1).join(' ') || undefined;
        return handleDddLookupCli(value, opts, io);
      }
      return usage(io, 'Expected: ddd lookup <code>');
    }
    case 'detect':
      return handleDetectCli(rest.join(' ') || undefined, opts, io);
    case 'sanitize':
      return handleSanitizeCli(rest[0] ?? '', rest.slice(1).join(' ') || undefined, opts, io);
    case 'generate':
      return handleGenerateCli(rest[0] ?? '', opts, io);
    default: {
      if (isReferenceLookupCommand(root)) {
        const action = rest[0];
        if (action === 'lookup') {
          const value = rest.slice(1).join(' ') || undefined;
          return handleReferenceLookupCli(root, value, opts, io);
        }
        if (action === 'search' && isReferenceSearchCommand(root)) {
          const value = rest.slice(1).join(' ') || undefined;
          return handleReferenceSearchCli(root, value, opts, io);
        }
        const searchHint = isReferenceSearchCommand(root) ? ' | search <query>' : '';
        return usage(io, `Expected: ${root} lookup <codigo>${searchHint}`);
      }
      return usage(io, `Unknown command: ${root}`);
    }
  }
}
