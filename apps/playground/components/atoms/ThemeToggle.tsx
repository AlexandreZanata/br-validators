'use client';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/components/providers/I18nProvider';
import { MoonIcon, SunIcon } from './icons';
import { Button } from './Button';
import styles from './atoms.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { messages } = useI18n();
  const isDark = theme === 'dark';

  return (
    <Button
      className={`${styles.themeToggle} ${isDark ? styles.themeToggleSunBtn : styles.themeToggleMoonBtn}`.trim()}
      variant="icon"
      size="sm"
      onClick={toggleTheme}
      aria-label={messages.actions.toggleTheme}
      title={isDark ? messages.actions.toggleThemeLight : messages.actions.toggleThemeDark}
      type="button"
    >
      {isDark ? <SunIcon className={styles.themeIconSun} /> : <MoonIcon className={styles.themeIconMoon} />}
    </Button>
  );
}
