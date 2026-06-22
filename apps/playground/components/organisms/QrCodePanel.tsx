'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/atoms/Button';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

type Props = {
  value: string;
  fileBaseName?: string;
};

type DownloadFormat = 'png' | 'jpeg' | 'webp' | 'svg';

function getCanvas(id: string): HTMLCanvasElement | null {
  return document.getElementById(id) as HTMLCanvasElement | null;
}

function triggerDownload(href: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
}

export function QrCodePanel({ value, fileBaseName = 'pix-qr' }: Props) {
  const canvasId = useId();
  const { messages } = useI18n();
  const [copied, setCopied] = useState<'payload' | 'image' | null>(null);
  const qr = messages.pixQr;

  const downloadRaster = useCallback(
    (mime: 'image/png' | 'image/jpeg' | 'image/webp', ext: DownloadFormat) => {
      const canvas = getCanvas(canvasId);
      if (!canvas) return;
      const dataUrl = canvas.toDataURL(mime, mime === 'image/jpeg' ? 0.92 : undefined);
      triggerDownload(dataUrl, `${fileBaseName}.${ext}`);
    },
    [canvasId, fileBaseName],
  );

  const downloadSvg = useCallback(() => {
    const canvas = getCanvas(canvasId);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const size = canvas.width;
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${String(size)}" height="${String(size)}" viewBox="0 0 ${String(size)} ${String(size)}">`,
      `<image href="${pngUrl}" width="${String(size)}" height="${String(size)}" />`,
      '</svg>',
    ].join('');
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), `${fileBaseName}.svg`);
  }, [canvasId, fileBaseName]);

  const copyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied('payload');
      window.setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      // clipboard unavailable
    }
  }, [value]);

  const copyImage = useCallback(async () => {
    const canvas = getCanvas(canvasId);
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => {
          resolve(result);
        }, 'image/png');
      });
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied('image');
      window.setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      // clipboard unavailable
    }
  }, [canvasId]);

  const downloadActions = useMemo(
    () =>
      [
        { id: 'png' as const, label: qr.downloadPng, onClick: () => { downloadRaster('image/png', 'png'); } },
        { id: 'jpeg' as const, label: qr.downloadJpeg, onClick: () => { downloadRaster('image/jpeg', 'jpeg'); } },
        { id: 'webp' as const, label: qr.downloadWebp, onClick: () => { downloadRaster('image/webp', 'webp'); } },
        { id: 'svg' as const, label: qr.downloadSvg, onClick: downloadSvg },
      ] as const,
    [downloadRaster, downloadSvg, qr.downloadJpeg, qr.downloadPng, qr.downloadSvg, qr.downloadWebp],
  );

  return (
    <section className={styles.qrCard}>
      <h2 className={styles.qrTitle}>{qr.title}</h2>
      <p className={styles.qrHint}>{qr.hint}</p>
      <QRCodeCanvas id={canvasId} value={value} size={256} level="M" marginSize={4} />
      <div className={styles.qrPayload}>
        <code className={styles.qrPayloadText}>{value}</code>
      </div>
      <div className={styles.qrActions}>
        {downloadActions.map((action) => (
          <Button key={action.id} type="button" variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
      </div>
      <div className={styles.qrActions}>
        <Button type="button" variant="ghost" size="sm" onClick={() => { void copyPayload(); }}>
          {copied === 'payload' ? messages.actions.copied : qr.copyPayload}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { void copyImage(); }}>
          {copied === 'image' ? messages.actions.copied : qr.copyImage}
        </Button>
      </div>
    </section>
  );
}
