'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type PlaygroundRouterContextValue = {
  path: string;
  setOptimisticPath: (path: string) => void;
};

const PlaygroundRouterContext = createContext<PlaygroundRouterContextValue | null>(null);

export function PlaygroundRouterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState(pathname);

  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const value = useMemo(
    () => ({
      path: optimisticPath,
      setOptimisticPath,
    }),
    [optimisticPath],
  );

  return <PlaygroundRouterContext.Provider value={value}>{children}</PlaygroundRouterContext.Provider>;
}

export function usePlaygroundPath(): string {
  const context = useContext(PlaygroundRouterContext);
  if (!context) {
    throw new Error('usePlaygroundPath must be used within PlaygroundRouterProvider');
  }
  return context.path;
}

export function useSetPlaygroundPath(): (path: string) => void {
  const context = useContext(PlaygroundRouterContext);
  if (!context) {
    throw new Error('useSetPlaygroundPath must be used within PlaygroundRouterProvider');
  }
  return context.setOptimisticPath;
}
