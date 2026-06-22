import { computeCrc16Ccitt } from '@br-validators/core';

export type StaticPixBrCodeInput = {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: string;
  txid?: string;
};

function tlv(tag: string, value: string): string {
  return `${tag}${value.length.toString().padStart(2, '0')}${value}`;
}

function normalizeAmount(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return undefined;
  return normalized;
}

/** Build static PIX BR Code EMV payload (Bacen Manual BR Code). */
export function buildStaticPixBrCode(input: StaticPixBrCodeInput): string {
  const key = input.pixKey.trim();
  const merchantName = input.merchantName.trim().slice(0, 25);
  const merchantCity = input.merchantCity.trim().slice(0, 15).toUpperCase();
  const txid = (input.txid?.trim() || '***').slice(0, 25);
  const amount = input.amount ? normalizeAmount(input.amount) : undefined;

  const pixGui = tlv('00', 'br.gov.bcb.pix');
  const pixKeyField = tlv('01', key);
  const merchantAccount = tlv('26', `${pixGui}${pixKeyField}`);

  let payload = '';
  payload += tlv('00', '01');
  payload += merchantAccount;
  payload += tlv('52', '0000');
  payload += tlv('53', '986');
  if (amount) {
    payload += tlv('54', amount);
  }
  payload += tlv('58', 'BR');
  payload += tlv('59', merchantName);
  payload += tlv('60', merchantCity);
  payload += tlv('62', tlv('05', txid));
  payload += '6304';

  return payload + computeCrc16Ccitt(payload);
}
