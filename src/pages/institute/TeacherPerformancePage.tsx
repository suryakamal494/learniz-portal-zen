import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeFilterBar } from '@/components/institute/TimeFilterBar';
import { TrendBadge } from '@/components/institute/TrendBadge';
import { PerformanceBarCard } from '@/components/institute/PerformanceBarCard';
import { InstituteInsightCard } from '@/components/institute/InstituteInsightCard';
import { mockTeacherPerformance, mockInstituteSubjects } from '@/data/mockInstituteData';
import { generateTeacherInsight, getSubjectBgClass } from '@/utils/instituteAnalyticsUtils';
import { TimeFilterOption } from '@/types/instituteAnalytics';

export default function TeacherPerformancePage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all-time');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const filteredTeachers = mockTeacherPerformance.filter((tp) => {
    const matchesSearch = tp.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || tp.teacher.subjects.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Teacher Performance
          </h1>
          <p className="text-muted-foreground mt-1">Understand teaching outcomes through student learning data</p>
        </div>
        <TimeFilterBar value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Info Card */}
      <InstituteInsightCard
        type="info"
        title="How to Read This Report"
        message="Teacher performance is measured through student learning outcomes, not direct evaluation. Each teacher's data reflects how well students are grasping concepts in their classes. This supports meaningful academic discussions, not judgments."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {mockInstituteSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teacher Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTeachers.map((tp) => (
          <Link key={tp.teacherId} to={`/institute/teachers/${tp.teacherId}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{tp.teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{tp.teacher.email}</p>
                  </div>
                  <TrendBadge trend={tp.trend} />
                </div>

                <PerformanceBarCard
                  label="Student Accuracy"
                  value={tp.overallAccuracy}
                  trend={tp.trend}
                  subtitle={`${tp.totalStudents} students • ${tp.totalQuestions.toLocaleString()} questions`}
                />

                <div className="flex flex-wrap gap-2 mt-4">
                  {tp.teacher.subjects.map((subjectId) => (
                    <span key={subjectId} className={`text-xs px-2 py-1 rounded-full ${getSubjectBgClass(subjectId)}`}>
                      {mockInstituteSubjects.find((s) => s.id === subjectId)?.name || subjectId}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {tp.teacher.classes.map((cls) => (
                    <span key={cls}>{cls}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {tp.subjectPerformance.reduce((acc, sp) => acc + sp.chapters.length, 0)} chapters taught
                  </p>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No teachers found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
