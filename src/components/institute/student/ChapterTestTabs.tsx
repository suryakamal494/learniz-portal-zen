import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentTestResult, ChapterTestType } from '@/types/studentReport';
import { 
  FileText, 
  BookOpen, 
  ClipboardList,
  Calendar,
  Clock,
  Award,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterTestTabsProps {
  testsByType: {
    liveAssessments: StudentTestResult[];
    lmsQuizzes: StudentTestResult[];
    assignments: StudentTestResult[];
  };
}

export const ChapterTestTabs: React.FC<ChapterTestTabsProps> = ({ testsByType }) => {
  const getTabData = () => [
    { 
      id: 'live_assessment' as ChapterTestType, 
      label: 'Live Assessment', 
      icon: FileText,
      tests: testsByType.liveAssessments,
      color: 'text-blue-600'
    },
    { 
      id: 'lms_quiz' as ChapterTestType, 
      label: 'LMS Quiz', 
      icon: BookOpen,
      tests: testsByType.lmsQuizzes,
      color: 'text-purple-600'
    },
    { 
      id: 'assignment' as ChapterTestType, 
      label: 'Assignments', 
      icon: ClipboardList,
      tests: testsByType.assignments,
      color: 'text-green-600'
    },
  ];

  const tabs = getTabData();

  const getComparisonBadge = (accuracy: number, classAvg: number) => {
    const diff = accuracy - classAvg;
    if (diff >= 3) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{diff.toFixed(1)}% vs class
        </Badge>
      );
    }
    if (diff <= -3) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
          <TrendingDown className="h-3 w-3 mr-1" />
          {diff.toFixed(1)}% vs class
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
        At class avg
      </Badge>
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTestCard = (test: StudentTestResult) => (
    <Card key={test.testId} className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{test.testName}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(test.testDate)}
              </span>
              {test.timeTaken && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {test.timeTaken}
                </span>
              )}
            </div>
          </div>
          {getComparisonBadge(test.accuracy, test.classAverage)}
        </div>

        {/* Score Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className={cn("text-lg font-bold", getAccuracyColor(test.accuracy))}>
              {test.accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", getProgressColor(test.accuracy))}
              style={{ width: `${test.accuracy}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t">
          <div>
            <div className="text-lg font-semibold text-foreground">{test.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {test.correct}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600 flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4" />
              {test.wrong}
            </div>
            <div className="text-xs text-muted-foreground">Wrong</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-500 flex items-center justify-center gap-1">
              <MinusCircle className="h-4 w-4" />
              {test.skipped}
            </div>
            <div className="text-xs text-muted-foreground">Skipped</div>
          </div>
        </div>

        {/* Rank (if available) */}
        {test.rank && test.totalStudents && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-sm">
              Rank: <span className="font-semibold">{test.rank}</span>
              <span className="text-muted-foreground">/{test.totalStudents}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (testType: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>No {testType.toLowerCase()} tests available for this chapter</p>
    </div>
  );

  const getTabStyles = (tabId: ChapterTestType) => {
    switch (tabId) {
      case 'live_assessment':
        return {
          base: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
          active: 'data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500',
          badge: 'bg-blue-100 text-blue-600 data-[state=active]:bg-blue-400 data-[state=active]:text-white'
        };
      case 'lms_quiz':
        return {
          base: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
          active: 'data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500',
          badge: 'bg-purple-100 text-purple-600 data-[state=active]:bg-purple-400 data-[state=active]:text-white'
        };
      case 'assignment':
        return {
          base: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
          active: 'data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500',
          badge: 'bg-green-100 text-green-600 data-[state=active]:bg-green-400 data-[state=active]:text-white'
        };
      default:
        return {
          base: 'border-gray-200 bg-gray-50 text-gray-700',
          active: 'data-[state=active]:bg-gray-500 data-[state=active]:text-white',
          badge: 'bg-gray-100 text-gray-600'
        };
    }
  };

  return (
    <Tabs defaultValue="live_assessment" className="w-full">
      <TabsList className="w-full justify-start gap-2 h-auto flex-wrap bg-transparent p-0">
        {tabs.map((tab) => {
          const styles = getTabStyles(tab.id);
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={cn(
                "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all shadow-sm",
                styles.base,
                styles.active
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">{tab.label}</span>
              <span className="sm:hidden font-medium">{tab.label.split(' ')[0]}</span>
              <Badge variant="secondary" className={cn("ml-1 h-5 text-xs font-semibold", styles.badge)}>
                {tab.tests.length}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.tests.length > 0 ? (
            <div className="space-y-3">
              {tab.tests.map(renderTestCard)}
            </div>
          ) : (
            renderEmptyState(tab.label)
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
