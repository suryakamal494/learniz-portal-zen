import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { mockInstituteClasses } from '@/data/mockInstituteData';
import { generateClassInsight, getSubjectBgClass } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function ClassOverviewPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Class Overview
          </h1>
          <p className="text-muted-foreground mt-1">Academic health by class and batch</p>
        </div>
        <TimeFilterBar value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Info */}
      <InstituteInsightCard
        type="info"
        title="What This Shows"
        message="Class-level performance helps understand how different grade levels and batches are progressing. Use this to identify classes needing more focus or to celebrate high-performing cohorts."
      />

      {/* Class Cards */}
      <div className="space-y-4">
        {mockInstituteClasses.map((cls) => (
          <Collapsible
            key={cls.id}
            open={expandedClass === cls.id}
            onOpenChange={(open) => setExpandedClass(open ? cls.id : null)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardContent className="p-5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{cls.grade}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {cls.totalStudents} students • {cls.batches.length} batches
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{cls.overallAccuracy.toFixed(1)}%</p>
                        <TrendBadge trend={cls.trend} size="sm" />
                      </div>
                      {expandedClass === cls.id ? (
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
                    message={generateClassInsight(cls.name, cls.overallAccuracy, cls.trend, cls.subjectPerformance.length)}
                  />

                  {/* Subject Performance */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Subject Performance</h4>
                    {cls.subjectPerformance.map((sp) => (
                      <PerformanceBarCard
                        key={sp.subjectId}
                        label={sp.subjectName}
                        value={sp.accuracy}
                        trend={sp.trend}
                      />
                    ))}
                  </div>

                  {/* Batch Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Batch Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cls.batches.map((batch) => (
                        <div
                          key={batch.id}
                          className="p-3 rounded-lg border bg-muted/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{batch.name}</span>
                            <span className="font-bold">{batch.accuracy.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{batch.studentCount} students</span>
                            <span>{batch.engagement.toFixed(1)}% engagement</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${batch.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
