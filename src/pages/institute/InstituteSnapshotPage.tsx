import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, GraduationCap, Download, ChevronRight, BookOpen, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { MetricCard } from '@/components/institute/MetricCard';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { mockInstituteSnapshot, mockInstituteClasses } from '@/data/mockInstituteData';
import { mockGrandTests } from '@/data/mockGrandTests';
import { mockCLRReports, calculateCLRSummary, getReportsBySignal } from '@/data/mockCLRData';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { formatNumber } from '@/utils/formatUtils';

export default function InstituteSnapshotPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const snapshot = mockInstituteSnapshot;
  
  // Get recent grand tests (completed ones)
  const recentGrandTests = mockGrandTests
    .filter(t => t.status === 'completed')
    .slice(0, 3);
  
  // Get CLR alerts (immediate review items)
  const clrSummary = calculateCLRSummary(mockCLRReports);
  const immediateReviewReports = getReportsBySignal(mockCLRReports, 'immediate-review');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Institute Overview
          </h1>
          <p className="text-muted-foreground mt-1">Navigate by class to view meaningful performance data</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeFilterBar value={timeFilter} onChange={setTimeFilter} />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={snapshot.totalStudents}
          subtitle="Across all classes"
          icon={GraduationCap}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Total Teachers"
          value={snapshot.totalTeachers}
          subtitle="Active faculty"
          icon={Users}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Total Classes"
          value={snapshot.totalClasses}
          subtitle={`${mockInstituteClasses.reduce((acc, cls) => acc + cls.sections.length, 0)} sections`}
          icon={BookOpen}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Questions Attempted"
          value={snapshot.totalQuestions.toLocaleString()}
          subtitle={`${snapshot.totalSubjects} subjects`}
          icon={GraduationCap}
          iconColor="text-amber-500"
        />
      </div>

      {/* Alerts Section - CLR Immediate Review */}
      {immediateReviewReports.length > 0 && (
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Classrooms Needing Immediate Review
              </CardTitle>
              <Link to="/institute/learning-response">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {immediateReviewReports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{report.chapter}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.className} • {report.batchName} • {report.subject}
                    </p>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    {report.accuracyTrend[report.accuracyTrend.length - 1]}% accuracy
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Grand Tests */}
      {recentGrandTests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Grand Tests
              </CardTitle>
              <Link to="/institute/grand-tests">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentGrandTests.map((test) => (
                <Link 
                  key={test.id} 
                  to={`/institute/grand-tests/${test.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.totalStudents} students
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'font-semibold',
                        test.overallAccuracy >= 70 ? 'text-green-600 dark:text-green-400' :
                        test.overallAccuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 
                        'text-red-600 dark:text-red-400'
                      )}>
                        {formatNumber(test.overallAccuracy)}%
                      </p>
                      <p className="text-xs text-muted-foreground">accuracy</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Cards - Main Focus */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Classes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a class to view detailed performance by subject and section
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInstituteClasses.map((classItem) => (
            <Link
              key={classItem.id}
              to={`/institute/classes?class=${classItem.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {classItem.name}
                    </CardTitle>
                    <TrendBadge trend={classItem.trend} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{classItem.totalStudents} students</span>
                    <span>•</span>
                    <span>{classItem.batches.length} batches</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Class Accuracy */}
                  <PerformanceBarCard
                    label="Class Accuracy"
                    value={classItem.overallAccuracy}
                    showStatus={true}
                    trend={classItem.trend}
                  />
                  
                  {/* Subject Performance for this class */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Subject Performance</p>
                    {classItem.subjectPerformance.map((subject) => (
                      <div key={subject.subjectId} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{subject.subjectName}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium',
                            subject.accuracy >= 70 ? 'text-green-600' :
                            subject.accuracy >= 50 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {formatNumber(subject.accuracy)}%
                          </span>
                          <TrendBadge trend={subject.trend} size="sm" showLabel={false} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Batches Preview */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {classItem.batches.map((batch) => (
                        <span
                          key={batch.id}
                          className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            batch.accuracy >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            batch.accuracy >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {batch.name}: {batch.accuracy.toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Details Link */}
                  <div className="flex items-center justify-end pt-2 text-sm text-primary">
                    <span>View Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/institute/teachers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Teacher Performance</p>
                <p className="text-sm text-muted-foreground">View by teacher</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/institute/subjects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold">Subject Health</p>
                <p className="text-sm text-muted-foreground">View by subject</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/institute/grand-tests">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">Grand Tests</p>
                <p className="text-sm text-muted-foreground">Institution-wide exams</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
