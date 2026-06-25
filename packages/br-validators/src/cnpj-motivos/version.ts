import cnpjMotivosMetadata from './data/metadata.json';
import type { CnpjMotivosDataVersion } from './types.js';

export const CNPJ_MOTIVOS_DATA_VERSION: CnpjMotivosDataVersion =
  cnpjMotivosMetadata as CnpjMotivosDataVersion;
