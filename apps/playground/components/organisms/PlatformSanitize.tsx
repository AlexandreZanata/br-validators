'use client';

import { useMemo, useState } from 'react';
import {
  IE_SUPPORTED_UFS,
  sanitize,
  type SanitizableDocumentType,
  type UfCode,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { CopyableInput } from '@/components/molecules/CopyableInput';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { FixesList } from '@/components/molecules/FixesList';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

const SANITIZABLE_TYPES: { value: SanitizableDocumentType; label: string }[] = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'cep', label: 'CEP' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'placa', label: 'Placa' },
  { value: 'pis-pasep', label: 'PIS/PASEP' },
  { value: 'cnh', label: 'CNH' },
  { value: 'renavam', label: 'RENAVAM' },
  { value: 'titulo-eleitor', label: 'Título de Eleitor' },
  { value: 'nfe-chave', label: 'NF-e Chave' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao-credito', label: 'Cartão de Crédito' },
  { value: 'inscricao-estadual', label: 'Inscrição Estadual' },
  { value: 'inscricao-estadual-produtor-rural', label: 'IE SP Produtor Rural' },
  { value: 'pix', label: 'PIX key' },
];

export function PlatformSanitize() {
  const { messages } = useI18n();
  const copy = messages.platform.sanitize;
  const [input, setInput] = useState('123456789O9');
  const [type, setType] = useState<SanitizableDocumentType>('cpf');
  const [uf, setUf] = useState<UfCode>('SP');

  const result = useMemo(() => {
    if (!input) return null;
    if (type === 'inscricao-estadual') {
      return sanitize(input, type, { uf });
    }
    return sanitize(input, type);
  }, [input, type, uf]);

  const cliCommand = input
    ? type === 'inscricao-estadual'
      ? `br-validators sanitize ${input.includes(' ') ? `"${input}"` : input} --type inscricao-estadual --uf ${uf}`
      : `br-validators sanitize ${input.includes(' ') ? `"${input}"` : input} --type ${type}`
    : '';

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="sanitize-type">{copy.typeLabel}</Label>
        <Select
          id="sanitize-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as SanitizableDocumentType);
          }}
        >
          {SANITIZABLE_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      {type === 'inscricao-estadual' ? (
        <div>
          <Label htmlFor="sanitize-uf">{copy.ufLabel}</Label>
          <Select
            id="sanitize-uf"
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
        <Label htmlFor="sanitize-input">{copy.inputLabel}</Label>
        <CopyableInput
          id="sanitize-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
      </div>

      {result ? (
        <FixesList
          fixes={result.ok ? result.fixes : []}
          sanitizedValue={result.ok ? result.value : undefined}
          ok={result.ok}
          message={result.ok ? undefined : result.message}
        />
      ) : null}

      <CliCommandHint code={cliCommand} />
    </main>
  );
}
