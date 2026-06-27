import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

function readNodeFileSync(
  path: string | number,
  encoding: 'utf8',
): string {
  const fs = nodeRequire('node:fs') as typeof import('node:fs');
  return fs.readFileSync(path, encoding);
}

export type CliIo = { stdout: string[]; stderr: string[] };

export function readInputFile(path: string, io: CliIo): string | null {
  try {
    return readNodeFileSync(path, 'utf8');
  } catch {
    io.stderr.push(`Cannot read file: ${path}`);
    return null;
  }
}

import { runBancosList } from './commands/bancos/list.js';
import { runBancosLookup } from './commands/bancos/lookup.js';
import { runReferenceLookup } from './commands/reference-lookup/lookup.js';
import { runReferenceSearch } from './commands/reference-lookup/search.js';
import { runReferenceValidate } from './commands/reference-lookup/validate.js';
import { runCstLookup, runCstSearch, runCstValidate } from './commands/cst/index.js';
import { runIbgeLookup } from './commands/ibge/lookup.js';
import { runIbgeList } from './commands/ibge/list.js';
import { runFeriadosList } from './commands/feriados/list.js';
import { runInssCalc, runInssTabela } from './commands/inss/index.js';
import { runIrpfCalc, runIrpfTabela } from './commands/irpf/index.js';
import { runTseMunicipiosLookup } from './commands/tse-municipios/lookup.js';
import { runCepFaixa } from './commands/cep/faixa.js';
import { runDddLookup } from './commands/ddd/lookup.js';
import { runNfeCufLookup } from './commands/nfe-cuf/lookup.js';
import { runSelicCommand } from './commands/selic/index.js';
import {
  runIssMunicipalList,
  runIssMunicipalLookup,
  runIssMunicipalResolve,
  runIssMunicipalSearch,
} from './commands/iss-municipal/index.js';
import { runPtaxLookup } from './commands/ptax/lookup.js';
import { runPtaxHistorico } from './commands/ptax/historico.js';
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
import { runMask } from './commands/mask.js';
import { runCompare } from './commands/compare.js';
import { runBatch } from './commands/batch.js';
import { runDiff } from './commands/diff.js';
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

export type MaskCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type CompareCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type DiffCliOptions = CnpjCliOptions & {
  uf?: string;
};

export type BatchCliOptions = CnpjCliOptions & {
  uf?: string;
  limit?: number;
  col?: string;
  delimiter?: string;
  skipHeader?: boolean;
};

export type GenerateCliOptions = {
  json?: boolean;
  quiet?: boolean;
  masked?: boolean;
  stripped?: boolean;
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

export function handleMaskCli(
  type: string,
  value: string | undefined,
  opts: MaskCliOptions,
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

  return runMask(
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

export function readStdinSync(io: CliIo): string | null {
  try {
    if (process.stdin.isTTY) {
      return null;
    }
    return readNodeFileSync(0, 'utf8');
  } catch {
    io.stderr.push('Cannot read stdin.');
    return null;
  }
}

export function handleCompareCli(
  type: string,
  valueA: string | undefined,
  valueB: string | undefined,
  opts: CompareCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runCompare(
    type,
    valueA,
    valueB,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      uf: opts.uf,
    },
    io,
  );
}

export function handleDiffCli(
  type: string,
  valueA: string | undefined,
  valueB: string | undefined,
  opts: DiffCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runDiff(
    type,
    valueA,
    valueB,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      uf: opts.uf,
    },
    io,
  );
}

export function handleBatchCli(
  type: string,
  opts: BatchCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let lines: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    lines = content;
  } else {
    const stdin = readStdinSync(io);
    if (stdin !== null) {
      lines = stdin;
    }
  }

  return runBatch(
    type,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      uf: opts.uf,
      lines,
      limit: opts.limit,
      col: opts.col,
      delimiter: opts.delimiter,
      skipHeader: opts.skipHeader,
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
      stripped: Boolean(opts.stripped),
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

export function handleReferenceValidateCli(
  command: string,
  value: string | undefined,
  opts: ReferenceLookupCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runReferenceValidate(
    command,
    value,
    {
      json: Boolean(opts.json),
      verbose: Boolean(opts.verbose),
    },
    io,
  );
}

export type CstCliOptions = ReferenceDatasetCliOptions & {
  tax?: string;
};

export function handleCstLookupCli(
  value: string | undefined,
  opts: CstCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runCstLookup(value, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    tax: opts.tax,
  }, io);
}

export function handleCstSearchCli(
  query: string | undefined,
  opts: CstCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runCstSearch(query, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    tax: opts.tax,
    limit: opts.limit,
  }, io);
}

export function handleCstValidateCli(
  value: string | undefined,
  opts: CstCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runCstValidate(value, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    tax: opts.tax,
  }, io);
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

export function handleInssTabelaCli(
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runInssTabela({
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    ano: opts.year,
  }, io);
}

export function handleInssCalcCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runInssCalc(value, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    ano: opts.year,
  }, io);
}

export function handleIrpfTabelaCli(
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIrpfTabela({
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    ano: opts.year,
  }, io);
}

export function handleIrpfCalcCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIrpfCalc(value, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    ano: opts.year,
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

export function handleNfeCufLookupCli(
  value: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runNfeCufLookup(value, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handleSelicCli(
  opts: ReferenceDatasetCliOptions & { date?: string },
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runSelicCommand({
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    date: opts.date,
  }, io);
}

export function handleIssMunicipalListCli(
  opts: ReferenceDatasetCliOptions & { uf?: string; limit?: number },
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIssMunicipalList({
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    uf: opts.uf,
    limit: opts.limit,
  }, io);
}

export function handleIssMunicipalLookupCli(
  codigo: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIssMunicipalLookup(codigo, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handleIssMunicipalSearchCli(
  query: string | undefined,
  opts: ReferenceDatasetCliOptions & { uf?: string; limit?: number },
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIssMunicipalSearch(query, {
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
    limit: opts.limit,
    uf: opts.uf,
  }, io);
}

export function handleIssMunicipalResolveCli(
  uf: string | undefined,
  nome: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runIssMunicipalResolve(uf, nome, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handlePtaxLookupCli(
  moeda: string | undefined,
  data: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runPtaxLookup(moeda, data, { json: Boolean(opts.json), verbose: Boolean(opts.verbose) }, io);
}

export function handlePtaxHistoricoCli(
  moeda: string | undefined,
  desde: string | undefined,
  ate: string | undefined,
  opts: ReferenceDatasetCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  return runPtaxHistorico(
    moeda,
    desde,
    ate,
    { json: Boolean(opts.json), verbose: Boolean(opts.verbose) },
    io,
  );
}

export function writeCliIo(io: CliIo): void {
  for (const line of io.stdout) console.log(line);
  for (const line of io.stderr) console.error(line);
}
