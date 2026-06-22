'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

type Props = {
  fixes: string[];
  sanitizedValue?: string;
  ok?: boolean;
  message?: string;
};

export function FixesList({ fixes, sanitizedValue, ok, message }: Props) {
  const { messages } = useI18n();

  if (ok === false && message) {
    return <p className={styles.fixError}>{message}</p>;
  }

  return (
    <div className={styles.fixes}>
      {sanitizedValue ? (
        <p className={styles.fixValue}>
          {messages.sanitize.sanitized}: <code>{sanitizedValue}</code>
        </p>
      ) : null}
      {fixes.length > 0 ? (
        <ul className={styles.fixList}>
          {fixes.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.fixEmpty}>{messages.sanitize.noFixes}</p>
      )}
    </div>
  );
}
