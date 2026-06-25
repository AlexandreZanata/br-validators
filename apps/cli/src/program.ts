import { Command } from 'commander';
import { registerReferenceLookupCommands } from './commands/reference-lookup/register-program.js';
import {
  handleBrCodeCli,
  handleCepCli,
  handleCnpjCli,
  handleCpfCli,
  handleTelefoneCli,
  handleCnhCli,
  handleRenavamCli,
  handleTituloEleitorCli,
  handleNfeChaveCli,
  handleProcessoJudicialCli,
  handleRgCli,
  handleListCli,
  handlePisPasepCli,
  handleCnisCli,
  handlePixCli,
  handleBoletoCli,
  handleCartaoCli,
  handleCartaoCreditoCli,
  handleEanCli,
  handleIeCli,
  handleDetectCli,
  handleSanitizeCli,
  handleGenerateCli,
  handlePlacaCli,
  handleBancosLookupCli,
  handleBancosListCli,
  handleCepFaixaCli,
  handleDddLookupCli,
  handleFeriadosListCli,
  handleIbgeListCli,
  handleIbgeLookupCli,
  handleTseMunicipiosLookupCli,
  type BancosListCliOptions,
  type BancosLookupCliOptions,
  type ReferenceDatasetCliOptions,
  writeCliIo,
  type BoletoCliOptions,
  type CartaoCliOptions,
  type CartaoCreditoCliOptions,
  type EanCliOptions,
  type BrCodeCliOptions,
  type CepCliOptions,
  type TelefoneCliOptions,
  type CnhCliOptions,
  type RenavamCliOptions,
  type TituloEleitorCliOptions,
  type NfeChaveCliOptions,
  type ProcessoJudicialCliOptions,
  type RgCliOptions,
  type CnpjCliOptions,
  type CpfCliOptions,
  type IeCliOptions,
  type DetectCliOptions,
  type SanitizeCliOptions,
  type GenerateCliOptions,
  type PisPasepCliOptions,
  type CnisCliOptions,
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

  cep
    .command('faixa')
    .description('Resolve CEP prefix to municipality (IBGE CNEFE)')
    .argument('<prefixo>', 'CEP prefix (5+ digits)')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .action((prefixo: string, opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleCepFaixaCli(prefixo, opts, io);
      writeCliIo(io);
    });

  const telefone = program.command('telefone').description('Telefone — Brazilian fixo/celular (Anatel DDD)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    telefone
      .command(action)
      .description(`${action} a Brazilian telephone number`)
      .argument('[value]', 'Telephone value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: TelefoneCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleTelefoneCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cnh = program.command('cnh').description('CNH — Registro Nacional, 11 contiguous digits (CONTRAN / SENATRAN)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cnh
      .command(action)
      .description(`${action} a CNH`)
      .argument('[value]', 'CNH value (11 digits or decorated input)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CnhCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCnhCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const renavam = program.command('renavam').description('RENAVAM — 11-digit vehicle registry code (DENATRAN / SENATRAN)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    renavam
      .command(action)
      .description(`${action} a RENAVAM`)
      .argument('[value]', 'RENAVAM value (11 digits or optional dash before DV)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: RenavamCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleRenavamCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const tituloEleitor = program
    .command('titulo-eleitor')
    .description('Título de Eleitor — 12-digit voter registration (TSE / Wikipedia PT algorithm)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    tituloEleitor
      .command(action)
      .description(`${action} a Título de Eleitor`)
      .argument('[value]', 'Título de Eleitor value (12 or 13 digits, spaces allowed)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: TituloEleitorCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleTituloEleitorCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const processoJudicial = program
    .command('processo-judicial')
    .description('Processo judicial CNJ — número único NNNNNNN-DD.AAAA.J.TR.OOOO (Resolução 65/2008)');

  for (const action of ['validate', 'parse', 'format', 'strip'] as const) {
    processoJudicial
      .command(action)
      .description(`${action} a processo judicial CNJ`)
      .argument('[value]', 'CNJ process number (masked or 20 digits)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate/parse only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: ProcessoJudicialCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleProcessoJudicialCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const nfeChave = program
    .command('nfe-chave')
    .description('NF-e / NFC-e chave de acesso — 44 digits (SEFAZ MOC §2.2.6)');

  for (const action of ['validate', 'parse', 'format', 'strip'] as const) {
    nfeChave
      .command(action)
      .description(`${action} an NF-e chave de acesso`)
      .argument('[value]', 'Chave de acesso (44 digits, spaces allowed)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate/parse only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: NfeChaveCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleNfeChaveCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const brcode = program.command('brcode').description('BR Code — PIX QR payload (Bacen EMV TLV)');

  for (const action of ['parse', 'validate'] as const) {
    brcode
      .command(action)
      .description(`${action} a BR Code payload`)
      .argument('[value]', 'BR Code payload (Pix Copia e Cola)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: BrCodeCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleBrCodeCli(action, value, opts, io);
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

  const cnis = program.command('cnis').description('CNIS / NIT — modulo 11 with issuer metadata (INSS vs Caixa)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cnis
      .command(action)
      .description(`${action} a NIT (CNIS worker ID)`)
      .argument('[value]', 'NIT value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('--issuer <issuer>', 'Override issuer: inss | caixa')
      .option('--tipo <tipo>', 'Override tipo: nit | pis | nis')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CnisCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCnisCli(action, value, opts, io);
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

  const ean = program.command('ean').description('GS1 EAN-8 / EAN-13 product barcodes — modulo-10 weights 1/3');

  ean
    .command('detect')
    .description('detect EAN format (ean-8 or ean-13)')
    .argument('[value]', 'EAN barcode (raw or masked)')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: EanCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleEanCli('detect', value, opts, io);
      writeCliIo(io);
    });

  for (const action of ['validate', 'format', 'strip'] as const) {
    ean
      .command(action)
      .description(`${action} an EAN barcode`)
      .argument('[value]', 'EAN barcode (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: EanCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleEanCli(action, value, opts, io);
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

  const rg = program
    .command('rg')
    .description('RG (Registro Geral) — per-UF validation (phase 1: SP, RJ, MG, PR, RS, SC)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    rg
      .command(action)
      .description(`${action} an RG`)
      .argument('[value]', 'RG value (raw or masked)')
      .requiredOption('--uf <uf>', 'State code (SP, RJ, MG, PR, RS, SC)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: RgCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleRgCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const bancos = program.command('bancos').description('Bacen STR participants — offline lookup');

  bancos
    .command('lookup')
    .description('Resolve bank by COMPE (3 digits) or ISPB (8 digits)')
    .argument('<codigoOuIspb>', 'COMPE or ISPB')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date (BANCOS_DATA_VERSION)')
    .action((codigoOuIspb: string, opts: BancosLookupCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleBancosLookupCli(codigoOuIspb, opts, io);
      writeCliIo(io);
    });

  bancos
    .command('list')
    .description('List STR participants (optional --limit)')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date (BANCOS_DATA_VERSION)')
    .option('--limit <n>', 'Maximum rows to print', (v: string) => Number(v))
    .action((opts: BancosListCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleBancosListCli(opts, io);
      writeCliIo(io);
    });

  const ibge = program.command('ibge').description('IBGE states and municipalities — offline lookup');

  ibge
    .command('lookup')
    .description('Resolve municipality by 7-digit IBGE code')
    .argument('<codigo>', 'IBGE municipality code')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .action((codigo: string, opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleIbgeLookupCli(codigo, opts, io);
      writeCliIo(io);
    });

  ibge
    .command('list')
    .description('List estados or municipios')
    .argument('<target>', 'estados | municipios')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .option('--uf <uf>', 'Filter municipalities by UF')
    .option('--limit <n>', 'Maximum rows', (v: string) => Number(v))
    .action((target: string, opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      if (target !== 'estados' && target !== 'municipios') {
        io.stderr.push('Expected target: estados | municipios');
        process.exitCode = 2;
        writeCliIo(io);
        return;
      }
      process.exitCode = handleIbgeListCli(target, opts, io);
      writeCliIo(io);
    });

  const feriados = program.command('feriados').description('Brazilian national holidays — offline calendar');

  feriados
    .command('list')
    .description('List national holidays for a year')
    .option('--year <yyyy>', 'Calendar year', (v: string) => Number(v))
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .action((opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleFeriadosListCli(opts, io);
      writeCliIo(io);
    });

  const tseMunicipios = program
    .command('tse-municipios')
    .description('TSE ↔ IBGE municipality cross-walk — offline lookup');

  tseMunicipios
    .command('lookup')
    .description('Resolve TSE (5 digits) or IBGE (7 digits) municipality code')
    .argument('<codigo>', 'TSE or IBGE code')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .action((codigo: string, opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleTseMunicipiosLookupCli(codigo, opts, io);
      writeCliIo(io);
    });

  const ddd = program.command('ddd').description('Anatel DDD geographic lookup — offline');

  ddd
    .command('lookup')
    .description('Resolve DDD to UF, region, and municipalities')
    .argument('<code>', '2-digit DDD')
    .option('--json', 'JSON output')
    .option('--verbose', 'Include dataset capture date')
    .action((code: string, opts: ReferenceDatasetCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleDddLookupCli(code, opts, io);
      writeCliIo(io);
    });

  registerReferenceLookupCommands(program);

  program
    .command('detect')
    .description('Detect document type from raw input')
    .argument('[value]', 'Raw value to classify')
    .option('--uf <uf>', 'State code for Inscrição Estadual detection')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((value: string | undefined, opts: DetectCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleDetectCli(value, opts, io);
      writeCliIo(io);
    });

  program
    .command('sanitize <type> [value]')
    .description('Sanitize messy input then validate')
    .option('--uf <uf>', 'State code (required for inscricao-estadual)')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('-f, --file <path>', 'Read value from file')
    .action((type: string, value: string | undefined, opts: SanitizeCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleSanitizeCli(type, value, opts, io);
      writeCliIo(io);
    });

  program
    .command('generate <type>')
    .description('Generate synthetic valid test document')
    .option('--json', 'JSON output')
    .option('-q, --quiet', 'Exit code only')
    .option('--masked', 'Return masked/formatted output')
    .option('--format <format>', 'Format variant (numeric, alphanumeric, legacy, mercosul, celular, fixo)')
    .option('--seed <number>', 'Deterministic PRNG seed', (v: string) => Number(v))
    .option('--uf <uf>', 'State code (required for inscricao-estadual and titulo-eleitor)')
    .option('--brand <brand>', 'Card brand (visa, mastercard, amex, elo, hipercard)')
    .action((type: string, opts: GenerateCliOptions) => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleGenerateCli(type, opts, io);
      writeCliIo(io);
    });

  return program;
}

export function run(argv: string[]): void {
  createProgram().parse(argv);
}
