import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudentOverview } from '@/types/studentReport';
import { User, TrendingUp, TrendingDown, Minus, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: StudentOverview;
  classId: string;
  sectionId: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, classId, sectionId }) => {
  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'above_average':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'below_average':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'above_average':
        return <TrendingUp className="h-3.5 w-3.5" />;
      case 'below_average':
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getPerformanceLabel = (status: string, accuracy: number, classAvg: number) => {
    const diff = Math.abs(accuracy - classAvg).toFixed(1);
    switch (status) {
      case 'above_average':
        return `+${diff}% above avg`;
      case 'below_average':
        return `-${diff}% below avg`;
      default:
        return 'At average';
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatLastActive = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link to={`/institute/students/${classId}/${sectionId}/${student.studentId}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30 cursor-pointer h-full">
        <CardContent className="p-4 sm:p-5">
          {/* Header with name and roll */}
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {student.name}
              </h3>
              <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>

          {/* Accuracy Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-muted-foreground">Overall Accuracy</span>
              <span className="text-sm font-semibold">{student.overallAccuracy}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all", getProgressColor(student.overallAccuracy))}
                style={{ width: `${student.overallAccuracy}%` }}
              />
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                getPerformanceColor(student.performanceStatus)
              )}
            >
              {getPerformanceIcon(student.performanceStatus)}
              {getPerformanceLabel(student.performanceStatus, student.overallAccuracy, student.classAverage)}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
            <span>{student.subjectsCount} subjects • {student.testsAttempted} tests</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatLastActive(student.lastActive)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
