import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, GraduationCap, Download, ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { MetricCard } from '@/components/institute/MetricCard';
import { AttentionAreasCard } from '@/components/institute/AttentionAreasCard';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { mockInstituteSnapshot, mockInstituteClasses } from '@/data/mockInstituteData';
import { TimeFilterOption } from '@/types/instituteAnalytics';

export default function InstituteSnapshotPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const snapshot = mockInstituteSnapshot;

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
          subtitle={`${mockInstituteClasses.reduce((acc, cls) => acc + cls.batches.length, 0)} batches`}
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

      {/* Class Cards - Main Focus */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Classes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a class to view detailed performance by subject and batch
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
                            {subject.accuracy.toFixed(1)}%
                          </span>
                          <TrendBadge trend={subject.trend} size="sm" showLabel={false} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Batches Preview */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Batches</p>
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

      {/* Attention Areas - Keep with class context */}
      <AttentionAreasCard areas={snapshot.attentionAreas} />

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
