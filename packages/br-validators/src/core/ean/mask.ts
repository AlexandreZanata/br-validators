import { EAN_13_LENGTH, EAN_8_LENGTH } from './constants.js';

/** GS1 human-readable grouping — EAN-13: 1-6-6, EAN-8: 4-4. */
export function applyEanMask(canonical: string): string {
  if (canonical.length === EAN_13_LENGTH) {
    return `${canonical.slice(0, 1)} ${canonical.slice(1, 7)} ${canonical.slice(7)}`;
  }
  if (canonical.length === EAN_8_LENGTH) {
    return `${canonical.slice(0, 4)} ${canonical.slice(4)}`;
  }
  throw new Error(`EAN must have ${EAN_8_LENGTH} or ${EAN_13_LENGTH} digits to apply mask`);
}
