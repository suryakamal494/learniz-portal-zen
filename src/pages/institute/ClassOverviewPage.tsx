import React, { useState, useMemo } from 'react';
import { GraduationCap, ChevronDown, ChevronRight, Users, BookOpen, ExternalLink, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { mockInstituteClasses, mockTeacherPerformance } from '@/data/mockInstituteData';
import { generateClassInsight, getSubjectBgClass, getPerformanceStatus, getPerformanceBgColor, formatDate } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChapterDetail {
  chapterId: string;
  chapterName: string;
  accuracy: number;
  engagement: number;
  totalQuestions: number;
  lastTestDate: string;
  teacherId: string;
  teacherName: string;
}

interface BatchSubjectData {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  chapters: ChapterDetail[];
}

export default function ClassOverviewPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterDetail | null>(null);

  // Get batch-level subject and chapter data
  const getBatchSubjectData = (batchId: string, batchName: string, className: string): BatchSubjectData[] => {
    const subjectMap = new Map<string, BatchSubjectData>();

    mockTeacherPerformance.forEach((teacher) => {
      teacher.subjectPerformance.forEach((sp) => {
        sp.chapters.forEach((chapter) => {
          const batchData = chapter.batchBreakdown.find(
            (b) => b.batchId === batchId || (b.batchName === batchName && b.className === className)
          );

          if (batchData) {
            if (!subjectMap.has(sp.subjectId)) {
              subjectMap.set(sp.subjectId, {
                subjectId: sp.subjectId,
                subjectName: sp.subjectName,
                accuracy: 0,
                chapters: [],
              });
            }

            const subjectData = subjectMap.get(sp.subjectId)!;
            subjectData.chapters.push({
              chapterId: chapter.chapterId,
              chapterName: chapter.chapterName,
              accuracy: batchData.accuracy,
              engagement: batchData.engagement,
              totalQuestions: chapter.totalQuestions,
              lastTestDate: chapter.lastTestDate,
              teacherId: teacher.teacherId,
              teacherName: teacher.teacher.name,
            });
          }
        });
      });
    });

    // Calculate subject-level accuracy
    subjectMap.forEach((subject) => {
      if (subject.chapters.length > 0) {
        subject.accuracy = subject.chapters.reduce((sum, ch) => sum + ch.accuracy, 0) / subject.chapters.length;
      }
    });

    return Array.from(subjectMap.values());
  };

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
        message="Class-level performance with drill-down to batches, subjects, and chapters. Click on any batch to see detailed subject and chapter performance with teacher attribution."
      />

      {/* Class Cards */}
      <div className="space-y-4">
        {mockInstituteClasses.map((cls) => (
          <Collapsible
            key={cls.id}
            open={expandedClass === cls.id}
            onOpenChange={(open) => {
              setExpandedClass(open ? cls.id : null);
              if (!open) {
                setExpandedBatch(null);
                setExpandedSubject(null);
              }
            }}
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

                  {/* Subject Performance Summary */}
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

                  {/* Batch Drill-down */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Batch Details (Click to expand)</h4>
                    <div className="space-y-3">
                      {cls.batches.map((batch) => {
                        const batchSubjects = getBatchSubjectData(batch.id, batch.name, cls.name);
                        
                        return (
                          <Collapsible
                            key={batch.id}
                            open={expandedBatch === batch.id}
                            onOpenChange={(open) => {
                              setExpandedBatch(open ? batch.id : null);
                              if (!open) setExpandedSubject(null);
                            }}
                          >
                            <Card className="border-dashed">
                              <CollapsibleTrigger asChild>
                                <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <span className="font-medium">{batch.name}</span>
                                        <p className="text-xs text-muted-foreground">
                                          {batch.studentCount} students • {batchSubjects.length} subjects
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className="font-bold">{batch.accuracy.toFixed(1)}%</span>
                                        <p className="text-xs text-muted-foreground">{batch.engagement.toFixed(1)}% eng.</p>
                                      </div>
                                      <span className={cn(
                                        'text-xs px-2 py-0.5 rounded-full capitalize',
                                        getPerformanceBgColor(getPerformanceStatus(batch.accuracy))
                                      )}>
                                        {getPerformanceStatus(batch.accuracy)}
                                      </span>
                                      {expandedBatch === batch.id ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="px-3 pb-3 space-y-3 border-t pt-3">
                                  {batchSubjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                      No subject data available for this batch
                                    </p>
                                  ) : (
                                    batchSubjects.map((subject) => (
                                      <Collapsible
                                        key={`${batch.id}-${subject.subjectId}`}
                                        open={expandedSubject === `${batch.id}-${subject.subjectId}`}
                                        onOpenChange={(open) => 
                                          setExpandedSubject(open ? `${batch.id}-${subject.subjectId}` : null)
                                        }
                                      >
                                        <CollapsibleTrigger asChild>
                                          <div className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-2">
                                              <span className={cn(
                                                'px-2 py-1 rounded text-xs font-medium',
                                                getSubjectBgClass(subject.subjectId)
                                              )}>
                                                {subject.subjectName}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {subject.chapters.length} chapters
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">{subject.accuracy.toFixed(1)}%</span>
                                              {expandedSubject === `${batch.id}-${subject.subjectId}` ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                              )}
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                          <div className="mt-2 space-y-2 pl-3">
                                            {subject.chapters.map((chapter) => (
                                              <div
                                                key={chapter.chapterId}
                                                className="flex items-center justify-between p-2 rounded bg-muted/30 border text-sm"
                                              >
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-medium truncate">{chapter.chapterName}</p>
                                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Link 
                                                      to={`/institute/teachers/${chapter.teacherId}`}
                                                      className="text-primary hover:underline flex items-center gap-1"
                                                    >
                                                      <User className="h-3 w-3" />
                                                      {chapter.teacherName}
                                                    </Link>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <div className="text-right">
                                                    <p className="font-bold">{chapter.accuracy.toFixed(1)}%</p>
                                                    <p className="text-xs text-muted-foreground">{chapter.totalQuestions}q</p>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedChapter(chapter);
                                                    }}
                                                  >
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                  </Button>
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
                                    ))
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Chapter Details Modal */}
      <Dialog open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedChapter?.chapterName}</DialogTitle>
          </DialogHeader>
          {selectedChapter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{selectedChapter.accuracy.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold">{selectedChapter.engagement.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-medium">{selectedChapter.totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Test Date</span>
                  <span className="font-medium">{formatDate(selectedChapter.lastTestDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teacher</span>
                  <Link 
                    to={`/institute/teachers/${selectedChapter.teacherId}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {selectedChapter.teacherName}
                  </Link>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link 
                  to={`/teacher/reports/chapter-analytics/${selectedChapter.chapterId}`}
                  className="flex-1"
                >
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </Link>
                <Link to={`/institute/teachers/${selectedChapter.teacherId}`}>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Teacher
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
