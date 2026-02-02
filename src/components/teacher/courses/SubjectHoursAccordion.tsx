import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChapterHoursRow } from './ChapterHoursRow';
import { CourseSubjectWithContent } from '@/types/course';
import { formatHours, getChapterHours } from '@/utils/courseHoursUtils';

interface SubjectHoursAccordionProps {
  subject: CourseSubjectWithContent;
  isExpanded: boolean;
  onToggle: () => void;
  onTopicHoursChange: (chapterId: string, topicId: string, hours: number) => void;
  subjectTotalHours: number;
  expandAllChapters: boolean;
}

export function SubjectHoursAccordion({
  subject,
  isExpanded,
  onToggle,
  onTopicHoursChange,
  subjectTotalHours,
  expandAllChapters,
}: SubjectHoursAccordionProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Sync with parent expand all state
  useEffect(() => {
    if (expandAllChapters) {
      setExpandedChapters(new Set(subject.chapters.map(ch => ch.id)));
    } else {
      setExpandedChapters(new Set());
    }
  }, [expandAllChapters, subject.chapters]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleTopicChange = (chapterId: string, topicId: string, hours: number) => {
    onTopicHoursChange(chapterId, topicId, hours);
  };

  const totalChapters = subject.chapters.length;
  const totalTopics = subject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-card border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors min-h-[56px]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">
                {subject.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalChapters} chapters • {totalTopics} topics
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="text-right">
              <span className="text-sm font-semibold text-primary block">
                {formatHours(subjectTotalHours)}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 sm:pl-6 pr-2 py-3 space-y-2 border-l-2 border-primary/20 ml-6 mt-2 max-h-[400px] overflow-y-auto">
          {subject.chapters.map((chapter) => (
            <ChapterHoursRow
              key={chapter.id}
              chapterId={chapter.id}
              chapterName={chapter.name}
              topics={chapter.topics}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              onTopicHoursChange={(topicId, hours) => handleTopicChange(chapter.id, topicId, hours)}
              totalHours={getChapterHours(chapter)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
