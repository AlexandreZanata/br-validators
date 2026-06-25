export type CliIo = { stdout: string[]; stderr: string[] };

export function readInputFile(path: string, io: CliIo): string | null {
  try {
    // Lazy Node fs — avoids bundling fs in browser builds that alias node:fs to a stub.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- runtime-only in Node CLI
    const fsModule = require('node:fs') as typeof import('node:fs');
    return fsModule.readFileSync(path, 'utf8');
  } catch {
    io.stderr.push(`Cannot read file: ${path}`);
    return null;
  }
}

import { runBancosList } from './commands/bancos/list.js';
import { runBancosLookup } from './commands/bancos/lookup.js';
import { runReferenceLookup } from './commands/reference-lookup/lookup.js';
import { runReferenceSearch } from './commands/reference-lookup/search.js';
import { runIbgeLookup } from './commands/ibge/lookup.js';
import { runIbgeList } from './commands/ibge/list.js';
import { runFeriadosList } from './commands/feriados/list.js';
import { runTseMunicipiosLookup } from './commands/tse-municipios/lookup.js';
import { runCepFaixa } from './commands/cep/faixa.js';
import { runDddLookup } from './commands/ddd/lookup.js';
import { runBrCode, type BrCodeAction } from './commands/brcode.js';
import { runCep, type CepAction } from './commands/cep.js';
import { runTelefone, type TelefoneAction } from './commands/telefone.js';
import { runCnh, type CnhAction } from './commands/cnh.js';
import { runProcessoJudicial, type ProcessoJudicialAction } from './commands/processo-judicial.js';
import { runRg, type RgAction } from './commands/rg.js';
import { runRenavam, type RenavamAction } from './commands/renavam.js';
import { runTituloEleitor, type TituloEleitorAction } from './commands/titulo-eleitor.js';
import { runNfeChave, type NfeChaveAction } from './commands/nfe-chave.js';
import { runCnpj, type CnpjAction } from './commands/cnpj.js';
import { runCpf, type CpfAction } from './commands/cpf.js';
import { runPlaca, type PlacaAction } from './commands/placa.js';
import { runPisPasep, type PisPasepAction } from './commands/pis-pasep.js';
import { runCnis, type CnisAction } from './commands/cnis.js';
import { runPix, type PixAction } from './commands/pix.js';
import { runBoleto, type BoletoAction, type BoletoConvertDirection } from './commands/boleto.js';
import { runCartao, type CartaoAction } from './commands/cartao.js';
import { runCartaoCredito, type CartaoCreditoAction } from './commands/cartao-credito.js';
import { runEan, type EanAction } from './commands/ean.js';
import { runIe, type IeAction } from './commands/ie.js';
import { runDetect } from './commands/detect.js';
import { runSanitize } from './commands/sanitize.js';
import { runGenerate } from './commands/generate.js';
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

export type ProcessoJudicialCliOptions = CnpjCliOptions;

export type RgCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type RenavamCliOptions = CnpjCliOptions;

export type TituloEleitorCliOptions = CnpjCliOptions;

export type NfeChaveCliOptions = CnpjCliOptions;

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

export type EanCliOptions = CnpjCliOptions;

export type CnisCliOptions = CnpjCliOptions & {
  issuer?: 'inss' | 'caixa';
  tipo?: 'nit' | 'pis' | 'nis';
};

export type IeCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type DetectCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type SanitizeCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type GenerateCliOptions = {
  json?: boolean;
  quiet?: boolean;
  masked?: boolean;
  format?: string;
  seed?: number;
  uf?: string;
  brand?: string;
};

export type BancosLookupCliOptions = {
  json?: boolean;
  verbose?: boolean;
};

export type ReferenceLookupCliOptions = BancosLookupCliOptions;

export type BancosListCliOptions = BancosLookupCliOptions & {
  limit?: number;
};

export type ReferenceDatasetCliOptions = BancosLookupCliOptions & {
  limit?: number;
  uf?: string;
  year?: number;
};

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

export function handleCnisCli(
  action: CnisAction,
  value: string | undefined,
  opts: CnisCliOptions,
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

  return runCnis(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      issuer: opts.issuer,
      tipo: opts.tipo,
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

export function handleEanCli(
  action: EanAction,
  value: string | undefined,
  opts: EanCliOptions,
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

  return runEan(
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

export function handleProcessoJudicialCli(
  action: ProcessoJudicialAction,
  value: string | undefined,
  opts: ProcessoJudicialCliOptions,
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

  return runProcessoJudicial(
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

export function handleNfeChaveCli(
  action: NfeChaveAction,
  value: string | undefined,
  opts: NfeChaveCliOptions,
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

  return runNfeChave(
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

export function handleRgCli(
  action: RgAction,
  value: string | undefined,
  opts: RgCliOptions,
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

  return runRg(
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

export function handleDetectCli(
  value: string | undefined,
  opts: DetectCliOptions,
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

  return runDetect(
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      uf: opts.uf,
      file: fileContent,
    },
    io,
  );
}

export function handleSanitizeCli(
  type: string,
  value: string | undefined,
  opts: SanitizeCliOptions,
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

  return runSanitize(
    type,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      uf: opts.uf,
      file: fileContent,
    },
    io,
  );
}

export function handleGenerateCli(
  type: string,
  opts: GenerateCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runGenerate(
    type,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      masked: Boolean(opts.masked),
      format: opts.format,
      seed: opts.seed,
      uf: opts.uf,
      brand: opts.brand,
    },
    io,
  );
}

export function handleBancosLookupCli(
  value: string | undefined,
  opts: BancosLookupCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runBancosLookup(
    value,
    {
      json: Boolean(opts.json),
      verbose: Boolean(opts.verbose),
    },
    io,
  );
}

export function handleBancosListCli(
  opts: BancosListCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runBancosList(
    {
      json: Boolean(opts.json),
      verbose: Boolean(opts.verbose),
      limit: opts.limit,
    },
    io,
  );
}

export function handleReferenceLookupCli(
  command: string,
  value: string | undefined,
  opts: ReferenceLookupCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runReferenceLookup(
    command,
    value,
    {
      json: Boolean(opts.json),
      verbose: Boolean(opts.verbose),
    },
    io,
  );
}

export function handleReferenceSearchCli(
  command: string,
  query: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runReferenceSearch(
    command,
    query,
    {
      json: Boolean(opts.json),
      verbose: Boolean(opts.verbose),
      limit: opts.limit,
    },
    io,
  );
}

export function handleIbgeLookupCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIbgeLookup(value, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handleIbgeListCli(
  target: 'estados' | 'municipios',
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIbgeList(target, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    uf: opts.uf,
    limit: opts.limit,
  }, io);
}

export function handleFeriadosListCli(
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runFeriadosList({
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    year: opts.year,
  }, io);
}

export function handleTseMunicipiosLookupCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runTseMunicipiosLookup(value, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handleCepFaixaCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runCepFaixa(value, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handleDddLookupCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runDddLookup(value, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function writeCliIo(io: CliIo): void {
  for (const line of io.stdout) console.log(line);
  for (const line of io.stderr) console.error(line);
}
