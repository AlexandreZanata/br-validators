'use client';

import { useMemo, useState } from 'react';
import {
  diff,
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

export function PlatformDiff() {
  const { messages } = useI18n();
  const copy = messages.platform.diff;
  const [type, setType] = useState<PlatformDocumentType>('cpf');
  const [valueA, setValueA] = useState('12345678909');
  const [valueB, setValueB] = useState('12345678901');
  const [uf, setUf] = useState<UfCode>('SP');

  const result = useMemo(() => {
    if (!valueA || !valueB) return null;
    const options = UF_TYPES.has(type) ? { uf } : {};
    return diff(valueA, valueB, type, options);
  }, [type, valueA, valueB, uf]);

  const cliCommand =
    valueA && valueB
      ? `br-validators diff ${type} ${valueA.includes(' ') ? `"${valueA}"` : valueA} ${valueB.includes(' ') ? `"${valueB}"` : valueB} --json`
      : '';

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="diff-type">{copy.typeLabel}</Label>
        <Select
          id="diff-type"
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
          <Label htmlFor="diff-uf">{copy.ufLabel}</Label>
          <Select
            id="diff-uf"
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
        <Label htmlFor="diff-a">{copy.valueALabel}</Label>
        <CopyableInput
          id="diff-a"
          value={valueA}
          onChange={(e) => {
            setValueA(e.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="diff-b">{copy.valueBLabel}</Label>
        <CopyableInput
          id="diff-b"
          value={valueB}
          onChange={(e) => {
            setValueB(e.target.value);
          }}
        />
      </div>

      {result ? (
        <ResultSection title={messages.sections.result}>
          <ResultRow label={copy.changedLabel} value={result.changed ? copy.yes : copy.no} />
          {result.fields.map((field) => (
            <ResultRow
              key={field.field}
              label={field.field}
              value={`${field.a} → ${field.b}`}
              mono
            />
          ))}
        </ResultSection>
      ) : null}

      {result ? <CopyableCode code={JSON.stringify(result, null, 2)} label={messages.common.json} /> : null}
      <CliCommandHint code={cliCommand} />
    </main>
  );
}
