'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  IE_OFFICIAL_SOURCE_URLS,
  IE_SP_GOLDEN,
  IE_SUPPORTED_UFS,
  formatInscricaoEstadual,
  stripInscricaoEstadual,
  validateInscricaoEstadual,
  type UfCode,
} from 'br-validators';

const UF_SAMPLES: Record<UfCode, string> = {
  AC: '0113253877910',
  AL: '248682954',
  AM: '917050150',
  AP: '039045820',
  BA: '63984300',
  CE: '836182316',
  DF: '0730000100109',
  ES: '463921810',
  GO: '112237118',
  MA: '123517680',
  MG: '2490944173923',
  MS: '282570926',
  MT: '00130000019',
  PA: '153662476',
  PB: '312029063',
  PE: '064970639',
  PI: '465180426',
  PR: '0031595584',
  RJ: '06540481',
  RN: '204502292',
  RO: '39206839474860',
  RR: '247681047',
  RS: '3288345503',
  SC: '632480718',
  SE: '826594042',
  SP: IE_SP_GOLDEN,
  TO: '27035910938',
};

const UF_LABELS: Record<UfCode, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais',
  MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia',
  RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo',
  TO: 'Tocantins',
};

export default function IePlaygroundPage() {
  const [uf, setUf] = useState<UfCode>('SP');
  const [input, setInput] = useState(IE_SP_GOLDEN);

  const source = IE_OFFICIAL_SOURCE_URLS[uf];

  const stripped = useMemo(() => (input ? stripInscricaoEstadual(input) : ''), [input]);
  const validation = useMemo(
    () => (input ? validateInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );
  const formatted = useMemo(
    () => (input ? formatInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );

  const cliCommand = input
    ? `br-validators ie validate ${stripped || '<value>'} --uf ${uf}`
    : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Inscrição Estadual</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Check digits only · all 27 UFs (UC-009) — no SEFAZ registration lookup
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>UF</label>
      <select
        value={uf}
        onChange={(e) => {
          const next = e.target.value as UfCode;
          setUf(next);
          setInput(UF_SAMPLES[next]);
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
          marginBottom: '1rem',
        }}
      >
        {IE_SUPPORTED_UFS.map((code) => (
          <option key={code} value={code}>
            {code} — {UF_LABELS[code]}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>Input</label>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        placeholder="IE value"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid #24304d',
          background: '#141b2f',
          color: '#e8ecf4',
          fontSize: '1rem',
          marginBottom: '1rem',
        }}
      />

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#9aa5bd', marginBottom: '0.5rem' }}>Validate</h2>
        <pre
          style={{
            background: '#0d1220',
            padding: '1rem',
            borderRadius: 10,
            overflow: 'auto',
            fontSize: '0.9rem',
          }}
        >
          {validation
            ? JSON.stringify(
                validation.ok
                  ? { ok: true, value: validation.value, uf: validation.uf }
                  : { ok: false, code: validation.code, message: validation.message },
                null,
                2,
              )
            : '—'}
        </pre>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#9aa5bd', marginBottom: '0.5rem' }}>Format</h2>
        <pre
          style={{
            background: '#0d1220',
            padding: '1rem',
            borderRadius: 10,
            overflow: 'auto',
            fontSize: '0.9rem',
          }}
        >
          {formatted ? JSON.stringify(formatted, null, 2) : '—'}
        </pre>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#9aa5bd', marginBottom: '0.5rem' }}>CLI</h2>
        <code style={{ color: '#a8d5a2', wordBreak: 'break-all' }}>{cliCommand}</code>
      </section>

      <p style={{ fontSize: '0.85rem', color: '#6b7a99' }}>
        Official source ({uf}):{' '}
        <a href={source} target="_blank" rel="noopener noreferrer" style={{ color: '#7aa2ff' }}>
          {source}
        </a>
      </p>
    </main>
  );
}
