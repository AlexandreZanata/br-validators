import { readFileSync } from './fs';

/** Browser stub — createRequire is unavailable in the playground CLI bundle. */
export function createRequire(): (id: string) => { readFileSync: typeof readFileSync } {
  return () => ({ readFileSync });
}
