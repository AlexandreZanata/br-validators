import selicMetadata from './data/metadata.json';
import type { SelicDataVersion } from './types.js';

export const SELIC_DATA_VERSION: SelicDataVersion = selicMetadata as SelicDataVersion;
