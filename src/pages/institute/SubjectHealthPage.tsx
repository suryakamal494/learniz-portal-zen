import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { CollapsibleSection } from '@/components/institute/CollapsibleSection';
import { mockInstituteSubjects } from '@/data/mockInstituteData';
import { generateSubjectInsight, formatDate, getPerformanceStatus, getPerformanceBgColor } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export default function SubjectHealthPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Subject Health
          </h1>
          <p className="text-muted-foreground mt-1">Curriculum-level performance across the institute</p>
        </div>
        <TimeFilterBar value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Info */}
      <InstituteInsightCard
        type="info"
        title="What This Shows"
        message="Subject health is aggregated across all teachers and classes. This view helps identify curriculum areas needing attention, independent of individual teacher performance."
      />

      {/* Subject Cards */}
      <div className="space-y-4">
        {mockInstituteSubjects.map((subject) => (
          <Collapsible
            key={subject.id}
            open={expandedSubject === subject.id}
            onOpenChange={(open) => setExpandedSubject(open ? subject.id : null)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardContent className="p-5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subject.teacherCount} teachers • {subject.classCount} classes • {subject.chapters.length} chapters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{subject.overallAccuracy.toFixed(1)}%</p>
                        <TrendBadge trend={subject.trend} size="sm" />
                      </div>
                      {expandedSubject === subject.id ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-5 pb-5 space-y-4 border-t pt-4">
                  <InstituteInsightCard
                    type="insight"
                    title="What This Means"
                    message={generateSubjectInsight(subject.name, subject.overallAccuracy, subject.trend, subject.chapters.length)}
                  />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Chapter Breakdown</h4>
                    {subject.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chapter.name}</span>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full capitalize',
                              getPerformanceBgColor(getPerformanceStatus(chapter.accuracy))
                            )}>
                              {getPerformanceStatus(chapter.accuracy)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last activity: {formatDate(chapter.lastActivityDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">{chapter.accuracy.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">{chapter.totalQuestions} questions</p>
                          </div>
                          <TrendBadge trend={chapter.trend} showLabel={false} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
