import { useState, useMemo, useEffect } from 'react';
import { Plus, Sparkles, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditableChapterCard } from './EditableChapterCard';
import { ChapterPickerModal } from './ChapterPickerModal';
import { AvailableSubject, CourseSubjectWithContent, CourseChapter } from '@/types/course';
import { toast } from 'sonner';

interface CustomSubjectBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSubjects: AvailableSubject[];
  onSave: (subject: CourseSubjectWithContent) => void;
  editingSubject?: CourseSubjectWithContent | null; // For edit mode
}

export function CustomSubjectBuilder({
  open,
  onOpenChange,
  availableSubjects,
  onSave,
  editingSubject,
}: CustomSubjectBuilderProps) {
  const [subjectName, setSubjectName] = useState(editingSubject?.name || '');
  const [chapters, setChapters] = useState<CourseChapter[]>(editingSubject?.chapters || []);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Sync state when editingSubject changes (for edit mode)
  useEffect(() => {
    if (open && editingSubject) {
      setSubjectName(editingSubject.name);
      setChapters(editingSubject.chapters);
      // Expand all chapters by default in edit mode
      setExpandedChapters(new Set(editingSubject.chapters.map(ch => ch.id)));
    } else if (open && !editingSubject) {
      // Reset for new subject creation
      setSubjectName('');
      setChapters([]);
      setExpandedChapters(new Set());
    }
  }, [open, editingSubject]);

  // Reset state when closing
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedSourceId('');
    }
    onOpenChange(isOpen);
  };

  const selectedSource = useMemo(
    () => availableSubjects.find((s) => s.id === selectedSourceId),
    [availableSubjects, selectedSourceId]
  );

  // Get already added chapter IDs for the selected source
  const addedChapterIds = useMemo(
    () =>
      chapters
        .filter((ch) => ch.sourceSubjectId === selectedSourceId)
        .map((ch) => ch.id),
    [chapters, selectedSourceId]
  );

  const handleAddChapters = (chapterIds: string[]) => {
    if (!selectedSource) return;

    const newChapters: CourseChapter[] = chapterIds.map((chId) => {
      const sourceChapter = selectedSource.chapters.find((c) => c.id === chId)!;
      return {
        id: `${selectedSource.id}-${sourceChapter.id}-${Date.now()}`, // Unique ID
        name: sourceChapter.name,
        originalName: sourceChapter.name,
        sourceSubjectId: selectedSource.id,
        sourceSubjectName: selectedSource.name,
        isSelected: true,
        topics: sourceChapter.topics.map((t) => ({
          id: `${t.id}-${Date.now()}`,
          name: t.name,
          originalName: t.name,
          sourceSubjectId: selectedSource.id,
          isSelected: true,
        })),
      };
    });

    setChapters((prev) => [...prev, ...newChapters]);
  };

  const handleChapterNameChange = (chapterId: string, newName: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, name: newName } : ch))
    );
  };

  const handleTopicNameChange = (chapterId: string, topicId: string, newName: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              topics: ch.topics.map((t) =>
                t.id === topicId ? { ...t, name: newName } : t
              ),
            }
          : ch
      )
    );
  };

  const handleTopicToggle = (chapterId: string, topicId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              topics: ch.topics.map((t) =>
                t.id === topicId ? { ...t, isSelected: !t.isSelected } : t
              ),
            }
          : ch
      )
    );
  };

  const handleRemoveChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
  };

  const handleSave = () => {
    if (!subjectName.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    if (chapters.length === 0) {
      toast.error('Please add at least one chapter');
      return;
    }

    const hasSelectedTopics = chapters.some((ch) =>
      ch.topics.some((t) => t.isSelected)
    );

    if (!hasSelectedTopics) {
      toast.error('Please select at least one topic');
      return;
    }

    // Get unique source subjects
    const sourceSubjects = new Set(chapters.map((ch) => ch.sourceSubjectName).filter(Boolean));

    const customSubject: CourseSubjectWithContent = {
      id: editingSubject?.id || `custom-${Date.now()}`,
      name: subjectName.trim(),
      institute: 'Custom',
      isOwner: true,
      isCustom: true,
      chapters: chapters.filter((ch) => ch.topics.some((t) => t.isSelected)),
    };

    onSave(customSubject);
    handleOpenChange(false);
  };

  // Calculate summary stats
  const summary = useMemo(() => {
    const sourceSubjects = new Set(chapters.map((ch) => ch.sourceSubjectName).filter(Boolean));
    const totalTopics = chapters.reduce(
      (acc, ch) => acc + ch.topics.filter((t) => t.isSelected).length,
      0
    );
    return {
      chaptersCount: chapters.length,
      topicsCount: totalTopics,
      sourcesCount: sourceSubjects.size,
      sources: Array.from(sourceSubjects),
    };
  }, [chapters]);

  const handleExpandAll = () => {
    setExpandedChapters(new Set(chapters.map(ch => ch.id)));
  };

  const handleCollapseAll = () => {
    setExpandedChapters(new Set());
  };

  const toggleChapterExpanded = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingSubject ? 'Edit Custom Subject' : 'Create Custom Subject'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-3 px-6">
            {/* Subject Name - Compact */}
            <div className="space-y-1.5">
              <Label htmlFor="subject-name" className="text-sm">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-name"
                placeholder="e.g., Science, General Studies"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Add Content Section - Compact */}
            <div className="space-y-1.5">
              <Label className="text-sm">Add Content from Source Subjects</Label>
              <div className="flex gap-2">
                <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder="Select source subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.chapters.length} chapters)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowChapterPicker(true)}
                  disabled={!selectedSourceId}
                  className="gap-2 h-9"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Chapters
                </Button>
              </div>
            </div>

            {/* Added Chapters - Larger scrollable area */}
            <div className="flex-1 min-h-0 flex flex-col border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <Label className="text-sm font-medium">Added Chapters ({chapters.length})</Label>
                {chapters.length > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandAll}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <ChevronsUpDown className="h-3 w-3" />
                      Expand All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapseAll}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <ChevronsDownUp className="h-3 w-3" />
                      Collapse All
                    </Button>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 h-[280px]">
                <div className="p-3 space-y-2">
                  {chapters.map((chapter) => (
                    <EditableChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      isExpanded={expandedChapters.has(chapter.id)}
                      onToggleExpand={() => toggleChapterExpanded(chapter.id)}
                      onNameChange={(name) => handleChapterNameChange(chapter.id, name)}
                      onTopicNameChange={(topicId, name) =>
                        handleTopicNameChange(chapter.id, topicId, name)
                      }
                      onTopicToggle={(topicId) => handleTopicToggle(chapter.id, topicId)}
                      onRemove={() => handleRemoveChapter(chapter.id)}
                    />
                  ))}

                  {chapters.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                      <p className="text-muted-foreground text-sm">
                        No chapters added yet. Select a source subject and add chapters.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

          </div>
          
          {/* Summary - Fixed at bottom */}
          {chapters.length > 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 px-6 py-2 border-t">
              Summary: {summary.chaptersCount} chapter{summary.chaptersCount !== 1 ? 's' : ''},{' '}
              {summary.topicsCount} topic{summary.topicsCount !== 1 ? 's' : ''} from{' '}
              {summary.sourcesCount} source{summary.sourcesCount !== 1 ? 's' : ''}
              {summary.sources.length > 0 && (
                <span className="ml-1">({summary.sources.join(', ')})</span>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChapterPickerModal
        open={showChapterPicker}
        onOpenChange={setShowChapterPicker}
        sourceSubject={selectedSource || null}
        onAddChapters={handleAddChapters}
        excludeChapterIds={addedChapterIds}
      />
    </>
  );
}
