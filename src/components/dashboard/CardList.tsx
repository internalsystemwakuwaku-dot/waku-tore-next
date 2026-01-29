'use client';

import { useMemo } from 'react';
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

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.desc?.toLowerCase().includes(query)
      );
    }

    // Filter by system type
    if (systemTypes.length > 0) {
      result = result.filter((card) =>
        systemTypes.includes(card.assignment?.systemType ?? '')
      );
    }

    // Filter by assignee
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

    // Filter by labels
    if (labels.length > 0) {
      result = result.filter((card) =>
        card.labels.some((label) => labels.includes(label.id))
      );
    }

    // Filter pinned only
    if (isPinnedOnly) {
      result = result.filter((card) => card.assignment?.isPinned);
    }

    // Sort
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
      // 'trello' - keep original order (by pos within list)
      default:
        break;
    }

    // Always put pinned cards first
    result.sort((a, b) => {
      const aPinned = a.assignment?.isPinned ? 1 : 0;
      const bPinned = b.assignment?.isPinned ? 1 : 0;
      return bPinned - aPinned;
    });

    return result;
  }, [cards, sortBy, searchQuery, systemTypes, assignees, labels, isPinnedOnly]);

  // Group cards by list
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {lists
        .filter((list) => !list.closed)
        .map((list) => {
          const listCards = cardsByList.get(list.id) || [];

          return (
            <div
              key={list.id}
              className="flex-shrink-0 w-72 bg-secondary/50 rounded-lg p-3"
            >
              {/* List Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">{list.name}</h2>
                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                  {listCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {listCards.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
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
