import { en } from './messages/en';
import { pt } from './messages/pt';
import type { Locale } from './types';

const catalogs: Record<Locale, typeof en> = {
  en,
  pt: pt as typeof en,
};

export function getMessages(locale: Locale) {
  return catalogs[locale];
}

export { en, pt };
