/**
 * Strip NIT mask — digits only (same mask family as PIS/PASEP per RV_03).
 */
export function stripNit(input: string): string {
  return input.replace(/\D/g, '');
}
