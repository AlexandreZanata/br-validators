/**
 * IBGE municipality codes whose 7th check digit does not follow the standard algorithm.
 * @see https://www.ibge.gov.br/explica/codigos-dos-municipios.php
 */

/** First 6 digits → official 7-digit IBGE code (including non-algorithmic DV). */
export const CMUNFG_DV_EXCEPTIONS: Readonly<Partial<Record<string, number>>> = {
  '220191': 2201919,
  '220225': 2202251,
  '220198': 2201988,
  '261153': 2611533,
  '311783': 3117836,
  '315213': 3152131,
  '430587': 4305871,
  '520393': 5203939,
  '520396': 5203962,
};
