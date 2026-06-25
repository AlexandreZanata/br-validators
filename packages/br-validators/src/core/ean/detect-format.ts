import { stripEan } from '../../strip/ean.js';
import { EAN_13_LENGTH, EAN_8_LENGTH, type EanFormat } from './constants.js';

/** Best-effort format detection from stripped length (8 or 13 digits only). */
export function detectEanFormat(input: string): EanFormat | null {
  const stripped = stripEan(input);
  if (stripped.length === EAN_13_LENGTH) {
    return 'ean-13';
  }
  if (stripped.length === EAN_8_LENGTH) {
    return 'ean-8';
  }
  return null;
}
