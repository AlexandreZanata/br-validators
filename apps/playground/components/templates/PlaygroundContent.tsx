'use client';

import { useEffect, useMemo, useState } from 'react';
import { DocumentWorkspace } from '@/components/organisms/DocumentWorkspace';
import { HomePage } from '@/components/organisms/HomePage';
import { PixWorkspace } from '@/components/organisms/PixWorkspace';
import { PlatformDetect } from '@/components/organisms/PlatformDetect';
import { PlatformCompare } from '@/components/organisms/PlatformCompare';
import { PlatformBatch } from '@/components/organisms/PlatformBatch';
import { PlatformDiff } from '@/components/organisms/PlatformDiff';
import { PlatformGenerate } from '@/components/organisms/PlatformGenerate';
import { PlatformSanitize } from '@/components/organisms/PlatformSanitize';
import { OfficialSourcesPage } from '@/components/organisms/OfficialSourcesPage';
import { DataIbgeExplorer } from '@/components/organisms/DataIbgeExplorer';
import { DataBancosLookup } from '@/components/organisms/DataBancosLookup';
import { DataFinanceExplorer } from '@/components/organisms/DataFinanceExplorer';
import { DataPayrollExplorer } from '@/components/organisms/DataPayrollExplorer';
import { DataCalendarExplorer } from '@/components/organisms/DataCalendarExplorer';
import { DataCatalogTable } from '@/components/organisms/DataCatalogTable';
import { DataGovBrGroupExplorer } from '@/components/organisms/DataGovBrGroupExplorer';
import { usePlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import type { DocumentSlug, PlatformSlug, ReferenceDataSlug } from '@/lib/nav';
import { playgroundRouteKey, resolvePlaygroundRoute } from '@/lib/playground-routes';
import styles from './templates.module.css';

function DocumentPane({ slug }: { slug: DocumentSlug }) {
  if (slug === 'pix') {
    return <PixWorkspace />;
  }
  return <DocumentWorkspace slug={slug} />;
}

function PlatformPane({ slug }: { slug: PlatformSlug }) {
  switch (slug) {
    case 'detect':
      return <PlatformDetect />;
    case 'sanitize':
      return <PlatformSanitize />;
    case 'compare':
      return <PlatformCompare />;
    case 'batch':
      return <PlatformBatch />;
    case 'diff':
      return <PlatformDiff />;
    case 'generate':
      return <PlatformGenerate />;
    case 'official-sources':
      return <OfficialSourcesPage />;
  }
}

function ReferenceDataPane({ slug }: { slug: ReferenceDataSlug }) {
  switch (slug) {
    case 'data/ibge':
      return <DataIbgeExplorer />;
    case 'data/calendar':
      return <DataCalendarExplorer />;
    case 'data/payroll':
      return <DataPayrollExplorer />;
    case 'data/finance':
      return <DataFinanceExplorer />;
    case 'data/bancos':
      return <DataBancosLookup />;
    case 'data/fiscal':
      return <DataGovBrGroupExplorer groupId="fiscal" />;
    case 'data/trade':
      return <DataGovBrGroupExplorer groupId="trade" />;
    case 'data/logistics':
      return <DataGovBrGroupExplorer groupId="logistics" />;
    case 'data/catalog':
      return <DataCatalogTable />;
  }
}

export function PlaygroundContent() {
  const pathname = usePlaygroundPath();
  const route = useMemo(() => resolvePlaygroundRoute(pathname), [pathname]);
  const activeKey = playgroundRouteKey(route);

  const [mountedKeys, setMountedKeys] = useState<Set<string>>(() => new Set([activeKey]));

  useEffect(() => {
    setMountedKeys((previous) => {
      if (previous.has(activeKey)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(activeKey);
      return next;
    });
  }, [activeKey]);

  const panes = [...mountedKeys].map((key) => {
    const isActive = key === activeKey;

    if (key === 'home') {
      return (
        <div key={key} className={styles.viewPane} hidden={!isActive}>
          <HomePage />
        </div>
      );
    }

    if (key.startsWith('document:')) {
      const slug = key.slice('document:'.length) as DocumentSlug;
      return (
        <div key={key} className={styles.viewPane} hidden={!isActive}>
          <DocumentPane slug={slug} />
        </div>
      );
    }

    if (key.startsWith('platform:')) {
      const slug = key.slice('platform:'.length) as PlatformSlug;
      return (
        <div key={key} className={styles.viewPane} hidden={!isActive}>
          <PlatformPane slug={slug} />
        </div>
      );
    }

    if (key.startsWith('reference-data:')) {
      const slug = key.slice('reference-data:'.length) as ReferenceDataSlug;
      return (
        <div key={key} className={styles.viewPane} hidden={!isActive}>
          <ReferenceDataPane slug={slug} />
        </div>
      );
    }

    return null;
  });

  return <div className={styles.playgroundViews}>{panes}</div>;
}
