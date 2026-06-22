'use client';

import { useMemo, useState } from 'react';
import { validateBrCode, validatePixKey } from '@br-validators/core';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { QrCodePanel } from '@/components/organisms/QrCodePanel';
import { useI18n } from '@/components/providers/I18nProvider';
import { buildStaticPixBrCode } from '@/lib/pix/build-static-brcode';
import styles from './organisms.module.css';

type Props = {
  pixKey: string;
};

export function PixQrBuilder({ pixKey }: Props) {
  const { messages } = useI18n();
  const qr = messages.pixQr;
  const [merchantName, setMerchantName] = useState('Fulano de Tal');
  const [merchantCity, setMerchantCity] = useState('BRASILIA');
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState('***');

  const pixValidation = pixKey.trim() ? validatePixKey(pixKey) : null;

  const brCodePayload = useMemo(() => {
    if (!pixValidation?.ok) return null;
    if (!merchantName.trim() || !merchantCity.trim()) return null;
    try {
      const payload = buildStaticPixBrCode({
        pixKey: pixValidation.value,
        merchantName,
        merchantCity,
        amount: amount.trim() || undefined,
        txid: txid.trim() || undefined,
      });
      const validation = validateBrCode(payload);
      return validation.ok ? payload : null;
    } catch {
      return null;
    }
  }, [amount, merchantCity, merchantName, pixValidation, txid]);

  if (!pixValidation?.ok) {
    return (
      <section className={styles.qrCard}>
        <h2 className={styles.qrTitle}>{qr.title}</h2>
        <p className={styles.qrHint}>{qr.keyRequired}</p>
      </section>
    );
  }

  return (
    <>
      <section className={styles.qrForm}>
        <h2 className={styles.qrFormTitle}>{qr.formTitle}</h2>
        <p className={styles.qrHint}>{qr.formHint}</p>
        <div className={styles.qrFormGrid}>
          <div>
            <Label htmlFor="pix-qr-merchant">{qr.merchantName}</Label>
            <Input
              id="pix-qr-merchant"
              value={merchantName}
              maxLength={25}
              onChange={(e) => {
                setMerchantName(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="pix-qr-city">{qr.merchantCity}</Label>
            <Input
              id="pix-qr-city"
              value={merchantCity}
              maxLength={15}
              onChange={(e) => {
                setMerchantCity(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="pix-qr-amount">{qr.amount}</Label>
            <Input
              id="pix-qr-amount"
              value={amount}
              placeholder={qr.amountPlaceholder}
              inputMode="decimal"
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="pix-qr-txid">{qr.txid}</Label>
            <Input
              id="pix-qr-txid"
              value={txid}
              maxLength={25}
              onChange={(e) => {
                setTxid(e.target.value);
              }}
            />
          </div>
        </div>
      </section>
      {brCodePayload ? <QrCodePanel value={brCodePayload} /> : null}
    </>
  );
}
