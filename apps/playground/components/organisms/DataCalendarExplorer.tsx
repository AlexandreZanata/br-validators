'use client';

import { useMemo, useState } from 'react';
import {
  FERIADOS_DATA_VERSION,
  FERIADOS_GOV_CALENDARIO_URL,
  getAllFeriados,
} from '@br-validators/core/feriados';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

const CURRENT_YEAR = new Date().getUTCFullYear();

export function DataCalendarExplorer() {
  const { messages } = useI18n();
  const copy = messages.referenceData.calendar;
  const [yearInput, setYearInput] = useState(String(CURRENT_YEAR));

  const year = useMemo(() => {
    const parsed = Number(yearInput.replace(/\D/g, ''));
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return CURRENT_YEAR;
    }
    return parsed;
  }, [yearInput]);

  const feriados = useMemo(() => getAllFeriados(year), [year]);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {FERIADOS_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={FERIADOS_GOV_CALENDARIO_URL} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="calendar-year">{copy.yearLabel}</Label>
        <Input
          id="calendar-year"
          value={yearInput}
          inputMode="numeric"
          placeholder={copy.yearPlaceholder}
          onChange={(event) => {
            setYearInput(event.target.value);
          }}
        />
      </div>

      <ResultSection title={copy.holidaysTitle}>
        <p className={styles.description}>
          {copy.holidayCount}: {feriados.length}
        </p>
        <ul className={styles.referenceDataList}>
          {feriados.map((feriado) => (
            <li key={feriado.data}>
              <code>{feriado.data}</code> — {feriado.nome} ({feriado.tipo})
            </li>
          ))}
        </ul>
      </ResultSection>

      {feriados[0] ? (
        <ResultSection title={copy.sampleTitle}>
          <ResultRow label={copy.dateField} value={feriados[0].data} />
          <ResultRow label={copy.nameField} value={feriados[0].nome} />
          <ResultRow label={copy.typeField} value={feriados[0].tipo} />
        </ResultSection>
      ) : null}
    </main>
  );
}
