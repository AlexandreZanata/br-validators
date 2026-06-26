'use client';

import { useMemo, useState } from 'react';
import {
  BCB_SELIC_SGS_API_URL,
  SELIC_DATA_VERSION,
  getSelicHistorico,
  getSelicMeta,
  getSelicMetaPorData,
} from '@br-validators/core/selic';
import { getPtaxUltimoDiaUtil } from '@br-validators/core/ptax';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

export function DataFinanceExplorer() {
  const { messages } = useI18n();
  const copy = messages.referenceData.finance;
  const [dateInput, setDateInput] = useState('');

  const meta = useMemo(() => {
    const trimmed = dateInput.trim();
    if (trimmed.length === 0) {
      return getSelicMeta();
    }
    return getSelicMetaPorData(trimmed);
  }, [dateInput]);

  const recentChanges = useMemo(() => {
    const historico = getSelicHistorico({});
    const changes: { data: string; valor: number }[] = [];
    for (let index = 0; index < historico.length; index += 1) {
      const entry = historico[index];
      if (index === 0 || entry.valor !== historico[index - 1].valor) {
        changes.push({ data: entry.data, valor: entry.valor });
      }
    }
    return changes.slice(-4);
  }, []);

  const ptaxUsd = useMemo(() => getPtaxUltimoDiaUtil('USD'), []);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {SELIC_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={BCB_SELIC_SGS_API_URL} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="finance-date">{copy.dateLabel}</Label>
        <Input
          id="finance-date"
          value={dateInput}
          inputMode="numeric"
          placeholder={copy.datePlaceholder}
          onChange={(event) => {
            setDateInput(event.target.value);
          }}
        />
      </div>

      <ResultSection title={copy.selicTitle}>
        {meta === undefined ? (
          <p className={styles.description}>{copy.dateNotFound}</p>
        ) : (
          <>
            <ResultRow label={copy.dateField} value={meta.dataReferencia} />
            <ResultRow label={copy.rateField} value={`${meta.valor.toFixed(2)}% a.a.`} />
            <ResultRow label={copy.staleField} value={meta.isStale ? copy.staleYes : copy.staleNo} />
            {meta.warning !== undefined ? (
              <p className={styles.description}>{meta.warning}</p>
            ) : null}
          </>
        )}
      </ResultSection>

      <ResultSection title={copy.copomTitle}>
        <ul className={styles.referenceDataList}>
          {recentChanges.map((entry) => (
            <li key={entry.data}>
              <code>{entry.data}</code> — {entry.valor.toFixed(2)}% a.a.
            </li>
          ))}
        </ul>
      </ResultSection>

      <ResultSection title={copy.ptaxTitle}>
        {ptaxUsd === undefined ? (
          <p className={styles.description}>{copy.ptaxUnavailable}</p>
        ) : (
          <>
            <ResultRow label={copy.ptaxUsdField} value={`${ptaxUsd.cotacaoCompra} / ${ptaxUsd.cotacaoVenda}`} />
            <ResultRow label={copy.dateField} value={ptaxUsd.dataReferencia} />
          </>
        )}
      </ResultSection>
    </main>
  );
}
