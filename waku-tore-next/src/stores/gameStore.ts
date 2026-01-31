import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameData, GameSettings } from '@/types/game';
import { LEVELS, XP_REWARDS } from '@/types/game';

interface Inventory {
  mouse: number;
  coffee: number;
  keyboard: number;
  monitor: number;
  ai: number;
  server: number;
  [key: string]: number;
}

interface GameStore {
  // State
  xp: number;
  level: number;
  money: number;
  totalClicks: number;
  autoClickers: number;
  autoXpPerSecond: number;
  purchasedItems: string[];
  inventory: Inventory;
  settings: GameSettings;
  isInitialized: boolean;

  // Actions
  initGame: (data?: Partial<GameData>) => void;
  addXp: (amount: number, type?: keyof typeof XP_REWARDS) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  incrementClicks: () => void;
  purchaseItem: (itemId: string, price: number, xpPerSec?: number) => boolean;
  purchaseAutoClicker: (price: number) => boolean;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
}

const calculateLevel = (xp: number): number => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].requiredXp) {
      return LEVELS[i].level;
    }
  }
  return 1;
};

const getLevelInfo = (level: number) => {
  return LEVELS.find((l) => l.level === level) || LEVELS[0];
};

const initialSettings: GameSettings = {
  profileEffect: null,
  rankPlate: null,
  hoverAction: null,
  soundEnabled: true,
  particleEnabled: true,
};

const initialInventory: Inventory = {
  mouse: 0,
  coffee: 0,
  keyboard: 0,
  monitor: 0,
  ai: 0,
  server: 0,
};

const initialState = {
  xp: 0,
  level: 1,
  money: 1000,
  totalClicks: 0,
  autoClickers: 0,
  autoXpPerSecond: 0,
  purchasedItems: [] as string[],
  inventory: initialInventory as Inventory,
  settings: initialSettings,
  isInitialized: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initGame: (data) => {
        if (data) {
          set({
            xp: data.xp ?? 0,
            level: data.level ?? calculateLevel(data.xp ?? 0),
            money: data.money ?? 1000,
            totalClicks: data.totalClicks ?? 0,
            autoClickers: data.autoClickers ?? 0,
            autoXpPerSecond: data.autoXpPerSecond ?? 0,
            purchasedItems: data.purchasedItems ?? [],
            inventory: data.inventory ?? initialInventory,
            settings: data.settings ?? initialSettings,
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },

      addXp: (amount, type) => {
        const currentXp = get().xp;
        const currentLevel = get().level;
        const newXp = currentXp + amount;
        const newLevel = calculateLevel(newXp);

        set({
          xp: newXp,
          level: newLevel,
        });

        // Check for level up
        if (newLevel > currentLevel) {
          // Could trigger level up animation/sound here
          console.log(`Level up! ${currentLevel} -> ${newLevel}`);
        }
      },

      addMoney: (amount) => {
        set((state) => ({ money: state.money + amount }));
      },

      spendMoney: (amount) => {
        const currentMoney = get().money;
        if (currentMoney >= amount) {
          set({ money: currentMoney - amount });
          return true;
        }
        return false;
      },

      incrementClicks: () => {
        set((state) => ({
          totalClicks: state.totalClicks + 1,
        }));
        get().addXp(XP_REWARDS.COOKIE_CLICK);
      },

      purchaseItem: (itemId, price, xpPerSec = 0) => {
        const state = get();
        if (state.money >= price) {
          const newInventory = { ...state.inventory };
          newInventory[itemId] = (newInventory[itemId] || 0) + 1;

          set({
            money: state.money - price,
            purchasedItems: state.purchasedItems.includes(itemId)
              ? state.purchasedItems
              : [...state.purchasedItems, itemId],
            inventory: newInventory,
            autoXpPerSecond: state.autoXpPerSecond + xpPerSec,
          });
          return true;
        }
        return false;
      },

      purchaseAutoClicker: (price) => {
        const state = get();
        if (state.money >= price) {
          set({
            money: state.money - price,
            autoClickers: state.autoClickers + 1,
          });
          return true;
        }
        return false;
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetGame: () => set(initialState),
    }),
    {
      name: 'waku-tore-game',
    }
  )
);

// Selectors
export const useXp = () => useGameStore((state) => state.xp);
export const useLevel = () => useGameStore((state) => state.level);
export const useMoney = () => useGameStore((state) => state.money);
export const useLevelInfo = () => {
  const level = useGameStore((state) => state.level);
  return getLevelInfo(level);
};

export const useXpProgress = () => {
  const xp = useGameStore((state) => state.xp);
  const level = useGameStore((state) => state.level);

  const currentLevelInfo = getLevelInfo(level);
  const nextLevelInfo = LEVELS.find((l) => l.level > level);

  if (!nextLevelInfo) {
    return { current: xp, required: xp, progress: 100 };
  }

  const currentLevelXp = currentLevelInfo?.requiredXp ?? 0;
  const nextLevelXp = nextLevelInfo.requiredXp;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return {
    current: xp - currentLevelXp,
    required: nextLevelXp - currentLevelXp,
    progress: Math.min(100, Math.max(0, progress)),
  };
};
