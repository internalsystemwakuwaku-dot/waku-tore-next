// Re-export all types
export * from './trello';
export * from './game';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Memo types
export interface Memo {
  id: string;
  type: 'personal' | 'shared' | 'card';
  userId: string;
  content: string;
  cardId: string | null;
  deadline: Date | null;
  relatedUsers: string[];
  isFinished: boolean;
  trelloCommentId: string | null;
  createdAt: Date;
}

// Operation log types
export interface OperationLog {
  id: number;
  userId: string;
  action: string;
  cardId: string | null;
  details: Record<string, unknown>;
  createdAt: Date;
}

// Member settings types
export interface MemberSetting {
  id: number;
  role: 'kochiku' | 'system' | 'shodan' | 'mtg';
  displayName: string;
  userId: string | null;
  sortOrder: number;
}

// Filter types
export interface FilterState {
  sortBy: 'trello' | 'due' | 'updated' | 'name';
  searchQuery: string;
  systemTypes: string[];
  assignees: string[];
  labels: string[];
  lists: string[];
  isPinnedOnly: boolean;
}

// Theme types
export type ThemeName =
  | 'default'
  | 'dark'
  | 'cat'
  | 'dog'
  | 'horse'
  | 'dragon'
  | 'neon'
  | 'gaming'
  | 'retro'
  | 'blueprint'
  | 'japanese';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  primaryColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
}
