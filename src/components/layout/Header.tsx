'use client';

import { useState } from 'react';
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
import { useGameStore, useLevelInfo, useXpProgress } from '@/stores/gameStore';

export function Header() {
  const { data: session } = useSession();
  const levelInfo = useLevelInfo();
  const xpProgress = useXpProgress();
  const money = useGameStore((state) => state.money);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">わく☆とれ</span>
            <span className="text-xs text-muted-foreground">v2.0.0</span>
          </Link>
        </div>

        {/* Game Status */}
        {session && (
          <div className="flex items-center gap-4 flex-1">
            {/* Level Badge */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: levelInfo.color + '20', color: levelInfo.color }}
            >
              <span>Lv.{levelInfo.level}</span>
              <span>{levelInfo.name}</span>
            </div>

            {/* XP Bar */}
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${xpProgress.progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()} XP
              </div>
            </div>

            {/* Money */}
            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
              <span>💰</span>
              <span>{money.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '更新中...' : '🔄 更新'}
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
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
                <DropdownMenuItem asChild>
                  <Link href="/memos">📝 メモ帳</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/game">🎮 ゲーム</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
