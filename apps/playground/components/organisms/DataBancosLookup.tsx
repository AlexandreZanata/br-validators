'use client';

import { useMemo, useState } from 'react';
import { BANCOS_DATA_VERSION, getAllBancos } from '@br-validators/core/bancos';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import { filterBancosByQuery, resolveBancoFromInput } from '@/lib/reference-data/bancos-lookup';
import styles from './organisms.module.css';

const LIST_SAMPLE_LIMIT = 50;

export function DataBancosLookup() {
  const { messages } = useI18n();
  const copy = messages.referenceData.bancos;
  const [lookupInput, setLookupInput] = useState('001');
  const [listQuery, setListQuery] = useState('');
  const [showList, setShowList] = useState(true);

  const banco = useMemo(() => resolveBancoFromInput(lookupInput), [lookupInput]);
  const listSample = useMemo(() => {
    const filtered = filterBancosByQuery(getAllBancos(), listQuery);
    return filtered.slice(0, LIST_SAMPLE_LIMIT);
  }, [listQuery]);

  const sourceUrl = BANCOS_DATA_VERSION.endpoints[0] ?? BANCOS_DATA_VERSION.fonte;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {BANCOS_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={sourceUrl} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="bancos-lookup">{copy.lookupLabel}</Label>
        <Input
          id="bancos-lookup"
          value={lookupInput}
          inputMode="numeric"
          placeholder={copy.lookupPlaceholder}
          onChange={(event) => {
            setLookupInput(event.target.value);
          }}
        />
      </div>

      {banco ? (
        <ResultSection title={copy.resultTitle}>
          <ResultRow label={copy.codeField} value={banco.codigo} />
          <ResultRow label={copy.ispbField} value={banco.ispb} />
          <ResultRow label={copy.nameField} value={banco.nome} />
          <ResultRow label={copy.shortNameField} value={banco.nomeReduzido} />
        </ResultSection>
      ) : lookupInput.trim() ? (
        <p className={styles.description}>{copy.notFound}</p>
      ) : null}

      <div>
        <button
          type="button"
          className={styles.referenceDataToggle}
          aria-expanded={showList}
          onClick={() => {
            setShowList((previous) => !previous);
          }}
        >
          {showList ? copy.hideList : copy.showList}
        </button>
      </div>

      {showList ? (
        <>
          <div>
            <Label htmlFor="bancos-list-search">{copy.listSearchLabel}</Label>
            <Input
              id="bancos-list-search"
              value={listQuery}
              placeholder={copy.listSearchPlaceholder}
              onChange={(event) => {
                setListQuery(event.target.value);
              }}
            />
          </div>
          <ResultSection title={copy.listTitle}>
            <ul className={styles.referenceDataList}>
              {listSample.map((row) => (
                <li key={row.ispb}>
                  <code>{row.codigo}</code> — {row.nome}
                </li>
              ))}
            </ul>
          </ResultSection>
        </>
      ) : null}
    </main>
  );
}
