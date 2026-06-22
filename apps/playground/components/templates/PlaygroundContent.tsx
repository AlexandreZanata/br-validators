'use client';

import { useEffect, useMemo, useState } from 'react';
import { DocumentWorkspace } from '@/components/organisms/DocumentWorkspace';
import { HomePage } from '@/components/organisms/HomePage';
import { PixWorkspace } from '@/components/organisms/PixWorkspace';
import { PlatformDetect } from '@/components/organisms/PlatformDetect';
import { PlatformGenerate } from '@/components/organisms/PlatformGenerate';
import { PlatformSanitize } from '@/components/organisms/PlatformSanitize';
import { usePlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import type { DocumentSlug, PlatformSlug } from '@/lib/nav';
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
    case 'generate':
      return <PlatformGenerate />;
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

    return null;
  });

  return <div className={styles.playgroundViews}>{panes}</div>;
}
