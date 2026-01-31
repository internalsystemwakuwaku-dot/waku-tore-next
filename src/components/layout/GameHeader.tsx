'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Coins, Trophy, Zap, ShoppingBag, Settings, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';

export function GameHeader() {
    const {
        xp, totalXp, gold, calculateRank, calculateNextRankXp,
        autoXpPerSec, clickPower
    } = useGameStore();

    const { theme } = useThemeStore();
    const [rankName, setRankName] = useState('');
    const [nextRankXp, setNextRankXp] = useState(0);
    const [renderProgress, setRenderProgress] = useState(0);

    // Hydration mismatch avoidance
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update computed values
    useEffect(() => {
        setRankName(calculateRank());
        setNextRankXp(calculateNextRankXp());

        // XP progress calculation (simplified for now)
        // 実際には現在のランクの開始XPと終了XPを使って0-100%を計算する方が自然だが、
        // ここでは単純に「次のランクまであとどれくらいか」を可視化する
        // ただし、分母が不明確になりがちなので、とりあえず「現在のXP / (現在のXP + 残りXP)」で概算する
        // あるいは nextRankXp が「残り必要XP」なので、
        // 逆算して「ランク内進行度」を出せればベストだが、定数リストが大きいので簡易実装にする
        // 0-100%ループではなく、蓄積型のバーにするなら totalXp ベースだが、それだと見た目が変わらない

        // 簡易実装: 次のレベルまでの進捗を適当にアニメーションさせるのではなく、
        // 「次のランクまで」を表示し、バーは常に100%から減っていく演出か、
        // あるいは現在のランクのminXPを取得して計算する

        // constantsのimportを避けるためストア側で計算させるのが綺麗だが、ここでは一旦簡易的に
        // 常に動いている感触を出すために、totalXpの下2桁などを使う手もあるが...
        // まじめに実装すると:
        // nextXp / (nextXp + (totalXp - rankMinXp)) ... いや rankMinXp が必要

        setRenderProgress(Math.min(100, Math.max(0, (totalXp % 1000) / 10))); // 仮のビジュアライザ
    }, [xp, totalXp, calculateRank, calculateNextRankXp]);

    if (!mounted) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-[var(--header-bg)] text-[var(--text-color)] transition-colors duration-300 shadow-sm backdrop-blur-md bg-opacity-90 supports-[backdrop-filter]:bg-opacity-60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">

                {/* Left: Rank & Status */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-start min-w-[120px]">
                        <span className="text-xs text-[var(--sub-text)] flex items-center gap-1 font-bold">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            RANK
                        </span>
                        <span className="text-sm font-bold truncate max-w-[200px]" title={rankName}>
                            {rankName}
                        </span>
                    </div>

                    <div className="flex flex-col w-[120px] md:w-[200px] gap-1">
                        <div className="flex justify-between text-xs items-end">
                            <span className="text-[var(--sub-text)]">Next Rank</span>
                            <span className="font-mono text-[var(--primary-color)] font-bold">-{nextRankXp.toLocaleString()} XP</span>
                        </div>
                        <Progress value={renderProgress} className="h-2 bg-[var(--border-color)]" indicatorClassName="bg-[var(--primary-color)] transition-all duration-500" />
                    </div>
                </div>

                {/* Center: Title (Mobile only mostly, or omitted) or Main Action */}
                <div className="hidden lg:flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] rounded-full border border-[var(--border-color)]">
                        <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
                        <span className="text-xs text-[var(--sub-text)]">Auto</span>
                        <span className="font-mono font-bold">{autoXpPerSec.toLocaleString()} /s</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] rounded-full border border-[var(--border-color)]">
                        <span className="text-lg">👆</span>
                        <span className="text-xs text-[var(--sub-text)]">Click</span>
                        <span className="font-mono font-bold">{clickPower.toLocaleString()}</span>
                    </div>
                </div>

                {/* Right: Currency & Actions */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                        <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-mono font-bold text-yellow-700 dark:text-yellow-300">
                            {Math.floor(gold).toLocaleString()} G
                        </span>
                    </div>

                    <Button variant="outline" size="icon" className="relative hover:bg-[var(--primary-color)] hover:text-white transition-colors border-[var(--border-color)]">
                        <ShoppingBag className="w-5 h-5" />
                    </Button>

                    <Button variant="outline" size="icon" className="hover:bg-[var(--primary-color)] hover:text-white transition-colors border-[var(--border-color)]">
                        <Gift className="w-5 h-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-[var(--sub-text)] hover:text-[var(--text-color)]">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
