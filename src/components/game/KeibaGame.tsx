'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

// Horse names
const HORSES = [
  { id: 1, name: 'サンダーボルト', emoji: '🏇' },
  { id: 2, name: 'ゴールドラッシュ', emoji: '🐴' },
  { id: 3, name: 'スターダスト', emoji: '🌟' },
  { id: 4, name: 'ブレイズウィンド', emoji: '🔥' },
  { id: 5, name: 'アクアマリン', emoji: '💎' },
  { id: 6, name: 'シャドウナイト', emoji: '🌙' },
];

type BetType = 'win' | 'place' | 'exacta';

interface Bet {
  type: BetType;
  selections: number[];
  amount: number;
}

export function KeibaGame() {
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceResult, setRaceResult] = useState<number[] | null>(null);
  const [bet, setBet] = useState<Bet | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedHorses, setSelectedHorses] = useState<number[]>([]);
  const [betType, setBetType] = useState<BetType>('win');
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const money = useGameStore((state) => state.money);
  const spendMoney = useGameStore((state) => state.spendMoney);
  const addMoney = useGameStore((state) => state.addMoney);

  const toggleHorse = (id: number) => {
    if (selectedHorses.includes(id)) {
      setSelectedHorses(selectedHorses.filter((h) => h !== id));
    } else {
      const maxSelections = betType === 'win' || betType === 'place' ? 1 : 2;
      if (selectedHorses.length < maxSelections) {
        setSelectedHorses([...selectedHorses, id]);
      }
    }
  };

  const placeBet = () => {
    if (selectedHorses.length === 0) {
      toast.error('馬を選択してください');
      return;
    }

    if (betAmount > money) {
      toast.error('所持金が足りません');
      return;
    }

    if (betType === 'exacta' && selectedHorses.length !== 2) {
      toast.error('馬連は2頭選択してください');
      return;
    }

    if (!spendMoney(betAmount)) {
      toast.error('所持金が足りません');
      return;
    }

    setBet({
      type: betType,
      selections: selectedHorses,
      amount: betAmount,
    });

    toast.success('馬券を購入しました！');
  };

  const startRace = () => {
    if (!bet) {
      toast.error('先に馬券を購入してください');
      return;
    }

    setRaceInProgress(true);
    setRaceResult(null);
    setPositions([0, 0, 0, 0, 0, 0]);

    // Simulate race
    const intervals: NodeJS.Timeout[] = [];
    const finalPositions = [0, 0, 0, 0, 0, 0];

    HORSES.forEach((_, index) => {
      const speed = 0.5 + Math.random() * 0.5;
      intervals.push(
        setInterval(() => {
          finalPositions[index] += speed + Math.random() * 2;
          setPositions([...finalPositions]);
        }, 50)
      );
    });

    // End race after 3 seconds
    setTimeout(() => {
      intervals.forEach(clearInterval);

      // Determine results
      const results = HORSES.map((h, i) => ({
        id: h.id,
        position: finalPositions[i],
      }))
        .sort((a, b) => b.position - a.position)
        .map((h) => h.id);

      setRaceResult(results);
      setRaceInProgress(false);

      // Calculate payout
      calculatePayout(results);
    }, 3000);
  };

  const calculatePayout = (results: number[]) => {
    if (!bet) return;

    let won = false;
    let payout = 0;

    switch (bet.type) {
      case 'win':
        if (results[0] === bet.selections[0]) {
          won = true;
          payout = bet.amount * 6; // 6x for win
        }
        break;
      case 'place':
        if (results.slice(0, 3).includes(bet.selections[0])) {
          won = true;
          payout = bet.amount * 2; // 2x for place
        }
        break;
      case 'exacta':
        if (results[0] === bet.selections[0] && results[1] === bet.selections[1]) {
          won = true;
          payout = bet.amount * 30; // 30x for exacta
        }
        break;
    }

    if (won) {
      addMoney(payout);
      toast.success(`当たり！ ${payout.toLocaleString()}円 獲得！`);
    } else {
      toast.error('残念... ハズレでした');
    }
  };

  const resetGame = () => {
    setBet(null);
    setSelectedHorses([]);
    setRaceResult(null);
    setPositions([0, 0, 0, 0, 0, 0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏇 競馬ゲーム
          <Badge variant="outline">所持金: {money.toLocaleString()}円</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Race Track */}
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 space-y-2">
          {HORSES.map((horse, index) => (
            <div key={horse.id} className="flex items-center gap-2">
              <span className="w-6 text-center">{horse.id}</span>
              <div className="flex-1 h-8 bg-amber-200 dark:bg-amber-900/30 rounded relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-100 flex items-center"
                  style={{ left: `${Math.min(positions[index], 90)}%` }}
                >
                  <span className="text-2xl">{horse.emoji}</span>
                </div>
                <div className="absolute right-0 top-0 h-full w-1 bg-red-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        {raceResult && (
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">レース結果</h4>
            <div className="flex gap-4">
              {raceResult.slice(0, 3).map((horseId, index) => {
                const horse = HORSES.find((h) => h.id === horseId)!;
                return (
                  <div key={horseId} className="text-center">
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="text-sm">{horse.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Betting */}
        {!bet && !raceInProgress && (
          <div className="space-y-4">
            {/* Bet Type */}
            <div className="flex gap-2">
              <Button
                variant={betType === 'win' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBetType('win');
                  setSelectedHorses([]);
                }}
              >
                単勝 (6倍)
              </Button>
              <Button
                variant={betType === 'place' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBetType('place');
                  setSelectedHorses([]);
                }}
              >
                複勝 (2倍)
              </Button>
              <Button
                variant={betType === 'exacta' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBetType('exacta');
                  setSelectedHorses([]);
                }}
              >
                馬連 (30倍)
              </Button>
            </div>

            {/* Horse Selection */}
            <div className="grid grid-cols-3 gap-2">
              {HORSES.map((horse) => (
                <Button
                  key={horse.id}
                  variant={selectedHorses.includes(horse.id) ? 'default' : 'outline'}
                  className="h-auto py-2"
                  onClick={() => toggleHorse(horse.id)}
                >
                  <span className="text-lg mr-1">{horse.emoji}</span>
                  <span className="text-xs">{horse.name}</span>
                </Button>
              ))}
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2">
              <span className="text-sm">金額:</span>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                className="w-32"
                min={10}
                step={10}
              />
              <span className="text-sm">円</span>
            </div>

            <Button onClick={placeBet} className="w-full">
              馬券を購入
            </Button>
          </div>
        )}

        {/* Race Controls */}
        {bet && !raceInProgress && !raceResult && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              購入済み: {bet.type === 'win' ? '単勝' : bet.type === 'place' ? '複勝' : '馬連'}{' '}
              - {HORSES.filter((h) => bet.selections.includes(h.id)).map((h) => h.name).join(', ')}{' '}
              ({bet.amount.toLocaleString()}円)
            </div>
            <Button onClick={startRace} className="w-full">
              レース開始！
            </Button>
          </div>
        )}

        {raceInProgress && (
          <div className="text-center py-4">
            <div className="animate-pulse text-lg font-bold">レース中...</div>
          </div>
        )}

        {raceResult && (
          <Button onClick={resetGame} variant="outline" className="w-full">
            もう一度遊ぶ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
