/**
 * Strip EAN mask — digits only.
 * @see https://www.gs1.org/standards/barcodes/ean-upc
 */
export function stripEan(input: string): string {
  return input.replace(/\D/g, '');
}
