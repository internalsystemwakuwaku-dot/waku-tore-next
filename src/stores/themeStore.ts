import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/lib/themes';

interface ThemeState {
  theme: Theme;
  backgroundUrl: string | null;
  backgroundOpacity: number;
  setTheme: (theme: Theme) => void;
  setBackgroundUrl: (url: string | null) => void;
  setBackgroundOpacity: (opacity: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      backgroundUrl: null,
      backgroundOpacity: 0.1,
      setTheme: (theme) => set({ theme }),
      setBackgroundUrl: (url) => set({ backgroundUrl: url }),
      setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
    }),
    {
      name: 'waku-tore-theme-storage',
    }
  )
);
