import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState } from '@/types';

interface FilterStore extends FilterState {
  // Actions
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  setSystemTypes: (types: string[]) => void;
  setAssignees: (assignees: string[]) => void;
  setLabels: (labels: string[]) => void;
  setLists: (lists: string[]) => void;
  setIsPinnedOnly: (isPinnedOnly: boolean) => void;
  toggleSystemType: (type: string) => void;
  toggleAssignee: (assignee: string) => void;
  toggleLabel: (label: string) => void;
  toggleList: (list: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  sortBy: 'trello',
  searchQuery: '',
  systemTypes: [],
  assignees: [],
  labels: [],
  lists: [],
  isPinnedOnly: false,
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSortBy: (sortBy) => set({ sortBy }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSystemTypes: (systemTypes) => set({ systemTypes }),
      setAssignees: (assignees) => set({ assignees }),
      setLabels: (labels) => set({ labels }),
      setLists: (lists) => set({ lists }),
      setIsPinnedOnly: (isPinnedOnly) => set({ isPinnedOnly }),

      toggleSystemType: (type) =>
        set((state) => ({
          systemTypes: state.systemTypes.includes(type)
            ? state.systemTypes.filter((t) => t !== type)
            : [...state.systemTypes, type],
        })),

      toggleAssignee: (assignee) =>
        set((state) => ({
          assignees: state.assignees.includes(assignee)
            ? state.assignees.filter((a) => a !== assignee)
            : [...state.assignees, assignee],
        })),

      toggleLabel: (label) =>
        set((state) => ({
          labels: state.labels.includes(label)
            ? state.labels.filter((l) => l !== label)
            : [...state.labels, label],
        })),

      toggleList: (list) =>
        set((state) => ({
          lists: state.lists.includes(list)
            ? state.lists.filter((l) => l !== list)
            : [...state.lists, list],
        })),

      resetFilters: () => set(initialState),
    }),
    {
      name: 'waku-tore-filters',
    }
  )
);
