import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChapterNotesButtonProps {
  notesCount: number;
  onClick: () => void;
  className?: string;
}

export function ChapterNotesButton({ notesCount, onClick, className }: ChapterNotesButtonProps) {
  if (notesCount === 0) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-7 px-2 gap-1.5 text-xs font-medium",
        "text-primary hover:text-primary hover:bg-primary/10",
        "transition-colors",
        className
      )}
    >
      <MessageSquareText className="h-3.5 w-3.5" />
      <span>{notesCount}</span>
    </Button>
  );
}
