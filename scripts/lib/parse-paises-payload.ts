import { isHtmlPayload } from './fetch-nfe-portal.js';
import { parseNfePaisesOdsArchive } from './parse-nfe-paises-ods.js';
import {
  mergePaisesBacenRecords,
  parseNfePaisesTable,
  type PaisBacenRecord,
} from './parse-nfe-paises.js';

export function isOdsPayload(payload: Uint8Array): boolean {
  return payload.length >= 2 && payload[0] === 0x50 && payload[1] === 0x4b;
}

export function parsePaisesFromPayload(payload: string | Uint8Array): PaisBacenRecord[] {
  if (typeof payload === 'string') {
    if (isHtmlPayload(payload)) {
      return [];
    }
    return parseNfePaisesTable(payload);
  }

  if (isOdsPayload(payload)) {
    return parseNfePaisesOdsArchive(payload);
  }

  const text = new TextDecoder('utf-8').decode(payload);
  if (isHtmlPayload(text)) {
    return [];
  }
  return parseNfePaisesTable(text);
}

export { mergePaisesBacenRecords };
