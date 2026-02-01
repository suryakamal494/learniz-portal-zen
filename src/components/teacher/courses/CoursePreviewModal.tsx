import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, BookOpen, Layers, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Course, CourseSubjectWithContent } from '@/types/course';
import { cn } from '@/lib/utils';

interface CoursePreviewModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoursePreviewModal({ course, open, onOpenChange }: CoursePreviewModalProps) {
  const navigate = useNavigate();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  if (!course) return null;

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSubjects(new Set(course.subjects.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSubjects(new Set());
  };

  const getCourseTotals = () => {
    let totalSubjects = course.subjects.length;
    let totalChapters = 0;
    let totalTopics = 0;

    course.subjects.forEach((subject) => {
      totalChapters += subject.chapters.length;
      subject.chapters.forEach((chapter) => {
        totalTopics += chapter.topics.length;
      });
    });

    return { totalSubjects, totalChapters, totalTopics };
  };

  const getSubjectStats = (subject: CourseSubjectWithContent) => {
    const chapters = subject.chapters.length;
    const topics = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
    return { chapters, topics };
  };

  const handleEdit = () => {
    onOpenChange(false);
    navigate(`/teacher/courses/${course.id}/edit`);
  };

  const totals = getCourseTotals();

  const subjectColors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-pink-600',
    'bg-cyan-600',
    'bg-yellow-600',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Course Preview</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Course Header */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    📘 {course.title}
                    <span className="text-muted-foreground font-normal">•</span>
                    <span className="text-muted-foreground font-normal text-base">
                      {course.className}
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.fee ? `Fee: ₹${course.fee.toLocaleString()}` : 'No fee specified'}
                    {' | '}
                    Created: {new Date(course.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {course.description && (
                <p className="text-sm text-muted-foreground">{course.description}</p>
              )}
            </div>

            {/* Content Summary */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                📚 Course Content
                <span className="text-sm font-normal text-muted-foreground">
                  ({totals.totalSubjects} Subjects, {totals.totalChapters} Chapters, {totals.totalTopics} Topics)
                </span>
              </h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Subjects Tree */}
            <div className="space-y-3">
              {course.subjects.map((subject, index) => {
                const isExpanded = expandedSubjects.has(subject.id);
                const stats = getSubjectStats(subject);
                const colorClass = subjectColors[index % subjectColors.length];

                return (
                  <Collapsible
                    key={subject.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSubject(subject.id)}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className={cn('h-3 w-3 rounded-full flex-shrink-0', colorClass)} />
                          <span className="font-medium text-foreground flex-1">
                            {subject.name}
                            <span className="text-muted-foreground font-normal">
                              {' - '}{subject.institute}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {stats.chapters} Chapters, {stats.topics} Topics
                          </span>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 py-3 space-y-3 border-t border-border bg-background">
                          {subject.chapters.map((chapter, chIndex) => (
                            <div key={chapter.id} className="pl-8">
                              <div className="flex items-center gap-2 text-sm">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{chapter.name}</span>
                              </div>
                              <div className="pl-6 mt-2 space-y-1">
                                {chapter.topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>{topic.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
