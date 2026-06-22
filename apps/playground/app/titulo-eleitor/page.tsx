'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  TITULO_ELEITOR_ALGORITHM_REF_URL,
  TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
  TITULO_ELEITOR_NORMATIVE_SECONDARY_URL,
  TITULO_ELEITOR_OFFICIAL_SOURCE_URL,
  TITULO_ELEITOR_TSE_PORTAL_URL,
  formatTituloEleitor,
  stripTituloEleitor,
  validateTituloEleitor,
} from '@br-validators/core';

export default function TituloEleitorPlaygroundPage() {
  const [input, setInput] = useState(TITULO_ELEITOR_GOLDEN_PRIMARY);

  const stripped = useMemo(() => (input ? stripTituloEleitor(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateTituloEleitor(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatTituloEleitor(input) : null), [input]);

  const cliCommand = input ? `br-validators titulo-eleitor validate "${input}" --json` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Título de Eleitor Validator</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Inscrição eleitoral · 12 digits (13 for SP/MG) · modulo 11
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>Input</label>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid #24304d',
          background: '#141b2f',
          color: '#e8ecf4',
          fontSize: '1rem',
        }}
      />

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 12,
          background: '#141b2f',
          border: '1px solid #24304d',
          display: 'grid',
          gap: '0.75rem',
        }}
      >
        <Row label="Strip" value={stripped || '—'} />
        <Row
          label="Valid"
          value={
            validation
              ? validation.ok
                ? 'yes'
                : `no — ${validation.code}`
              : '—'
          }
        />
        <Row
          label="UF"
          value={
            validation?.ok
              ? validation.uf ?? (validation.exterior ? 'ZZ (exterior)' : String(validation.ufCode))
              : '—'
          }
        />
        <Row
          label="Format"
          value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'}
        />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official sources:{' '}
        <a href={TITULO_ELEITOR_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Resolução TSE 20.132/1998 (Art. 10)
        </a>
        {' · '}
        <a href={TITULO_ELEITOR_NORMATIVE_SECONDARY_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Res. 23.659/2021
        </a>
        {' · '}
        <a href={TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Wikipedia PT — pesos DV
        </a>
        {' · '}
        <a href={TITULO_ELEITOR_ALGORITHM_REF_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Ghiorzi
        </a>
        {' · '}
        <a href={TITULO_ELEITOR_TSE_PORTAL_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          TSE
        </a>
      </p>

      {cliCommand && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 10,
            background: '#0f1528',
            border: '1px solid #24304d',
            overflow: 'auto',
            fontSize: '0.85rem',
          }}
        >
          {cliCommand}
        </pre>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: '1rem', alignItems: 'start' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <code style={{ wordBreak: 'break-all' }}>{value}</code>
    </div>
  );
}
