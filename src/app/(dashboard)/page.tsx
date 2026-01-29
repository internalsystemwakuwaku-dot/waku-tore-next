'use client';

import { useState, useMemo } from 'react';
import { useCardsWithAssignments, useTrelloData } from '@/hooks/useTrelloData';
import { CardList } from '@/components/dashboard/CardList';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { AssignmentModal } from '@/components/modals/AssignmentModal';
import { MoveCardModal } from '@/components/modals/MoveCardModal';
import { CardLogModal } from '@/components/modals/CardLogModal';
import type { ExtendedCard } from '@/types/trello';

// Temporary members and system types - these would come from DB in production
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

const SYSTEM_TYPES = [
  '予約システム',
  'EC',
  'HP',
  'その他',
];

export default function DashboardPage() {
  const { cards, isLoading: cardsLoading, refresh } = useCardsWithAssignments();
  const { lists, customFields, isLoading: listsLoading } = useTrelloData();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'assignment' | 'move' | 'logs' | null>(null);

  const isLoading = cardsLoading || listsLoading;

  // Get selected card
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return cards.find((c) => c.id === selectedCardId) || null;
  }, [cards, selectedCardId]);

  // Get unique labels from all cards
  const allLabels = useMemo(() => {
    const labelMap = new Map();
    cards.forEach((card) => {
      card.labels.forEach((label) => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label);
        }
      });
    });
    return Array.from(labelMap.values());
  }, [cards]);

  // Modal handlers
  const openAssignmentModal = (cardId: string) => {
    setSelectedCardId(cardId);
    setModalType('assignment');
  };

  const openMoveModal = (cardId: string) => {
    setSelectedCardId(cardId);
    setModalType('move');
  };

  const openLogsModal = (cardId: string) => {
    setSelectedCardId(cardId);
    setModalType('logs');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCardId(null);
  };

  const handleSaved = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        lists={lists}
        labels={allLabels}
        members={MEMBERS}
        systemTypes={SYSTEM_TYPES}
      />

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>全カード: {cards.length}</span>
        <span>リスト: {lists.filter((l) => !l.closed).length}</span>
      </div>

      {/* Card List */}
      <CardList
        cards={cards}
        lists={lists}
        onOpenAssignment={openAssignmentModal}
        onOpenMove={openMoveModal}
        onOpenLogs={openLogsModal}
      />

      {/* Modals */}
      <AssignmentModal
        isOpen={modalType === 'assignment'}
        onClose={closeModal}
        card={selectedCard}
        members={MEMBERS}
        systemTypes={SYSTEM_TYPES}
        onSaved={handleSaved}
      />

      <MoveCardModal
        isOpen={modalType === 'move'}
        onClose={closeModal}
        card={selectedCard}
        lists={lists}
        onMoved={handleSaved}
      />

      <CardLogModal
        isOpen={modalType === 'logs'}
        onClose={closeModal}
        card={selectedCard}
      />
    </div>
  );
}
