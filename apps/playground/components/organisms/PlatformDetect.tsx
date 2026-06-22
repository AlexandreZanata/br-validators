'use client';

import { useMemo, useState } from 'react';
import { detect, IE_SUPPORTED_UFS, type UfCode } from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { CopyableCode } from '@/components/molecules/CopyableCode';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

export function PlatformDetect() {
  const { messages } = useI18n();
  const copy = messages.platform.detect;
  const [input, setInput] = useState('123.456.789-09');
  const [uf, setUf] = useState<UfCode>('SP');

  const result = useMemo(() => (input ? detect(input, { uf }) : null), [input, uf]);

  const cliCommand = input
    ? `br-validators detect ${input.includes(' ') ? `"${input}"` : input} --json`
    : '';

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="detect-input">{copy.inputLabel}</Label>
        <Input
          id="detect-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="detect-uf">{copy.ufLabel}</Label>
        <Select
          id="detect-uf"
          value={uf}
          onChange={(e) => {
            setUf(e.target.value as UfCode);
          }}
        >
          {IE_SUPPORTED_UFS.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
      </div>

      {result ? (
        <ResultSection title={messages.sections.result}>
          <ResultRow label="Type" value={result.type} />
          <ResultRow label="OK" value={result.ok ? 'yes' : 'no'} />
          {result.ok ? (
            <>
              <ResultRow label="Value" value={result.value} mono />
              {'format' in result && result.format ? (
                <ResultRow label="Format" value={result.format} />
              ) : null}
            </>
          ) : (
            <ResultRow label="Code" value={result.code} />
          )}
        </ResultSection>
      ) : null}

      {result ? <CopyableCode code={JSON.stringify(result, null, 2)} label={messages.common.json} /> : null}
      <CliCommandHint code={cliCommand} />
    </main>
  );
}
