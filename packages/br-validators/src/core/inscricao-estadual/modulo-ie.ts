/**
 * Shared modulo helpers for IE check digits.
 */

export function computeIeSpCheckDigit(digits: string, weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? 0 : remainder % 10;
}

export function computeIeMtCheckDigit(digits10: string): number {
  let sum = 0;
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 10; i++) {
    sum += Number(digits10[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder <= 1 ? 0 : 11 - remainder;
}

export function computeIeDfCheckDigit(
  digits: string,
  weights: readonly number[],
  includeDv1 = false,
  dv1 = 0,
): number {
  let sum = 0;
  const digitCount = includeDv1 ? 11 : digits.length;
  for (let i = 0; i < digitCount; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  if (includeDv1) {
    sum += dv1 * weights[11];
  }
  const remainder = sum % 11;
  return remainder <= 1 ? 0 : 11 - remainder;
}

/** CE / SC / SE / PB / PI — weights 9..2 on 8 body digits. */
export function computeIeCeCheckDigit(body8: string): number {
  let weight = 9;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight--;
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** AL — product×10 mod 11. */
export function computeIeAlCheckDigit(body8: string): number {
  let weight = 9;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight--;
  }
  const product = sum * 10;
  let digit = product - Math.floor(product / 11) * 11;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** AM — descending weights with special remainder rule. */
export function computeIeAmCheckDigit(body8: string): number {
  let weight = 9;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight--;
  }
  if (sum < 11) {
    return 11 - sum;
  }
  const remainder = sum % 11;
  let digit = 11 - remainder;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** PR / AC style — mod11, weights cycle 2..7 from right. */
export function computeIePrStyleCheckDigit(body: string): number {
  let weight = body.length - 5;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
    if (weight === 1) {
      weight = 7;
    }
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** AC — weights cycle 9..2 from left. */
export function computeIeAcCheckDigit(body: string): number {
  let weight = body.length - 7;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
    if (weight === 1) {
      weight = 9;
    }
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** BA — mod10 or mod11 by reference digit. */
export function computeIeBaModule(ie: string): number {
  const refIndex = ie.length === 9 ? 1 : 0;
  const refDigit = Number(ie[refIndex]);
  const mod10Digits = [0, 1, 2, 3, 4, 5, 8];
  return mod10Digits.includes(refDigit) ? 10 : 11;
}

export function computeIeBaCheckDigit(body: string, mod: number): number {
  let weight = body.length + 1;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
  }
  const rest = sum % mod;
  let digit = mod - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** PE — dual DV, weights length+1..2. */
export function computeIePeCheckDigit(body: string): number {
  let weight = body.length + 1;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** RJ / RS / RO — cyclic descending weights. */
export function computeIeCyclicMod11CheckDigit(
  body: string,
  startWeight: number,
  resetWeight: number,
): number {
  let weight = startWeight;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
    if (weight === 1) {
      weight = resetWeight;
    }
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}

/** RO — cyclic weights 6..9, subtract 10 when digit >= 10. */
export function computeIeRoCheckDigit(body: string): number {
  let weight = 6;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
    if (weight === 1) {
      weight = 9;
    }
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit -= 10;
  }
  return digit;
}

/** GO — mod11 with special range override. */
export function computeIeGoCheckDigit(body8: string): number {
  let weight = 9;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight--;
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  const bodyInt = Number(body8);
  if (digit >= 10) {
    if (digit === 11 && bodyInt >= 10103105 && bodyInt <= 10119997) {
      digit = 1;
    } else {
      digit = 0;
    }
  }
  return digit;
}

/** AP — prefix 03 with range-based p/d constants. */
export function computeIeApCheckDigit(body8: string): number {
  const bodyInt = Number(body8);
  let p = 0;
  let d = 0;
  if (bodyInt >= 3000001 && bodyInt <= 3017000) {
    p = 5;
    d = 0;
  } else if (bodyInt >= 3017001 && bodyInt <= 3019022) {
    p = 9;
    d = 1;
  }
  let weight = 9;
  let sum = p;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight--;
  }
  let digit = 11 - (sum % 11);
  if (digit === 10) {
    digit = 0;
  } else if (digit === 11) {
    digit = d;
  }
  return digit;
}

/** RR — mod9, ascending weights 1..8. */
export function computeIeRrCheckDigit(body8: string): number {
  let weight = 1;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * weight;
    weight++;
  }
  return sum % 9;
}

/** TO — mod11, rest < 2 → DV 0. */
export function computeIeToCheckDigit(body: string): number {
  let weight = 9;
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[i]) * weight;
    weight--;
  }
  const rest = sum % 11;
  if (rest < 2) {
    return 0;
  }
  return 11 - rest;
}

/** MG — first DV via digit-sum on alternating products. */
export function computeIeMgFirstCheckDigit(body11: string): number {
  const bodyWithZero = `${body11.slice(0, 3)}0${body11.slice(3)}`;
  let weightedSum = '';
  for (let i = 0; i < bodyWithZero.length; i++) {
    const w = (i + 1) % 2 === 0 ? 2 : 1;
    weightedSum += (Number(bodyWithZero[i]) * w).toString();
  }
  let sum = 0;
  for (let i = 0; i < weightedSum.length; i++) {
    sum += Number(weightedSum[i]);
  }
  const lastDigit = Number(sum.toString().slice(-1));
  return lastDigit === 0 ? 0 : 10 - lastDigit;
}

/** MG — second DV, weights 3..11 cycling. */
export function computeIeMgSecondCheckDigit(body12: string): number {
  let weight = 3;
  let sum = 0;
  for (let i = 0; i < body12.length; i++) {
    sum += Number(body12[i]) * weight;
    weight--;
    if (weight === 1) {
      weight = 11;
    }
  }
  const rest = sum % 11;
  let digit = 11 - rest;
  if (digit >= 10) {
    digit = 0;
  }
  return digit;
}
