'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCardLogs } from '@/lib/trello/actions';
import type { ExtendedCard } from '@/types/trello';

interface CardLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ExtendedCard | null;
}

interface LogEntry {
  id: number;
  userId: string;
  action: string;
  cardId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date | null;
}

export function CardLogModal({ isOpen, onClose, card }: CardLogModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      loadLogs();
    }
  }, [isOpen, card]);

  const loadLogs = async () => {
    if (!card) return;

    setIsLoading(true);
    try {
      const data = await getCardLogs(card.id);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>操作履歴</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{card.name}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              読み込み中...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              履歴がありません
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    実行者: {log.userId}
                  </div>
                  {log.details && (
                    <div className="mt-2 text-xs bg-secondary/50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    move: '📦 カード移動',
    assign: '👤 担当者設定',
    update_due: '📅 期限更新',
    add_comment: '💬 コメント追加',
    delete_comment: '🗑️ コメント削除',
    bulk_move: '📦 一括移動',
    bulk_assign: '👤 一括担当者設定',
  };
  return labels[action] || action;
}

function formatDateTime(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
