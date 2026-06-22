import {
  TITULO_ELEITOR_LENGTH,
  TITULO_ELEITOR_LENGTH_EXTENDED,
  TITULO_ELEITOR_NUMERIC_PATTERN_12,
  TITULO_ELEITOR_NUMERIC_PATTERN_13,
} from './constants.js';

/**
 * Display mask — `XXXX XXXX XXXX` (BR-TITULO-005).
 * @see https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador
 */
export function applyTituloEleitorMask(canonical: string): string {
  if (TITULO_ELEITOR_NUMERIC_PATTERN_12.test(canonical)) {
    return `${canonical.slice(0, 4)} ${canonical.slice(4, 8)} ${canonical.slice(8)}`;
  }
  if (TITULO_ELEITOR_NUMERIC_PATTERN_13.test(canonical)) {
    return `${canonical.slice(0, 5)} ${canonical.slice(5, 9)} ${canonical.slice(9)}`;
  }
  throw new Error(
    `Título de Eleitor must have exactly ${TITULO_ELEITOR_LENGTH} or ${TITULO_ELEITOR_LENGTH_EXTENDED} digits to format`,
  );
}
