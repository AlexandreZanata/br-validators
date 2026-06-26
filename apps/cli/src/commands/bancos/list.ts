import { BANCOS_DATA_VERSION, getAllBancos, type Banco } from '@br-validators/core/bancos';
import { EXIT } from '../../constants.js';
import { formatBancoHuman } from './lookup.js';

export type BancosListOptions = {
  json: boolean;
  verbose: boolean;
  limit?: number;
};

function sliceBancos(limit?: number): readonly Banco[] {
  const all = getAllBancos();
  if (limit === undefined || !Number.isFinite(limit) || limit <= 0) {
    return all;
  }
  return all.slice(0, limit);
}

export function runBancosListCommand(
  options: BancosListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const bancos = sliceBancos(options.limit);

  if (options.json) {
    const payload: { ok: true; total: number; bancos: readonly Banco[]; capturadoEm?: string } = {
      ok: true,
      total: bancos.length,
      bancos,
    };
    if (options.verbose) {
      payload.capturadoEm = BANCOS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  for (const banco of bancos) {
    io.stdout.push(formatBancoHuman(banco));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${BANCOS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runBancosList(
  options: BancosListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  return runBancosListCommand(options, io);
}
