'use client';

import { useMemo, useState } from 'react';
import {
  compare,
  IE_SUPPORTED_UFS,
  type UfCode,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { CopyableInput } from '@/components/molecules/CopyableInput';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { CopyableCode } from '@/components/molecules/CopyableCode';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

const PLATFORM_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'processo-judicial',
  'rg',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'ean',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'pix',
  'brcode',
] as const;

type PlatformDocumentType = (typeof PLATFORM_TYPES)[number];

const UF_TYPES = new Set<PlatformDocumentType>(['inscricao-estadual', 'rg', 'titulo-eleitor']);

export function PlatformCompare() {
  const { messages } = useI18n();
  const copy = messages.platform.compare;
  const [type, setType] = useState<PlatformDocumentType>('cpf');
  const [valueA, setValueA] = useState('123.456.789-09');
  const [valueB, setValueB] = useState('12345678909');
  const [uf, setUf] = useState<UfCode>('SP');

  const result = useMemo(() => {
    if (!valueA || !valueB) return null;
    const options = UF_TYPES.has(type) ? { uf } : {};
    return compare(valueA, valueB, type, options);
  }, [type, valueA, valueB, uf]);

  const cliCommand =
    valueA && valueB
      ? `br-validators compare ${type} ${valueA.includes(' ') ? `"${valueA}"` : valueA} ${valueB.includes(' ') ? `"${valueB}"` : valueB} --json`
      : '';

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="compare-type">{copy.typeLabel}</Label>
        <Select
          id="compare-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as PlatformDocumentType);
          }}
        >
          {PLATFORM_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      {UF_TYPES.has(type) ? (
        <div>
          <Label htmlFor="compare-uf">{copy.ufLabel}</Label>
          <Select
            id="compare-uf"
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
      ) : null}

      <div>
        <Label htmlFor="compare-a">{copy.valueALabel}</Label>
        <CopyableInput
          id="compare-a"
          value={valueA}
          onChange={(e) => {
            setValueA(e.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="compare-b">{copy.valueBLabel}</Label>
        <CopyableInput
          id="compare-b"
          value={valueB}
          onChange={(e) => {
            setValueB(e.target.value);
          }}
        />
      </div>

      {result ? (
        <ResultSection title={messages.sections.result}>
          <ResultRow label={copy.equalLabel} value={result.equal ? copy.yes : copy.no} />
        </ResultSection>
      ) : null}

      {result ? <CopyableCode code={JSON.stringify(result, null, 2)} label={messages.common.json} /> : null}
      <CliCommandHint code={cliCommand} />
    </main>
  );
}
