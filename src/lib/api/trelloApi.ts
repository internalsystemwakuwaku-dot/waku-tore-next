import { TRELLO_CONFIG } from '@/lib/game/trelloConfig';
import { TrelloCard, TrelloList, TrelloCustomField } from '@/types/trello';

/**
 * Trello API Fetch Wrapper
 */
async function fetchTrello<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `https://api.trello.com/1${endpoint}`;
    // URLパラメータに認証情報を付与するための処理
    const urlObj = new URL(url);
    urlObj.searchParams.append('key', TRELLO_CONFIG.API_KEY);
    urlObj.searchParams.append('token', TRELLO_CONFIG.API_TOKEN);

    const res = await fetch(urlObj.toString(), options);
    if (!res.ok) {
        throw new Error(`Trello API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

/**
 * Fetch Lists
 */
export async function fetchLists(): Promise<TrelloList[]> {
    return fetchTrello<TrelloList[]>(`/boards/${TRELLO_CONFIG.BOARD_ID}/lists?filter=open`);
}

/**
 * Fetch Custom Fields
 */
export async function fetchCustomFields(): Promise<TrelloCustomField[]> {
    return fetchTrello<TrelloCustomField[]>(`/boards/${TRELLO_CONFIG.BOARD_ID}/customFields`);
}

/**
 * Fetch Cards
 */
export async function fetchCards(): Promise<TrelloCard[]> {
    const fields = 'name,id,shortLink,shortUrl,idList,due,dueComplete,labels,desc';
    // checklists=all & customFieldItems=true を追加
    return fetchTrello<TrelloCard[]>(
        `/boards/${TRELLO_CONFIG.BOARD_ID}/cards?fields=${fields}&checklists=all&customFieldItems=true`
    );
}

/**
 * Move Card
 */
export async function moveCard(cardId: string, newListId: string): Promise<void> {
    await fetchTrello(`/cards/${cardId}?idList=${newListId}`, {
        method: 'PUT'
    });
}

/**
 * Update Due Date
 */
export async function updateCardDue(cardId: string, due: string | null): Promise<void> {
    const dueValue = due ? due : 'null';
    await fetchTrello(`/cards/${cardId}?due=${dueValue}`, {
        method: 'PUT'
    });
}
