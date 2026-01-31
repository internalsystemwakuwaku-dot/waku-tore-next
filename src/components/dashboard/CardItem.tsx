'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleCardPin } from '@/lib/trello/actions';
import { toast } from 'sonner';
import type { ExtendedCard, TrelloList } from '@/types/trello';

interface CardItemProps {
  card: ExtendedCard;
  lists: TrelloList[];
  onOpenAssignment: (cardId: string) => void;
  onOpenMove: (cardId: string) => void;
  onOpenLogs: (cardId: string) => void;
}

export function CardItem({
  card,
  lists,
  onOpenAssignment,
  onOpenMove,
  onOpenLogs,
}: CardItemProps) {
  const [isPinning, setIsPinning] = useState(false);

  const isPinned = card.assignment?.isPinned ?? false;
  const hasDue = !!card.due;
  const isOverdue = hasDue && new Date(card.due!) < new Date();
  const isDueSoon = hasDue && !isOverdue && isDueWithin(card.due!, 3);

  const handleTogglePin = async () => {
    setIsPinning(true);
    try {
      await toggleCardPin(card.id, !isPinned);
      toast.success(isPinned ? 'ピン留めを解除しました' : 'ピン留めしました');
    } catch {
      toast.error('エラーが発生しました');
    } finally {
      setIsPinning(false);
    }
  };

  const handleOpenTrello = () => {
    window.open(card.url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(card.shortUrl);
    toast.success('リンクをコピーしました');
  };

  return (
    <Card
      className={`
        group relative transition-all hover:shadow-md cursor-pointer
        ${isPinned ? 'ring-2 ring-yellow-400' : ''}
        ${isOverdue ? 'border-red-400' : isDueSoon ? 'border-orange-400' : ''}
      `}
    >
      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">
          📌
        </div>
      )}

      <CardContent className="p-3">
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <div
                key={label.id}
                className="h-2 w-10 rounded"
                style={{ backgroundColor: getLabelColor(label.color) }}
                title={label.name}
              />
            ))}
          </div>
        )}

        {/* Card Name */}
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{card.name}</h3>

        {/* Assignment Info */}
        {card.assignment && (
          <div className="text-xs text-muted-foreground space-y-1 mb-2">
            {card.assignment.kochikuUserId && (
              <div>構築: {card.assignment.kochikuUserId}</div>
            )}
            {card.assignment.systemUserId && (
              <div>システム: {card.assignment.systemUserId}</div>
            )}
            {card.assignment.systemType && (
              <Badge variant="secondary" className="text-xs">
                {card.assignment.systemType}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {hasDue && (
          <div
            className={`text-xs mb-2 ${
              isOverdue
                ? 'text-red-600 font-medium'
                : isDueSoon
                ? 'text-orange-600'
                : 'text-muted-foreground'
            }`}
          >
            📅 {formatDate(card.due!)}
            {isOverdue && ' (期限切れ)'}
          </div>
        )}

        {/* Checklist Progress */}
        {card.checklists && card.checklists.length > 0 && (
          <ChecklistProgress checklists={card.checklists} />
        )}

        {/* Context Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenTrello}>
                🔗 Trelloで開く
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                📋 リンクをコピー
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOpenAssignment(card.id)}>
                👤 担当者設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenMove(card.id)}>
                ➡️ カード移動
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePin} disabled={isPinning}>
                {isPinned ? '📌 ピン解除' : '📌 ピン留め'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOpenLogs(card.id)}>
                📜 操作履歴
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistProgress({
  checklists,
}: {
  checklists: ExtendedCard['checklists'];
}) {
  if (!checklists || checklists.length === 0) return null;

  const total = checklists.reduce((sum, cl) => sum + cl.checkItems.length, 0);
  const completed = checklists.reduce(
    (sum, cl) => sum + cl.checkItems.filter((i) => i.state === 'complete').length,
    0
  );

  if (total === 0) return null;

  const progress = (completed / total) * 100;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span>
        {completed}/{total}
      </span>
    </div>
  );
}

function getLabelColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: '#61bd4f',
    yellow: '#f2d600',
    orange: '#ff9f1a',
    red: '#eb5a46',
    purple: '#c377e0',
    blue: '#0079bf',
    sky: '#00c2e0',
    lime: '#51e898',
    pink: '#ff78cb',
    black: '#344563',
  };
  return colorMap[color] || '#888888';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isDueWithin(dateString: string, days: number): boolean {
  const due = new Date(dateString);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
}
