'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = globalThis.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
      return;
    }
    const systemTheme = globalThis.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(systemTheme);
    document.documentElement.dataset.theme = systemTheme;
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    globalThis.localStorage.setItem('theme', next);
  };

  return { theme, toggleTheme };
}
