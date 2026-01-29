'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
        <p className="text-muted-foreground mb-4">
          ページの読み込み中にエラーが発生しました。
        </p>
        <p className="text-sm text-red-500 mb-4 break-all">
          {error.message}
        </p>
        <Button onClick={() => reset()}>
          再試行
        </Button>
      </div>
    </div>
  );
}
