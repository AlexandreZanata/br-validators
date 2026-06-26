'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { useSetPlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './home.module.css';

function QuickLink({ href, children }: { href: string; children: ReactNode }) {
  const setPath = useSetPlaygroundPath();

  return (
    <Link
      href={href}
      prefetch
      scroll={false}
      onClick={() => {
        setPath(href);
      }}
    >
      {children}
    </Link>
  );
}

export function HomePage() {
  const { messages } = useI18n();

  return (
    <ValidatorPanel title={messages.home.title} description={messages.home.description}>
      <p className={styles.lead}>{messages.home.lead}</p>
      <section className={styles.quickLinks}>
        <h2 className={styles.quickTitle}>{messages.home.quickStart}</h2>
        <ul>
          <li>
            <QuickLink href="/cpf">{messages.home.cpfLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/cnpj">{messages.home.cnpjLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/pix">{messages.home.pixLink}</QuickLink>
          </li>
        </ul>
      </section>
      <section className={styles.quickLinks}>
        <h2 className={styles.quickTitle}>{messages.home.platform}</h2>
        <ul>
          <li>
            <QuickLink href="/detect">{messages.home.detectLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/sanitize">{messages.home.sanitizeLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/compare">{messages.home.compareLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/batch">{messages.home.batchLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/diff">{messages.home.diffLink}</QuickLink>
          </li>
          <li>
            <QuickLink href="/generate">{messages.home.generateLink}</QuickLink>
          </li>
        </ul>
      </section>
    </ValidatorPanel>
  );
}
