import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, BookOpen, GraduationCap, TrendingUp, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { MetricCard } from '@/components/institute/MetricCard';
import { AttentionAreasCard } from '@/components/institute/AttentionAreasCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { CollapsibleSection } from '@/components/institute/CollapsibleSection';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { mockInstituteSnapshot, mockInstituteTrend } from '@/data/mockInstituteData';
import { generateInstituteInsight, formatDate, getSubjectBgClass } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
            Institute Snapshot
          </h1>
          <p className="text-muted-foreground mt-1">Overall academic health at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeFilterBar value={timeFilter} onChange={setTimeFilter} />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Accuracy"
          value={`${snapshot.overallAccuracy.toFixed(1)}%`}
          trend={snapshot.overallTrend}
          icon={TrendingUp}
          iconColor="text-green-500"
          showPerformanceStatus
          accuracy={snapshot.overallAccuracy}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${snapshot.overallEngagement.toFixed(1)}%`}
          subtitle="Active participation"
          icon={Users}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Total Students"
          value={snapshot.totalStudents}
          subtitle={`${snapshot.totalTeachers} teachers`}
          icon={GraduationCap}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Questions Attempted"
          value={snapshot.totalQuestions.toLocaleString()}
          subtitle={`${snapshot.totalSubjects} subjects`}
          icon={BookOpen}
          iconColor="text-amber-500"
        />
      </div>

      {/* What This Means */}
      <InstituteInsightCard
        type="insight"
        title="What This Means"
        message={generateInstituteInsight(snapshot.overallAccuracy, snapshot.overallEngagement, snapshot.overallTrend)}
      />

      {/* Subject Performance */}
      <CollapsibleSection
        title="Subject-Wise Performance"
        whatThisShows="How each subject is performing across the entire institute. Click a subject to see detailed chapter analysis."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {snapshot.subjectSummary.map((subject) => (
            <Link
              key={subject.id}
              to={`/institute/subjects?subject=${subject.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-semibold">{subject.name}</span>
                    </div>
                    <TrendBadge trend={subject.trend} size="sm" />
                  </div>
                  <PerformanceBarCard
                    label="Accuracy"
                    value={subject.accuracy}
                    showStatus={false}
                  />
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{subject.chapterCount} chapters</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      {/* Trend Chart */}
      <CollapsibleSection
        title="Performance Trend"
        whatThisShows="How the institute's overall accuracy and engagement has changed over time."
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockInstituteTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Accuracy %" />
              <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} name="Engagement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      {/* Recently Active Chapters */}
      <CollapsibleSection
        title="Recently Active Chapters"
        whatThisShows="Chapters that had test activity in recent days. These represent current teaching focus areas."
      >
        <div className="space-y-2">
          {snapshot.recentlyActiveChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getSubjectBgClass(chapter.subjectId)}`}>
                  {chapter.subjectName}
                </span>
                <span className="font-medium">{chapter.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-sm">{chapter.accuracy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{formatDate(chapter.lastActivityDate)}</p>
                </div>
                <TrendBadge trend={chapter.trend} showLabel={false} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Attention Areas */}
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
        <Link to="/institute/classes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">Class Overview</p>
                <p className="text-sm text-muted-foreground">View by class</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
