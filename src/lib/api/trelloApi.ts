import { TRELLO_CONFIG } from '@/lib/game/trelloConfig';
import { TrelloCard, TrelloList, TrelloCustomField } from '@/types/trello';

/**
 * Trello API Fetch Wrapper
 */
async function fetchTrello<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `https://api.trello.com/1${endpoint}`;
    // URLパラメータに認証情報を付与するための処理
    const urlObj = new URL(url);
    urlObj.searchParams.append('key', TRELLO_CONFIG.API_KEY || 'dummy_key');
    urlObj.searchParams.append('token', TRELLO_CONFIG.API_TOKEN || 'dummy_token');

    try {
        if (!TRELLO_CONFIG.API_KEY || TRELLO_CONFIG.API_KEY === 'your-api-key' || endpoint.includes('dummy')) {
            throw new Error('Demo Mode: Skip API');
        }

        const res = await fetch(urlObj.toString(), options);
        if (!res.ok) {
            throw new Error(`Trello API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (e) {
        console.warn('Falling back to mock data due to error:', e);
        // --- Mock Data Switch ---
        if (endpoint.includes('/lists?')) {
            return [
                { id: 'list-1', name: '未着手 (ToDo)', closed: false },
                { id: 'list-2', name: '進行中 (Doing)', closed: false },
                { id: 'list-3', name: '確認待ち (Review)', closed: false },
                { id: 'list-4', name: '完了 (Done)', closed: false },
            ] as unknown as T;
        }
        if (endpoint.includes('/customFields')) {
            return [
                {
                    id: 'cf-1',
                    name: '構築No.',
                    type: 'list',
                    options: [
                        { id: 'opt-1', value: { text: "101" } },
                        { id: 'opt-2', value: { text: "102" } }
                    ]
                }
            ] as unknown as T;
        }
        if (endpoint.includes('/cards?')) {
            // Mock Cards
            const mockCards: TrelloCard[] = [
                {
                    id: 'card-1',
                    name: '【デモ】ログイン機能の修正',
                    desc: 'ログインできないバグを修正する',
                    idList: 'list-2',
                    due: new Date(Date.now() + 86400000).toISOString(),
                    dueComplete: false,
                    labels: [{ id: 'l1', name: 'Bug', color: 'red' }],
                    checklists: [],
                    customFieldItems: []
                },
                {
                    id: 'card-2',
                    name: '【デモ】デザイン案の作成',
                    desc: '新しいLPのデザイン',
                    idList: 'list-1',
                    due: null,
                    dueComplete: false,
                    labels: [{ id: 'l2', name: 'Design', color: 'blue' }],
                    checklists: [],
                    customFieldItems: []
                },
                {
                    id: 'card-3',
                    name: '【デモ】サーバー構築',
                    desc: 'AWS環境の整備',
                    idList: 'list-4',
                    due: new Date(Date.now() - 86400000).toISOString(),
                    dueComplete: true,
                    labels: [],
                    checklists: [],
                    customFieldItems: []
                }
            ];
            return mockCards as unknown as T;
        }
        // Move/Update mock
        if (endpoint.includes('/cards/')) {
            return {} as unknown as T;
        }

        throw e;
    }
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
