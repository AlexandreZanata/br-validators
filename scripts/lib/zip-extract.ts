import { inflateRawSync } from 'node:zlib';

const LOCAL_FILE_HEADER_SIGNATURE = 0x0403_4b50;
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x0201_4b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x0605_4b50;
const DATA_DESCRIPTOR_SIGNATURE = 0x0807_4b50;
const COMPRESSION_STORE = 0;
const COMPRESSION_DEFLATE = 8;
const GP_FLAG_DATA_DESCRIPTOR = 0x0008;

interface ZipCentralEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
}

function readUint16(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
}

function decodeName(archive: Uint8Array, offset: number, length: number): string {
  return new TextDecoder().decode(archive.subarray(offset, offset + length));
}

function findEndOfCentralDirectoryOffset(view: DataView, archiveLength: number): number {
  const maxComment = 65_535;
  const searchStart = Math.max(0, archiveLength - maxComment - 22);
  for (let offset = archiveLength - 22; offset >= searchStart; offset -= 1) {
    if (readUint32(view, offset) === END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset;
    }
  }
  throw new Error('Zip end-of-central-directory record not found');
}

function listZipCentralEntries(archive: Uint8Array): ZipCentralEntry[] {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const eocdOffset = findEndOfCentralDirectoryOffset(view, archive.length);
  const centralDirectoryOffset = readUint32(view, eocdOffset + 16);
  const entries: ZipCentralEntry[] = [];
  let offset = centralDirectoryOffset;

  while (offset + 46 <= archive.length) {
    if (readUint32(view, offset) !== CENTRAL_DIRECTORY_HEADER_SIGNATURE) {
      break;
    }

    const compressionMethod = readUint16(view, offset + 10);
    const compressedSize = readUint32(view, offset + 20);
    const nameLength = readUint16(view, offset + 28);
    const extraLength = readUint16(view, offset + 30);
    const commentLength = readUint16(view, offset + 32);
    const localHeaderOffset = readUint32(view, offset + 42);
    const nameStart = offset + 46;
    const name = decodeName(archive, nameStart, nameLength);

    entries.push({
      name,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    });

    offset = nameStart + nameLength + extraLength + commentLength;
  }

  return entries;
}

function readLocalEntryData(archive: Uint8Array, entry: ZipCentralEntry): Uint8Array {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const localOffset = entry.localHeaderOffset;

  if (readUint32(view, localOffset) !== LOCAL_FILE_HEADER_SIGNATURE) {
    throw new Error(`Invalid local header for zip entry: ${entry.name}`);
  }

  const generalPurposeFlag = readUint16(view, localOffset + 6);
  const compressionMethod = readUint16(view, localOffset + 8);
  const nameLength = readUint16(view, localOffset + 26);
  const extraLength = readUint16(view, localOffset + 28);
  const dataStart = localOffset + 30 + nameLength + extraLength;

  let compressedSize = readUint32(view, localOffset + 18);
  if ((generalPurposeFlag & GP_FLAG_DATA_DESCRIPTOR) !== 0 || compressedSize === 0) {
    compressedSize = entry.compressedSize;
  }

  const compressed = archive.subarray(dataStart, dataStart + compressedSize);
  let trailingOffset = dataStart + compressedSize;

  if ((generalPurposeFlag & GP_FLAG_DATA_DESCRIPTOR) !== 0) {
    if (readUint32(view, trailingOffset) === DATA_DESCRIPTOR_SIGNATURE) {
      trailingOffset += 16;
    } else {
      trailingOffset += 12;
    }
  }

  if (compressionMethod === COMPRESSION_STORE) {
    return compressed;
  }
  if (compressionMethod === COMPRESSION_DEFLATE) {
    return inflateRawSync(compressed);
  }

  throw new Error(`Unsupported zip compression method: ${String(compressionMethod)}`);
}

export function extractZipEntry(archive: Uint8Array, entryName: string): Uint8Array {
  const entry = listZipCentralEntries(archive).find((candidate) => candidate.name === entryName);
  if (entry === undefined) {
    throw new Error(`Zip entry not found: ${entryName}`);
  }
  return readLocalEntryData(archive, entry);
}
