import Link from 'next/link';

const types = [
  { slug: 'cnpj', label: 'CNPJ' },
  { slug: 'cpf', label: 'CPF' },
  { slug: 'cep', label: 'CEP' },
  { slug: 'telefone', label: 'Telefone' },
  { slug: 'cnh', label: 'CNH' },
  { slug: 'renavam', label: 'RENAVAM' },
  { slug: 'titulo-eleitor', label: 'Título de Eleitor' },
  { slug: 'placa', label: 'Placa' },
  { slug: 'pis', label: 'PIS/PASEP' },
  { slug: 'pix', label: 'PIX Key' },
  { slug: 'brcode', label: 'BR Code' },
  { slug: 'boleto', label: 'Boleto' },
  { slug: 'cartao', label: 'Credit Card' },
  { slug: 'ie', label: 'Inscrição Estadual (27 UFs)' },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>BR Validators Playground</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '2rem' }}>
        100% open-source · client-side validation · official algorithms
      </p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
        {types.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/${t.slug}`}
              style={{
                display: 'block',
                padding: '1rem 1.25rem',
                borderRadius: 12,
                background: '#141b2f',
                color: '#e8ecf4',
                textDecoration: 'none',
                border: '1px solid #24304d',
              }}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
