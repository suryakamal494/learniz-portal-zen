import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/institute/MetricCard';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { CollapsibleSection } from '@/components/institute/CollapsibleSection';
import { mockTeacherPerformance, mockTeacherTrends } from '@/data/mockInstituteData';
import { generateTeacherInsight, formatDate, getSubjectBgClass, getPerformanceStatus, getPerformanceBgColor } from '@/utils/instituteAnalyticsUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function TeacherDetailPage() {
  const { teacherId } = useParams();
  const teacherData = mockTeacherPerformance.find((t) => t.teacherId === teacherId);

  if (!teacherData) {
    return (
      <div className="p-6 text-center">
        <p>Teacher not found</p>
        <Link to="/institute/teachers">
          <Button variant="link">Back to Teachers</Button>
        </Link>
      </div>
    );
  }

  const trendData = mockTeacherTrends[teacherId || ''] || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/institute/teachers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{teacherData.teacher.name}</h1>
          <p className="text-muted-foreground">{teacherData.teacher.email}</p>
        </div>
        <TrendBadge trend={teacherData.trend} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Student Accuracy"
          value={`${teacherData.overallAccuracy.toFixed(1)}%`}
          trend={teacherData.trend}
          showPerformanceStatus
          accuracy={teacherData.overallAccuracy}
        />
        <MetricCard
          title="Engagement"
          value={`${teacherData.overallEngagement.toFixed(1)}%`}
          icon={Users}
        />
        <MetricCard
          title="Total Students"
          value={teacherData.totalStudents}
          icon={User}
        />
        <MetricCard
          title="Questions Attempted"
          value={teacherData.totalQuestions.toLocaleString()}
          icon={BookOpen}
        />
      </div>

      {/* Insight */}
      <InstituteInsightCard
        type="insight"
        title="What This Means"
        message={generateTeacherInsight(
          teacherData.teacher.name,
          teacherData.overallAccuracy,
          teacherData.trend,
          teacherData.subjectPerformance.length
        )}
      />

      {/* Trend Chart */}
      <CollapsibleSection
        title="Performance Trend"
        whatThisShows="How student outcomes in this teacher's classes have changed over time."
      >
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      {/* Subject Tabs */}
      <Tabs defaultValue={teacherData.subjectPerformance[0]?.subjectId} className="space-y-4">
        <TabsList>
          {teacherData.subjectPerformance.map((sp) => (
            <TabsTrigger key={sp.subjectId} value={sp.subjectId}>
              {sp.subjectName}
            </TabsTrigger>
          ))}
        </TabsList>

        {teacherData.subjectPerformance.map((sp) => (
          <TabsContent key={sp.subjectId} value={sp.subjectId} className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{sp.subjectName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sp.classes.join(', ')} • {sp.batches.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl">{sp.accuracy.toFixed(1)}%</span>
                    <TrendBadge trend={sp.trend} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <div className="space-y-3">
              <h4 className="font-medium">Chapter Performance</h4>
              {sp.chapters.map((chapter) => (
                <Card key={chapter.chapterId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium">{chapter.chapterName}</span>
                        <p className="text-xs text-muted-foreground">
                          Last tested: {formatDate(chapter.lastTestDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full capitalize',
                          getPerformanceBgColor(getPerformanceStatus(chapter.accuracy))
                        )}>
                          {getPerformanceStatus(chapter.accuracy)}
                        </span>
                        <span className="font-bold">{chapter.accuracy.toFixed(1)}%</span>
                        <TrendBadge trend={chapter.trend} showLabel={false} size="sm" />
                      </div>
                    </div>

                    {/* Batch Breakdown */}
                    {chapter.batchBreakdown.length > 1 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Batch Comparison</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {chapter.batchBreakdown.map((batch) => (
                            <div key={batch.batchId} className="text-xs p-2 rounded bg-muted/50">
                              <p className="font-medium">{batch.batchName}</p>
                              <p className="text-muted-foreground">{batch.accuracy.toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
