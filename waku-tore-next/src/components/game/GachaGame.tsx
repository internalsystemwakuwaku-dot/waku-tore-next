'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

// Gacha items
const GACHA_ITEMS = [
  // Common (60%)
  { id: 'c1', name: 'コイン +100', rarity: 'common', reward: { type: 'money', amount: 100 } },
  { id: 'c2', name: 'XP +50', rarity: 'common', reward: { type: 'xp', amount: 50 } },
  { id: 'c3', name: 'コイン +200', rarity: 'common', reward: { type: 'money', amount: 200 } },

  // Uncommon (25%)
  { id: 'u1', name: 'コイン +500', rarity: 'uncommon', reward: { type: 'money', amount: 500 } },
  { id: 'u2', name: 'XP +200', rarity: 'uncommon', reward: { type: 'xp', amount: 200 } },

  // Rare (10%)
  { id: 'r1', name: 'コイン +1000', rarity: 'rare', reward: { type: 'money', amount: 1000 } },
  { id: 'r2', name: 'XP +500', rarity: 'rare', reward: { type: 'xp', amount: 500 } },

  // Epic (4%)
  { id: 'e1', name: 'コイン +3000', rarity: 'epic', reward: { type: 'money', amount: 3000 } },

  // Legendary (1%)
  { id: 'l1', name: '大当たり！コイン +10000', rarity: 'legendary', reward: { type: 'money', amount: 10000 } },
];

const GACHA_COST = 100;

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンダリー',
};

export function GachaGame() {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<typeof GACHA_ITEMS[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const money = useGameStore((state) => state.money);
  const spendMoney = useGameStore((state) => state.spendMoney);
  const addMoney = useGameStore((state) => state.addMoney);
  const addXp = useGameStore((state) => state.addXp);

  const rollGacha = () => {
    if (money < GACHA_COST) {
      toast.error('所持金が足りません');
      return;
    }

    if (!spendMoney(GACHA_COST)) {
      return;
    }

    setIsRolling(true);
    setShowResult(false);

    // Determine rarity based on probability
    const rand = Math.random() * 100;
    let rarity: string;
    if (rand < 1) rarity = 'legendary';
    else if (rand < 5) rarity = 'epic';
    else if (rand < 15) rarity = 'rare';
    else if (rand < 40) rarity = 'uncommon';
    else rarity = 'common';

    // Get random item of that rarity
    const itemsOfRarity = GACHA_ITEMS.filter((i) => i.rarity === rarity);
    const item = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];

    // Show animation for 2 seconds
    setTimeout(() => {
      setResult(item);
      setIsRolling(false);
      setShowResult(true);

      // Apply reward
      if (item.reward.type === 'money') {
        addMoney(item.reward.amount);
      } else if (item.reward.type === 'xp') {
        addXp(item.reward.amount);
      }

      if (item.rarity === 'legendary') {
        toast.success('🎉 レジェンダリー！！');
      } else if (item.rarity === 'epic') {
        toast.success('✨ エピック！');
      }
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎰 ガチャ
          <Badge variant="outline">所持金: {money.toLocaleString()}円</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gacha Machine */}
        <div className="relative h-48 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg flex items-center justify-center overflow-hidden">
          {isRolling && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🎲</div>
            </div>
          )}

          {showResult && result && (
            <div
              className="text-center animate-scale-in"
              style={{ color: RARITY_COLORS[result.rarity] }}
            >
              <div className="text-5xl mb-2">
                {result.rarity === 'legendary' ? '🌟' : result.rarity === 'epic' ? '💎' : '🎁'}
              </div>
              <div className="text-xl font-bold text-white">{result.name}</div>
              <Badge
                style={{
                  backgroundColor: RARITY_COLORS[result.rarity],
                  color: 'white',
                }}
              >
                {RARITY_LABELS[result.rarity]}
              </Badge>
            </div>
          )}

          {!isRolling && !showResult && (
            <div className="text-center text-white">
              <div className="text-6xl mb-2">🎰</div>
              <div className="text-lg">ボタンを押してガチャを回そう！</div>
            </div>
          )}
        </div>

        {/* Probabilities */}
        <div className="text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <span style={{ color: RARITY_COLORS.common }}>コモン: 60%</span>
            <span style={{ color: RARITY_COLORS.uncommon }}>アンコモン: 25%</span>
            <span style={{ color: RARITY_COLORS.rare }}>レア: 10%</span>
            <span style={{ color: RARITY_COLORS.epic }}>エピック: 4%</span>
            <span style={{ color: RARITY_COLORS.legendary }}>レジェンダリー: 1%</span>
          </div>
        </div>

        {/* Roll Button */}
        <Button
          onClick={rollGacha}
          disabled={isRolling || money < GACHA_COST}
          className="w-full"
          size="lg"
        >
          {isRolling ? '回転中...' : `ガチャを回す (${GACHA_COST}円)`}
        </Button>
      </CardContent>
    </Card>
  );
}
