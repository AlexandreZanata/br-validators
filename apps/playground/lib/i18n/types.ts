export type Locale = 'pt' | 'en';

export type Messages = typeof import('./messages/en').en;

export const LOCALES: { code: Locale; htmlLang: string; flag: string; label: string }[] = [
  { code: 'pt', htmlLang: 'pt-BR', flag: '/flags/br.svg', label: 'Português' },
  { code: 'en', htmlLang: 'en', flag: '/flags/us.svg', label: 'English' },
];

export const DEFAULT_LOCALE: Locale = 'pt';

export function isLocale(value: string): value is Locale {
  return value === 'pt' || value === 'en';
}
