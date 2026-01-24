import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ReferenceLine, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { StudentSubjectPerformance, StudentOverview } from '@/types/studentReport';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentPerformanceOverviewProps {
  student: StudentOverview;
  subjects: StudentSubjectPerformance[];
}

export const StudentPerformanceOverview: React.FC<StudentPerformanceOverviewProps> = ({ 
  student, 
  subjects 
}) => {
  // Calculate insights
  const subjectsAboveAvg = subjects.filter(s => s.overallAccuracy > s.classAverage).length;
  const chaptersNeedingWork = subjects.flatMap(s => 
    s.chapters.filter(c => c.overallAccuracy < 40)
  );
  const chaptersStrong = subjects.flatMap(s => 
    s.chapters.filter(c => c.overallAccuracy >= 70)
  );
  
  // Calculate overall trend
  const getOverallTrend = () => {
    const improvingCount = subjects.flatMap(s => s.chapters).filter(c => c.trend === 'improving').length;
    const decliningCount = subjects.flatMap(s => s.chapters).filter(c => c.trend === 'declining').length;
    if (improvingCount > decliningCount + 2) return 'improving';
    if (decliningCount > improvingCount + 2) return 'declining';
    return 'stable';
  };
  
  const overallTrend = getOverallTrend();
  
  // Prepare chart data
  const chartData = subjects.map(s => ({
    name: s.subjectName.substring(0, 4),
    fullName: s.subjectName,
    accuracy: s.overallAccuracy,
    classAvg: s.classAverage,
    diff: s.overallAccuracy - s.classAverage,
    color: s.subjectColor
  }));
  
  const chartConfig = {
    accuracy: { label: 'Your Score', color: 'hsl(var(--primary))' },
    classAvg: { label: 'Class Avg', color: 'hsl(var(--muted-foreground))' }
  };

  const getBarColor = (diff: number) => {
    if (diff >= 5) return '#22c55e'; // green
    if (diff >= 0) return '#84cc16'; // lime
    if (diff >= -5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getTrendIcon = () => {
    switch (overallTrend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendLabel = () => {
    switch (overallTrend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  };

  const getTrendBg = () => {
    switch (overallTrend) {
      case 'improving': return 'bg-green-50 border-green-200';
      case 'declining': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="mb-6 border-t-4 border-t-primary/60 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick glance at how {student.name.split(' ')[0]} is performing across subjects
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Quick Insight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className={cn("border", subjectsAboveAvg > subjects.length / 2 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200")}>
            <CardContent className="p-3 text-center">
              <div className={cn("text-2xl font-bold", subjectsAboveAvg > subjects.length / 2 ? "text-green-600" : "text-amber-600")}>
                {subjectsAboveAvg}/{subjects.length}
              </div>
              <div className="text-xs text-muted-foreground">Subjects Above Avg</div>
            </CardContent>
          </Card>
          
          <Card className={cn("border", chaptersNeedingWork.length === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
            <CardContent className="p-3 text-center">
              <div className={cn("text-2xl font-bold", chaptersNeedingWork.length === 0 ? "text-green-600" : "text-red-600")}>
                {chaptersNeedingWork.length}
              </div>
              <div className="text-xs text-muted-foreground">Chapters Need Work</div>
            </CardContent>
          </Card>
          
          <Card className="border bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chaptersStrong.length}
              </div>
              <div className="text-xs text-muted-foreground">Strong Chapters</div>
            </CardContent>
          </Card>
          
          <Card className={cn("border", getTrendBg())}>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon()}
                <span className={cn(
                  "text-lg font-bold",
                  overallTrend === 'improving' ? 'text-green-600' : 
                  overallTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                )}>
                  {getTrendLabel()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Overall Trend</div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Comparison Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Subject Performance vs Class Average
          </h4>
          <div className="h-48 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ left: 0, right: 40, top: 5, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={45}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-2 text-sm">
                        <p className="font-medium">{data.fullName}</p>
                        <p className="text-muted-foreground">
                          Score: <span className="font-medium text-foreground">{data.accuracy.toFixed(1)}%</span>
                        </p>
                        <p className="text-muted-foreground">
                          Class Avg: <span className="font-medium text-foreground">{data.classAvg.toFixed(1)}%</span>
                        </p>
                        <p className={cn(
                          "font-medium",
                          data.diff >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {data.diff >= 0 ? '+' : ''}{data.diff.toFixed(1)}% vs class
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={student.classAverage} stroke="#9ca3af" strokeDasharray="3 3" />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.diff)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm" /> Above Avg
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded-sm" /> At Avg
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" /> Below Avg
            </span>
            <span className="flex items-center gap-1">
              <div className="w-6 h-0 border-t border-dashed border-gray-400" /> Class Avg
            </span>
          </div>
        </div>

        {/* Attention Areas */}
        {chaptersNeedingWork.length > 0 && (
          <div className="bg-red-50/50 border border-red-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Chapters Needing Attention ({chaptersNeedingWork.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {chaptersNeedingWork.slice(0, 5).map((ch, idx) => {
                const subject = subjects.find(s => s.chapters.some(c => c.chapterId === ch.chapterId));
                return (
                  <Badge key={idx} variant="outline" className="bg-white border-red-200 text-red-700">
                    {subject?.subjectName.substring(0, 3)} • {ch.chapterName.substring(0, 15)}... ({ch.overallAccuracy.toFixed(0)}%)
                  </Badge>
                );
              })}
              {chaptersNeedingWork.length > 5 && (
                <Badge variant="outline" className="bg-white border-red-200 text-red-600">
                  +{chaptersNeedingWork.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Strong Areas */}
        {chaptersStrong.length > 0 && (
          <div className="bg-green-50/50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Strong Chapters ({chaptersStrong.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {chaptersStrong.slice(0, 5).map((ch, idx) => {
                const subject = subjects.find(s => s.chapters.some(c => c.chapterId === ch.chapterId));
                return (
                  <Badge key={idx} variant="outline" className="bg-white border-green-200 text-green-700">
                    {subject?.subjectName.substring(0, 3)} • {ch.chapterName.substring(0, 15)}... ({ch.overallAccuracy.toFixed(0)}%)
                  </Badge>
                );
              })}
              {chaptersStrong.length > 5 && (
                <Badge variant="outline" className="bg-white border-green-200 text-green-600">
                  +{chaptersStrong.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
