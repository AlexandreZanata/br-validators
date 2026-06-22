'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSetPlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import styles from './organisms.module.css';

type Props = {
  href: string;
  isActive: boolean;
  title?: string;
  onNavigate?: () => void;
  children: React.ReactNode;
};

export function SidebarNavLink({ href, isActive, title, onNavigate, children }: Props) {
  const router = useRouter();
  const setOptimisticPath = useSetPlaygroundPath();

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  return (
    <Link
      href={href}
      prefetch
      scroll={false}
      title={title}
      className={`${styles.navLink} ${isActive ? styles.active : ''}`.trim()}
      aria-current={isActive ? 'page' : undefined}
      onMouseEnter={() => {
        router.prefetch(href);
      }}
      onClick={() => {
        setOptimisticPath(href);
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}
