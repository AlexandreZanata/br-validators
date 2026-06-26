import type { Command } from 'commander';
import { handleReferenceLookupCli, handleReferenceSearchCli, handleReferenceValidateCli, type ReferenceLookupCliOptions, writeCliIo } from '../../handlers.js';
import { REFERENCE_LOOKUP_MODULES, REFERENCE_LOOKUP_COMMANDS, REFERENCE_SEARCH_COMMANDS } from './registry.js';
import { REFERENCE_VALIDATE_COMMANDS } from './validate.js';

export function registerReferenceLookupCommands(program: Command): void {
  for (const command of REFERENCE_LOOKUP_COMMANDS) {
    const module = REFERENCE_LOOKUP_MODULES[command];
    const root = program.command(command).description(module.description);

    root
      .command('lookup')
      .description(`Resolve ${command} by official code`)
      .argument('<codigo>', 'Lookup code')
      .option('--json', 'JSON output')
      .option('--verbose', 'Include dataset capture date')
      .action((codigo: string, opts: ReferenceLookupCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleReferenceLookupCli(command, codigo, opts, io);
        writeCliIo(io);
      });

    if ((REFERENCE_VALIDATE_COMMANDS as readonly string[]).includes(command)) {
      root
        .command('validate')
        .description(`Validate ${command} format and embedded table`)
        .argument('<codigo>', 'Code to validate')
        .option('--json', 'JSON output')
        .option('--verbose', 'Include module metadata')
        .action((codigo: string, opts: ReferenceLookupCliOptions) => {
          const io = { stdout: [] as string[], stderr: [] as string[] };
          process.exitCode = handleReferenceValidateCli(command, codigo, opts, io);
          writeCliIo(io);
        });
    }

    if ((REFERENCE_SEARCH_COMMANDS as readonly string[]).includes(command)) {
      root
        .command('search')
        .description(`Search ${command} by description fragment`)
        .argument('<query>', 'Search query')
        .option('--json', 'JSON output')
        .option('--verbose', 'Include dataset capture date')
        .option('--limit <n>', 'Maximum rows', (v: string) => Number(v))
        .action((query: string, opts: ReferenceLookupCliOptions & { limit?: number }) => {
          const io = { stdout: [] as string[], stderr: [] as string[] };
          process.exitCode = handleReferenceSearchCli(command, query, opts, io);
          writeCliIo(io);
        });
    }
  }
}
