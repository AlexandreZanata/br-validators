/** GS1 EAN/UPC — official reference for check-digit algorithm. */
export const EAN_OFFICIAL_SOURCE_URL = 'https://www.gs1.org/standards/barcodes/ean-upc' as const;

export const EAN_8_LENGTH = 8 as const;
export const EAN_13_LENGTH = 13 as const;

/** Golden EAN-13 from GS1 examples (modulo-10 weights 1/3). */
export const EAN_GOLDEN_13 = '4006381333931' as const;
export const EAN_GOLDEN_13_MASKED = '4 006381 333931' as const;

/** Golden EAN-8 from GS1 examples. */
export const EAN_GOLDEN_8 = '96385074' as const;
export const EAN_GOLDEN_8_MASKED = '9638 5074' as const;

export type EanFormat = 'ean-8' | 'ean-13';
