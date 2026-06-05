import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Filter, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { mockInstituteSubjects, mockInstituteClasses, mockTeacherPerformance } from '@/data/mockInstituteData';
import { generateSubjectInsight, formatDate, getPerformanceStatus, getPerformanceBgColor, getSubjectBgClass } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function SubjectHealthPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  // Get available batches based on selected class
  const availableBatches = useMemo(() => {
    if (selectedClass === 'all') {
      return mockInstituteClasses.flatMap((c) => c.batches);
    }
    const classData = mockInstituteClasses.find((c) => c.id === selectedClass);
    return classData?.batches || [];
  }, [selectedClass]);

  // Reset batch when class changes
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedBatch('all');
  };

  // Get filtered subject data with batch-specific accuracy
  const filteredSubjectData = useMemo(() => {
    return mockInstituteSubjects.map((subject) => {
      // Get chapters with batch-specific data from teacher performance
      const chaptersWithBatchData = subject.chapters.map((chapter) => {
        // Find batch-specific accuracy from teacher performance data
        let batchAccuracies: { batchId: string; batchName: string; className: string; accuracy: number; teacherId: string; teacherName: string }[] = [];

        mockTeacherPerformance.forEach((teacher) => {
          teacher.subjectPerformance.forEach((sp) => {
            if (sp.subjectId === subject.id) {
              sp.chapters.forEach((ch) => {
                if (ch.chapterId === chapter.id) {
                  ch.batchBreakdown.forEach((batch) => {
                    batchAccuracies.push({
                      batchId: batch.batchId,
                      batchName: batch.batchName,
                      className: batch.className,
                      accuracy: batch.accuracy,
                      teacherId: teacher.teacherId,
                      teacherName: teacher.teacher.name,
                    });
                  });
                }
              });
            }
          });
        });

        // Filter by class and batch
        if (selectedClass !== 'all') {
          const classData = mockInstituteClasses.find((c) => c.id === selectedClass);
          if (classData) {
            batchAccuracies = batchAccuracies.filter((b) => b.className === classData.name);
          }
        }

        if (selectedBatch !== 'all') {
          batchAccuracies = batchAccuracies.filter((b) => b.batchId === selectedBatch);
        }

        // Calculate filtered accuracy
        const filteredAccuracy = batchAccuracies.length > 0
          ? batchAccuracies.reduce((sum, b) => sum + b.accuracy, 0) / batchAccuracies.length
          : chapter.accuracy;

        return {
          ...chapter,
          filteredAccuracy,
          batchBreakdown: batchAccuracies,
        };
      });

      // Filter out chapters with no data for selected filters
      const validChapters = chaptersWithBatchData.filter(
        (ch) => ch.batchBreakdown.length > 0 || (selectedClass === 'all' && selectedBatch === 'all')
      );

      // Calculate subject-level accuracy based on filtered chapters
      const subjectAccuracy = validChapters.length > 0
        ? validChapters.reduce((sum, ch) => sum + ch.filteredAccuracy, 0) / validChapters.length
        : subject.overallAccuracy;

      return {
        ...subject,
        filteredAccuracy: subjectAccuracy,
        filteredChapters: validChapters.length > 0 ? validChapters : chaptersWithBatchData,
      };
    });
  }, [selectedClass, selectedBatch]);

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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {mockInstituteClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedBatch} 
                onValueChange={setSelectedBatch}
                disabled={availableBatches.length === 0}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedClass !== 'all' || selectedBatch !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedClass('all');
                    setSelectedBatch('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <InstituteInsightCard
        type="info"
        title="What This Shows"
        message={
          selectedClass !== 'all' || selectedBatch !== 'all'
            ? `Showing subject performance filtered by ${selectedClass !== 'all' ? mockInstituteClasses.find(c => c.id === selectedClass)?.name : 'all classes'}${selectedBatch !== 'all' ? ` → ${availableBatches.find(b => b.id === selectedBatch)?.name}` : ''}. Teacher attribution shows who teaches each chapter.`
            : 'Subject health is aggregated across all teachers and classes. Use filters above to drill down to specific class or section performance.'
        }
      />

      {/* Subject Cards */}
      <div className="space-y-4">
        {filteredSubjectData.map((subject) => (
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
                          {subject.teacherCount} teachers • {subject.classCount} classes • {subject.filteredChapters.length} chapters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{subject.filteredAccuracy.toFixed(1)}%</p>
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
                    message={generateSubjectInsight(subject.name, subject.filteredAccuracy, subject.trend, subject.filteredChapters.length)}
                  />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Chapter Breakdown</h4>
                    {subject.filteredChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{chapter.name}</span>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full capitalize',
                                getPerformanceBgColor(getPerformanceStatus(chapter.filteredAccuracy))
                              )}>
                                {getPerformanceStatus(chapter.filteredAccuracy)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last activity: {formatDate(chapter.lastActivityDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">{chapter.filteredAccuracy.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">{chapter.totalQuestions} questions</p>
                            </div>
                            <TrendBadge trend={chapter.trend} showLabel={false} size="sm" />
                            <Link to={`/teacher/reports/chapter-analytics/${chapter.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Batch Breakdown & Teacher Attribution */}
                        {chapter.batchBreakdown && chapter.batchBreakdown.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              {selectedBatch !== 'all' ? 'Teacher & Performance' : 'Section Performance & Teachers'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {chapter.batchBreakdown.map((batch, idx) => (
                                <div key={`${batch.batchId}-${idx}`} className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{batch.batchName}</p>
                                    <Link 
                                      to={`/institute/teachers/${batch.teacherId}`}
                                      className="text-primary hover:underline flex items-center gap-1"
                                    >
                                      <User className="h-3 w-3" />
                                      {batch.teacherName}
                                    </Link>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">{batch.accuracy.toFixed(1)}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
