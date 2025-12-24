
import React, { useState, useMemo } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleOverviewCards } from '@/components/institute/schedule/ScheduleOverviewCards';
import { BatchProgressTable } from '@/components/institute/schedule/BatchProgressTable';
import { ChapterProgressSection } from '@/components/institute/schedule/ChapterProgressSection';
import { TeacherProgressGrid } from '@/components/institute/schedule/TeacherProgressGrid';
import { 
  mockTeacherScheduleWithStatus,
  calculateScheduleStats,
  calculateBatchProgress,
  calculateChapterProgress,
  calculateTeacherProgress
} from '@/data/mockTeachingProgress';

export default function ScheduleTrackingPage() {
  const [classFilter, setClassFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('this-month');

  // Get unique classes for filter
  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(mockTeacherScheduleWithStatus.map(c => c.class))).sort();
  }, []);

  // Filter data based on selection
  const filteredData = useMemo(() => {
    let data = mockTeacherScheduleWithStatus;
    
    if (classFilter !== 'all') {
      data = data.filter(c => c.class === classFilter);
    }
    
    return data;
  }, [classFilter]);

  // Calculate all stats from filtered data
  const stats = useMemo(() => calculateScheduleStats(filteredData), [filteredData]);
  const batchProgress = useMemo(() => calculateBatchProgress(filteredData), [filteredData]);
  const chapterProgress = useMemo(() => calculateChapterProgress(filteredData), [filteredData]);
  const teacherProgress = useMemo(() => calculateTeacherProgress(filteredData), [filteredData]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule Tracking</h1>
          <p className="text-muted-foreground">
            Real-time view of teaching progress across all classes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <ScheduleOverviewCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Batch Progress */}
        <BatchProgressTable batchProgress={batchProgress} />
        
        {/* Chapter Progress */}
        <ChapterProgressSection chapterProgress={chapterProgress} />
      </div>

      {/* Teacher Progress */}
      <TeacherProgressGrid teacherProgress={teacherProgress} />
    </div>
  );
}
