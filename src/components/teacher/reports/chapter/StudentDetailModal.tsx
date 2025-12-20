import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StudentChapterPerformance } from '@/types/chapterReport';
import { PerformanceBar } from './PerformanceBar';
import { 
  getTrendIcon, 
  getTrendLabel,
  getMasteryLabel, 
  getMasteryColor,
  formatComparison,
  getComparisonColor
} from '@/utils/chapterAnalyticsUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Target, TrendingUp, BarChart2 } from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentChapterPerformance;
  classAverage: number;
  open: boolean;
  onClose: () => void;
}

export function StudentDetailModal({ student, classAverage, open, onClose }: StudentDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {student.studentName}'s Chapter Performance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{student.chapterAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{student.skipPercentage.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Skip Rate</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Badge className={getMasteryColor(student.masteryLevel)}>
                {getMasteryLabel(student.masteryLevel)}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Mastery</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${getComparisonColor(student.comparisonWithClass)}`}>
                {student.comparisonWithClass > 0 ? '+' : ''}{student.comparisonWithClass.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">vs Class Avg</div>
            </div>
          </div>

          {/* Trend Information */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Performance Trend</h3>
              <span className="text-sm">
                {getTrendIcon(student.trend)} {getTrendLabel(student.trend)}
              </span>
            </div>
            
            {student.trendData.length >= 2 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="testName" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center bg-muted/30 rounded">
                <p className="text-sm text-muted-foreground">
                  Need more tests to show trend (attempted: {student.testsAttempted})
                </p>
              </div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Topic-Wise Performance</h3>
            </div>
            
            <div className="space-y-4">
              {student.topicPerformance.map((topic) => (
                <PerformanceBar
                  key={topic.topicId}
                  label={topic.topicName}
                  value={topic.accuracy}
                  category={topic.category}
                  showTrend={false}
                />
              ))}
            </div>
          </div>

          {/* Comparison with Class */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Comparison with Class</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Student</div>
                <div className="h-4 bg-primary rounded-full" style={{ width: `${Math.min(100, student.chapterAccuracy)}%` }} />
                <div className="text-sm font-bold mt-1">{student.chapterAccuracy.toFixed(1)}%</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Class Average</div>
                <div className="h-4 bg-muted-foreground/50 rounded-full" style={{ width: `${Math.min(100, classAverage)}%` }} />
                <div className="text-sm font-bold mt-1">{classAverage.toFixed(1)}%</div>
              </div>
            </div>
            
            <p className="text-sm mt-3">
              {student.comparisonWithClass > 5 && (
                <span className="text-green-600">
                  ✓ {student.studentName} is performing above the class average. Keep encouraging!
                </span>
              )}
              {student.comparisonWithClass < -5 && (
                <span className="text-red-600">
                  ⚠ {student.studentName} is below the class average. Consider providing additional support.
                </span>
              )}
              {student.comparisonWithClass >= -5 && student.comparisonWithClass <= 5 && (
                <span className="text-muted-foreground">
                  {student.studentName} is performing at the class average level.
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
