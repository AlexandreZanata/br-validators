import simplesNacionalMetadata from './data/metadata.json';
import type { SimplesDataVersion } from './types.js';

export const SIMPLES_NACIONAL_DATA_VERSION: SimplesDataVersion =
  simplesNacionalMetadata as SimplesDataVersion;
