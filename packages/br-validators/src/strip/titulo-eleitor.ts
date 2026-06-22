/**
 * Strip Título de Eleitor — digits only (BR-TITULO-002).
 * @see https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador
 */
export function stripTituloEleitor(input: string): string {
  return input.replace(/\D/g, '');
}
