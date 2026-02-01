import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AvailableSubject } from '@/types/course';

interface ChapterPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceSubject: AvailableSubject | null;
  onAddChapters: (chapterIds: string[]) => void;
  excludeChapterIds?: string[]; // Chapters already added
}

export function ChapterPickerModal({
  open,
  onOpenChange,
  sourceSubject,
  onAddChapters,
  excludeChapterIds = [],
}: ChapterPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());

  // Filter chapters based on search and exclusion
  const availableChapters = useMemo(() => {
    if (!sourceSubject) return [];
    return sourceSubject.chapters.filter(
      (ch) =>
        !excludeChapterIds.includes(ch.id) &&
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sourceSubject, searchQuery, excludeChapterIds]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedChapterIds.size === availableChapters.length) {
      setSelectedChapterIds(new Set());
    } else {
      setSelectedChapterIds(new Set(availableChapters.map((ch) => ch.id)));
    }
  };

  const handleAdd = () => {
    onAddChapters(Array.from(selectedChapterIds));
    setSelectedChapterIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedChapterIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  if (!sourceSubject) return null;

  const allSelected = availableChapters.length > 0 && selectedChapterIds.size === availableChapters.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Chapters from {sourceSubject.name}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Select All */}
        {availableChapters.length > 0 && (
          <div className="flex items-center gap-2 py-2 border-b">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({availableChapters.length})
            </label>
          </div>
        )}

        {/* Chapter List */}
        <ScrollArea className="h-64">
          <div className="space-y-1 pr-4">
            {availableChapters.map((chapter) => {
              const isSelected = selectedChapterIds.has(chapter.id);
              return (
                <label
                  key={chapter.id}
                  htmlFor={`chapter-${chapter.id}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    id={`chapter-${chapter.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleChapter(chapter.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{chapter.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({chapter.topics.length} topics)
                    </span>
                  </div>
                </label>
              );
            })}

            {availableChapters.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No chapters match your search' : 'All chapters have been added'}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedChapterIds.size === 0}>
            Add {selectedChapterIds.size} Chapter{selectedChapterIds.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
