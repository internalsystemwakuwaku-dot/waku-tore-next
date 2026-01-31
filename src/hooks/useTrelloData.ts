'use client';

import useSWR from 'swr';
import { getTrelloData, getCardsWithAssignments } from '@/lib/trello/actions';
import type { TrelloBoardData, ExtendedCard } from '@/types/trello';

// Fetcher for SWR
const fetchTrelloData = async (): Promise<TrelloBoardData> => {
  return getTrelloData();
};

const fetchCardsWithAssignments = async (): Promise<ExtendedCard[]> => {
  return getCardsWithAssignments();
};

export function useTrelloData() {
  const { data, error, isLoading, mutate } = useSWR<TrelloBoardData>(
    'trello-data',
    fetchTrelloData,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
    }
  );

  return {
    lists: data?.lists ?? [],
    cards: data?.cards ?? [],
    customFields: data?.customFields ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useCardsWithAssignments() {
  const { data, error, isLoading, mutate } = useSWR<ExtendedCard[]>(
    'cards-with-assignments',
    fetchCardsWithAssignments,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 3,
    }
  );

  return {
    cards: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for single card data
export function useCard(cardId: string | null) {
  const { cards, isLoading, error } = useCardsWithAssignments();

  const card = cardId ? cards.find((c) => c.id === cardId) : null;

  return {
    card,
    isLoading,
    error,
  };
}
