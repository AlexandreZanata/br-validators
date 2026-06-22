'use client';

import { Button } from '@/components/atoms/Button';
import { SparklesIcon } from '@/components/atoms/icons';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { TextArea } from '@/components/atoms/TextArea';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

type Props = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  multiline?: boolean;
  showGenerate?: boolean;
};

export function DocumentInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  onGenerate,
  multiline = false,
  showGenerate = true,
}: Props) {
  const { messages } = useI18n();

  return (
    <div className={styles.fieldCard}>
      <Label htmlFor={id}>{label}</Label>
      <div className={styles.inputRow}>
        {multiline ? (
          <TextArea
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        ) : (
          <Input
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        )}
      </div>
      {showGenerate && onGenerate ? (
        <div className={styles.inputActions}>
          <Button type="button" variant="secondary" icon={<SparklesIcon />} onClick={onGenerate}>
            {messages.actions.generate}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
