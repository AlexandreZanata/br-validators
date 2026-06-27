'use client';

import { useMemo, useState } from 'react';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import type { Messages } from '@/lib/i18n/types';
import {
  resolveIssMunicipalExplorerResults,
} from '@/lib/reference-data/iss-municipal-filter';
import type { CstTax } from '@br-validators/core/cst';
import { getIssMunicipalUfsDisponiveis } from '@br-validators/core/iss-municipal';
import {
  GOVBR_GROUPS,
  type GovBrGroupId,
  type GovBrModuleDefinition,
  type GovBrModuleId,
  type GovBrLookupRow,
} from '@/lib/reference-data/govbr-groups';
import styles from './organisms.module.css';

function formatFieldValue(value: string | number | null): string {
  if (value === null) {
    return '—';
  }
  return String(value);
}

function formatIssMunicipalCountLabel(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

function formatIssMunicipalListPreview(template: string, shown: number, count: number): string {
  return template.replace('{shown}', String(shown)).replace('{count}', String(count));
}

type GroupModuleCopy = {
  label: string;
  fields: Record<string, string>;
};

type ExplorerMode = 'lookup' | 'validate';

const CST_TAX_OPTIONS: readonly CstTax[] = ['icms', 'ipi', 'pis', 'cofins'];

function getGroupModuleCopy(
  messages: Messages,
  groupId: GovBrGroupId,
  moduleId: GovBrModuleId,
): GroupModuleCopy {
  if (groupId === 'fiscal') {
    return messages.referenceData.fiscal.modules[
      moduleId as
        | 'naturezaJuridica'
        | 'nbs'
        | 'cest'
        | 'cnae'
        | 'cfop'
        | 'ncm'
        | 'nfeCuf'
        | 'cbo'
        | 'cst'
        | 'issMunicipal'
    ];
  }
  if (groupId === 'trade') {
    return messages.referenceData.trade.modules[moduleId as 'moedas' | 'paisesBacen' | 'incoterms'];
  }
  return messages.referenceData.logistics.modules[moduleId as 'portos' | 'aeroportos'];
}

export function DataGovBrGroupExplorer({ groupId }: { groupId: GovBrGroupId }) {
  const { messages } = useI18n();
  const copy = messages.referenceData[groupId];
  const fiscalCopy = groupId === 'fiscal' ? messages.referenceData.fiscal : null;
  const modules = GOVBR_GROUPS[groupId];
  const issMunicipalUfs = useMemo(() => getIssMunicipalUfsDisponiveis(), []);
  const [activeModuleId, setActiveModuleId] = useState<GovBrModuleId>(modules[0].id);
  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId) ?? modules[0],
    [activeModuleId, modules],
  );
  const [lookupInput, setLookupInput] = useState(activeModule.defaultCode);
  const [issMunicipalUf, setIssMunicipalUf] = useState('');
  const [mode, setMode] = useState<ExplorerMode>('lookup');
  const [cstTax, setCstTax] = useState<CstTax>(activeModule.defaultCstTax ?? 'icms');

  const moduleCopy = getGroupModuleCopy(messages, groupId, activeModule.id);
  const supportsValidate = activeModule.validate !== undefined;
  const isIssMunicipalModule = activeModule.id === 'issMunicipal';

  const issMunicipalExplorer = useMemo(() => {
    if (!isIssMunicipalModule) {
      return null;
    }
    return resolveIssMunicipalExplorerResults(lookupInput, issMunicipalUf);
  }, [isIssMunicipalModule, lookupInput, issMunicipalUf]);

  const lookupResult = useMemo((): GovBrLookupRow | null => {
    if (isIssMunicipalModule) {
      if (issMunicipalExplorer?.mode === 'single') {
      const row = issMunicipalExplorer.rows.at(0);
      if (row === undefined) {
        return null;
      }
        return {
          codigoIbge: row.codigoIbge,
          nome: row.nome,
          uf: row.uf,
          aliquotaMin: row.aliquotaMin,
          aliquotaMax: row.aliquotaMax,
          warning: row.warning,
        };
      }
      return null;
    }
    return activeModule.lookup(lookupInput);
  }, [activeModule, isIssMunicipalModule, issMunicipalExplorer, lookupInput]);

  const validateResult = useMemo(() => {
    if (!supportsValidate) {
      return undefined;
    }
    return activeModule.validate?.(lookupInput, { cstTax });
  }, [activeModule, lookupInput, supportsValidate, cstTax]);

  function selectModule(module: GovBrModuleDefinition) {
    setActiveModuleId(module.id);
    setLookupInput(module.defaultCode);
    setIssMunicipalUf('');
    setMode('lookup');
    if (module.defaultCstTax !== undefined) {
      setCstTax(module.defaultCstTax);
    }
  }

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {activeModule.capturadoEm}
          {' · '}
          <OfficialSourceLink href={activeModule.sourceUrl} label={copy.officialSource} />
        </p>
      </header>

      <div className={styles.referenceDataTabs} role="tablist" aria-label={copy.moduleTabLabel}>
        {modules.map((module) => {
          const selected = module.id === activeModule.id;
          return (
            <button
              key={module.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`${styles.referenceDataTab} ${selected ? styles.referenceDataTabActive : ''}`.trim()}
              onClick={() => {
                selectModule(module);
              }}
            >
              {getGroupModuleCopy(messages, groupId, module.id).label}
            </button>
          );
        })}
      </div>

      {fiscalCopy && activeModule.id === 'issMunicipal' ? (
        <p className={styles.description}>{fiscalCopy.issMunicipalDisclaimer}</p>
      ) : null}

      {fiscalCopy && isIssMunicipalModule ? (
        <div>
          <Label htmlFor={`${groupId}-iss-municipal-uf`}>{fiscalCopy.issMunicipalUfFilter}</Label>
          <Select
            id={`${groupId}-iss-municipal-uf`}
            value={issMunicipalUf}
            onChange={(event) => {
              setIssMunicipalUf(event.target.value);
            }}
          >
            <option value="">{fiscalCopy.issMunicipalUfAll}</option>
            {issMunicipalUfs.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
          {issMunicipalUf.length > 0 && issMunicipalExplorer !== null ? (
            <p className={styles.description}>
              {formatIssMunicipalCountLabel(
                fiscalCopy.issMunicipalCountLabel,
                issMunicipalExplorer.totalForUf,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {fiscalCopy && supportsValidate ? (
        <div className={styles.referenceDataTabs} role="tablist" aria-label={fiscalCopy.modeTabLabel}>
          {(['lookup', 'validate'] as const).map((tabMode) => {
            const selected = mode === tabMode;
            return (
              <button
                key={tabMode}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`${styles.referenceDataTab} ${selected ? styles.referenceDataTabActive : ''}`.trim()}
                onClick={() => {
                  setMode(tabMode);
                }}
              >
                {tabMode === 'lookup' ? fiscalCopy.lookupModeLabel : fiscalCopy.validateModeLabel}
              </button>
            );
          })}
        </div>
      ) : null}

      <div>
        <Label htmlFor={`${groupId}-${activeModule.id}-lookup`}>{copy.lookupLabel}</Label>
        <Input
          id={`${groupId}-${activeModule.id}-lookup`}
          value={lookupInput}
          placeholder={copy.lookupPlaceholder}
          onChange={(event) => {
            setLookupInput(event.target.value);
          }}
        />
      </div>

      {fiscalCopy && activeModule.validateRequiresCstTax && mode === 'validate' ? (
        <div>
          <Label htmlFor={`${groupId}-${activeModule.id}-cst-tax`}>{fiscalCopy.cstTaxLabel}</Label>
          <Select
            id={`${groupId}-${activeModule.id}-cst-tax`}
            value={cstTax}
            onChange={(event) => {
              setCstTax(event.target.value as CstTax);
            }}
          >
            {CST_TAX_OPTIONS.map((tax) => (
              <option key={tax} value={tax}>
                {tax.toUpperCase()}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {mode === 'validate' && fiscalCopy && validateResult ? (
        validateResult.ok ? (
          <ResultSection title={fiscalCopy.validateResultTitle}>
            <ResultRow label={fiscalCopy.validateFields.value} value={validateResult.value} />
            <ResultRow label={fiscalCopy.validateFields.description} value={validateResult.description} />
            {validateResult.format !== undefined ? (
              <ResultRow label={fiscalCopy.validateFields.format} value={validateResult.format} />
            ) : null}
          </ResultSection>
        ) : lookupInput.trim() ? (
          <p className={styles.description}>
            {fiscalCopy.validateError}: {validateResult.code} — {validateResult.message}
          </p>
        ) : null
      ) : null}

      {mode === 'lookup' && isIssMunicipalModule && issMunicipalExplorer?.mode === 'list' && fiscalCopy ? (
        <>
          <p className={styles.description}>
            {formatIssMunicipalListPreview(
              fiscalCopy.issMunicipalListPreview,
              issMunicipalExplorer.rows.length,
              issMunicipalExplorer.totalForUf,
            )}
          </p>
          {issMunicipalExplorer.rows.map((row) => (
            <ResultSection key={row.codigoIbge} title={`${row.nome}/${row.uf}`}>
              {activeModule.fieldKeys.map((fieldKey) => (
                <ResultRow
                  key={`${String(row.codigoIbge)}-${fieldKey}`}
                  label={moduleCopy.fields[fieldKey] ?? fieldKey}
                  value={formatFieldValue(
                    fieldKey === 'codigoIbge'
                      ? row.codigoIbge
                      : fieldKey === 'nome'
                        ? row.nome
                        : fieldKey === 'uf'
                          ? row.uf
                          : fieldKey === 'aliquotaMin'
                            ? row.aliquotaMin
                            : fieldKey === 'aliquotaMax'
                              ? row.aliquotaMax
                              : fieldKey === 'warning'
                                ? row.warning
                                : null,
                  )}
                />
              ))}
            </ResultSection>
          ))}
        </>
      ) : null}

      {mode === 'lookup' && isIssMunicipalModule && issMunicipalExplorer?.mode === 'search' ? (
        <>
          {issMunicipalExplorer.rows.map((row) => (
            <ResultSection key={row.codigoIbge} title={`${row.nome}/${row.uf}`}>
              {activeModule.fieldKeys.map((fieldKey) => (
                <ResultRow
                  key={`${String(row.codigoIbge)}-${fieldKey}`}
                  label={moduleCopy.fields[fieldKey] ?? fieldKey}
                  value={formatFieldValue(
                    fieldKey === 'codigoIbge'
                      ? row.codigoIbge
                      : fieldKey === 'nome'
                        ? row.nome
                        : fieldKey === 'uf'
                          ? row.uf
                          : fieldKey === 'aliquotaMin'
                            ? row.aliquotaMin
                            : fieldKey === 'aliquotaMax'
                              ? row.aliquotaMax
                              : fieldKey === 'warning'
                                ? row.warning
                                : null,
                  )}
                />
              ))}
            </ResultSection>
          ))}
        </>
      ) : null}

      {mode === 'lookup' && lookupResult ? (
        <ResultSection title={copy.resultTitle}>
          {activeModule.fieldKeys.map((fieldKey) => (
            <ResultRow
              key={fieldKey}
              label={moduleCopy.fields[fieldKey] ?? fieldKey}
              value={formatFieldValue(lookupResult[fieldKey] ?? null)}
            />
          ))}
        </ResultSection>
      ) : null}

      {mode === 'lookup' &&
      !lookupResult &&
      lookupInput.trim() &&
      (!isIssMunicipalModule || issMunicipalExplorer?.mode === 'single' || issMunicipalExplorer?.mode === 'search') ? (
        <p className={styles.description}>{copy.notFound}</p>
      ) : null}
    </main>
  );
}
