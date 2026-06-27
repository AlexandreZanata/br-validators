import {
  getPtaxHistorico,
  PTAX_DATA_VERSION,
  type PtaxCotacaoResult,
} from '@br-validators/core/ptax';
import { EXIT } from '../../constants.js';

export type PtaxHistoricoCliOptions = {
  json: boolean;
  verbose: boolean;
};

export function formatPtaxHistoricoHuman(results: readonly PtaxCotacaoResult[]): string[] {
  return results.map(
    (cotacao) =>
      `${cotacao.dataReferencia} — compra ${String(cotacao.cotacaoCompra)} / venda ${String(cotacao.cotacaoVenda)}`,
  );
}

export function runPtaxHistoricoCommand(
  moeda: string,
  desde: string,
  ate: string,
  options: PtaxHistoricoCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmedMoeda = moeda.trim();
  const trimmedDesde = desde.trim();
  const trimmedAte = ate.trim();

  if (trimmedMoeda.length === 0) {
    io.stderr.push('Missing currency code. Pass a 3-letter ISO code (e.g. USD).');
    return EXIT.USAGE;
  }

  if (trimmedDesde.length === 0 || trimmedAte.length === 0) {
    io.stderr.push('Missing date range. Pass desde and ate as YYYY-MM-DD.');
    return EXIT.USAGE;
  }

  const results = getPtaxHistorico(trimmedMoeda, { desde: trimmedDesde, ate: trimmedAte });

  if (results.length === 0) {
    io.stderr.push(
      `No PTAX quotes in embed for ${trimmedMoeda} between ${trimmedDesde} and ${trimmedAte}`,
    );
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: {
      ok: true;
      moeda: string;
      desde: string;
      ate: string;
      total: number;
      cotacoes: readonly PtaxCotacaoResult[];
      capturadoEm?: string;
      janelaDiasUteis?: number;
    } = {
      ok: true,
      moeda: trimmedMoeda.toUpperCase(),
      desde: trimmedDesde,
      ate: trimmedAte,
      total: results.length,
      cotacoes: results,
    };
    if (options.verbose) {
      payload.capturadoEm = PTAX_DATA_VERSION.capturadoEm;
      payload.janelaDiasUteis = PTAX_DATA_VERSION.janelaDiasUteis;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(`${trimmedMoeda.toUpperCase()} PTAX historico (${String(results.length)} rows)`);
  for (const line of formatPtaxHistoricoHuman(results)) {
    io.stdout.push(line);
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${PTAX_DATA_VERSION.capturadoEm}`);
    io.stdout.push(`janelaDiasUteis: ${String(PTAX_DATA_VERSION.janelaDiasUteis)}`);
  }
  return EXIT.OK;
}

export function runPtaxHistorico(
  moeda: string | undefined,
  desde: string | undefined,
  ate: string | undefined,
  options: PtaxHistoricoCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!moeda?.trim()) {
    io.stderr.push('Missing currency code. Usage: ptax historico <moeda> <desde> <ate>');
    return EXIT.USAGE;
  }
  if (!desde?.trim() || !ate?.trim()) {
    io.stderr.push('Missing date range. Usage: ptax historico <moeda> <desde> <ate>');
    return EXIT.USAGE;
  }
  return runPtaxHistoricoCommand(moeda.trim(), desde.trim(), ate.trim(), options, io);
}
