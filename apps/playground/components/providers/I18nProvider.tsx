'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMessages } from '@/lib/i18n';
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from '@/lib/i18n/types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: ReturnType<typeof getMessages>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const stored = globalThis.localStorage.getItem('locale');
  if (stored && isLocale(stored)) return stored;
  const dataset = document.documentElement.dataset.locale;
  if (dataset && isLocale(dataset)) return dataset;
  return DEFAULT_LOCALE;
}

function applyLocale(locale: Locale) {
  const htmlLang = LOCALES.find((item) => item.code === locale)?.htmlLang ?? 'pt-BR';
  document.documentElement.lang = htmlLang;
  document.documentElement.dataset.locale = locale;
  globalThis.localStorage.setItem('locale', locale);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = readInitialLocale();
    setLocaleState(initial);
    applyLocale(initial);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    applyLocale(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: getMessages(locale),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
