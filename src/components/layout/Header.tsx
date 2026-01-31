'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGameStore } from '@/stores/gameStore';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Zap, ShoppingBag, Settings, Gift } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  // Game Store
  const {
    xp, totalXp, gold, calculateRank, calculateNextRankXp,
    autoXpPerSec, clickPower
  } = useGameStore();

  const { theme } = useThemeStore();
  const [rankName, setRankName] = useState('');
  const [nextRankXp, setNextRankXp] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setRankName(calculateRank());
    setNextRankXp(calculateNextRankXp());
    setRenderProgress(Math.min(100, Math.max(0, (totalXp % 1000) / 10))); // 仮計算
  }, [xp, totalXp, calculateRank, calculateNextRankXp]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[var(--header-bg)] text-[var(--text-color)] transition-colors duration-300 shadow-sm backdrop-blur-md bg-opacity-90 supports-[backdrop-filter]:bg-opacity-60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">わく☆とれ</span>
            {theme !== 'default' && <span className="text-xs opacity-70 ml-2">{theme} mode</span>}
          </Link>
        </div>

        {/* Game Status (Only if logged in) */}
        {session && (
          <>
            {/* Rank & XP */}
            <div className="hidden md:flex flex-col items-start min-w-[120px] mr-4">
              <span className="text-xs text-[var(--sub-text)] flex items-center gap-1 font-bold">
                <Trophy className="w-3 h-3 text-yellow-500" />
                RANK
              </span>
              <span className="text-sm font-bold truncate max-w-[200px]" title={rankName}>
                {rankName}
              </span>
            </div>

            <div className="hidden md:flex flex-col w-[120px] lg:w-[200px] gap-1 mr-4">
              <div className="flex justify-between text-xs items-end">
                <span className="text-[var(--sub-text)]">Next Rank</span>
                <span className="font-mono text-[var(--primary-color)] font-bold">-{nextRankXp.toLocaleString()}</span>
              </div>
              <Progress value={renderProgress} className="h-2 bg-[var(--border-color)]" indicatorClassName="bg-[var(--primary-color)] transition-all duration-500" />
            </div>

            {/* Auto & Click Stats (Desktop only) */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--input-bg)] rounded-full border border-[var(--border-color)]">
                <Zap className="w-3 h-3 text-blue-500 fill-blue-500" />
                <span className="font-mono font-bold text-xs">{autoXpPerSec.toLocaleString()} /s</span>
              </div>
            </div>

            {/* Gold Area */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-mono font-bold text-yellow-700 dark:text-yellow-300">
                  {Math.floor(gold).toLocaleString()} G
                </span>
              </div>

              {/* Game Actions */}
              <Button variant="outline" size="icon" className="relative hover:bg-[var(--primary-color)] hover:text-white transition-colors border-[var(--border-color)]">
                <ShoppingBag className="w-5 h-5" />
              </Button>

              <Button variant="outline" size="icon" className="hover:bg-[var(--primary-color)] hover:text-white transition-colors border-[var(--border-color)]">
                <Gift className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-2 ml-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-[var(--border-color)]">
                    <AvatarFallback className="bg-[var(--primary-color)] text-white">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">⚙️ 設定</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  🚪 ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
