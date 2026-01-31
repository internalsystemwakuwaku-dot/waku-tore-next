// Game System Types

export interface GameData {
  userId: string;
  xp: number;
  level: number;
  money: number;
  totalClicks: number;
  autoClickers: number;
  purchasedItems: string[];
  settings: GameSettings;
  updatedAt: Date;
}

export interface GameSettings {
  profileEffect: string | null;
  rankPlate: string | null;
  hoverAction: string | null;
  soundEnabled: boolean;
  particleEnabled: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'autoClicker' | 'profileEffect' | 'rankPlate' | 'hoverAction';
  unlockLevel: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  requiredXp: number;
  color: string;
}

// XP rewards for actions
export const XP_REWARDS = {
  LOGIN: 50,
  CARD_MOVE: 20,
  ASSIGNMENT_SET: 30,
  MEMO_ADD: 15,
  MEMO_COMPLETE: 10,
  COOKIE_CLICK: 1,
  DAILY_BONUS: 100,
} as const;

// Level definitions (200 levels)
export const LEVELS: LevelInfo[] = [
  { level: 1, name: '転生者', requiredXp: 0, color: '#888888' },
  { level: 2, name: '見習い', requiredXp: 100, color: '#888888' },
  { level: 3, name: '初心者', requiredXp: 250, color: '#888888' },
  { level: 4, name: '新人', requiredXp: 450, color: '#888888' },
  { level: 5, name: '一般人', requiredXp: 700, color: '#888888' },
  { level: 10, name: '中級者', requiredXp: 2000, color: '#4CAF50' },
  { level: 20, name: '上級者', requiredXp: 8000, color: '#2196F3' },
  { level: 30, name: '熟練者', requiredXp: 20000, color: '#9C27B0' },
  { level: 40, name: '達人', requiredXp: 40000, color: '#FF9800' },
  { level: 50, name: '名人', requiredXp: 70000, color: '#F44336' },
  { level: 60, name: '師範', requiredXp: 110000, color: '#E91E63' },
  { level: 70, name: '仙人', requiredXp: 160000, color: '#00BCD4' },
  { level: 80, name: '賢者', requiredXp: 220000, color: '#3F51B5' },
  { level: 90, name: '勇者', requiredXp: 290000, color: '#FFC107' },
  { level: 100, name: '英雄', requiredXp: 370000, color: '#FFD700' },
  { level: 120, name: '伝説', requiredXp: 550000, color: '#FF6B6B' },
  { level: 140, name: '神話', requiredXp: 770000, color: '#9B59B6' },
  { level: 160, name: '不滅', requiredXp: 1030000, color: '#1ABC9C' },
  { level: 180, name: '超越者', requiredXp: 1330000, color: '#E74C3C' },
  { level: 200, name: '宇宙神', requiredXp: 1670000, color: '#F1C40F' },
];

// Keiba (Horse Racing) Types
export interface KeibaHorse {
  id: number;
  name: string;
  odds: number;
}

export interface KeibaBet {
  id: string;
  userId: string;
  raceId: string;
  betType: 'win' | 'place' | 'exacta' | 'quinella' | 'trifecta' | 'trio';
  selections: number[];
  amount: number;
  createdAt: Date;
}

export interface KeibaResult {
  raceId: string;
  result: number[]; // [1st, 2nd, 3rd, 4th, 5th, 6th]
  allBets: KeibaBet[];
  createdAt: Date;
}

// Gacha Types
export interface GachaItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'profileEffect' | 'rankPlate' | 'hoverAction' | 'title';
  description: string;
}

export interface GachaResult {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  rarity: string;
  createdAt: Date;
}
