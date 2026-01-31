// Trello API Types

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
  idBoard: string;
}

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
  pos: number;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  idValue?: string;
  value?: {
    text?: string;
    number?: string;
    checked?: string;
    date?: string;
  };
}

export interface TrelloCustomField {
  id: string;
  idModel: string;
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'list';
  options?: {
    id: string;
    idCustomField: string;
    value: { text: string };
    pos: number;
  }[];
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  dueComplete: boolean;
  closed: boolean;
  idList: string;
  idBoard: string;
  pos: number;
  dateLastActivity: string;
  labels: TrelloLabel[];
  checklists?: TrelloChecklist[];
  customFieldItems?: TrelloCustomFieldItem[];
  shortUrl: string;
  url: string;
}

export interface TrelloComment {
  id: string;
  data: {
    text: string;
    card: { id: string; name: string };
  };
  date: string;
  memberCreator: {
    id: string;
    fullName: string;
    username: string;
  };
}

export interface TrelloBoardData {
  lists: TrelloList[];
  cards: TrelloCard[];
  customFields: TrelloCustomField[];
}

// Extended card with assignment data
export interface ExtendedCard extends TrelloCard {
  assignment?: CardAssignment;
  memos?: CardMemo[];
  attributes?: {
    industries: string[];
    prefectures: string[];
  };
}

// Local assignment data
export interface CardAssignment {
  id: string;
  kochikuUserId: string | null;
  systemUserId: string | null;
  shodanUserId: string | null;
  mtgUserId: string | null;
  systemType: string | null;
  link: string | null;
  memo1: string | null;
  memo2: string | null;
  memo3: string | null;
  isPinned: boolean | null;
  updatedAt: Date | null;
}

export interface CardMemo {
  id: string;
  userId: string;
  content: string;
  deadline: Date | null;
  isFinished: boolean;
  trelloCommentId: string | null;
  createdAt: Date;
}
