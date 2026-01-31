import { useState, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';
import { OMIKUJI_RESULTS, LUCKY_ITEMS, LUCKY_COLORS, TOPICS_ANIME, TOPICS_MOVIES, TOPICS_HORSES } from '@/lib/game/omikujiData';

export interface OmikujiResult {
    result: { label: string; weight: number; bonus: number; color: string };
    item: string;
    color: string;
    topic: { category: string; title: string; desc: string };
    xpBonus: number;
    goldBonus: number;
}

export const useOmikuji = () => {
    const { addXp, addGold, level } = useGameStore();
    const [result, setResult] = useState<OmikujiResult | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const drawOmikuji = useCallback(() => {
        setIsDrawing(true);

        // 演出のため少し待機
        setTimeout(() => {
            // 1. 運勢の抽選 (重み付け抽選)
            const totalWeight = OMIKUJI_RESULTS.reduce((acc, r) => acc + r.weight, 0);
            let r = Math.random() * totalWeight;
            let selectedResult = OMIKUJI_RESULTS[0];
            for (const res of OMIKUJI_RESULTS) {
                if (r < res.weight) {
                    selectedResult = res;
                    break;
                }
                r -= res.weight;
            }

            // 2. ラッキーアイテムとカラー
            const item = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)];
            const color = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];

            // 3. 話題のネタ
            const categories = [
                { name: 'アニメ', data: TOPICS_ANIME, key: 't' },
                { name: '映画', data: TOPICS_MOVIES, key: 't' },
                { name: 'ウマ娘/競走馬', data: TOPICS_HORSES, key: 'n' }
            ];
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const topicData = cat.data[Math.floor(Math.random() * cat.data.length)] as any;
            const topic = {
                category: cat.name,
                title: topicData[cat.key], // 't' or 'n'
                desc: topicData.d
            };

            // 4. ボーナス計算 (レベル依存)
            const baseBonus = (level + 1) * 100;
            const xpBonus = Math.floor(baseBonus * selectedResult.bonus);
            const goldBonus = Math.floor(baseBonus * selectedResult.bonus * 2);

            // 報酬付与
            addXp(xpBonus, 'おみくじ');
            addGold(goldBonus);

            if (selectedResult.label === '大吉' || selectedResult.label === '中吉') {
                toast.success(`運勢: ${selectedResult.label}`, { description: `${xpBonus} XP と ${goldBonus} Gold を獲得！` });
            } else if (selectedResult.label === '凶' || selectedResult.label === '大凶') {
                toast.error(`運勢: ${selectedResult.label}`, { description: 'ドンマイ！明日があるさ。' });
            } else {
                toast.info(`運勢: ${selectedResult.label}`, { description: `${xpBonus} XP と ${goldBonus} Gold を獲得！` });
            }

            setResult({
                result: selectedResult,
                item,
                color,
                topic,
                xpBonus,
                goldBonus
            });
            setIsDrawing(false);
        }, 1000);
    }, [addXp, addGold, level]);

    const resetOmikuji = useCallback(() => {
        setResult(null);
    }, []);

    return {
        result,
        isDrawing,
        drawOmikuji,
        resetOmikuji
    };
};
