'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { MenuIcon } from '@/components/atoms/icons';
import { ToolbarActions } from '@/components/atoms/ToolbarActions';
import { useI18n } from '@/components/providers/I18nProvider';
import { Sidebar } from '@/components/organisms/Sidebar';
import { PlaygroundContent } from '@/components/templates/PlaygroundContent';
import styles from './templates.module.css';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { messages } = useI18n();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className={styles.shell}>
      <Sidebar className={styles.desktopSidebar} />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              className={styles.menuButton}
              variant="icon"
              size="sm"
              aria-label={messages.actions.openMenu}
              title={messages.actions.openMenu}
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <MenuIcon />
            </Button>
            <div className={styles.headerBrand}>
              <span className={styles.headerTitle}>{messages.brand.header}</span>
              <span className={styles.headerTagline}>{messages.brand.tagline}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <ToolbarActions />
          </div>
        </header>

        {menuOpen ? (
          <>
            <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />
            <Sidebar className={styles.mobileSidebar} onNavigate={closeMenu} />
          </>
        ) : null}

        <div className={styles.pageContent}>
          <PlaygroundContent />
          <div hidden aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
