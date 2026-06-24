import { effectScope } from 'vue';
import type { UseBrValidatorReturn } from '../src/types.js';

export function withComposableScope<T>(factory: () => T): T {
  const scope = effectScope();
  const result = scope.run(factory);
  if (result === undefined) {
    throw new Error('Composable scope returned undefined');
  }
  scope.stop();
  return result;
}

export function setValue(composable: UseBrValidatorReturn, next: string): void {
  composable.value.value = next;
}
