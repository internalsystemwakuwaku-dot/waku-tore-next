'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filterStore';
import type { TrelloList, TrelloLabel } from '@/types/trello';

interface FilterBarProps {
  lists: TrelloList[];
  labels: TrelloLabel[];
  members: string[];
  systemTypes: string[];
}

export function FilterBar({ lists, labels, members, systemTypes }: FilterBarProps) {
  const {
    sortBy,
    searchQuery,
    systemTypes: selectedSystemTypes,
    assignees,
    labels: selectedLabels,
    setSortBy,
    setSearchQuery,
    toggleSystemType,
    toggleAssignee,
    toggleLabel,
    resetFilters,
  } = useFilterStore();

  const hasActiveFilters =
    searchQuery ||
    selectedSystemTypes.length > 0 ||
    assignees.length > 0 ||
    selectedLabels.length > 0;

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Search and Sort Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="店舗名・カード名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trello">Trello順</SelectItem>
            <SelectItem value="due">期限順</SelectItem>
            <SelectItem value="updated">更新順</SelectItem>
            <SelectItem value="name">名前順</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            フィルタをクリア
          </Button>
        )}
      </div>

      {/* Filter Chips Row */}
      <div className="flex flex-wrap gap-2">
        {/* System Types */}
        {systemTypes.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">システム:</span>
            {systemTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedSystemTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleSystemType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Assignees */}
        {members.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">担当:</span>
            {members.map((member) => (
              <Badge
                key={member}
                variant={assignees.includes(member) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleAssignee(member)}
              >
                {member}
              </Badge>
            ))}
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">ラベル:</span>
            {labels.slice(0, 8).map((label) => (
              <Badge
                key={label.id}
                variant={selectedLabels.includes(label.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                style={{
                  backgroundColor: selectedLabels.includes(label.id)
                    ? getLabelColor(label.color)
                    : undefined,
                  borderColor: getLabelColor(label.color),
                  color: selectedLabels.includes(label.id) ? 'white' : getLabelColor(label.color),
                }}
                onClick={() => toggleLabel(label.id)}
              >
                {label.name || label.color}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getLabelColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: '#61bd4f',
    yellow: '#f2d600',
    orange: '#ff9f1a',
    red: '#eb5a46',
    purple: '#c377e0',
    blue: '#0079bf',
    sky: '#00c2e0',
    lime: '#51e898',
    pink: '#ff78cb',
    black: '#344563',
  };
  return colorMap[color] || '#888888';
}
