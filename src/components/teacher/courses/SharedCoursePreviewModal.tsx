import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SharedCourse } from '@/types/course';
import { getSharedCourseStats } from '@/data/mockSharedCourses';
import { cn } from '@/lib/utils';

interface SharedCoursePreviewModalProps {
  course: SharedCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharedCoursePreviewModal({
  course,
  open,
  onOpenChange,
}: SharedCoursePreviewModalProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  if (!course) return null;

  const stats = getSharedCourseStats(course);

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const expandAll = () => {
    const allSubjects = new Set(course.subjects.map((s) => s.id));
    const allChapters = new Set(
      course.subjects.flatMap((s) => s.chapters.map((c) => c.id))
    );
    setExpandedSubjects(allSubjects);
    setExpandedChapters(allChapters);
  };

  const collapseAll = () => {
    setExpandedSubjects(new Set());
    setExpandedChapters(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-xl font-semibold truncate">
                Preview: {course.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {course.className} • Shared by {course.sharedBy}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              📚 {stats.subjectCount} Subjects
            </Badge>
            <Badge variant="secondary" className="text-xs">
              📖 {stats.chapterCount} Chapters
            </Badge>
            <Badge variant="secondary" className="text-xs">
              📝 {stats.topicCount} Topics
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="h-8 text-xs"
            >
              <ChevronsUpDown className="h-3.5 w-3.5 mr-1" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="h-8 text-xs"
            >
              <ChevronsDownUp className="h-3.5 w-3.5 mr-1" />
              Collapse All
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4" style={{ minHeight: '300px', maxHeight: '55vh' }}>
          <div className="space-y-3">
            {course.subjects.map((subject) => (
              <Collapsible
                key={subject.id}
                open={expandedSubjects.has(subject.id)}
                onOpenChange={() => toggleSubject(subject.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      'hover:bg-muted/50',
                      expandedSubjects.has(subject.id)
                        ? 'bg-muted/30 border-primary/30'
                        : 'bg-card border-border'
                    )}
                  >
                    {expandedSubjects.has(subject.id) ? (
                      <ChevronDown className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{subject.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({subject.chapters.length} chapters)
                      </span>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-7 mt-2 space-y-2 border-l-2 border-muted pl-4">
                    {subject.chapters.map((chapter) => (
                      <Collapsible
                        key={chapter.id}
                        open={expandedChapters.has(chapter.id)}
                        onOpenChange={() => toggleChapter(chapter.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              'w-full flex items-center gap-2 p-2 rounded-md transition-colors text-left text-sm',
                              'hover:bg-muted/50',
                              expandedChapters.has(chapter.id)
                                ? 'bg-muted/20'
                                : ''
                            )}
                          >
                            {expandedChapters.has(chapter.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="font-medium text-foreground">{chapter.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({chapter.topics.length} topics)
                            </span>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-5 mt-1 space-y-1 border-l border-muted/50 pl-3">
                            {chapter.topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                <span>{topic.name}</span>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
