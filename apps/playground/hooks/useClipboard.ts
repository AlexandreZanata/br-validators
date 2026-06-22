'use client';

import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    globalThis.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return { copied, copy };
}
