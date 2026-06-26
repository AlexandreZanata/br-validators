export {
  resolveFixedLengthCodeLookup,
  resolvePositiveIdLookup,
  resolvePositiveIntegerLookup,
  resolveStringCodeLookup,
} from './resolve.js';
export type { LookupErrorCode, LookupResult } from '../types/lookup-result.js';
export {
  isLookupNotFound,
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  lookupNotFound,
  unwrapLookupValue,
} from '../types/lookup-result.js';
export { fiscalValidationFromLookup } from './fiscal-validation.js';
export type { FiscalCodeValidationResult, FiscalCodeRow } from '../types/fiscal-code-result.js';
