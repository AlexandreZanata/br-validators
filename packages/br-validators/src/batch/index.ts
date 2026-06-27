/**
 * Batch validation — maps `validate*` per row, never throws (BR-BATCH-001).
 * @see docs/OFFICIAL-SOURCES.md
 */
import { validateForPlatform } from '../platform/validate-dispatch.js';
import type { PlatformDocumentType, PlatformOptions } from '../platform/types.js';
import type { ValidationErrorCode } from '../types/validation-result.js';

export type BatchValidEntry = {
  index: number;
  input: string;
  value: string;
};

export type BatchInvalidEntry = {
  index: number;
  input: string;
  code: ValidationErrorCode;
  message: string;
};

export type BatchSummary = {
  total: number;
  valid: number;
  invalid: number;
};

export type BatchResult = {
  valid: BatchValidEntry[];
  invalid: BatchInvalidEntry[];
  summary: BatchSummary;
};

export { parseBatchCsv } from './parse-csv.js';
export type {
  ParseBatchCsvFailure,
  ParseBatchCsvOptions,
  ParseBatchCsvResult,
  ParseBatchCsvSuccess,
} from './parse-csv.js';

export function batch(
  inputs: readonly string[],
  type: PlatformDocumentType,
  options: PlatformOptions = {},
): BatchResult {
  const valid: BatchValidEntry[] = [];
  const invalid: BatchInvalidEntry[] = [];

  inputs.forEach((input, index) => {
    const result = validateForPlatform(input, type, options);
    if (result.ok) {
      valid.push({ index, input, value: result.value });
    } else {
      invalid.push({ index, input, code: result.code, message: result.message });
    }
  });

  return {
    valid,
    invalid,
    summary: {
      total: inputs.length,
      valid: valid.length,
      invalid: invalid.length,
    },
  };
}
