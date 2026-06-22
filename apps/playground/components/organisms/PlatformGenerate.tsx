'use client';

import { useMemo, useState } from 'react';
import {
  generate,
  validateCpf,
  validateCnpj,
  validateCep,
  validatePlaca,
  validatePisPasep,
  validateRenavam,
  validateCnh,
  validateTelefone,
  validateCartaoCredito,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { GenerateOptions, type GenerateOptionsState } from '@/components/molecules/GenerateOptions';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { Button } from '@/components/atoms/Button';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

const GENERATABLE: { value: GeneratableDocumentType; label: string; formats?: string[] }[] = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ', formats: ['numeric', 'alphanumeric'] },
  { value: 'cep', label: 'CEP' },
  { value: 'telefone', label: 'Telefone', formats: ['celular', 'fixo'] },
  { value: 'placa', label: 'Placa', formats: ['mercosul', 'legacy'] },
  { value: 'pis-pasep', label: 'PIS/PASEP' },
  { value: 'cnh', label: 'CNH' },
  { value: 'renavam', label: 'RENAVAM' },
  { value: 'cartao-credito', label: 'Cartão de Crédito' },
];

function confirmValid(type: GeneratableDocumentType, value: string): boolean {
  switch (type) {
    case 'cpf':
      return validateCpf(value).ok;
    case 'cnpj':
      return validateCnpj(value).ok;
    case 'cep':
      return validateCep(value).ok;
    case 'placa':
      return validatePlaca(value).ok;
    case 'pis-pasep':
      return validatePisPasep(value).ok;
    case 'renavam':
      return validateRenavam(value).ok;
    case 'cnh':
      return validateCnh(value).ok;
    case 'telefone':
      return validateTelefone(value).ok;
    case 'cartao-credito':
      return validateCartaoCredito(value).ok;
    default:
      return false;
  }
}

export function PlatformGenerate() {
  const { messages } = useI18n();
  const copy = messages.platform.generate;
  const [type, setType] = useState<GeneratableDocumentType>('cpf');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<GenerateOptionsState>({ masked: false });

  const selected = GENERATABLE.find((item) => item.value === type);
  const formats = selected?.formats;

  const valid = useMemo(
    () => (output ? confirmValid(type, output) : null),
    [type, output],
  );

  const handleGenerate = () => {
    const value = generate(type, {
      seed: options.seed,
      masked: options.masked,
      format: options.format as 'numeric' | 'alphanumeric' | 'legacy' | 'mercosul' | 'celular' | 'fixo' | undefined,
    });
    setOutput(value);
  };

  const cliCommand = `br-validators generate --type ${type} --json`;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="generate-type">{copy.typeLabel}</Label>
        <Select
          id="generate-type"
          value={type}
          onChange={(e) => {
            const next = e.target.value as GeneratableDocumentType;
            setType(next);
            const nextFormats = GENERATABLE.find((item) => item.value === next)?.formats;
            setOptions({ masked: false, format: nextFormats?.[0] });
            setOutput('');
          }}
        >
          {GENERATABLE.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <GenerateOptions formats={formats} options={options} onChange={setOptions} />

      <Button type="button" variant="primary" onClick={handleGenerate}>
        {messages.actions.generateRun}
      </Button>

      {output ? (
        <ResultSection title={messages.sections.output}>
          <ResultRow label={messages.common.value} value={output} mono />
          <ResultRow label={messages.common.valid} value={valid ? 'yes' : 'no'} />
        </ResultSection>
      ) : null}

      <CliCommandHint code={cliCommand} />
    </main>
  );
}
