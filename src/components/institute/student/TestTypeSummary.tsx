import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentTestResult, ChapterTestType } from '@/types/studentReport';
import { 
  FileText, 
  BookOpen, 
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestTypeSummaryProps {
  testType: ChapterTestType;
  tests: StudentTestResult[];
  onViewAll: () => void;
}

export const TestTypeSummary: React.FC<TestTypeSummaryProps> = ({ 
  testType, 
  tests, 
  onViewAll 
}) => {
  if (tests.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No tests available</p>
      </div>
    );
  }

  const avgAccuracy = tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length;
  const bestTest = tests.reduce((best, t) => t.accuracy > best.accuracy ? t : best, tests[0]);
  const worstTest = tests.reduce((worst, t) => t.accuracy < worst.accuracy ? t : worst, tests[0]);
  
  // Calculate trend from recent tests
  const getTrend = () => {
    if (tests.length < 2) return 'stable';
    const recentAvg = tests.slice(0, Math.min(2, tests.length)).reduce((s, t) => s + t.accuracy, 0) / Math.min(2, tests.length);
    const olderAvg = tests.slice(-2).reduce((s, t) => s + t.accuracy, 0) / Math.min(2, tests.length);
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };
  
  const trend = getTrend();

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTypeConfig = (type: ChapterTestType) => {
    switch (type) {
      case 'live_assessment':
        return { 
          icon: FileText, 
          label: 'Live Assessments',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'lms_quiz':
        return { 
          icon: BookOpen, 
          label: 'LMS Quizzes',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600'
        };
      case 'assignment':
        return { 
          icon: ClipboardList, 
          label: 'Assignments',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      default:
        return { 
          icon: FileText, 
          label: 'Tests',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getTypeConfig(testType);
  const Icon = config.icon;

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  };

  return (
    <Card className={cn("border", config.bgColor, config.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{config.label}</h4>
              <p className="text-sm text-muted-foreground">{tests.length} tests completed</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 bg-white">
            {getTrendIcon()}
            {getTrendLabel()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-white/70 rounded-lg">
            <div className={cn("text-xl font-bold", getAccuracyColor(avgAccuracy))}>
              {avgAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
          <div className="text-center p-2 bg-white/70 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {bestTest.accuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
          <div className="text-center p-2 bg-white/70 rounded-lg">
            <div className={cn("text-xl font-bold", getAccuracyColor(worstTest.accuracy))}>
              {worstTest.accuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Lowest</div>
          </div>
        </div>

        {/* Best Test Highlight */}
        <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg mb-3">
          <Award className="h-4 w-4 text-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Best Performance</p>
            <p className="text-sm font-medium truncate">{bestTest.testName}</p>
          </div>
          <span className="text-sm font-bold text-green-600">{bestTest.accuracy.toFixed(0)}%</span>
        </div>

        {/* View All Button */}
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
          onClick={onViewAll}
        >
          View All {tests.length} Tests
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
