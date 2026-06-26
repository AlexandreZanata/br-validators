import {
  getPtaxCotacao,
  PTAX_DATA_VERSION,
  type PtaxCotacaoResult,
} from '@br-validators/core/ptax';
import { EXIT } from '../../constants.js';

export type PtaxLookupCliOptions = {
  json: boolean;
  verbose: boolean;
};

export function formatPtaxCotacaoHuman(cotacao: PtaxCotacaoResult): string {
  return `${cotacao.moeda} Fechamento PTAX — compra ${String(cotacao.cotacaoCompra)} / venda ${String(cotacao.cotacaoVenda)} (${cotacao.dataReferencia})`;
}

export function runPtaxLookupCommand(
  moeda: string,
  data: string | undefined,
  options: PtaxLookupCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmedMoeda = moeda.trim();
  if (trimmedMoeda.length === 0) {
    io.stderr.push('Missing currency code. Pass a 3-letter ISO code (e.g. USD).');
    return EXIT.USAGE;
  }

  const cotacao =
    data === undefined || data.trim().length === 0
      ? getPtaxCotacao(trimmedMoeda)
      : getPtaxCotacao(trimmedMoeda, data.trim());

  if (cotacao === undefined) {
    io.stderr.push(`PTAX quote not found: ${trimmedMoeda}${data ? ` ${data}` : ''}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; cotacao: PtaxCotacaoResult; capturadoEm?: string } = {
      ok: true,
      cotacao,
    };
    if (options.verbose) {
      payload.capturadoEm = PTAX_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatPtaxCotacaoHuman(cotacao));
  if (options.verbose) {
    io.stdout.push(`dataReferencia: ${cotacao.dataReferencia}`);
    io.stdout.push(`isStale: ${String(cotacao.isStale)}`);
    if (cotacao.warning !== undefined) {
      io.stdout.push(`warning: ${cotacao.warning}`);
    }
    io.stdout.push(`capturadoEm: ${PTAX_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runPtaxLookup(
  moeda: string | undefined,
  data: string | undefined,
  options: PtaxLookupCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!moeda?.trim()) {
    io.stderr.push('Missing currency code. Usage: ptax lookup <moeda> [data]');
    return EXIT.USAGE;
  }
  return runPtaxLookupCommand(moeda.trim(), data?.trim(), options, io);
}
