import { useState } from 'react';
import { ChevronDown, ChevronRight, X, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CourseChapter, CourseTopic } from '@/types/course';
import { cn } from '@/lib/utils';

interface EditableChapterCardProps {
  chapter: CourseChapter;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNameChange: (newName: string) => void;
  onTopicNameChange: (topicId: string, newName: string) => void;
  onTopicToggle: (topicId: string) => void;
  onRemove: () => void;
}

export function EditableChapterCard({
  chapter,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onNameChange,
  onTopicNameChange,
  onTopicToggle,
  onRemove,
}: EditableChapterCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [tempName, setTempName] = useState(chapter.name);
  const [tempTopicName, setTempTopicName] = useState('');

  const selectedTopicsCount = chapter.topics.filter((t) => t.isSelected).length;
  const isRenamed = chapter.originalName && chapter.name !== chapter.originalName;

  const handleSaveChapterName = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleStartEditTopic = (topic: CourseTopic) => {
    setEditingTopicId(topic.id);
    setTempTopicName(topic.name);
  };

  const handleSaveTopicName = (topicId: string) => {
    if (tempTopicName.trim()) {
      onTopicNameChange(topicId, tempTopicName.trim());
    }
    setEditingTopicId(null);
  };

  const handleSelectAll = () => {
    const allSelected = chapter.topics.every((t) => t.isSelected);
    chapter.topics.forEach((topic) => {
      if (allSelected ? topic.isSelected : !topic.isSelected) {
        onTopicToggle(topic.id);
      }
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Collapsible open={isExpanded} onOpenChange={handleToggleExpand}>
        {/* Chapter Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
          <CollapsibleTrigger asChild>
            <button className="p-0.5 hover:bg-muted rounded">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveChapterName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveChapterName}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{chapter.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={() => {
                    setTempName(chapter.name);
                    setIsEditingName(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Source info and rename indicator */}
            <div className="flex items-center gap-2 mt-0.5">
              {chapter.sourceSubjectName && (
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
            {selectedTopicsCount}/{chapter.topics.length} topics
          </span>

          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Topics List */}
        <CollapsibleContent>
          <div className="px-3 py-2 border-t border-border bg-background space-y-1">
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary hover:underline mb-1"
            >
              {selectedTopicsCount === chapter.topics.length ? 'Deselect All' : 'Select All'}
            </button>

            {chapter.topics.map((topic) => {
              const isEditing = editingTopicId === topic.id;
              const topicRenamed = topic.originalName && topic.name !== topic.originalName;

              return (
                <div key={topic.id} className="flex items-center gap-2 py-1 pl-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={tempTopicName}
                        onChange={(e) => setTempTopicName(e.target.value)}
                        className="h-6 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTopicName(topic.id);
                          if (e.key === 'Escape') setEditingTopicId(null);
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleSaveTopicName(topic.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor={`topic-${topic.id}`}
                        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                      >
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={topic.isSelected}
                          onCheckedChange={() => onTopicToggle(topic.id)}
                          className="h-3.5 w-3.5"
                        />
                        <span
                          className={cn(
                            'text-sm truncate',
                            topic.isSelected ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {topic.name}
                        </span>
                        {topicRenamed && (
                          <span className="text-xs text-muted-foreground italic whitespace-nowrap">
                            (was: {topic.originalName})
                          </span>
                        )}
                      </label>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 opacity-60 hover:opacity-100 flex-shrink-0"
                        onClick={() => handleStartEditTopic(topic)}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
