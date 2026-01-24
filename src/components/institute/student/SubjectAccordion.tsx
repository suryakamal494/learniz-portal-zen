import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { StudentSubjectPerformance, StudentChapterPerformance } from '@/types/studentReport';
import { ChapterTestTabs } from './ChapterTestTabs';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectAccordionProps {
  subjects: StudentSubjectPerformance[];
}

export const SubjectAccordion: React.FC<SubjectAccordionProps> = ({ subjects }) => {
  const getSubjectIconColor = (color: string): string => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      orange: 'bg-orange-100 text-orange-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getComparisonBadge = (accuracy: number, classAvg: number) => {
    const diff = accuracy - classAvg;
    if (diff >= 3) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{diff.toFixed(1)}%
        </Badge>
      );
    }
    if (diff <= -3) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
          <TrendingDown className="h-3 w-3 mr-1" />
          {diff.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
        <Minus className="h-3 w-3 mr-1" />
        Avg
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      case 'stable':
        return 'Stable';
      default:
        return 'Not enough data';
    }
  };

  const getChapterBorderColor = (accuracy: number) => {
    if (accuracy >= 70) return 'border-l-green-400';
    if (accuracy >= 40) return 'border-l-amber-400';
    return 'border-l-red-400';
  };

  const renderChapter = (chapter: StudentChapterPerformance, subjectColor: string) => {
    const chapterBgTint = {
      blue: 'bg-blue-50/40',
      purple: 'bg-purple-50/40',
      green: 'bg-green-50/40',
      emerald: 'bg-emerald-50/40',
      orange: 'bg-orange-50/40',
      amber: 'bg-amber-50/40',
    }[subjectColor] || 'bg-gray-50/40';

    return (
      <AccordionItem 
        key={chapter.chapterId} 
        value={chapter.chapterId}
        className={cn(
          "border rounded-lg mb-2 overflow-hidden border-l-4",
          getChapterBorderColor(chapter.overallAccuracy),
          chapterBgTint
        )}
      >
        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-medium text-sm truncate">{chapter.chapterName}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{chapter.testsAttempted} tests</span>
                  <span className="flex items-center gap-1">
                    {getTrendIcon(chapter.trend)}
                    {getTrendLabel(chapter.trend)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {getComparisonBadge(chapter.overallAccuracy, chapter.classAverage)}
              <span className={cn("font-bold text-sm", getAccuracyColor(chapter.overallAccuracy))}>
                {chapter.overallAccuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {/* Chapter Overview */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Chapter Performance</span>
            <span className={cn("font-semibold", getAccuracyColor(chapter.overallAccuracy))}>
              {chapter.overallAccuracy.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className={cn("h-full rounded-full transition-all", getProgressColor(chapter.overallAccuracy))}
              style={{ width: `${chapter.overallAccuracy}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Class average: {chapter.classAverage.toFixed(1)}%</span>
            <span className={chapter.comparisonWithClass >= 0 ? 'text-green-600' : 'text-red-600'}>
              {chapter.comparisonWithClass >= 0 ? '+' : ''}{chapter.comparisonWithClass.toFixed(1)}% vs class
            </span>
          </div>
        </div>

        {/* Test Breakdown Tabs */}
        <ChapterTestTabs testsByType={chapter.testsByType} />
      </AccordionContent>
    </AccordionItem>
  );
  };

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {subjects.map((subject) => (
        <AccordionItem 
          key={subject.subjectId} 
          value={subject.subjectId}
          className="border rounded-xl overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-4 hover:bg-muted/30 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  getSubjectIconColor(subject.subjectColor)
                )}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-foreground">{subject.subjectName}</div>
                  <div className="text-xs text-muted-foreground">
                    {subject.chapters.length} chapters • {subject.testsAttempted} tests
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className={cn("text-lg font-bold", getAccuracyColor(subject.overallAccuracy))}>
                    {subject.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Class avg: {subject.classAverage.toFixed(1)}%
                  </div>
                </div>
                <div className="sm:hidden">
                  <span className={cn("text-lg font-bold", getAccuracyColor(subject.overallAccuracy))}>
                    {subject.overallAccuracy.toFixed(1)}%
                  </span>
                </div>
                {getComparisonBadge(subject.overallAccuracy, subject.classAverage)}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {/* Subject Progress Bar */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Subject Performance</span>
                <span className="text-sm font-medium">{subject.overallAccuracy.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(subject.overallAccuracy))}
                  style={{ width: `${subject.overallAccuracy}%` }}
                />
              </div>
            </div>

            {/* Chapters */}
            <h4 className="font-medium text-sm text-foreground mb-3">Chapters</h4>
            <Accordion type="single" collapsible className="space-y-2">
              {subject.chapters.map((chapter) => renderChapter(chapter, subject.subjectColor))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
