import { useState, useMemo } from 'react';
import { Plus, ChevronDown, Sparkles } from 'lucide-react';
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

  // Reset state when opening/closing
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset on close
      setSubjectName(editingSubject?.name || '');
      setChapters(editingSubject?.chapters || []);
      setSelectedSourceId('');
    } else if (editingSubject) {
      // Populate on edit
      setSubjectName(editingSubject.name);
      setChapters(editingSubject.chapters);
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingSubject ? 'Edit Custom Subject' : 'Create Custom Subject'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="subject-name">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-name"
                placeholder="e.g., Science, General Studies"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>

            {/* Add Content Section */}
            <div className="space-y-2">
              <Label>Add Content from Source Subjects</Label>
              <div className="flex gap-2">
                <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
                  <SelectTrigger className="flex-1">
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
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Chapters
                </Button>
              </div>
            </div>

            {/* Added Chapters */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Label>Added Chapters ({chapters.length})</Label>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <EditableChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      onNameChange={(name) => handleChapterNameChange(chapter.id, name)}
                      onTopicNameChange={(topicId, name) =>
                        handleTopicNameChange(chapter.id, topicId, name)
                      }
                      onTopicToggle={(topicId) => handleTopicToggle(chapter.id, topicId)}
                      onRemove={() => handleRemoveChapter(chapter.id)}
                    />
                  ))}

                  {chapters.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">
                        No chapters added yet. Select a source subject and add chapters.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Summary */}
            {chapters.length > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                Summary: {summary.chaptersCount} chapter{summary.chaptersCount !== 1 ? 's' : ''},{' '}
                {summary.topicsCount} topic{summary.topicsCount !== 1 ? 's' : ''} from{' '}
                {summary.sourcesCount} source{summary.sourcesCount !== 1 ? 's' : ''}
                {summary.sources.length > 0 && (
                  <span className="ml-1">({summary.sources.join(', ')})</span>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
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
