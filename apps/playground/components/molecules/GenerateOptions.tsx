'use client';

import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

export type GenerateOptionsState = {
  seed?: number;
  masked: boolean;
  format?: string;
};

type Props = {
  formats?: readonly string[];
  options: GenerateOptionsState;
  onChange: (options: GenerateOptionsState) => void;
};

export function GenerateOptions({ formats, options, onChange }: Props) {
  const { messages } = useI18n();

  return (
    <div className={styles.generateOptions}>
      <div>
        <Label htmlFor="gen-seed">{messages.generate.seed}</Label>
        <Input
          id="gen-seed"
          type="number"
          value={options.seed ?? ''}
          placeholder={messages.generate.seedPlaceholder}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({
              ...options,
              seed: raw === '' ? undefined : Number(raw),
            });
          }}
        />
      </div>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={options.masked}
          onChange={(e) => {
            onChange({ ...options, masked: e.target.checked });
          }}
        />
        {messages.generate.masked}
      </label>
      {formats && formats.length > 0 ? (
        <div>
          <Label htmlFor="gen-format">{messages.generate.format}</Label>
          <Select
            id="gen-format"
            value={options.format ?? formats[0]}
            onChange={(e) => {
              onChange({ ...options, format: e.target.value });
            }}
          >
            {formats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  );
}
