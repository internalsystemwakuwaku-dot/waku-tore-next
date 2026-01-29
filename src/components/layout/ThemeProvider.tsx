'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, backgroundUrl, backgroundOpacity } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    Object.values(THEMES).forEach(({ className }) => {
      if (className) {
        root.classList.remove(className);
      }
    });

    // Add current theme class
    const themeConfig = THEMES[theme];
    if (themeConfig?.className) {
      root.classList.add(themeConfig.className);
    }
  }, [theme]);

  return (
    <>
      {backgroundUrl && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            opacity: backgroundOpacity,
          }}
        />
      )}
      {children}
    </>
  );
}
