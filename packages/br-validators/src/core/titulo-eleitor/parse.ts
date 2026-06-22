import {
  TITULO_ELEITOR_LENGTH,
  TITULO_ELEITOR_LENGTH_EXTENDED,
  TITULO_ELEITOR_SEQUENTIAL_LENGTH,
  TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED,
  TITULO_ELEITOR_SPECIAL_UF_CODES,
} from './constants.js';

export type TituloEleitorParts = {
  sequential: string;
  ufDigits: string;
  ufCode: number;
  checkDigits: string;
};

export function parseTituloEleitorParts(stripped: string): TituloEleitorParts | null {
  if (stripped.length === TITULO_ELEITOR_LENGTH) {
    return {
      sequential: stripped.slice(0, TITULO_ELEITOR_SEQUENTIAL_LENGTH),
      ufDigits: stripped.slice(TITULO_ELEITOR_SEQUENTIAL_LENGTH, TITULO_ELEITOR_LENGTH - 2),
      ufCode: Number(stripped.slice(TITULO_ELEITOR_SEQUENTIAL_LENGTH, TITULO_ELEITOR_LENGTH - 2)),
      checkDigits: stripped.slice(TITULO_ELEITOR_LENGTH - 2),
    };
  }

  if (stripped.length === TITULO_ELEITOR_LENGTH_EXTENDED) {
    const ufDigits = stripped.slice(
      TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED,
      TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED + 2,
    );
    const ufCode = Number(ufDigits);
    if (!(TITULO_ELEITOR_SPECIAL_UF_CODES as readonly number[]).includes(ufCode)) {
      return null;
    }
    return {
      sequential: stripped.slice(0, TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED),
      ufDigits,
      ufCode,
      checkDigits: stripped.slice(TITULO_ELEITOR_LENGTH_EXTENDED - 2),
    };
  }

  return null;
}
