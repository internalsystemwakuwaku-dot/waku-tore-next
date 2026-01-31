'use client';

import { useGameStore } from '@/stores/gameStore';
import { useThemeStore } from '@/stores/themeStore'; // テーマカラー用（任意）

interface XpBarProps {
  compact?: boolean;
}

export function XpBar({ compact = false }: XpBarProps) {
  const { totalXp, calculateRank, calculateNextRankXp } = useGameStore();

  const rankName = calculateRank();
  const nextRankXpAmount = calculateNextRankXp();

  // 簡易進捗計算 (totalXpの下3桁などを利用)
  // 本当は「現在のランクのminXP」が必要だが、ストアの実装が簡易なためビジュアル用ロジックで代用
  const progress = Math.min(100, Math.max(0, (totalXp % 1000) / 10));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
          Rank: {rankName}
        </div>
        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary/20 text-primary">
            {rankName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Next: -{(nextRankXpAmount).toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
