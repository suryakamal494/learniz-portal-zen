import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileQuestion } from 'lucide-react';
import type { ChapterTest } from '@/types/program';

interface Props {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  existingIds: Set<string>;
  onAdd: (tests: ChapterTest[]) => void;
}

// Mock teacher library — small static pool
const LIBRARY: Omit<ChapterTest, 'chapterId' | 'sharedAt' | 'enabledForStudents' | 'source'>[] = [
  { id: 'lib-1', title: 'My Practice Set — Core Concepts', questionCount: 10, durationMinutes: 10, totalMarks: 10 },
  { id: 'lib-2', title: 'Formula Recall Drill', questionCount: 8, durationMinutes: 8, totalMarks: 8 },
  { id: 'lib-3', title: 'Numerical Problem Set', questionCount: 12, durationMinutes: 18, totalMarks: 24 },
  { id: 'lib-4', title: 'Previous Year Questions Pack', questionCount: 15, durationMinutes: 20, totalMarks: 30 },
  { id: 'lib-5', title: 'Quick Revision Quiz', questionCount: 6, durationMinutes: 6, totalMarks: 6 },
];

export function AddTestFromLibraryModal({ open, onClose, chapterId, existingIds, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY.filter((l) => !q || l.title.toLowerCase().includes(q));
  }, [query]);

  const handleConfirm = () => {
    const tests: ChapterTest[] = LIBRARY.filter((l) => picked.has(l.id)).map((l) => ({
      ...l,
      id: `${chapterId}-lib-${l.id}-${Date.now()}`,
      chapterId,
      source: 'library',
      enabledForStudents: true,
      sharedAt: new Date().toISOString(),
    }));
    onAdd(tests);
    setPicked(new Set());
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add tests from your library</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tests…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No tests match your search.</p>
            )}
            {filtered.map((l) => {
              const checked = picked.has(l.id);
              return (
                <li
                  key={l.id}
                  className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setPicked((prev) => {
                      const n = new Set(prev);
                      n.has(l.id) ? n.delete(l.id) : n.add(l.id);
                      return n;
                    });
                  }}
                >
                  <Checkbox checked={checked} onCheckedChange={() => {}} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{l.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <FileQuestion className="h-3 w-3" /> {l.questionCount} Q
                      </span>
                      <span>· {l.durationMinutes}m</span>
                      <span>· {l.totalMarks} marks</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={picked.size === 0}
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add {picked.size > 0 ? `(${picked.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
