import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, Users, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/institute/MetricCard';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { CollapsibleSection } from '@/components/institute/CollapsibleSection';
import { mockTeacherPerformance, mockTeacherTrends } from '@/data/mockInstituteData';
import { generateTeacherInsight, formatDate, getPerformanceStatus, getPerformanceBgColor, getSubjectBgClass } from '@/utils/instituteAnalyticsUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { TeacherChapterPerformance, BatchPerformance } from '@/types/instituteAnalytics';

interface ClassBatchSubjectData {
  className: string;
  batches: {
    batchId: string;
    batchName: string;
    accuracy: number;
    engagement: number;
    studentCount: number;
    subjects: {
      subjectId: string;
      subjectName: string;
      chapters: TeacherChapterPerformance[];
    }[];
  }[];
}

export default function TeacherDetailPage() {
  const { teacherId } = useParams();
  const teacherData = mockTeacherPerformance.find((t) => t.teacherId === teacherId);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Transform data: Subject-first → Class → Batch → Subject → Chapter
  const classBasedData = useMemo(() => {
    if (!teacherData) return [];

    const classMap = new Map<string, ClassBatchSubjectData>();

    teacherData.subjectPerformance.forEach((sp) => {
      sp.chapters.forEach((chapter) => {
        chapter.batchBreakdown.forEach((batch) => {
          const className = batch.className;
          
          if (!classMap.has(className)) {
            classMap.set(className, {
              className,
              batches: [],
            });
          }

          const classData = classMap.get(className)!;
          let batchData = classData.batches.find((b) => b.batchId === batch.batchId);
          
          if (!batchData) {
            batchData = {
              batchId: batch.batchId,
              batchName: batch.batchName,
              accuracy: batch.accuracy,
              engagement: batch.engagement,
              studentCount: batch.studentCount,
              subjects: [],
            };
            classData.batches.push(batchData);
          }

          let subjectData = batchData.subjects.find((s) => s.subjectId === sp.subjectId);
          if (!subjectData) {
            subjectData = {
              subjectId: sp.subjectId,
              subjectName: sp.subjectName,
              chapters: [],
            };
            batchData.subjects.push(subjectData);
          }

          // Add chapter with batch-specific data
          const chapterWithBatchData: TeacherChapterPerformance = {
            ...chapter,
            accuracy: batch.accuracy,
            engagement: batch.engagement,
            batchBreakdown: [batch],
          };
          subjectData.chapters.push(chapterWithBatchData);
        });
      });
    });

    // Calculate batch-level accuracy as average of all chapter accuracies
    classMap.forEach((classData) => {
      classData.batches.forEach((batch) => {
        let totalAccuracy = 0;
        let totalEngagement = 0;
        let chapterCount = 0;
        
        batch.subjects.forEach((subject) => {
          subject.chapters.forEach((chapter) => {
            totalAccuracy += chapter.accuracy;
            totalEngagement += chapter.engagement;
            chapterCount++;
          });
        });

        if (chapterCount > 0) {
          batch.accuracy = totalAccuracy / chapterCount;
          batch.engagement = totalEngagement / chapterCount;
        }
      });

      // Sort batches by name
      classData.batches.sort((a, b) => a.batchName.localeCompare(b.batchName));
    });

    return Array.from(classMap.values()).sort((a, b) => 
      a.className.localeCompare(b.className)
    );
  }, [teacherData]);

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
              <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      {/* Class-Based Hierarchy: Class → Batch → Subject → Chapter */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Performance by Class & Section</h2>
        <p className="text-sm text-muted-foreground">
          View detailed breakdown: Class → Section → Subject → Chapter
        </p>

        {classBasedData.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No class data available for this teacher.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={classBasedData[0]?.className} className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {classBasedData.map((classData) => (
                <TabsTrigger key={classData.className} value={classData.className}>
                  {classData.className}
                </TabsTrigger>
              ))}
            </TabsList>

            {classBasedData.map((classData) => (
              <TabsContent key={classData.className} value={classData.className} className="space-y-4">
                {/* Batch Cards */}
                {classData.batches.map((batch) => (
                  <Collapsible
                    key={batch.batchId}
                    open={expandedBatch === batch.batchId}
                    onOpenChange={(open) => setExpandedBatch(open ? batch.batchId : null)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{batch.batchName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {batch.studentCount} students • {batch.subjects.length} subject(s)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg">{batch.accuracy.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">{batch.engagement.toFixed(1)}% engagement</p>
                              </div>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full capitalize',
                                getPerformanceBgColor(getPerformanceStatus(batch.accuracy))
                              )}>
                                {getPerformanceStatus(batch.accuracy)}
                              </span>
                              {expandedBatch === batch.batchId ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4 border-t pt-4">
                          {/* Subjects within Batch */}
                          {batch.subjects.map((subject) => (
                            <Collapsible
                              key={`${batch.batchId}-${subject.subjectId}`}
                              open={expandedSubject === `${batch.batchId}-${subject.subjectId}`}
                              onOpenChange={(open) => 
                                setExpandedSubject(open ? `${batch.batchId}-${subject.subjectId}` : null)
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      'px-2 py-1 rounded text-xs font-medium',
                                      getSubjectBgClass(subject.subjectId)
                                    )}>
                                      {subject.subjectName}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {subject.chapters.length} chapter(s)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {expandedSubject === `${batch.batchId}-${subject.subjectId}` ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="mt-3 space-y-2 pl-4">
                                  {subject.chapters.map((chapter) => (
                                    <div
                                      key={chapter.chapterId}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{chapter.chapterName}</span>
                                          <TrendBadge trend={chapter.trend} showLabel={false} size="sm" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Last tested: {formatDate(chapter.lastTestDate)} • {chapter.totalQuestions} questions
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <p className="font-bold">{chapter.accuracy.toFixed(1)}%</p>
                                          <p className="text-xs text-muted-foreground">{chapter.engagement.toFixed(1)}% eng.</p>
                                        </div>
                                        <span className={cn(
                                          'text-xs px-2 py-0.5 rounded-full capitalize',
                                          getPerformanceBgColor(getPerformanceStatus(chapter.accuracy))
                                        )}>
                                          {getPerformanceStatus(chapter.accuracy)}
                                        </span>
                                        <Link 
                                          to={`/teacher/reports/chapter-analytics/${chapter.chapterId}`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
