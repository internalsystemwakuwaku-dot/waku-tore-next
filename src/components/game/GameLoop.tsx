'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function GameLoop() {
    const { autoXpPerSec, addXp, addGold } = useGameStore();
    const internalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 1秒ごとに自動計算を実行
        internalRef.current = setInterval(() => {
            if (autoXpPerSec > 0) {
                addXp(autoXpPerSec, 'auto');

                // 自動収入ロジック (XPの一部をGoldとして還元するなど)
                // original logic: if (this.autoXp > 0) this.addGold(this.autoXp * 0.1);
                addGold(Math.floor(autoXpPerSec * 0.1));
            }
        }, 1000);

        return () => {
            if (internalRef.current) {
                clearInterval(internalRef.current);
            }
        };
    }, [autoXpPerSec, addXp, addGold]);

    return null; // UIは描画しない
}
