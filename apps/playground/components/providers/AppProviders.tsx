'use client';

import { I18nProvider } from '@/components/providers/I18nProvider';
import { PlaygroundRouterProvider } from '@/components/providers/PlaygroundRouterProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <PlaygroundRouterProvider>{children}</PlaygroundRouterProvider>
    </I18nProvider>
  );
}
