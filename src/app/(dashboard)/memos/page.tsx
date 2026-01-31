'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LocalMemo {
  id: string;
  content: string;
  type: 'personal' | 'shared';
  isFinished: boolean;
  deadline: string | null;
  createdAt: string;
}

export default function MemosPage() {
  // In production, this would be fetched from the database
  const [memos, setMemos] = useState<LocalMemo[]>([]);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [newMemoDeadline, setNewMemoDeadline] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');

  const addMemo = () => {
    if (!newMemoContent.trim()) {
      toast.error('メモ内容を入力してください');
      return;
    }

    const newMemo: LocalMemo = {
      id: Date.now().toString(),
      content: newMemoContent,
      type: activeTab,
      isFinished: false,
      deadline: newMemoDeadline || null,
      createdAt: new Date().toISOString(),
    };

    setMemos([newMemo, ...memos]);
    setNewMemoContent('');
    setNewMemoDeadline('');
    toast.success('メモを追加しました');
  };

  const toggleMemo = (id: string) => {
    setMemos(
      memos.map((memo) =>
        memo.id === id ? { ...memo, isFinished: !memo.isFinished } : memo
      )
    );
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter((memo) => memo.id !== id));
    toast.success('メモを削除しました');
  };

  const filteredMemos = memos.filter((memo) => memo.type === activeTab);
  const activeMemos = filteredMemos.filter((memo) => !memo.isFinished);
  const completedMemos = filteredMemos.filter((memo) => memo.isFinished);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">📝 メモ帳</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'personal' | 'shared')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">🔒 個人メモ</TabsTrigger>
          <TabsTrigger value="shared">🌐 共有メモ</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {/* Add New Memo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">新しいメモを追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="メモ内容を入力..."
                value={newMemoContent}
                onChange={(e) => setNewMemoContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addMemo();
                  }
                }}
              />
              <div className="flex gap-2 items-center">
                <Input
                  type="datetime-local"
                  value={newMemoDeadline}
                  onChange={(e) => setNewMemoDeadline(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addMemo}>追加</Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Memos */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              未完了 ({activeMemos.length})
            </h3>
            {activeMemos.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  メモがありません
                </CardContent>
              </Card>
            ) : (
              activeMemos.map((memo) => (
                <MemoItem
                  key={memo.id}
                  memo={memo}
                  onToggle={() => toggleMemo(memo.id)}
                  onDelete={() => deleteMemo(memo.id)}
                />
              ))
            )}
          </div>

          {/* Completed Memos */}
          {completedMemos.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                完了済み ({completedMemos.length})
              </h3>
              {completedMemos.map((memo) => (
                <MemoItem
                  key={memo.id}
                  memo={memo}
                  onToggle={() => toggleMemo(memo.id)}
                  onDelete={() => deleteMemo(memo.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MemoItem({
  memo,
  onToggle,
  onDelete,
}: {
  memo: LocalMemo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isOverdue = memo.deadline && new Date(memo.deadline) < new Date() && !memo.isFinished;

  return (
    <Card className={memo.isFinished ? 'opacity-60' : ''}>
      <CardContent className="py-3 flex items-start gap-3">
        <Checkbox
          checked={memo.isFinished}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${memo.isFinished ? 'line-through text-muted-foreground' : ''}`}>
            {memo.content}
          </p>
          {memo.deadline && (
            <Badge
              variant={isOverdue ? 'destructive' : 'secondary'}
              className="mt-1 text-xs"
            >
              📅 {new Date(memo.deadline).toLocaleString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {isOverdue && ' (期限切れ)'}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          🗑️
        </Button>
      </CardContent>
    </Card>
  );
}
