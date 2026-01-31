import type {
  TrelloList,
  TrelloCard,
  TrelloCustomField,
  TrelloBoardData,
  TrelloComment,
} from '@/types/trello';

const TRELLO_API_BASE = 'https://api.trello.com/1';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

class TrelloClient {
  private apiKey: string;
  private apiToken: string;

  constructor() {
    this.apiKey = process.env.TRELLO_API_KEY!;
    this.apiToken = process.env.TRELLO_API_TOKEN!;

    if (!this.apiKey || !this.apiToken) {
      console.warn('Trello API credentials not configured');
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { retries = 5, retryDelay = 2000, ...fetchOptions } = options;

    const url = new URL(`${TRELLO_API_BASE}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('token', this.apiToken);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
          if (attempt < retries) {
            const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw new Error('Rate limit exceeded after retries');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Trello API Error: ${response.status} - ${errorText}`);
        }

        return response.json();
      } catch (error) {
        if (attempt === retries) throw error;

        // Retry on network errors
        const delay = retryDelay * Math.pow(2, attempt);
        console.log(`Request failed. Retrying in ${delay}ms...`, error);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw new Error('Request failed after all retries');
  }

  // ========================================
  // Board Operations
  // ========================================

  async getBoardData(boardId: string): Promise<TrelloBoardData> {
    const [lists, cards, customFields] = await Promise.all([
      this.getLists(boardId),
      this.getCards(boardId),
      this.getCustomFields(boardId),
    ]);

    return { lists, cards, customFields };
  }

  async getLists(boardId: string): Promise<TrelloList[]> {
    return this.fetch<TrelloList[]>(`/boards/${boardId}/lists`);
  }

  async getCards(boardId: string): Promise<TrelloCard[]> {
    return this.fetch<TrelloCard[]>(
      `/boards/${boardId}/cards?checklists=all&customFieldItems=true&fields=all`
    );
  }

  async getCustomFields(boardId: string): Promise<TrelloCustomField[]> {
    return this.fetch<TrelloCustomField[]>(`/boards/${boardId}/customFields`);
  }

  // ========================================
  // Card Operations
  // ========================================

  async getCard(cardId: string): Promise<TrelloCard> {
    return this.fetch<TrelloCard>(
      `/cards/${cardId}?checklists=all&customFieldItems=true`
    );
  }

  async moveCard(cardId: string, listId: string): Promise<TrelloCard> {
    return this.fetch<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ idList: listId }),
    });
  }

  async updateCardDue(cardId: string, due: string | null): Promise<TrelloCard> {
    return this.fetch<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ due }),
    });
  }

  async updateCardDescription(cardId: string, desc: string): Promise<TrelloCard> {
    return this.fetch<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ desc }),
    });
  }

  async updateCustomField(
    cardId: string,
    customFieldId: string,
    value: { idValue?: string; value?: Record<string, string> }
  ): Promise<void> {
    await this.fetch(`/cards/${cardId}/customField/${customFieldId}/item`, {
      method: 'PUT',
      body: JSON.stringify(value),
    });
  }

  // ========================================
  // Comment Operations
  // ========================================

  async getCardComments(cardId: string): Promise<TrelloComment[]> {
    return this.fetch<TrelloComment[]>(
      `/cards/${cardId}/actions?filter=commentCard`
    );
  }

  async addComment(cardId: string, text: string): Promise<TrelloComment> {
    return this.fetch<TrelloComment>(`/cards/${cardId}/actions/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.fetch(`/actions/${commentId}`, {
      method: 'DELETE',
    });
  }

  async updateComment(commentId: string, text: string): Promise<TrelloComment> {
    return this.fetch<TrelloComment>(`/actions/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
  }
}

// Singleton instance
export const trello = new TrelloClient();
