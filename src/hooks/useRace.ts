import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { RACE_SCHEDULE, RACE_HORSES, Horse } from '@/lib/game/constants';
import { toast } from 'sonner';

export const useRace = () => {
    const { raceData, setRaceData, checkRace } = useGameStore();
    const [raceStatus, setRaceStatus] = useState<'CLOSED' | 'OPEN' | 'RUNNING'>('CLOSED');
    const [nextRace, setNextRace] = useState<any>(null);

    // ID生成ヘルパー
    const generateRaceId = (race: { h: number; m: number }) => {
        const now = new Date();
        const y = now.getFullYear();
        const m = ('0' + (now.getMonth() + 1)).slice(-2);
        const d = ('0' + now.getDate()).slice(-2);
        const hh = ('0' + race.h).slice(-2);
        const mm = ('0' + race.m).slice(-2);
        return `${y}${m}${d}_${hh}${mm}`;
    };

    const updateRaceStatus = useCallback(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeVal = currentHour * 60 + currentMin;

        let targetRace = null;
        let status: 'CLOSED' | 'OPEN' | 'RUNNING' = 'CLOSED';

        for (let i = 0; i < RACE_SCHEDULE.length; i++) {
            const race = RACE_SCHEDULE[i];
            const raceTimeVal = race.h * 60 + race.m;

            // レース開始60分前から投票可能
            const voteStartVal = raceTimeVal - 60;
            // レース開始後5分間は「発走中」扱い
            const raceEndVal = raceTimeVal + 5;

            if (currentTimeVal >= voteStartVal && currentTimeVal < raceTimeVal) {
                targetRace = { ...race, id: generateRaceId(race) };
                status = 'OPEN';
                break;
            } else if (currentTimeVal >= raceTimeVal && currentTimeVal < raceEndVal) {
                targetRace = { ...race, id: generateRaceId(race) };
                status = 'RUNNING';
                break;
            } else if (currentTimeVal < voteStartVal) {
                if (!targetRace) targetRace = { ...race, id: generateRaceId(race) };
            }
        }

        setNextRace(targetRace);
        setRaceStatus(status);
    }, []);

    const generateNewspaperData = useCallback((raceId: string) => {
        // すでに保存済みのデータがあれば何もしない
        if (raceData.newspaper && raceData.newspaper.raceId === raceId) {
            return;
        }

        const conditions = [
            { label: '絶好', val: 1.1, icon: '⬆️', class: 'cond-excellent' },
            { label: '好調', val: 1.05, icon: '↗️', class: 'cond-good' },
            { label: '普通', val: 1.0, icon: '➡️', class: 'cond-normal' },
            { label: '不調', val: 0.95, icon: '↘️', class: 'cond-bad' }
        ];

        // ランダムに馬を選出 (ここでは定義されている全馬から)
        // constants.ts の RACE_HORSES を使用
        // 実際にはもっと多くの馬からランダムに選ぶロジックだったが、簡易的に全馬または一部を使用
        const selectedHorses = [...RACE_HORSES].sort(() => 0.5 - Math.random()).slice(0, 10); // 10頭立て

        const horsesData = selectedHorses.map(h => {
            const cond = conditions[Math.floor(Math.random() * conditions.length)];
            const adjustedSpeed = h.speed * cond.val;
            // オッズから勝率・AI予想を計算
            const baseWinRate = Math.min(90, Math.floor((1 / h.odds) * 80 + (Math.random() * 10 - 5)));
            const aiProb = Math.min(99, Math.floor((1 / h.odds) * 100 * cond.val));

            return {
                id: h.id,
                name: h.name,
                baseOdds: h.odds,
                condition: cond,
                adjustedSpeed: adjustedSpeed,
                winRate: baseWinRate,
                aiProb: aiProb,
                icon: h.icon,
                comment: ['気配抜群', '好調維持', '連勝狙う', '展開向けば', '一発ある', '少し重いかも', '仕上がり良'][Math.floor(Math.random() * 7)]
            };
        });

        const sorted = [...horsesData].sort((a, b) => b.adjustedSpeed - a.adjustedSpeed);

        // 印をつける
        horsesData.forEach(h => {
            const rank = sorted.findIndex(s => s.id === h.id);
            let mark = { s: '－', c: 'cond-bad' };
            if (rank === 0) mark = { s: '◎', c: 'mark-double-circle' };
            else if (rank === 1) mark = { s: '〇', c: 'mark-circle' };
            else if (rank === 2) mark = { s: '▲', c: 'mark-triangle' };
            else if (rank === 3) mark = { s: '☆', c: 'mark-star' };
            else if (rank === 4) mark = { s: '△', c: '' };

            (h as any).mark = mark;
        });

        setRaceData({ newspaper: { raceId, horses: horsesData } });
    }, [raceData.newspaper, setRaceData]);

    useEffect(() => {
        updateRaceStatus();
        checkRace();
        const timer = setInterval(() => {
            updateRaceStatus();
            checkRace();
        }, 60000); // 1分ごとに更新
        return () => clearInterval(timer);
    }, [updateRaceStatus, checkRace]);

    // レースIDが変わったら新聞を生成（OPENまたはRUNNINGのとき）
    useEffect(() => {
        if (nextRace && (raceStatus === 'OPEN' || raceStatus === 'RUNNING')) {
            generateNewspaperData(nextRace.id);
        }
    }, [nextRace, raceStatus, generateNewspaperData]);

    return {
        raceStatus,
        nextRace,
        newspaper: raceData.newspaper,
        updateRaceStatus
    };
};
