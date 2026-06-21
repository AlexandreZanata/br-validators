import { Command } from 'commander';
import {
  handleCepCli,
  handleCnpjCli,
  handleCpfCli,
  handleListCli,
  handlePisPasepCli,
  handlePixCli,
  handleBoletoCli,
  handleCartaoCli,
  handleCartaoCreditoCli,
  handleIeCli,
  handlePlacaCli,
  writeCliIo,
  type BoletoCliOptions,
  type CartaoCliOptions,
  type CartaoCreditoCliOptions,
  type CepCliOptions,
  type CnpjCliOptions,
  type CpfCliOptions,
  type IeCliOptions,
  type PisPasepCliOptions,
  type PixCliOptions,
  type PlacaCliOptions,
} from './handlers.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('br-validators')
    .description('100% open-source Brazilian document validators')
    .version('0.10.0-alpha.0');

  program
    .command('list')
    .description('List supported document types')
    .action(() => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleListCli(io);
      writeCliIo(io);
    });

  const cnpj = program.command('cnpj').description('CNPJ — numeric and alphanumeric (RFB Q14)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cnpj
      .command(action)
      .description(`${action} a CNPJ`)
      .argument('[value]', 'CNPJ value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CnpjCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCnpjCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cpf = program.command('cpf').description('CPF — numeric modulo 11 (RFB)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cpf
      .command(action)
      .description(`${action} a CPF`)
      .argument('[value]', 'CPF value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CpfCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCpfCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cep = program.command('cep').description('CEP — 8-digit postal code (Correios)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cep
      .command(action)
      .description(`${action} a CEP`)
      .argument('[value]', 'CEP value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CepCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCepCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const placa = program.command('placa').description('Placa — legacy + Mercosul (CONTRAN)');

  for (const action of ['validate', 'format', 'strip', 'convert'] as const) {
    placa
      .command(action)
      .description(`${action} a license plate`)
      .argument('[value]', 'Placa value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: PlacaCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handlePlacaCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const pisPasep = program.command('pis-pasep').description('PIS/PASEP — numeric modulo 11 (Caixa/INSS)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    pisPasep
      .command(action)
      .description(`${action} a PIS/PASEP number`)
      .argument('[value]', 'PIS/PASEP value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: PisPasepCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handlePisPasepCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const pix = program.command('pix').description('PIX key — CPF, CNPJ, email, phone, EVP (Bacen)');

  pix
    .command('detect')
    .description('detect PIX key type')
    .argument('[value]', 'PIX key value')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: PixCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handlePixCli('detect', value, opts, io);
      writeCliIo(io);
    });

  pix
    .command('validate')
    .description('validate a PIX key')
    .argument('[value]', 'PIX key value')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('--source', 'Include official source URL')
    .option('--type <type>', 'Force key type: cpf, cnpj, email, phone, evp')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: PixCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handlePixCli('validate', value, opts, io);
      writeCliIo(io);
    });

  pix
    .command('format')
    .description('format a PIX key')
    .argument('[value]', 'PIX key value')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('--type <type>', 'Force key type: cpf, cnpj, email, phone, evp')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: PixCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handlePixCli('format', value, opts, io);
      writeCliIo(io);
    });

  const boleto = program.command('boleto').description('Boleto — linha digitável + código de barras (FEBRABAN)');

  boleto
    .command('detect')
    .description('detect boleto input kind')
    .argument('[value]', 'Linha digitável or código de barras')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: BoletoCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleBoletoCli('detect', value, opts, undefined, io);
      writeCliIo(io);
    });

  boleto
    .command('validate')
    .description('validate a boleto')
    .argument('[value]', 'Linha digitável or código de barras')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('--source', 'Include official source URL')
    .option('--kind <kind>', 'Force input kind: linha-digitavel, codigo-barras')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: BoletoCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleBoletoCli('validate', value, opts, undefined, io);
      writeCliIo(io);
    });

  const convert = boleto.command('convert').description('convert between linha digitável and código de barras');

  for (const direction of ['linha-to-barras', 'barras-to-linha'] as const) {
    convert
      .command(direction)
      .description(`convert boleto ${direction.replace(/-/g, ' ')}`)
      .argument('[value]', 'Linha digitável or código de barras')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: BoletoCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleBoletoCli('convert', value, opts, direction, io);
        writeCliIo(io);
      });
  }

  for (const action of ['format', 'strip'] as const) {
    boleto
      .command(action)
      .description(`${action} a boleto linha digitável`)
      .argument('[value]', 'Linha digitável or código de barras')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: BoletoCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleBoletoCli(action, value, opts, undefined, io);
        writeCliIo(io);
      });
  }

  const cartao = program.command('cartao').description('Credit card PAN — Luhn / ISO/IEC 7812-1');

  cartao
    .command('detect')
    .description('detect card brand (best-effort)')
    .argument('[value]', 'Credit card PAN (raw or masked)')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: CartaoCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleCartaoCli('detect', value, opts, io);
      writeCliIo(io);
    });

  for (const action of ['validate', 'format', 'strip'] as const) {
    cartao
      .command(action)
      .description(`${action} a credit card PAN`)
      .argument('[value]', 'Credit card PAN (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CartaoCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCartaoCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cartaoCredito = program
    .command('cartao-credito')
    .description('Credit card PAN — Luhn / ISO/IEC 7812-1 (library subpath alias)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cartaoCredito
      .command(action)
      .description(`${action} a credit card PAN`)
      .argument('[value]', 'Credit card PAN (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CartaoCreditoCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCartaoCreditoCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const ie = program
    .command('ie')
    .description('Inscrição Estadual — SP, MT, DF (SEFAZ/SINTEGRA check digits)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    ie
      .command(action)
      .description(`${action} an Inscrição Estadual`)
      .argument('[value]', 'IE value (raw or masked)')
      .requiredOption('--uf <uf>', 'State code (27 UFs, e.g. SP, RJ, MG)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: IeCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleIeCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  return program;
}

export function run(argv: string[]): void {
  createProgram().parse(argv);
}
