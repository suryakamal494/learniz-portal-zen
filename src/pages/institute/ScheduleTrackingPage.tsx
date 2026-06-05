
import React, { useState, useMemo } from 'react';
import { Filter, RefreshCw, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleOverviewCards } from '@/components/institute/schedule/ScheduleOverviewCards';
import { BatchWiseTracking } from '@/components/institute/schedule/BatchWiseTracking';
import { TeacherWiseTracking } from '@/components/institute/schedule/TeacherWiseTracking';
import { 
  mockTeacherScheduleWithStatus,
  calculateScheduleStats,
  calculateClassBatchSubjectProgress,
  calculateTeacherClassProgress
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
  const classProgress = useMemo(() => calculateClassBatchSubjectProgress(filteredData), [filteredData]);
  const teacherProgress = useMemo(() => calculateTeacherClassProgress(filteredData), [filteredData]);

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
            <div className="w-full sm:w-48">
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
            <div className="w-full sm:w-48">
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

      {/* Tabbed Content */}
      <Tabs defaultValue="section-wise" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="section-wise" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Section-wise</span>
            <span className="sm:hidden">Sections</span>
          </TabsTrigger>
          <TabsTrigger value="teacher-wise" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Teacher-wise</span>
            <span className="sm:hidden">Teachers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="section-wise" className="mt-4">
          <BatchWiseTracking classProgress={classProgress} />
        </TabsContent>

        <TabsContent value="teacher-wise" className="mt-4">
          <TeacherWiseTracking teacherProgress={teacherProgress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
