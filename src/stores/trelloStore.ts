import { create } from 'zustand';
import { fetchLists, fetchCards, fetchCustomFields, moveCard as apiMoveCard, updateCardDue as apiUpdateCardDue } from '@/lib/api/trelloApi';
import { ExtendedCard, TrelloList, TrelloCustomField, TrelloCard } from '@/types/trello';
import { TRELLO_CONFIG } from '@/lib/game/trelloConfig';

interface TrelloState {
    lists: TrelloList[];
    cards: ExtendedCard[];
    customFields: TrelloCustomField[];
    members: any[]; // モックまたは将来的実装
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    fetchData: () => Promise<void>;
    moveCard: (cardId: string, newListId: string) => Promise<boolean>;
    updateDueDate: (cardId: string, due: string | null) => Promise<boolean>;
}

export const useTrelloStore = create<TrelloState>((set, get) => ({
    lists: [],
    cards: [],
    customFields: [],
    members: [],
    loading: false,
    error: null,
    lastUpdated: null,

    fetchData: async () => {
        set({ loading: true, error: null });
        try {
            // APIコール並列実行
            const [lists, rawCards, customFields] = await Promise.all([
                fetchLists(),
                fetchCards(),
                fetchCustomFields()
            ]);

            // 構築No.フィールドの定義を取得
            const constructionFieldDef = customFields.find(f => f.name === '構築No.');
            const constructionFieldId = constructionFieldDef ? constructionFieldDef.id : null;
            const constructionFieldOptions = constructionFieldDef ? (constructionFieldDef.options || []) : [];

            // カードデータの加工 (GASロジックの移植)
            const processedCards: ExtendedCard[] = rawCards.map((card: TrelloCard) => {
                const attributes: any = { industries: [], prefectures: [] };

                // チェックリストからの属性抽出
                if (card.checklists) {
                    card.checklists.forEach(checklist => {
                        if (checklist.name === '業種') {
                            checklist.checkItems.forEach(item => {
                                if (item.state === 'complete') {
                                    attributes.industries.push(item.name);
                                }
                            });
                        } else if (checklist.name === '都道府県') {
                            checklist.checkItems.forEach(item => {
                                if (item.state === 'complete') {
                                    attributes.prefectures.push(item.name);
                                }
                            });
                        }
                    });
                }

                // Assignmentデータ (Mock: 今後はSpreadsheet等から取得が必要)
                // とりあえず空で初期化
                const roleData = {
                    id: card.id,
                    constructionNumber: '',
                    // ...他のフィールドは必要に応じて追加
                };

                // カスタムフィールド '構築No.' の処理解決
                if (constructionFieldId && card.customFieldItems) {
                    const targetItem = card.customFieldItems.find(item => item.idCustomField === constructionFieldId);

                    if (targetItem) {
                        let trelloVal = "";
                        if (targetItem.idValue) {
                            const selectedOption = constructionFieldOptions.find(opt => opt.id === targetItem.idValue);
                            if (selectedOption && selectedOption.value) {
                                trelloVal = selectedOption.value.text;
                            }
                        } else if (targetItem.value) {
                            if (targetItem.value.number !== undefined) {
                                trelloVal = String(targetItem.value.number);
                            } else if (targetItem.value.text !== undefined) {
                                trelloVal = String(targetItem.value.text);
                            }
                        }

                        if (trelloVal !== "") {
                            roleData.constructionNumber = trelloVal;
                        }
                    }
                }

                // ExtendedCardとしてのデータ構築
                return {
                    ...card,
                    attributes, // 追加の属性を持たせるには型拡張が必要だが、一旦ExtendedCardに準拠
                    // types/trello.ts の ExtendedCard 定義に合わせて調整
                    assignment: roleData as any // 型互換性のため一旦anyキャスト
                };
            });

            set({
                lists,
                cards: processedCards,
                customFields,
                loading: false,
                lastUpdated: new Date()
            });

        } catch (e: any) {
            console.error('Fetch Data Error:', e);
            set({ error: e.message || 'データの取得に失敗しました', loading: false });
        }
    },

    moveCard: async (cardId, newListId) => {
        try {
            await apiMoveCard(cardId, newListId);
            // 成功したらローカルのstateも更新する (楽観的UI更新)
            set((state) => ({
                cards: state.cards.map(c =>
                    c.id === cardId ? { ...c, idList: newListId } : c
                )
            }));
            return true;
        } catch (e) {
            console.error('Move Card Error:', e);
            return false;
        }
    },

    updateDueDate: async (cardId, due) => {
        try {
            await apiUpdateCardDue(cardId, due);
            set((state) => ({
                cards: state.cards.map(c =>
                    c.id === cardId ? { ...c, due: due, dueComplete: false } : c
                )
            }));
            return true;
        } catch (e) {
            console.error('Update Due Error:', e);
            return false;
        }
    }
}));
