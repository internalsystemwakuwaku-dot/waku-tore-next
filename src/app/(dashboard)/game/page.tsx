'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XpBar } from '@/components/game/XpBar';
import { CookieClicker } from '@/components/game/CookieClicker';
import { KeibaGame } from '@/components/game/KeibaGame';
import { GachaGame } from '@/components/game/GachaGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';

export default function GamePage() {
  const { gold, totalXp, autoXpPerSec } = useGameStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🎮 ゲームセンター</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">レベル & XP</CardTitle>
          </CardHeader>
          <CardContent>
            <XpBar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">所持金</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              💰 {Math.floor(gold).toLocaleString()}円
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">生産性</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold">
                ⚡ {Math.floor(totalXp).toLocaleString()} Total XP
              </div>
              <div className="text-sm text-muted-foreground">
                Auto: {autoXpPerSec.toLocaleString()} XP/s
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Clicker */}
      <div className="flex justify-center py-4">
        <CookieClicker />
      </div>

      {/* Games */}
      <Tabs defaultValue="keiba" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="keiba">🏇 競馬</TabsTrigger>
          <TabsTrigger value="gacha">🎰 ガチャ</TabsTrigger>
        </TabsList>

        <TabsContent value="keiba" className="mt-4">
          <KeibaGame />
        </TabsContent>

        <TabsContent value="gacha" className="mt-4">
          <GachaGame />
        </TabsContent>
      </Tabs>
    </div>
  );
}
