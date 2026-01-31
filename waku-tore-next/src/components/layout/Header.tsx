'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { useGameStore, useLevelInfo, useXpProgress } from '@/stores/gameStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFilterStore } from '@/stores/filterStore';

// メンバーリスト（オリジナルと同じ）
const MEMBERS = [
  'wakuwaku0418',
  'aochan',
  'mj',
  'sasahara',
  'Inuyama',
  'reimen',
  'sirai',
  'murano',
  'yuni',
  'kimura',
  'hino',
  'derby0605',
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const { data: session } = useSession();
  const levelInfo = useLevelInfo();
  const xpProgress = useXpProgress();
  const { money, xp, addXp } = useGameStore();
  const { theme, setTheme } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // フィルター状態
  const {
    sortBy,
    searchQuery,
    systemTypes,
    assignees,
    setSortBy,
    setSearchQuery,
    toggleSystemType,
    toggleAssignee,
  } = useFilterStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // テーマをbodyに適用
  useEffect(() => {
    if (!mounted) return;
    document.body.className = '';
    if (theme && theme !== 'default') {
      document.body.classList.add(`${theme}-mode`);
    }
  }, [theme, mounted]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const handleCookieClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const clickPower = 2 + (useGameStore.getState().inventory?.mouse || 0) * 2;
    addXp(clickPower);

    // ビジュアルフィードバック
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(0.9)';
    setTimeout(() => {
      target.style.transform = 'scale(1)';
    }, 100);
  }, [addXp]);

  // 並び替え変更ハンドラ
  const handleSortChange = (value: string) => {
    switch (value) {
      case 'due-asc':
        setSortBy('due');
        break;
      case 'updated-desc':
        setSortBy('updated');
        break;
      case 'name-asc':
        setSortBy('name');
        break;
      default:
        setSortBy('trello');
    }
  };

  // システム種別変更ハンドラ
  const handleSystemTypeChange = (value: string) => {
    if (value === '') {
      // すべて選択時はフィルターをクリア
      if (systemTypes.length > 0) {
        systemTypes.forEach((t) => toggleSystemType(t));
      }
    } else {
      // 単一選択をトグル
      if (!systemTypes.includes(value)) {
        systemTypes.forEach((t) => toggleSystemType(t)); // 既存をクリア
        toggleSystemType(value);
      }
    }
  };

  // 担当者変更ハンドラ
  const handleAssigneeChange = (value: string) => {
    if (value === '') {
      if (assignees.length > 0) {
        assignees.forEach((a) => toggleAssignee(a));
      }
    } else {
      if (!assignees.includes(value)) {
        assignees.forEach((a) => toggleAssignee(a));
        toggleAssignee(value);
      }
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <span className="font-bold text-xl">わく☆とれ</span>
            <span className="text-xs opacity-50 ml-2">v2.0.0</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b transition-all duration-300" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
      {/* 上段 */}
      <div className="flex items-center px-4 py-2 gap-4">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h1 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>
              わく☆とれ
            </h1>
            <span className="text-xs opacity-50">v2.0.0</span>
          </Link>
          <button
            onClick={() => setHeaderCollapsed(!headerCollapsed)}
            className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="メニューの開閉"
          >
            <span className="text-lg">{headerCollapsed ? '▼' : '▲'}</span>
          </button>
        </div>

        {/* ゲームステータスバー */}
        {session && (
          <div className="game-status-bar">
            {/* クッキークリッカー */}
            <div className="cookie-clicker-area">
              <button
                className="btn-cookie"
                onClick={handleCookieClick}
                title="クリックしてXPゲット！"
              >
                🍪
              </button>
              <div className="auto-clicker-status">
                <span>Click: +{2 + (useGameStore.getState().inventory?.mouse || 0) * 2} XP</span>
                <span>Auto: {useGameStore.getState().autoXpPerSecond || 0} XP/s</span>
              </div>
            </div>

            {/* レベル＆ランク */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="game-level-badge">Lv.{levelInfo.level}</span>
                <span className="game-rank-text">{levelInfo.name}</span>

                {/* ミニボタン */}
                <div className="flex gap-1 ml-2">
                  <Link
                    href="/game"
                    className="btn-game-mini"
                    title="自動化ショップ"
                  >
                    🛒
                  </Link>
                  <button
                    className="btn-game-mini"
                    onClick={() => {/* TODO: ランキングモーダル */ }}
                    title="ランキング"
                  >
                    📊
                  </button>
                  <button
                    className="btn-game-mini"
                    onClick={() => {
                      localStorage.setItem('waku-tore-game', JSON.stringify(useGameStore.getState()));
                    }}
                    title="データを保存"
                  >
                    💾
                  </button>
                </div>
              </div>

              {/* XPバー */}
              <div className="flex items-center">
                <div className="game-xp-container" title="次のレベルまで">
                  <div
                    className="game-xp-bar"
                    style={{ width: `${xpProgress.progress}%` }}
                  />
                </div>
                <span className="game-xp-text">{Math.floor(xp).toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* マネーエリア */}
        {session && (
          <div className="game-money-area">
            <span>{money.toLocaleString()}</span>
            <div className="flex gap-1 ml-2">
              <Link
                href="/game#race"
                className="btn-race"
                title="競馬ゲーム"
              >
                競馬
              </Link>
              <Link
                href="/game#results"
                className="btn-race"
                style={{ background: 'linear-gradient(to bottom, #2c3e50, #34495e)', borderColor: '#1a252f' }}
              >
                結果
              </Link>
              <Link
                href="/game#gacha"
                className="btn-gacha"
                title="1回500円"
              >
                ガチャ
              </Link>
              <button
                className="btn-race"
                style={{ background: 'linear-gradient(to bottom, #f1c40f, #f39c12)', borderColor: '#d68910' }}
                onClick={() => {/* TODO: 所持金ランキング */ }}
                title="所持金ランキング"
              >
                長者
              </button>
            </div>
          </div>
        )}

        {/* クイックフィルター＆コントロール */}
        <div className="flex items-center gap-2 ml-auto">
          {/* クイックフィルターボタン */}
          <div className="flex gap-1">
            <button className="btn-quick-filter btn-today">本日予定</button>
            <button className="btn-quick-filter btn-tomorrow">明日予定</button>
            <button className="btn-quick-filter">翌週月曜予定</button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <div className="flex gap-1">
            <button className="btn-quick-filter btn-overdue">期限切れ</button>
            <button className="btn-quick-filter btn-due24h">24時間以内</button>
            <button className="btn-quick-filter btn-due3d">3日以内</button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* アクションボタン */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-quick-filter"
                style={{ background: 'var(--primary-color)', color: 'white' }}
                title="更新"
              >
                {isRefreshing ? '⏳' : '🔄'}
              </button>
              <button className="btn-quick-filter" title="ダッシュボード">📈</button>
              <Link href="/memos" className="btn-quick-filter" title="メモ帳">📝</Link>
              <button className="btn-quick-filter" title="今日の運勢">🎲</button>
            </div>
            <Link
              href="/settings"
              className="btn-quick-filter text-center"
              style={{ fontSize: '11px' }}
            >
              ⚙️ 設定
            </Link>
          </div>

          {/* ユーザーメニュー */}
          {session && (
            <div className="relative group">
              <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--primary-color)', color: 'white' }}>
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
                <div className="bg-white border rounded-lg shadow-lg p-2 min-w-48" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="font-medium" style={{ color: 'var(--text-color)' }}>{session.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--sub-text)' }}>{session.user.email}</p>
                  </div>
                  <Link href="/settings" className="block px-3 py-2 hover:bg-gray-100 rounded text-sm">
                    ⚙️ 設定
                  </Link>
                  <Link href="/memos" className="block px-3 py-2 hover:bg-gray-100 rounded text-sm">
                    📝 メモ帳
                  </Link>
                  <Link href="/game" className="block px-3 py-2 hover:bg-gray-100 rounded text-sm">
                    🎮 ゲーム
                  </Link>
                  <hr style={{ borderColor: 'var(--border-color)' }} className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-red-500"
                  >
                    🚪 ログアウト
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* フィルターバー（折りたたみ可能） */}
      {!headerCollapsed && (
        <div className="filter-bar px-4 py-2 border-t" style={{ background: 'var(--list-bg)', borderColor: 'var(--border-color)' }}>
          <button className="btn-quick-filter">
            ☑️ 選択モード
          </button>

          <div className="flex gap-1">
            <button className="btn-quick-filter" title="全リストのロックを解除">🔓 全解除</button>
            <button className="btn-quick-filter" title="全リストをロック">🔒 全ロック</button>
          </div>

          <div className="filter-group">
            <label>並び替え</label>
            <select
              className="px-2 py-1 rounded text-sm"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
              value={sortBy === 'due' ? 'due-asc' : sortBy === 'updated' ? 'updated-desc' : sortBy === 'name' ? 'name-asc' : 'none'}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="none">Trello順</option>
              <option value="due-asc">期限が近い順</option>
              <option value="updated-desc">更新日が新しい順</option>
              <option value="name-asc">店舗名順</option>
            </select>
          </div>

          <div className="filter-group">
            <label>予約システム担当</label>
            <select
              className="px-2 py-1 rounded text-sm"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
              value={assignees[0] || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">すべて</option>
              {MEMBERS.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>システム種別</label>
            <select
              className="px-2 py-1 rounded text-sm"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
              value={systemTypes[0] || ''}
              onChange={(e) => handleSystemTypeChange(e.target.value)}
            >
              <option value="">すべて</option>
              <option value="予約システム">中江式予約システム/アンケート</option>
              <option value="Mokare">Mokare</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Trelloラベル</label>
            <select className="px-2 py-1 rounded text-sm" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
              <option value="">すべて</option>
            </select>
          </div>

          <div className="filter-group">
            <label>構築担当</label>
            <select className="px-2 py-1 rounded text-sm" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
              <option value="">すべて</option>
              {MEMBERS.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>

          {/* 検索 */}
          <div className="filter-group ml-auto">
            <label>検索</label>
            <div className="relative">
              <input
                type="text"
                placeholder="店舗名で検索..."
                className="px-3 py-1 pr-8 rounded text-sm w-48"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          <div className="text-sm" style={{ color: 'var(--sub-text)' }}>
            <span>0</span>件
          </div>
        </div>
      )}

      {/* XP トーストコンテナ */}
      <div id="xp-toast-container" className="xp-toast-container" />
    </header>
  );
}
