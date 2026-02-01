import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Minus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { CourseChapter } from '@/types/course';

interface ChapterTopicTreeProps {
  chapters: CourseChapter[];
  onChapterToggle: (chapterId: string) => void;
  onTopicToggle: (chapterId: string, topicId: string) => void;
  onSelectAllTopics?: (chapterId: string) => void;
  readOnly?: boolean;
  showSourceInfo?: boolean; // Show source subject info for custom subjects
}

export function ChapterTopicTree({
  chapters,
  onChapterToggle,
  onTopicToggle,
  onSelectAllTopics,
  readOnly = false,
  showSourceInfo = false,
}: ChapterTopicTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapterExpand = (chapterId: string) => {
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

  const getChapterCheckState = (chapter: CourseChapter): 'none' | 'some' | 'all' => {
    const selectedCount = chapter.topics.filter((t) => t.isSelected).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === chapter.topics.length) return 'all';
    return 'some';
  };

  const getSelectedTopicCount = (chapter: CourseChapter): number => {
    return chapter.topics.filter((t) => t.isSelected).length;
  };

  return (
    <div className="space-y-1">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const checkState = getChapterCheckState(chapter);
        const selectedCount = getSelectedTopicCount(chapter);
        const totalCount = chapter.topics.length;
        const isRenamed = chapter.originalName && chapter.name !== chapter.originalName;

        return (
          <div key={chapter.id} className="border border-border rounded-lg overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleChapterExpand(chapter.id)}>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors">
                {!readOnly && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onChapterToggle(chapter.id);
                    }}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                        checkState === 'all'
                          ? 'bg-primary border-primary'
                          : checkState === 'some'
                          ? 'bg-primary/50 border-primary'
                          : 'border-muted-foreground/50'
                      )}
                    >
                      {checkState === 'all' && <Check className="h-3 w-3 text-primary-foreground" />}
                      {checkState === 'some' && <Minus className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </div>
                )}
                
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 flex-1 text-left min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{chapter.name}</span>
                        {showSourceInfo && chapter.sourceSubjectName && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 font-normal">
                            from {chapter.sourceSubjectName}
                          </Badge>
                        )}
                        {isRenamed && (
                          <span className="text-xs text-muted-foreground italic">
                            (originally: {chapter.originalName})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {readOnly ? `${totalCount} topics` : `${selectedCount}/${totalCount} topics`}
                    </span>
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="pl-8 pr-3 py-2 space-y-1.5 bg-background border-t border-border">
                  {!readOnly && onSelectAllTopics && (
                    <button
                      onClick={() => onSelectAllTopics(chapter.id)}
                      className="text-xs text-primary hover:underline mb-1"
                    >
                      {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  {chapter.topics.map((topic) => {
                    const topicRenamed = topic.originalName && topic.name !== topic.originalName;

                    return (
                      <div key={topic.id} className="flex items-center gap-2 py-1">
                        {!readOnly ? (
                          <Checkbox
                            id={topic.id}
                            checked={topic.isSelected}
                            onCheckedChange={() => onTopicToggle(chapter.id, topic.id)}
                            className="h-3.5 w-3.5"
                          />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        )}
                        <label
                          htmlFor={topic.id}
                          className={cn(
                            'text-sm cursor-pointer',
                            topic.isSelected ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {topic.name}
                          {topicRenamed && (
                            <span className="text-xs text-muted-foreground italic ml-1">
                              (was: {topic.originalName})
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}
