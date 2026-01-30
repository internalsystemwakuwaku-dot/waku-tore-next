'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, THEMES } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { theme, backgroundUrl, backgroundOpacity } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [theme, mounted]);

  return (
    <>
      {mounted && backgroundUrl && (
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
