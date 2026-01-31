'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeStore } from '@/stores/themeStore';
import { THEMES } from '@/lib/themes';
import { useGameStore } from '@/stores/gameStore';
import { signOut } from '@/lib/auth-client';
import { toast } from 'sonner';
import type { ThemeName } from '@/types'; // 型定義があれば使うが、なければany or string

export default function SettingsPage() {
  const { theme, backgroundUrl, backgroundOpacity, setTheme, setBackgroundUrl, setBackgroundOpacity } =
    useThemeStore();

  // Use new properties from gameStore
  const { soundEnabled, particleEnabled, toggleSound, toggleParticle } = useGameStore();

  const [bgInput, setBgInput] = useState(backgroundUrl || '');

  // ThemeName型が厳密でない場合に備えてキャスト
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    // @ts-ignore
    toast.success(`テーマを「${THEMES.find(t => t.id === newTheme)?.name || newTheme}」に変更しました`);
  };

  const handleBackgroundSave = () => {
    setBackgroundUrl(bgInput || null);
    toast.success('背景を保存しました');
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">⚙️ 設定</h1>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>テーマ</CardTitle>
          <CardDescription>アプリの外観を変更します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {THEMES.map(
              (themeItem) => (
                <Button
                  key={themeItem.id}
                  variant={theme === themeItem.id ? 'default' : 'outline'}
                  className="h-auto py-2"
                  onClick={() => handleThemeChange(themeItem.id)}
                >
                  {themeItem.name}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Background Settings */}
      <Card>
        <CardHeader>
          <CardTitle>背景画像</CardTitle>
          <CardDescription>カスタム背景画像を設定できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>画像URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={bgInput}
                onChange={(e) => setBgInput(e.target.value)}
              />
              <Button onClick={handleBackgroundSave}>保存</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>不透明度: {Math.round(backgroundOpacity * 100)}%</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={backgroundOpacity * 100}
              onChange={(e) => setBackgroundOpacity(parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          {backgroundUrl && (
            <Button
              variant="outline"
              onClick={() => {
                setBackgroundUrl(null);
                setBgInput('');
                toast.success('背景をリセットしました');
              }}
            >
              背景をリセット
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ゲーム設定</CardTitle>
          <CardDescription>ゲーミフィケーション機能の設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>サウンド効果</Label>
              <p className="text-sm text-muted-foreground">
                レベルアップ時などの効果音
              </p>
            </div>
            <Button
              variant={soundEnabled ? 'default' : 'outline'}
              onClick={toggleSound}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>パーティクル効果</Label>
              <p className="text-sm text-muted-foreground">
                クリック時のエフェクト
              </p>
            </div>
            <Button
              variant={particleEnabled ? 'default' : 'outline'}
              onClick={toggleParticle}
            >
              {particleEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            🚪 ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
