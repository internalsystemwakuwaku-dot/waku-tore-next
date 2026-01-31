import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RANKS, SHOP_ITEMS, ShopItem, XP_BASE } from '@/lib/game/constants';
import { toast } from 'sonner';

interface GameState {
  // Stats
  xp: number;
  totalXp: number; // 累積XP（ランク計算用）
  gold: number;
  level: number;

  // Inventory
  inventory: Record<string, number>; // itemId -> count

  // Settings
  soundEnabled: boolean;
  particleEnabled: boolean;

  // Computed
  clickPower: number;
  autoXpPerSec: number;

  // Actions
  addXp: (amount: number, source?: string) => void;
  addGold: (amount: number) => void;
  buyItem: (itemId: string) => boolean;
  calculateRank: () => string;
  calculateNextRankXp: () => number;
  toggleSound: () => void;
  toggleParticle: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalXp: 0,
      gold: 1000, // 初期所持金
      level: 0,
      inventory: {},
      soundEnabled: true,
      particleEnabled: true,

      clickPower: 1,
      autoXpPerSec: 0,

      addXp: (amount, source) => {
        const { xp, totalXp, calculateRank } = get();
        const currentRankName = calculateRank();

        // XP加算
        const newXp = xp + amount;
        const newTotalXp = totalXp + amount;

        set({ xp: newXp, totalXp: newTotalXp });

        // ランクアップチェック (簡易的: 名前が変わったら通知)
        const newRankName = get().calculateRank();
        if (currentRankName !== newRankName) {
          toast.success(`ランクアップ！`, {
            description: `「${newRankName}」になりました！`,
          });
        }
      },

      addGold: (amount) => {
        set((state) => ({ gold: state.gold + amount }));
      },

      buyItem: (itemId) => {
        const { gold, inventory, autoXpPerSec, clickPower } = get();
        const item = SHOP_ITEMS.find((i) => i.id === itemId);

        if (!item) return false;

        // 価格計算 (所持数に応じて増加: base * 1.15^count)
        const count = inventory[itemId] || 0;
        const cost = Math.floor(item.baseCost * Math.pow(1.15, count));

        if (gold < cost) {
          toast.error('お金が足りません！');
          return false;
        }

        // UNIQUEアイテムチェック
        if (item.isUnique && count > 0) {
          toast.error('このユニークアイテムは既に所持しています！');
          return false;
        }

        // 購入処理
        const newInventory = { ...inventory, [itemId]: count + 1 };

        // ステータス反映
        let newAutoXp = autoXpPerSec;
        let newClickPower = clickPower;

        if (item.type === 'auto' && item.xpPerSec) {
          newAutoXp += item.xpPerSec;
        }
        if (item.type === 'click' && item.clickPower) {
          newClickPower += item.clickPower;
        }

        set({
          gold: gold - cost,
          inventory: newInventory,
          autoXpPerSec: newAutoXp,
          clickPower: newClickPower,
        });

        toast.success(`${item.name}を購入しました！`);
        return true;
      },

      calculateRank: () => {
        const { totalXp } = get();
        // 累積XPを超えている最大のランクを探す
        // RANKSは昇順でソートされている前提 (constants.tsを確認済み)
        // 後ろから探索するか、適切にfindLast的なロジックが必要

        // 効率のため後ろからチェック
        for (let i = RANKS.length - 1; i >= 0; i--) {
          if (totalXp >= RANKS[i].minXp) {
            return RANKS[i].name;
          }
        }
        return RANKS[0].name;
      },

      calculateNextRankXp: () => {
        const { totalXp } = get();
        for (let i = 0; i < RANKS.length; i++) {
          if (totalXp < RANKS[i].minXp) {
            return RANKS[i].minXp - totalXp;
          }
        }
        return 0; // カンスト
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleParticle: () => set((state) => ({ particleEnabled: !state.particleEnabled })),

      resetGame: () => {
        if (confirm('本当にデータをリセットしますか？この操作は取り消せません。')) {
          set({
            xp: 0,
            totalXp: 0,
            gold: 0,
            level: 0,
            inventory: {},
            autoXpPerSec: 0,
            clickPower: 1,
          });
          toast.info('データをリセットしました。');
        }
      },
    }),
    {
      name: 'waku-tore-game-storage',
      // 特定のフィールドだけ永続化することも可能だが、全部保存でOK
    }
  )
);
