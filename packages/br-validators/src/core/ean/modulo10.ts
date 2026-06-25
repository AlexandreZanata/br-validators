/**
 * GS1 modulo-10 check digit — alternating weights 1 and 3 from the left (excluding check digit).
 * @see https://www.gs1.org/standards/barcodes/ean-upc
 */

export function computeGs1Modulo10Sum(digitsWithoutCheck: string): number {
  let sum = 0;
  for (let i = 0; i < digitsWithoutCheck.length; i++) {
    const digit = Number(digitsWithoutCheck.charAt(i));
    const weight = i % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }
  return sum;
}

export function computeGs1Modulo10CheckDigit(digitsWithoutCheck: string): number {
  const remainder = computeGs1Modulo10Sum(digitsWithoutCheck) % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/** Returns true when the full digit string passes GS1 modulo-10. */
export function passesGs1Modulo10(digits: string): boolean {
  const body = digits.slice(0, -1);
  const expected = computeGs1Modulo10CheckDigit(body);
  return expected === Number(digits.charAt(digits.length - 1));
}
