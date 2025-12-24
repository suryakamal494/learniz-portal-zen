
import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChapterProgress } from '@/types/teachingProgress';

interface ChapterProgressSectionProps {
  chapterProgress: ChapterProgress[];
}

export function ChapterProgressSection({ chapterProgress }: ChapterProgressSectionProps) {
  // Group by subject
  const groupedBySubject = chapterProgress.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, ChapterProgress[]>);

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Physics': { bg: 'bg-blue-500/10', text: 'text-blue-600' },
      'Mathematics': { bg: 'bg-purple-500/10', text: 'text-purple-600' },
      'Chemistry': { bg: 'bg-green-500/10', text: 'text-green-600' },
      'Biology': { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
      'English': { bg: 'bg-amber-500/10', text: 'text-amber-600' }
    };
    return colors[subject] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Chapter-wise Progress (Derived from Schedule)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedBySubject).map(([subject, chapters]) => {
          const colors = getSubjectColor(subject);
          
          return (
            <div key={subject}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${colors.bg} ${colors.text} border-0`}>
                  {subject}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {chapters.length} topics
                </span>
              </div>
              <div className="grid gap-3">
                {chapters.map(chapter => {
                  const total = chapter.sessionsPlanned;
                  const pending = total - chapter.sessionsCompleted - chapter.sessionsPartial - chapter.sessionsMissed;
                  
                  return (
                    <div 
                      key={chapter.chapterId}
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">{chapter.chapterName}</div>
                          <div className="text-sm text-muted-foreground">
                            {chapter.hoursSpent.toFixed(1)}h spent
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {chapter.sessionsPlanned} sessions
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {chapter.sessionsCompleted > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {chapter.sessionsCompleted} completed
                          </div>
                        )}
                        {chapter.sessionsPartial > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {chapter.sessionsPartial} partial
                          </div>
                        )}
                        {chapter.sessionsMissed > 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            {chapter.sessionsMissed} missed
                          </div>
                        )}
                        {pending > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {pending} pending
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
