'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { moveCard } from '@/lib/trello/actions';
import { toast } from 'sonner';
import type { ExtendedCard, TrelloList } from '@/types/trello';

interface MoveCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ExtendedCard | null;
  lists: TrelloList[];
  onMoved: () => void;
}

export function MoveCardModal({
  isOpen,
  onClose,
  card,
  lists,
  onMoved,
}: MoveCardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleMove = async () => {
    if (!card || !selectedListId) return;

    setIsLoading(true);
    try {
      const targetList = lists.find((l) => l.id === selectedListId);
      await moveCard(card.id, selectedListId, targetList?.name);
      toast.success(`「${targetList?.name}」に移動しました`);
      onMoved();
      onClose();
    } catch (error) {
      toast.error('移動に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  const currentList = lists.find((l) => l.id === card.idList);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>カード移動</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{card.name}</p>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            現在のリスト: <strong>{currentList?.name}</strong>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium">移動先を選択:</p>
            <div className="grid gap-2">
              {lists
                .filter((list) => !list.closed && list.id !== card.idList)
                .map((list) => (
                  <Button
                    key={list.id}
                    variant={selectedListId === list.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedListId(list.id)}
                  >
                    {list.name}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleMove}
            disabled={isLoading || !selectedListId}
          >
            {isLoading ? '移動中...' : '移動'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
