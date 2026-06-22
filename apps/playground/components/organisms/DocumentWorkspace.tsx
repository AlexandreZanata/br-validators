'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  IE_SUPPORTED_UFS,
  validatePixKey,
  type UfCode,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { ActionTabs } from '@/components/molecules/ActionTabs';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { FixesList } from '@/components/molecules/FixesList';
import { GenerateOptions, type GenerateOptionsState } from '@/components/molecules/GenerateOptions';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { QrCodePanel } from '@/components/organisms/QrCodePanel';
import { useI18n } from '@/components/providers/I18nProvider';
import { CAPABILITIES, enabledTabs, type ActionTab } from '@/lib/capabilities';
import { buildCliCommand, computeDocumentResults } from '@/lib/document-results';
import { DOCUMENT_META, ieOfficialLink } from '@/lib/document-meta';
import type { DocumentSlug } from '@/lib/nav';
import { goldenSample, playgroundGenerate } from '@/lib/playground-generate';
import { IE_SAMPLES } from '@/lib/generators/ie';
import styles from './organisms.module.css';

const UF_LABELS: Record<UfCode, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais',
  MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia',
  RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo',
  TO: 'Tocantins',
};

type Props = {
  slug: DocumentSlug;
  renderAfter?: (ctx: { input: string }) => ReactNode;
};

export function DocumentWorkspace({ slug, renderAfter }: Props) {
  const panelId = useId();
  const { messages } = useI18n();
  const meta = DOCUMENT_META[slug];
  const copy = messages.documents[slug];
  const capabilities = CAPABILITIES[slug];
  const tabs = enabledTabs(capabilities);

  const [input, setInput] = useState(meta.defaultInput);
  const [activeTab, setActiveTab] = useState<ActionTab>(tabs[0] ?? 'validate');
  const [uf, setUf] = useState<UfCode>('SP');
  const [generateOptions, setGenerateOptions] = useState<GenerateOptionsState>({
    masked: false,
    format: capabilities.generateFormats?.[0],
  });

  const results = useMemo(
    () => computeDocumentResults(slug, input, uf),
    [slug, input, uf],
  );

  const cliCommand = useMemo(
    () => buildCliCommand(slug, activeTab, input, results?.stripped ?? '', uf),
    [slug, activeTab, input, results?.stripped, uf],
  );

  const pixValidation = slug === 'pix' && input ? validatePixKey(input) : null;

  const handleGenerate = () => {
    try {
      const sample = goldenSample(slug);
      if (sample) {
        setInput(sample);
        return;
      }
      setInput(
        playgroundGenerate(slug, {
          seed: generateOptions.seed,
          masked: generateOptions.masked,
          format: generateOptions.format,
          uf,
        }),
      );
    } catch {
      // unsupported generate — no-op
    }
  };

  const officialLinks =
    slug === 'ie'
      ? [ieOfficialLink(uf)]
      : meta.officialLinks;

  const canGenerate = capabilities.generate || goldenSample(slug) !== null;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      {capabilities.ufSelector ? (
        <div>
          <Label htmlFor={`${panelId}-uf`}>{messages.common.uf}</Label>
          <Select
            id={`${panelId}-uf`}
            value={uf}
            onChange={(e) => {
              const next = e.target.value as UfCode;
              setUf(next);
              if (slug === 'ie') {
                setInput(IE_SAMPLES[next]);
              }
            }}
          >
            {IE_SUPPORTED_UFS.map((code) => (
              <option key={code} value={code}>
                {code} — {UF_LABELS[code]}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <DocumentInput
        id={`${panelId}-input`}
        label={copy.inputLabel}
        value={input}
        placeholder={'inputPlaceholder' in copy ? copy.inputPlaceholder : undefined}
        multiline={capabilities.multiline}
        onChange={setInput}
        showGenerate={canGenerate}
        onGenerate={canGenerate ? handleGenerate : undefined}
      />

      <ActionTabs
        tabs={tabs}
        activeTab={activeTab}
        panelId={panelId}
        onChange={setActiveTab}
      />

      {activeTab === 'generate' && capabilities.generate ? (
        <GenerateOptions
          formats={capabilities.generateFormats}
          options={generateOptions}
          onChange={setGenerateOptions}
        />
      ) : null}

      {activeTab === 'validate' && results ? (
        <ResultSection title={messages.sections.validation}>
          <ResultRow label={results.validationLabel} value={results.validationDetail} />
          {results.extraRows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
          ))}
        </ResultSection>
      ) : null}

      {activeTab === 'strip' && results ? (
        <ResultSection title={messages.sections.strip}>
          <ResultRow label="Stripped" value={results.stripped || '—'} mono />
        </ResultSection>
      ) : null}

      {activeTab === 'format' && results ? (
        <ResultSection title={messages.sections.format}>
          <ResultRow label={results.formattedLabel} value={results.formattedValue} mono />
        </ResultSection>
      ) : null}

      {activeTab === 'sanitize' && results?.sanitizeResult ? (
        <ResultSection title={messages.sections.sanitize}>
          <FixesList
            fixes={results.sanitizeResult.ok ? results.sanitizeResult.fixes : []}
            sanitizedValue={results.sanitizeResult.ok ? results.sanitizeResult.value : undefined}
            ok={results.sanitizeResult.ok}
            message={results.sanitizeResult.ok ? undefined : results.sanitizeResult.message}
          />
        </ResultSection>
      ) : null}

      {activeTab === 'generate' ? (
        <ResultSection title={messages.sections.generate}>
          <ResultRow label={messages.common.hint} value={messages.generate.hint} />
        </ResultSection>
      ) : null}

      {renderAfter?.({ input })}

      {capabilities.qrCode && !renderAfter && pixValidation?.ok ? (
        <QrCodePanel value={pixValidation.value} />
      ) : null}

      {officialLinks.map((link) => (
        <OfficialSourceLink key={link.href} href={link.href} label={link.label} />
      ))}
      <CliCommandHint code={cliCommand} />
    </main>
  );
}
