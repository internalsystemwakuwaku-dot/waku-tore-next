'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function CookieClicker() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const incrementClicks = useGameStore((state) => state.incrementClicks);
  const totalClicks = useGameStore((state) => state.totalClicks);
  const autoClickers = useGameStore((state) => state.autoClickers);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      incrementClicks();

      // Add particle effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newParticle = { id: Date.now(), x, y };
      setParticles((prev) => [...prev, newParticle]);

      // Remove particle after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    },
    [incrementClicks]
  );

  // Auto-clickers effect
  useEffect(() => {
    if (autoClickers <= 0) return;

    const interval = setInterval(() => {
      incrementClicks();
    }, 1000 / autoClickers); // More auto-clickers = faster

    return () => clearInterval(interval);
  }, [autoClickers, incrementClicks]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={handleClick}
        className="relative w-16 h-16 text-4xl rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer select-none"
        title="クリックでXPゲット！"
      >
        🍪
        {/* Particles */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute text-xs font-bold text-primary pointer-events-none animate-float-up"
            style={{ left: particle.x, top: particle.y }}
          >
            +1
          </span>
        ))}
      </button>
      <span className="text-xs text-muted-foreground mt-1">
        {totalClicks.toLocaleString()} clicks
        {autoClickers > 0 && ` (+${autoClickers}/s)`}
      </span>
    </div>
  );
}
