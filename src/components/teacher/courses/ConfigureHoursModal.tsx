import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { SubjectHoursAccordion } from './SubjectHoursAccordion';
import { Course, CourseSubjectWithContent } from '@/types/course';
import { getCourseHours, getSubjectHours, formatHours, getTotalChaptersCount, getTotalTopicsCount } from '@/utils/courseHoursUtils';
import { toast } from 'sonner';

interface ConfigureHoursModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCourse: Course) => void;
}

export function ConfigureHoursModal({
  course,
  open,
  onOpenChange,
  onSave,
}: ConfigureHoursModalProps) {
  // Local state for editing - deep clone to avoid mutating original
  const [editableSubjects, setEditableSubjects] = useState<CourseSubjectWithContent[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandAllChapters, setExpandAllChapters] = useState(false);

  // Initialize when modal opens
  useEffect(() => {
    if (course && open) {
      // Deep clone subjects to avoid mutating original
      const cloned = JSON.parse(JSON.stringify(course.subjects)) as CourseSubjectWithContent[];
      setEditableSubjects(cloned);
      setExpandedSubjects(new Set());
      setExpandAllChapters(false);
    }
  }, [course, open]);

  // Calculate totals
  const totalCourseHours = useMemo(() => {
    return editableSubjects.reduce((sum, subject) => sum + getSubjectHours(subject), 0);
  }, [editableSubjects]);

  const stats = useMemo(() => {
    if (!course) return { subjects: 0, chapters: 0, topics: 0 };
    return {
      subjects: course.subjects.length,
      chapters: getTotalChaptersCount(course),
      topics: getTotalTopicsCount(course),
    };
  }, [course]);

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

  const handleExpandAll = () => {
    setExpandedSubjects(new Set(editableSubjects.map(s => s.id)));
    setExpandAllChapters(true);
  };

  const handleCollapseAll = () => {
    setExpandedSubjects(new Set());
    setExpandAllChapters(false);
  };

  const handleTopicHoursChange = (subjectId: string, chapterId: string, topicId: string, hours: number) => {
    setEditableSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          chapters: subject.chapters.map((chapter) => {
            if (chapter.id !== chapterId) return chapter;
            return {
              ...chapter,
              topics: chapter.topics.map((topic) => {
                if (topic.id !== topicId) return topic;
                return { ...topic, hours };
              }),
            };
          }),
        };
      })
    );
  };

  const handleSave = () => {
    if (!course) return;
    
    const updatedCourse: Course = {
      ...course,
      subjects: editableSubjects,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    onSave(updatedCourse);
    toast.success('Teaching hours saved successfully');
    onOpenChange(false);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Configure Teaching Hours
          </DialogTitle>
          <DialogDescription>
            {course.programName} - {course.className}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-shrink-0 space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Set planned teaching hours for each topic. Chapter and subject totals will be calculated automatically.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg px-4 py-2">
                <span className="text-xs text-muted-foreground block">Total Course Hours</span>
                <span className="text-lg font-bold text-primary">{formatHours(totalCourseHours)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="block">{stats.subjects} subjects</span>
                <span className="block">{stats.chapters} chapters • {stats.topics} topics</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="text-xs"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                Collapse All
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] max-h-[55vh] overflow-y-auto pr-2 border rounded-lg">
          <div className="space-y-3 p-3">
            {editableSubjects.map((subject) => (
              <SubjectHoursAccordion
                key={subject.id}
                subject={subject}
                isExpanded={expandedSubjects.has(subject.id)}
                onToggle={() => toggleSubject(subject.id)}
                onTopicHoursChange={(chapterId, topicId, hours) =>
                  handleTopicHoursChange(subject.id, chapterId, topicId, hours)
                }
                subjectTotalHours={getSubjectHours(subject)}
                expandAllChapters={expandAllChapters && expandedSubjects.has(subject.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Hours
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
