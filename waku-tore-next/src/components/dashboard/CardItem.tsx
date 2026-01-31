'use client';

import { useState } from 'react';
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
  const dueDate = hasDue ? new Date(card.due!) : null;
  const now = new Date();
  const isOverdue = dueDate && dueDate < now;
  const isDueSoon = hasDue && !isOverdue && isDueWithin(card.due!, 3);
  const isDueComplete = card.dueComplete;

  // システム種別情報
  const systemType = card.assignment?.systemType;
  const isNakaeStyle = systemType?.includes('中江式') || systemType?.includes('予約システム');
  const isMokare = systemType?.includes('Mokare') || systemType?.includes('mokare');

  // 構築No.
  const constructionNo = card.customFieldItems?.find(
    (field) => field.idCustomField === '6799b710ccbdbe405066ba7d'
  )?.value?.text;

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

  // カードクラス名を構築
  const cardClasses = [
    'trello-card',
    'relative',
    'transition-all',
    'hover:shadow-md',
    'cursor-pointer',
    isPinned ? 'pinned' : '',
    isNakaeStyle && !isMokare ? 'border-nakae' : '',
    isMokare && !isNakaeStyle ? 'border-mokare' : '',
    isNakaeStyle && isMokare ? 'border-nakae border-mokare' : '',
  ].filter(Boolean).join(' ');

  // 期限バッジクラス名を取得
  const getDueBadgeClass = () => {
    if (isDueComplete) return 'due-badge due-complete';
    if (isOverdue) return 'due-badge due-overdue';
    if (isDueSoon) return 'due-badge due-soon';
    return 'due-badge due-ok';
  };

  return (
    <div
      className={cardClasses}
      data-card
      data-pinned={isPinned ? 'true' : 'false'}
    >
      {/* ラベル表示 */}
      {card.labels.length > 0 && (
        <div className="trello-label-container">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className={`trello-label label-${label.color || 'null'}`}
              title={label.name}
            >
              {label.name || '\u00A0'}
            </span>
          ))}
        </div>
      )}

      {/* カード名 */}
      <div className="trello-card-name">
        {constructionNo && (
          <span className="construction-number">#{constructionNo}</span>
        )}
        {card.name}
      </div>

      {/* 担当者情報 */}
      {card.assignment && (
        <div className="tags-container">
          {card.assignment.kochikuUserId && (
            <span className="tag tag-construction">
              構築: {card.assignment.kochikuUserId}
            </span>
          )}
          {card.assignment.systemUserId && (
            <span className="tag tag-system">
              システム: {card.assignment.systemUserId}
            </span>
          )}
          {card.assignment.shodanUserId && (
            <span className="tag tag-sales">
              商談: {card.assignment.shodanUserId}
            </span>
          )}
          {card.assignment.mtgUserId && (
            <span className="tag tag-mtg">
              MTG: {card.assignment.mtgUserId}
            </span>
          )}
        </div>
      )}

      {/* システム種別タグ */}
      {systemType && (
        <div className="tags-container">
          {isNakaeStyle && !isMokare && (
            <span className="tag tag-systemType">中江式</span>
          )}
          {isMokare && !isNakaeStyle && (
            <span className="tag tag-mokare">Mokare</span>
          )}
          {isNakaeStyle && isMokare && (
            <>
              <span className="tag tag-systemType">中江式</span>
              <span className="tag tag-mokare">Mokare</span>
            </>
          )}
        </div>
      )}

      {/* 期限表示 */}
      {hasDue && (
        <div className="due-container">
          <span className={getDueBadgeClass()}>
            📅 {formatDate(card.due!)}
            {isOverdue && !isDueComplete && ' (期限切れ)'}
            {isDueComplete && ' ✓'}
          </span>
        </div>
      )}

      {/* チェックリストの進捗 */}
      {card.checklists && card.checklists.length > 0 && (
        <ChecklistProgress checklists={card.checklists} />
      )}

      {/* メモ */}
      {card.assignment?.memo && (
        <div className="card-memo-container">
          <span className="card-memo">{card.assignment.memo}</span>
        </div>
      )}

      {/* コンテキストメニュー */}
      <div className="card-actions-top-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="action-btn">
              ⋮
            </button>
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
    </div>
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
  const isComplete = progress === 100;

  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sub-text)', marginTop: '6px' }}>
      <span style={{ fontSize: '12px' }}>☑</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${progress}%`,
            background: isComplete ? '#61bd4f' : 'var(--primary-color)'
          }}
        />
      </div>
      <span style={{ fontWeight: isComplete ? 'bold' : 'normal', color: isComplete ? '#61bd4f' : undefined }}>
        {completed}/{total}
      </span>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isThisYear) {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
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
