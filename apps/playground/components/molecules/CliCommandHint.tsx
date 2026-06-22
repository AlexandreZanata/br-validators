'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { CopyableCode } from './CopyableCode';

export function CliCommandHint({ code }: { code: string }) {
  const { messages } = useI18n();
  if (!code) return null;
  return <CopyableCode code={code} label={messages.common.cliEquivalent} />;
}
