'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveCardAssignment, updateCardDue } from '@/lib/trello/actions';
import { toast } from 'sonner';
import type { ExtendedCard } from '@/types/trello';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ExtendedCard | null;
  members: string[];
  systemTypes: string[];
  onSaved: () => void;
}

export function AssignmentModal({
  isOpen,
  onClose,
  card,
  members,
  systemTypes,
  onSaved,
}: AssignmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kochikuUserId: '',
    systemUserId: '',
    shodanUserId: '',
    mtgUserId: '',
    systemType: '',
    link: '',
    memo1: '',
    memo2: '',
    memo3: '',
    due: '',
  });

  // Load card data when modal opens
  useEffect(() => {
    if (card) {
      setFormData({
        kochikuUserId: card.assignment?.kochikuUserId ?? '',
        systemUserId: card.assignment?.systemUserId ?? '',
        shodanUserId: card.assignment?.shodanUserId ?? '',
        mtgUserId: card.assignment?.mtgUserId ?? '',
        systemType: card.assignment?.systemType ?? '',
        link: card.assignment?.link ?? '',
        memo1: card.assignment?.memo1 ?? '',
        memo2: card.assignment?.memo2 ?? '',
        memo3: card.assignment?.memo3 ?? '',
        due: card.due ? formatDateForInput(card.due) : '',
      });
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setIsLoading(true);
    try {
      // Save assignment data
      await saveCardAssignment(card.id, {
        kochikuUserId: formData.kochikuUserId || null,
        systemUserId: formData.systemUserId || null,
        shodanUserId: formData.shodanUserId || null,
        mtgUserId: formData.mtgUserId || null,
        systemType: formData.systemType || null,
        link: formData.link || null,
        memo1: formData.memo1 || null,
        memo2: formData.memo2 || null,
        memo3: formData.memo3 || null,
      });

      // Update due date if changed
      const newDue = formData.due ? new Date(formData.due).toISOString() : null;
      const oldDue = card.due;
      if (newDue !== oldDue) {
        await updateCardDue(card.id, newDue);
      }

      toast.success('担当者情報を保存しました');
      onSaved();
      onClose();
    } catch (error) {
      toast.error('保存に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">担当者設定</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{card.name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignees */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>構築担当</Label>
              <Select
                value={formData.kochikuUserId}
                onValueChange={(v) => setFormData({ ...formData, kochikuUserId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>システム担当</Label>
              <Select
                value={formData.systemUserId}
                onValueChange={(v) => setFormData({ ...formData, systemUserId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>商談担当</Label>
              <Select
                value={formData.shodanUserId}
                onValueChange={(v) => setFormData({ ...formData, shodanUserId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>MTG担当</Label>
              <Select
                value={formData.mtgUserId}
                onValueChange={(v) => setFormData({ ...formData, mtgUserId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* System Type */}
          <div className="space-y-2">
            <Label>システム種別</Label>
            <Select
              value={formData.systemType}
              onValueChange={(v) => setFormData({ ...formData, systemType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">未設定</SelectItem>
                {systemTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>期限</Label>
            <Input
              type="datetime-local"
              value={formData.due}
              onChange={(e) => setFormData({ ...formData, due: e.target.value })}
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label>リンク</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          {/* Memos */}
          <div className="space-y-2">
            <Label>メモ1</Label>
            <Input
              value={formData.memo1}
              onChange={(e) => setFormData({ ...formData, memo1: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>メモ2</Label>
            <Input
              value={formData.memo2}
              onChange={(e) => setFormData({ ...formData, memo2: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>メモ3</Label>
            <Input
              value={formData.memo3}
              onChange={(e) => setFormData({ ...formData, memo3: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
}
