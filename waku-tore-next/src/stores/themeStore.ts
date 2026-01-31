import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeName } from '@/types';

interface ThemeStore {
  theme: ThemeName;
  backgroundUrl: string | null;
  backgroundOpacity: number;
  setTheme: (theme: ThemeName) => void;
  setBackgroundUrl: (url: string | null) => void;
  setBackgroundOpacity: (opacity: number) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'default',
      backgroundUrl: null,
      backgroundOpacity: 0.3,

      setTheme: (theme) => set({ theme }),
      setBackgroundUrl: (backgroundUrl) => set({ backgroundUrl }),
      setBackgroundOpacity: (backgroundOpacity) => set({ backgroundOpacity }),
    }),
    {
      name: 'waku-tore-theme',
    }
  )
);

// Theme configurations
export const THEMES: Record<ThemeName, { displayName: string; className: string }> = {
  default: { displayName: 'デフォルト', className: '' },
  dark: { displayName: 'ダーク', className: 'dark' },
  cat: { displayName: '猫', className: 'theme-cat' },
  dog: { displayName: '犬', className: 'theme-dog' },
  horse: { displayName: '馬', className: 'theme-horse' },
  dragon: { displayName: 'ドラゴン', className: 'theme-dragon' },
  neon: { displayName: 'ネオン', className: 'theme-neon' },
  gaming: { displayName: 'ゲーミング', className: 'theme-gaming' },
  retro: { displayName: 'レトロRPG', className: 'theme-retro' },
  blueprint: { displayName: '設計図', className: 'theme-blueprint' },
  japanese: { displayName: '和風', className: 'theme-japanese' },
};
