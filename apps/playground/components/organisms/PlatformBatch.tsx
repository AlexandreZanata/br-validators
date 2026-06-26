'use client';

import { useMemo, useState } from 'react';
import {
  batch,
  IE_SUPPORTED_UFS,
  type UfCode,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { CopyableTextArea } from '@/components/molecules/CopyableTextArea';
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

const DEFAULT_LINES = '12345678909\n123.456.789-09\ninvalid';

export function PlatformBatch() {
  const { messages } = useI18n();
  const copy = messages.platform.batch;
  const [type, setType] = useState<PlatformDocumentType>('cpf');
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [uf, setUf] = useState<UfCode>('SP');

  const inputs = useMemo(
    () =>
      lines
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [lines],
  );

  const result = useMemo(() => {
    if (inputs.length === 0) return null;
    const options = UF_TYPES.has(type) ? { uf } : {};
    return batch(inputs, type, options);
  }, [inputs, type, uf]);

  const cliCommand = lines ? `br-validators batch ${type} --json  # pipe one value per line` : '';

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="batch-type">{copy.typeLabel}</Label>
        <Select
          id="batch-type"
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
          <Label htmlFor="batch-uf">{copy.ufLabel}</Label>
          <Select
            id="batch-uf"
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
        <Label htmlFor="batch-lines">{copy.inputLabel}</Label>
        <CopyableTextArea
          id="batch-lines"
          value={lines}
          rows={6}
          onChange={(e) => {
            setLines(e.target.value);
          }}
        />
      </div>

      {result ? (
        <ResultSection title={messages.sections.result}>
          <ResultRow label={copy.totalLabel} value={String(result.summary.total)} />
          <ResultRow label={copy.validLabel} value={String(result.summary.valid)} />
          <ResultRow label={copy.invalidLabel} value={String(result.summary.invalid)} />
        </ResultSection>
      ) : null}

      {result ? <CopyableCode code={JSON.stringify(result, null, 2)} label={messages.common.json} /> : null}
      <CliCommandHint code={cliCommand} />
    </main>
  );
}
