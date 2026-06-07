import React, { useMemo, useState, useEffect } from 'react';
import { Search, FileText, Video, File, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { mockLMSContent } from '@/data/mockLMSContent';
import { LMSContentItem } from '@/types/lmsContent';
import { ProgramLessonPlan } from '@/types/program';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (plans: ProgramLessonPlan[]) => void;
}

function typeIcon(type: string) {
  switch (type) {
    case 'video-url':
      return <Video className="h-3.5 w-3.5" />;
    case 'pdf':
      return <FileText className="h-3.5 w-3.5" />;
    case 'file':
      return <File className="h-3.5 w-3.5" />;
    default:
      return <BookOpen className="h-3.5 w-3.5" />;
  }
}

function itemToLessonPlan(item: LMSContentItem): ProgramLessonPlan {
  return {
    id: `lp-lib-${item.id}-${Date.now()}`,
    title: item.title,
    summary: `${item.subject} · ${item.chapter} · ${item.topic}`,
    contents: [],
    status: 'not-started',
    hoursPlanned: 1,
    hoursSpent: 0,
  };
}

export function AddLessonPlanModal({ open, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelected(new Set());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockLMSContent;
    return mockLMSContent.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.chapter.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const items = mockLMSContent.filter((c) => selected.has(c.id));
    if (items.length === 0) return;
    onAdd(items.map(itemToLessonPlan));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add from Library</DialogTitle>
          <p className="text-xs text-gray-500">
            Pick existing lesson material to attach to this chapter.
          </p>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, subject, chapter, topic..."
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2 min-h-[200px]">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              No content matches your search.
            </div>
          ) : (
            filtered.map((c) => {
              const isOn = selected.has(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isOn ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={isOn}
                    onCheckedChange={() => toggle(c.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0">
                        {typeIcon(c.type)}
                        {c.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {c.subject} · {c.chapter} · {c.topic}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
