'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function CookieClicker() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  const { addXp, addGold, clickPower, autoXpPerSec, xp } = useGameStore();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // 1クリックで ClickPower 分のXPとGoldを獲得
      addXp(clickPower, 'click');
      addGold(clickPower); // Goldも増える仕様にする

      // Add particle effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newParticle = { id: Date.now(), x, y, val: clickPower };
      setParticles((prev) => [...prev, newParticle]);

      // Remove particle after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    },
    [addXp, addGold, clickPower]
  );

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={handleClick}
        className="relative w-16 h-16 text-4xl rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer select-none"
        title={`クリックで +${clickPower} XP/Gold ゲット！`}
      >
        🍪
        {/* Particles */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute text-xs font-bold text-primary pointer-events-none animate-float-up whitespace-nowrap"
            style={{ left: particle.x, top: particle.y }}
          >
            +{particle.val}
          </span>
        ))}
      </button>
      <span className="text-xs text-muted-foreground mt-1">
        Current XP: {Math.floor(xp).toLocaleString()}
        {autoXpPerSec > 0 && ` (+${autoXpPerSec}/s)`}
      </span>
    </div>
  );
}
