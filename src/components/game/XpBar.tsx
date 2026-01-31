'use client';

import { useLevelInfo, useXpProgress } from '@/stores/gameStore';

interface XpBarProps {
  compact?: boolean;
}

export function XpBar({ compact = false }: XpBarProps) {
  const levelInfo = useLevelInfo();
  const xpProgress = useXpProgress();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: levelInfo.color + '20',
            color: levelInfo.color,
          }}
        >
          Lv.{levelInfo.level}
        </div>
        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${xpProgress.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{
              backgroundColor: levelInfo.color + '20',
              color: levelInfo.color,
            }}
          >
            Lv.{levelInfo.level} {levelInfo.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${xpProgress.progress}%` }}
        />
      </div>
    </div>
  );
}
