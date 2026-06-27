'use client';

import { useMemo, useState } from 'react';
import {
  IRPF_DATA_VERSION,
  IRPF_DEFAULT_ANO,
  IRPF_TABELA_PROGRESSIVA_MENSAL_URL,
  calcularIrpfMensal,
  getIrpfTabelaProgressiva,
} from '@br-validators/core/irpf';
import {
  INSS_ALIQUOTAS_URL,
  INSS_DATA_VERSION,
  calcularInssMensal,
  getInssTabelaContribuicao,
} from '@br-validators/core/inss';
import {
  ESOCIAL_DATA_VERSION,
  ESOCIAL_GOLDEN_SALARIO,
  ESOCIAL_TABELAS_URL,
  getEsocialRubricaPorCodigo,
  searchEsocialRubricas,
} from '@br-validators/core/esocial';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

export function DataPayrollExplorer() {
  const { messages } = useI18n();
  const copy = messages.referenceData.payroll;
  const [anoInput, setAnoInput] = useState(String(IRPF_DEFAULT_ANO));
  const [baseInput, setBaseInput] = useState('3000');
  const [rubricaCodeInput, setRubricaCodeInput] = useState(ESOCIAL_GOLDEN_SALARIO);
  const [rubricaSearchInput, setRubricaSearchInput] = useState('13º salário');

  const ano = useMemo(() => {
    const parsed = Number(anoInput.replace(/\D/g, ''));
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return IRPF_DEFAULT_ANO;
    }
    return parsed;
  }, [anoInput]);

  const irpfFaixas = useMemo(() => getIrpfTabelaProgressiva(ano), [ano]);
  const inssTabela = useMemo(() => getInssTabelaContribuicao(ano), [ano]);

  const baseCalculo = useMemo(() => {
    const normalized = baseInput.trim().replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }, [baseInput]);

  const irpfCalculo = useMemo(() => {
    if (baseCalculo === null) {
      return undefined;
    }
    return calcularIrpfMensal(baseCalculo, ano);
  }, [ano, baseCalculo]);

  const inssCalculo = useMemo(() => {
    if (baseCalculo === null) {
      return undefined;
    }
    return calcularInssMensal(baseCalculo, ano);
  }, [ano, baseCalculo]);

  const rubricaLookup = useMemo(
    () => getEsocialRubricaPorCodigo(rubricaCodeInput),
    [rubricaCodeInput],
  );

  const rubricaSearchResults = useMemo(
    () => searchEsocialRubricas(rubricaSearchInput, { limit: 8 }),
    [rubricaSearchInput],
  );

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="payroll-year">{copy.yearLabel}</Label>
        <Input
          id="payroll-year"
          value={anoInput}
          inputMode="numeric"
          placeholder={copy.yearPlaceholder}
          onChange={(event) => {
            setAnoInput(event.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="payroll-base">{copy.baseLabel}</Label>
        <Input
          id="payroll-base"
          value={baseInput}
          inputMode="decimal"
          placeholder={copy.basePlaceholder}
          onChange={(event) => {
            setBaseInput(event.target.value);
          }}
        />
      </div>

      <ResultSection title={copy.irpfTableTitle}>
        <p className={styles.description}>
          {copy.capturedAt}: {IRPF_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={IRPF_TABELA_PROGRESSIVA_MENSAL_URL} label={copy.irpfOfficialSource} />
        </p>
        {irpfFaixas === undefined ? (
          <p className={styles.description}>{copy.tableNotFound}</p>
        ) : (
          <ul className={styles.referenceDataList}>
            {irpfFaixas.map((faixa) => (
              <li key={`irpf-${String(faixa.faixa)}`}>
                <code>{faixa.faixa}</code> — {faixa.descricao} — {(faixa.aliquota * 100).toFixed(1)}% — R${' '}
                {faixa.parcelaDeduzir.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </ResultSection>

      <ResultSection title={copy.irpfResultTitle}>
        {baseCalculo === null ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : irpfCalculo === undefined ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : (
          <>
            <ResultRow label={copy.baseField} value={`R$ ${irpfCalculo.baseCalculo.toFixed(2)}`} />
            <ResultRow label={copy.faixaField} value={String(irpfCalculo.faixa)} />
            <ResultRow label={copy.aliquotaField} value={`${(irpfCalculo.aliquota * 100).toFixed(1)}%`} />
            <ResultRow label={copy.impostoField} value={`R$ ${irpfCalculo.imposto.toFixed(2)}`} />
          </>
        )}
      </ResultSection>

      <ResultSection title={copy.inssTableTitle}>
        <p className={styles.description}>
          {copy.capturedAt}: {INSS_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={INSS_ALIQUOTAS_URL} label={copy.inssOfficialSource} />
        </p>
        {inssTabela === undefined ? (
          <p className={styles.description}>{copy.tableNotFound}</p>
        ) : (
          <>
            <ResultRow label={copy.tetoField} value={`R$ ${inssTabela.teto.toFixed(2)}`} />
            <ul className={styles.referenceDataList}>
              {inssTabela.faixas.map((faixa) => (
                <li key={`inss-${String(faixa.faixa)}`}>
                  <code>{faixa.faixa}</code> — {faixa.descricao} — {(faixa.aliquota * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </>
        )}
      </ResultSection>

      <ResultSection title={copy.inssResultTitle}>
        {baseCalculo === null ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : inssCalculo === undefined ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : (
          <>
            <ResultRow label={copy.salarioField} value={`R$ ${inssCalculo.salarioContribuicao.toFixed(2)}`} />
            <ResultRow label={copy.faixaField} value={String(inssCalculo.faixa)} />
            <ResultRow label={copy.aliquotaField} value={`${(inssCalculo.aliquota * 100).toFixed(1)}%`} />
            <ResultRow label={copy.contribuicaoField} value={`R$ ${inssCalculo.contribuicao.toFixed(2)}`} />
          </>
        )}
      </ResultSection>

      <ResultSection title={copy.esocialRubricasTitle}>
        <p className={styles.description}>
          {copy.capturedAt}: {ESOCIAL_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={ESOCIAL_TABELAS_URL} label={copy.esocialOfficialSource} />
        </p>

        <div>
          <Label htmlFor="payroll-rubrica-code">{copy.rubricaCodeLabel}</Label>
          <Input
            id="payroll-rubrica-code"
            value={rubricaCodeInput}
            inputMode="numeric"
            placeholder={copy.rubricaCodePlaceholder}
            onChange={(event) => {
              setRubricaCodeInput(event.target.value);
            }}
          />
        </div>

        {rubricaLookup === undefined ? (
          <p className={styles.description}>{copy.rubricaNotFound}</p>
        ) : (
          <>
            <ResultRow label={copy.naturezaField} value={rubricaLookup.natureza} />
            <ResultRow label={copy.descricaoField} value={rubricaLookup.descricao} />
            <ResultRow label={copy.codIncCPField} value={rubricaLookup.codIncCP} />
          </>
        )}

        <div>
          <Label htmlFor="payroll-rubrica-search">{copy.rubricaSearchLabel}</Label>
          <Input
            id="payroll-rubrica-search"
            value={rubricaSearchInput}
            placeholder={copy.rubricaSearchPlaceholder}
            onChange={(event) => {
              setRubricaSearchInput(event.target.value);
            }}
          />
        </div>

        {rubricaSearchResults.length > 0 ? (
          <ul className={styles.referenceDataList}>
            {rubricaSearchResults.map((row) => (
              <li key={row.codigo}>
                <code>{row.codigo}</code> — {row.natureza}
              </li>
            ))}
          </ul>
        ) : null}
      </ResultSection>
    </main>
  );
}
