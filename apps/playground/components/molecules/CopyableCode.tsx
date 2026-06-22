'use client';

import { useClipboard } from '@/hooks/useClipboard';
import { Button } from '@/components/atoms/Button';
import { CodeBlock } from '@/components/atoms/CodeBlock';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

export function CopyableCode({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useClipboard();
  const { messages } = useI18n();

  return (
    <div className={styles.stack}>
      <div className={styles.copyRow}>
        <p className={styles.copyLabel}>{label ?? messages.common.json}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={async () => {
            await copy(code);
          }}
        >
          {copied ? messages.actions.copied : messages.actions.copy}
        </Button>
      </div>
      <CodeBlock code={code} />
    </div>
  );
}
