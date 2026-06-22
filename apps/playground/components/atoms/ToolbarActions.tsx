'use client';

import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import styles from './atoms.module.css';

export function ToolbarActions() {
  return (
    <div className={styles.toolbar}>
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
