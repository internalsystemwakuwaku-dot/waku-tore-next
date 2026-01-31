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

  // Race Data
  raceData: {
    newspaper: any; // 簡易的な型定義。詳細が必要ならinterfaceを作る
    activeBets: any[];
    lastRaceId: string;
  };

  // Actions
  addXp: (amount: number, source?: string) => void;
  addGold: (amount: number) => void;
  buyItem: (itemId: string) => boolean;
  calculateRank: () => string;
  calculateNextRankXp: () => number;
  toggleSound: () => void;
  toggleParticle: () => void;
  resetGame: () => void;

  // Race Actions
  setRaceData: (data: any) => void;
  addBet: (bet: any) => void;
  clearBets: () => void;
  checkRace: () => void; // レース進行チェック用
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalXp: 0,
      gold: 1000,
      level: 0,
      inventory: {},
      soundEnabled: true,
      particleEnabled: true,

      raceData: {
        newspaper: null,
        activeBets: [],
        lastRaceId: '',
      },

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
            raceData: { newspaper: null, activeBets: [], lastRaceId: '' },
          });
          toast.info('データをリセットしました。');
        }
      },

      setRaceData: (data) => set((state) => ({ raceData: { ...state.raceData, ...data } })),

      addBet: (bet) => {
        const { gold, raceData } = get();
        if (gold < bet.amount) {
          toast.error('お金が足りません！');
          return;
        }
        set({
          gold: gold - bet.amount,
          raceData: {
            ...raceData,
            activeBets: [...raceData.activeBets, bet]
          }
        });
        toast.success(`投票しました！`);
      },

      clearBets: () => set((state) => ({ raceData: { ...state.raceData, activeBets: [] } })),

      checkRace: () => {
        const { raceData, addGold, addXp } = get();
        if (!raceData.newspaper || raceData.activeBets.length === 0) return;

        // レースID ("YYYYMMDD_HHMM") から時刻をパース
        const raceId = raceData.newspaper.raceId;

        // すでに判定済みのレースならスキップ
        if (raceData.lastRaceId === raceId) return;

        const parts = raceId.split('_');
        if (parts.length !== 2) return;

        const timeStr = parts[1];
        const raceH = parseInt(timeStr.slice(0, 2));
        const raceM = parseInt(timeStr.slice(2, 4));

        const now = new Date();
        const raceTime = new Date();
        const idY = parseInt(parts[0].slice(0, 4));
        const idMonth = parseInt(parts[0].slice(4, 6)) - 1;
        const idD = parseInt(parts[0].slice(6, 8));

        raceTime.setFullYear(idY, idMonth, idD);
        raceTime.setHours(raceH, raceM, 0, 0);

        // レース終了時刻（+5分）まで待つ
        const raceEndTime = new Date(raceTime.getTime() + 2 * 60 * 1000); // 待機時間は2分に変更（テストしやすくするため）

        // まだレース中なら何もしない
        if (now < raceEndTime) return;

        // --- 結果判定 ---
        const horses = raceData.newspaper.horses;

        // 簡易抽選: adjustedSpeed を重みとして1着を決定
        const totalSpeed = horses.reduce((acc: number, h: any) => acc + h.adjustedSpeed, 0);
        let r = Math.random() * totalSpeed;
        let winner = horses[0];
        for (const h of horses) {
          if (r < h.adjustedSpeed) {
            winner = h;
            break;
          }
          r -= h.adjustedSpeed;
        }

        // 配当計算
        let totalPayout = 0;
        let winCount = 0;

        raceData.activeBets.forEach((bet: any) => {
          // 単勝のみ判定
          if (bet.horseId === winner.id) {
            const payout = Math.floor(bet.amount * bet.odds);
            totalPayout += payout;
            winCount++;
          }
        });

        if (totalPayout > 0) {
          addGold(totalPayout);
          toast.success(`レース結果確定！`, {
            description: `1着: ${winner.name}\nおめでとうございます！ ${totalPayout.toLocaleString()}G 獲得しました！`,
            duration: 8000
          });
          addXp(100 * winCount, 'race'); // 勝利ボーナスXP
        } else {
          toast.info(`レース結果確定`, {
            description: `1着: ${winner.name}\n残念、ハズレです...`,
            duration: 5000
          });
        }

        // ベットクリア ＆ lastRaceId更新（再判定防止）
        set((state) => ({
          raceData: {
            ...state.raceData,
            activeBets: [],
            lastRaceId: raceId
          }
        }));
      },
    }),
    {
      name: 'waku-tore-game-storage',
    }
  ));
