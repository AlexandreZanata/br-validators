import { readFileSync } from 'node:fs';
import { runBrCode, type BrCodeAction } from './commands/brcode.js';
import { runCep, type CepAction } from './commands/cep.js';
import { runTelefone, type TelefoneAction } from './commands/telefone.js';
import { runCnh, type CnhAction } from './commands/cnh.js';
import { runRenavam, type RenavamAction } from './commands/renavam.js';
import { runTituloEleitor, type TituloEleitorAction } from './commands/titulo-eleitor.js';
import { runCnpj, type CnpjAction } from './commands/cnpj.js';
import { runCpf, type CpfAction } from './commands/cpf.js';
import { runPlaca, type PlacaAction } from './commands/placa.js';
import { runPisPasep, type PisPasepAction } from './commands/pis-pasep.js';
import { runPix, type PixAction } from './commands/pix.js';
import { runBoleto, type BoletoAction, type BoletoConvertDirection } from './commands/boleto.js';
import { runCartao, type CartaoAction } from './commands/cartao.js';
import { runCartaoCredito, type CartaoCreditoAction } from './commands/cartao-credito.js';
import { runIe, type IeAction } from './commands/ie.js';
import { listSupportedTypes } from './commands/list.js';
import { EXIT } from './constants.js';

export type CnpjCliOptions = {
  json?: boolean;
  quiet?: boolean;
  source?: boolean;
  file?: string;
};

export type CpfCliOptions = CnpjCliOptions;

export type CepCliOptions = CnpjCliOptions;

export type TelefoneCliOptions = CnpjCliOptions;

export type CnhCliOptions = CnpjCliOptions;

export type RenavamCliOptions = CnpjCliOptions;

export type TituloEleitorCliOptions = CnpjCliOptions;

export type BrCodeCliOptions = CnpjCliOptions;

export type PlacaCliOptions = CnpjCliOptions;

export type PisPasepCliOptions = CnpjCliOptions;

export type PixCliOptions = CnpjCliOptions & {
  type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';
};

export type BoletoCliOptions = CnpjCliOptions & {
  kind?: 'linha-digitavel' | 'codigo-barras';
};

export type CartaoCliOptions = CnpjCliOptions;

export type CartaoCreditoCliOptions = CnpjCliOptions;

export type IeCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type CliIo = { stdout: string[]; stderr: string[] };

export function readInputFile(path: string, io: CliIo): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    io.stderr.push(`Cannot read file: ${path}`);
    return null;
  }
}

export function handleListCli(io: CliIo = { stdout: [], stderr: [] }): number {
  return listSupportedTypes(io);
}

export function handleCnpjCli(
  action: CnpjAction,
  value: string | undefined,
  opts: CnpjCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCnpj(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleCpfCli(
  action: CpfAction,
  value: string | undefined,
  opts: CpfCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCpf(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleCepCli(
  action: CepAction,
  value: string | undefined,
  opts: CepCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCep(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleTelefoneCli(
  action: TelefoneAction,
  value: string | undefined,
  opts: TelefoneCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runTelefone(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleCnhCli(
  action: CnhAction,
  value: string | undefined,
  opts: CnhCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCnh(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handlePlacaCli(
  action: PlacaAction,
  value: string | undefined,
  opts: PlacaCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runPlaca(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handlePisPasepCli(
  action: PisPasepAction,
  value: string | undefined,
  opts: PisPasepCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runPisPasep(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handlePixCli(
  action: PixAction,
  value: string | undefined,
  opts: PixCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runPix(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      type: opts.type,
      file: fileContent,
    },
    io,
  );
}

export function handleBoletoCli(
  action: BoletoAction,
  value: string | undefined,
  opts: BoletoCliOptions,
  direction?: BoletoConvertDirection,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runBoleto(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      kind: opts.kind,
      file: fileContent,
    },
    direction,
    io,
  );
}

export function handleCartaoCli(
  action: CartaoAction,
  value: string | undefined,
  opts: CartaoCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCartao(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleCartaoCreditoCli(
  action: CartaoCreditoAction,
  value: string | undefined,
  opts: CartaoCreditoCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCartaoCredito(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleRenavamCli(
  action: RenavamAction,
  value: string | undefined,
  opts: RenavamCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runRenavam(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleTituloEleitorCli(
  action: TituloEleitorAction,
  value: string | undefined,
  opts: TituloEleitorCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runTituloEleitor(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleBrCodeCli(
  action: BrCodeAction,
  value: string | undefined,
  opts: BrCodeCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runBrCode(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleIeCli(
  action: IeAction,
  value: string | undefined,
  opts: IeCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runIe(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      uf: opts.uf,
      file: fileContent,
    },
    io,
  );
}

export function writeCliIo(io: CliIo): void {
  for (const line of io.stdout) console.log(line);
  for (const line of io.stderr) console.error(line);
}
