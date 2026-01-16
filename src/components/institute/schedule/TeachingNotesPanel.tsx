import React from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TeachingSessionNote, TeachingStatus } from '@/types/teachingProgress';

interface TeachingNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  subjectName: string;
  contextInfo?: string;
  notes: TeachingSessionNote[];
}

export function TeachingNotesPanel({
  isOpen,
  onClose,
  chapterName,
  subjectName,
  contextInfo,
  notes
}: TeachingNotesPanelProps) {
  const getStatusBadge = (status: TeachingStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-0">Completed</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/10 text-amber-600 border-0">Partial</Badge>;
      case 'not-taken':
        return <Badge className="bg-red-500/10 text-red-600 border-0">Not Taken</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-0">Pending</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (markedAt: string) => {
    try {
      return format(new Date(markedAt), 'hh:mm a');
    } catch {
      return '';
    }
  };

  // Sort notes by date, newest first
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime()
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <SheetTitle className="text-lg">Teaching Notes</SheetTitle>
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-foreground">{chapterName}</p>
            <p className="text-sm text-muted-foreground">
              {subjectName} {contextInfo && `• ${contextInfo}`}
            </p>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          {sortedNotes.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No notes recorded for this chapter</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              <div className="text-sm text-muted-foreground mb-4">
                {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''} recorded
              </div>
              
              {sortedNotes.map((note, index) => (
                <div 
                  key={note.sessionId || index}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  {/* Header with date and status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(note.date)}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{note.time}</span>
                    </div>
                    {getStatusBadge(note.status)}
                  </div>

                  {/* Teacher info */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{note.teacherName}</span>
                  </div>

                  {/* Note content */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-sm text-foreground leading-relaxed">
                      "{note.notes}"
                    </p>
                  </div>

                  {/* Marked at timestamp */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Marked at {formatTime(note.markedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
