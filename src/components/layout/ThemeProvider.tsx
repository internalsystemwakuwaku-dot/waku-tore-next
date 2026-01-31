'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 既存のテーマクラスを削除
    document.body.className = '';

    // デフォルト以外の場合、クラスを追加
    if (theme !== 'default') {
      document.body.classList.add(theme);
    }
  }, [theme, mounted]);

  // ハイドレーション不一致を防ぐため、マウントされるまでは何もレンダリングしないか、
  // あるいはサーバーサイドレンダリングの結果と一致させる工夫が必要ですが、
  // ここではbodyへのクラス適用が主目的なのでchildrenはそのまま返します。
  // bodyへのクラス操作はuseEffectで行われるため、クライアントサイドでのみ実行されます。

  return <>{children}</>;
}
