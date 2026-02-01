import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChapterTopicTree } from './ChapterTopicTree';
import { AvailableSubject, CourseSubjectWithContent, CourseChapter, CourseTopic } from '@/types/course';
import { cn } from '@/lib/utils';

interface SubjectChapterSelectorProps {
  availableSubjects: AvailableSubject[];
  selectedSubjects: CourseSubjectWithContent[];
  onSelectionChange: (subjects: CourseSubjectWithContent[]) => void;
}

export function SubjectChapterSelector({
  availableSubjects,
  selectedSubjects,
  onSelectionChange,
}: SubjectChapterSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isSubjectSelected = (subjectId: string) => {
    return selectedSubjects.some((s) => s.id === subjectId);
  };

  const handleSubjectToggle = (subject: AvailableSubject) => {
    if (isSubjectSelected(subject.id)) {
      // Remove subject
      onSelectionChange(selectedSubjects.filter((s) => s.id !== subject.id));
    } else {
      // Add subject with all chapters and topics (all unselected initially)
      const newSubject: CourseSubjectWithContent = {
        id: subject.id,
        name: subject.name,
        institute: subject.institute,
        isOwner: subject.isOwner,
        chapters: subject.chapters.map((ch) => ({
          id: ch.id,
          name: ch.name,
          isSelected: false,
          topics: ch.topics.map((t) => ({
            id: t.id,
            name: t.name,
            isSelected: false,
          })),
        })),
      };
      onSelectionChange([...selectedSubjects, newSubject]);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    onSelectionChange(selectedSubjects.filter((s) => s.id !== subjectId));
  };

  const handleChapterToggle = (subjectId: string, chapterId: string) => {
    onSelectionChange(
      selectedSubjects.map((subject) => {
        if (subject.id !== subjectId) return subject;

        return {
          ...subject,
          chapters: subject.chapters.map((chapter) => {
            if (chapter.id !== chapterId) return chapter;

            // If all selected, deselect all. Otherwise, select all.
            const allSelected = chapter.topics.every((t) => t.isSelected);
            return {
              ...chapter,
              isSelected: !allSelected,
              topics: chapter.topics.map((t) => ({
                ...t,
                isSelected: !allSelected,
              })),
            };
          }),
        };
      })
    );
  };

  const handleTopicToggle = (subjectId: string, chapterId: string, topicId: string) => {
    onSelectionChange(
      selectedSubjects.map((subject) => {
        if (subject.id !== subjectId) return subject;

        return {
          ...subject,
          chapters: subject.chapters.map((chapter) => {
            if (chapter.id !== chapterId) return chapter;

            const updatedTopics = chapter.topics.map((topic) =>
              topic.id === topicId ? { ...topic, isSelected: !topic.isSelected } : topic
            );

            return {
              ...chapter,
              isSelected: updatedTopics.some((t) => t.isSelected),
              topics: updatedTopics,
            };
          }),
        };
      })
    );
  };

  const handleSelectAllTopics = (subjectId: string, chapterId: string) => {
    onSelectionChange(
      selectedSubjects.map((subject) => {
        if (subject.id !== subjectId) return subject;

        return {
          ...subject,
          chapters: subject.chapters.map((chapter) => {
            if (chapter.id !== chapterId) return chapter;

            const allSelected = chapter.topics.every((t) => t.isSelected);
            return {
              ...chapter,
              isSelected: !allSelected,
              topics: chapter.topics.map((t) => ({
                ...t,
                isSelected: !allSelected,
              })),
            };
          }),
        };
      })
    );
  };

  const handleSelectAll = () => {
    // Add all subjects with all content selected
    const allSubjects: CourseSubjectWithContent[] = availableSubjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      institute: subject.institute,
      isOwner: subject.isOwner,
      chapters: subject.chapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        isSelected: true,
        topics: ch.topics.map((t) => ({
          id: t.id,
          name: t.name,
          isSelected: true,
        })),
      })),
    }));
    onSelectionChange(allSubjects);
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const getSubjectStats = (subject: CourseSubjectWithContent) => {
    let selectedChapters = 0;
    let totalChapters = subject.chapters.length;
    let selectedTopics = 0;
    let totalTopics = 0;

    subject.chapters.forEach((ch) => {
      if (ch.topics.some((t) => t.isSelected)) selectedChapters++;
      ch.topics.forEach((t) => {
        totalTopics++;
        if (t.isSelected) selectedTopics++;
      });
    });

    return { selectedChapters, totalChapters, selectedTopics, totalTopics };
  };

  const subjectColors = [
    'bg-blue-600 border-l-blue-400',
    'bg-green-600 border-l-green-400',
    'bg-purple-600 border-l-purple-400',
    'bg-orange-600 border-l-orange-400',
    'bg-pink-600 border-l-pink-400',
    'bg-cyan-600 border-l-cyan-400',
    'bg-yellow-600 border-l-yellow-400',
  ];

  return (
    <div className="space-y-4">
      {/* Subject selection controls */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Select Subjects
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {availableSubjects.map((subject) => (
              <DropdownMenuCheckboxItem
                key={subject.id}
                checked={isSubjectSelected(subject.id)}
                onCheckedChange={() => handleSubjectToggle(subject)}
              >
                <span className="flex-1">{subject.name}</span>
                <span className="text-xs text-muted-foreground">
                  {subject.chapters.length} chapters
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={handleSelectAll}>
          Select All
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
          Deselect All
        </Button>

        {selectedSubjects.length > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">
            {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Selected subjects with chapters and topics */}
      <div className="space-y-4">
        {selectedSubjects.map((subject, index) => {
          const stats = getSubjectStats(subject);
          const colorClass = subjectColors[index % subjectColors.length];

          return (
            <Card key={subject.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'text-white rounded-md border-l-4 px-2.5 py-1 font-medium text-xs',
                        colorClass
                      )}
                    >
                      {subject.name} - {subject.institute}
                      {subject.isOwner && ' (Owner)'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {stats.selectedChapters}/{stats.totalChapters} chapters •{' '}
                      {stats.selectedTopics}/{stats.totalTopics} topics
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveSubject(subject.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ChapterTopicTree
                  chapters={subject.chapters}
                  onChapterToggle={(chapterId) => handleChapterToggle(subject.id, chapterId)}
                  onTopicToggle={(chapterId, topicId) =>
                    handleTopicToggle(subject.id, chapterId, topicId)
                  }
                  onSelectAllTopics={(chapterId) => handleSelectAllTopics(subject.id, chapterId)}
                />
              </CardContent>
            </Card>
          );
        })}

        {selectedSubjects.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No subjects selected. Use the dropdown above to add subjects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
