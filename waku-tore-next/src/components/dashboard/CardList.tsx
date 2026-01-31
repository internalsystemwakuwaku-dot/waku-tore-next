'use client';

import { useMemo, useState } from 'react';
import { CardItem } from './CardItem';
import { useFilterStore } from '@/stores/filterStore';
import type { ExtendedCard, TrelloList } from '@/types/trello';

interface CardListProps {
  cards: ExtendedCard[];
  lists: TrelloList[];
  onOpenAssignment: (cardId: string) => void;
  onOpenMove: (cardId: string) => void;
  onOpenLogs: (cardId: string) => void;
}

export function CardList({
  cards,
  lists,
  onOpenAssignment,
  onOpenMove,
  onOpenLogs,
}: CardListProps) {
  const {
    sortBy,
    searchQuery,
    systemTypes,
    assignees,
    labels,
    isPinnedOnly,
  } = useFilterStore();

  // リストロック状態（オリジナルの機能を再現）
  const [lockedLists, setLockedLists] = useState<Set<string>>(new Set());

  const toggleListLock = (listId: string) => {
    setLockedLists((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  // フィルターと並び替え
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // 検索クエリでフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.desc?.toLowerCase().includes(query)
      );
    }

    // システム種別でフィルター
    if (systemTypes.length > 0) {
      result = result.filter((card) =>
        systemTypes.includes(card.assignment?.systemType ?? '')
      );
    }

    // 担当者でフィルター
    if (assignees.length > 0) {
      result = result.filter((card) => {
        const assignment = card.assignment;
        if (!assignment) return false;
        return (
          assignees.includes(assignment.kochikuUserId ?? '') ||
          assignees.includes(assignment.systemUserId ?? '') ||
          assignees.includes(assignment.shodanUserId ?? '') ||
          assignees.includes(assignment.mtgUserId ?? '')
        );
      });
    }

    // ラベルでフィルター
    if (labels.length > 0) {
      result = result.filter((card) =>
        card.labels.some((label) => labels.includes(label.id))
      );
    }

    // ピン留めのみ表示
    if (isPinnedOnly) {
      result = result.filter((card) => card.assignment?.isPinned);
    }

    // 並び替え
    switch (sortBy) {
      case 'due':
        result.sort((a, b) => {
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        });
        break;
      case 'updated':
        result.sort(
          (a, b) =>
            new Date(b.dateLastActivity).getTime() -
            new Date(a.dateLastActivity).getTime()
        );
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      // 'trello' - 元の順序を維持
      default:
        break;
    }

    // ピン留めカードを常に先頭に配置
    result.sort((a, b) => {
      const aPinned = a.assignment?.isPinned ? 1 : 0;
      const bPinned = b.assignment?.isPinned ? 1 : 0;
      return bPinned - aPinned;
    });

    return result;
  }, [cards, sortBy, searchQuery, systemTypes, assignees, labels, isPinnedOnly]);

  // リストごとにカードをグループ化
  const cardsByList = useMemo(() => {
    const grouped = new Map<string, ExtendedCard[]>();

    lists.forEach((list) => {
      grouped.set(list.id, []);
    });

    filteredCards.forEach((card) => {
      const listCards = grouped.get(card.idList);
      if (listCards) {
        listCards.push(card);
      }
    });

    return grouped;
  }, [filteredCards, lists]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
      {lists
        .filter((list) => !list.closed)
        .map((list) => {
          const listCards = cardsByList.get(list.id) || [];
          const isLocked = lockedLists.has(list.id);

          return (
            <div
              key={list.id}
              className="industry-column flex-shrink-0"
              style={{
                width: '300px',
                maxHeight: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* リストヘッダー */}
              <div className="column-header">
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: '14px', margin: 0 }}>{list.name}</h2>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--sub-text)',
                      background: 'var(--card-bg)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {listCards.length}
                  </span>
                </div>
                <button
                  onClick={() => toggleListLock(list.id)}
                  className="action-btn"
                  title={isLocked ? 'ロック解除' : 'ロック'}
                  style={{ fontSize: '14px' }}
                >
                  {isLocked ? '🔒' : '🔓'}
                </button>
              </div>

              {/* カードリスト */}
              <div
                className="flex-1 overflow-y-auto pr-1"
                style={{
                  opacity: isLocked ? 0.5 : 1,
                  pointerEvents: isLocked ? 'none' : 'auto',
                }}
              >
                {listCards.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 10px',
                      color: 'var(--sub-text)',
                      fontSize: '13px',
                    }}
                  >
                    カードがありません
                  </div>
                ) : (
                  listCards.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      lists={lists}
                      onOpenAssignment={onOpenAssignment}
                      onOpenMove={onOpenMove}
                      onOpenLogs={onOpenLogs}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
