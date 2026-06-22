'use client';

import { FlagBr, FlagUs } from '@/components/atoms/flags';
import { useI18n } from '@/components/providers/I18nProvider';
import { LOCALES, type Locale } from '@/lib/i18n/types';
import styles from './atoms.module.css';

const FLAG_BY_LOCALE: Record<Locale, typeof FlagBr> = {
  pt: FlagBr,
  en: FlagUs,
};

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  return (
    <div className={styles.localeSwitcher} role="group" aria-label={messages.actions.selectLanguage}>
      {LOCALES.map((item) => {
        const active = item.code === locale;
        const Flag = FLAG_BY_LOCALE[item.code];
        return (
          <button
            key={item.code}
            type="button"
            className={`${styles.localeButton} ${active ? styles.localeButtonActive : ''}`.trim()}
            aria-label={item.label}
            aria-pressed={active}
            title={item.label}
            onClick={() => {
              setLocale(item.code);
            }}
          >
            <Flag className={styles.flagSvg} />
          </button>
        );
      })}
    </div>
  );
}
