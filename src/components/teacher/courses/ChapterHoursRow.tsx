import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TopicHoursInput } from './TopicHoursInput';
import { CourseTopic } from '@/types/course';
import { formatHours } from '@/utils/courseHoursUtils';

interface ChapterHoursRowProps {
  chapterId: string;
  chapterName: string;
  topics: CourseTopic[];
  isExpanded: boolean;
  onToggle: () => void;
  onTopicHoursChange: (topicId: string, hours: number) => void;
  totalHours: number;
}

export function ChapterHoursRow({
  chapterId,
  chapterName,
  topics,
  isExpanded,
  onToggle,
  onTopicHoursChange,
  totalHours,
}: ChapterHoursRowProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/60 rounded-lg cursor-pointer transition-colors min-h-[48px]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium text-sm text-foreground truncate">
              {chapterName}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              ({topics.length} topics)
            </span>
          </div>
          <div className="flex-shrink-0 ml-2">
            <span className="text-sm font-medium text-primary">
              {formatHours(totalHours)}
            </span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 sm:pl-8 pr-2 py-2 space-y-1 border-l-2 border-muted ml-4 mt-1">
          {topics.map((topic) => (
            <TopicHoursInput
              key={topic.id}
              topicId={topic.id}
              topicName={topic.name}
              hours={topic.hours || 0}
              onChange={onTopicHoursChange}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
