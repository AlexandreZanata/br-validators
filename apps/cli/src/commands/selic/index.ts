import {
  getSelicMeta,
  getSelicMetaPorData,
  SELIC_DATA_VERSION,
  type SelicMetaResult,
} from '@br-validators/core/selic';
import { EXIT } from '../../constants.js';

export type SelicCliOptions = {
  json: boolean;
  verbose: boolean;
  date?: string;
};

export function formatSelicMetaHuman(meta: SelicMetaResult): string {
  return `SELIC meta ${meta.dataReferencia} — ${String(meta.valor)}% a.a.`;
}

export function runSelicCommand(
  options: SelicCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const meta =
    options.date === undefined || options.date.trim().length === 0
      ? getSelicMeta()
      : getSelicMetaPorData(options.date.trim());

  if (meta === undefined) {
    io.stderr.push(
      options.date
        ? `SELIC meta not found for date ${options.date}`
        : 'SELIC meta series is empty',
    );
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: {
      ok: true;
      meta: SelicMetaResult;
      capturadoEm?: string;
    } = {
      ok: true,
      meta,
    };
    if (options.verbose) {
      payload.capturadoEm = SELIC_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatSelicMetaHuman(meta));
  if (options.verbose) {
    io.stdout.push(`dataReferencia: ${meta.dataReferencia}`);
    io.stdout.push(`isStale: ${String(meta.isStale)}`);
    if (meta.warning !== undefined) {
      io.stdout.push(`warning: ${meta.warning}`);
    }
    io.stdout.push(`capturadoEm: ${SELIC_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}
