import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StudentGrandTestResult } from '@/types/studentReport';
import { 
  Trophy, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Award,
  Users,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GrandTestCardProps {
  grandTest: StudentGrandTestResult;
  defaultOpen?: boolean;
}

export const GrandTestCard: React.FC<GrandTestCardProps> = ({ grandTest, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const getBandColor = (band: string) => {
    switch (band) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'at_risk':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBandLabel = (band: string) => {
    switch (band) {
      case 'high':
        return 'High Performer';
      case 'medium':
        return 'Medium';
      case 'at_risk':
        return 'At Risk';
      default:
        return band;
    }
  };

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'half-yearly':
        return 'Half-Yearly';
      case 'annual':
        return 'Annual';
      case 'term':
        return 'Term';
      case 'quarterly':
        return 'Quarterly';
      default:
        return type;
    }
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
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubjectColor = (subjectId: string): string => {
    const colors: Record<string, string> = {
      physics: 'bg-blue-100 text-blue-700',
      chemistry: 'bg-purple-100 text-purple-700',
      mathematics: 'bg-green-100 text-green-700',
      biology: 'bg-emerald-100 text-emerald-700',
      english: 'bg-orange-100 text-orange-700',
      social: 'bg-amber-100 text-amber-700',
    };
    return colors[subjectId] || 'bg-gray-100 text-gray-700';
  };

  const getBandCardStyles = (band: string) => {
    switch (band) {
      case 'high':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent';
      case 'medium':
        return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent';
      case 'at_risk':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getTestTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'half-yearly':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'annual':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'term':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'quarterly':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={cn("overflow-hidden", getBandCardStyles(grandTest.band))}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Icon & Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {grandTest.testName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={cn("text-xs", getTestTypeBadgeColor(grandTest.testType))}>
                      {getTestTypeLabel(grandTest.testType)}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(grandTest.testDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats & Toggle */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={cn("text-xl font-bold", getAccuracyColor(grandTest.accuracy))}>
                    {grandTest.accuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {grandTest.correct}/{grandTest.totalQuestions}
                  </div>
                </div>
                <Badge className={cn("shrink-0", getBandColor(grandTest.band))}>
                  {getBandLabel(grandTest.band)}
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t">
            {/* Overall Progress */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span className="text-sm font-medium">{grandTest.accuracy}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(grandTest.accuracy))}
                  style={{ width: `${grandTest.accuracy}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{grandTest.totalQuestions}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {grandTest.correct}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600 flex items-center justify-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {grandTest.wrong}
                </div>
                <div className="text-xs text-muted-foreground">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-500 flex items-center justify-center gap-1">
                  <MinusCircle className="h-4 w-4" />
                  {grandTest.skipped}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
            </div>

            {/* Rank */}
            {grandTest.rank && (
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-lg mb-4">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="text-sm">
                  Rank: <span className="font-bold text-lg">{grandTest.rank}</span>
                  <span className="text-muted-foreground"> / {grandTest.totalStudents} students</span>
                </span>
              </div>
            )}

            {/* Subject-wise Performance */}
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Subject-wise Performance</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {grandTest.subjectWise.map((subject) => (
                  <div 
                    key={subject.subjectId}
                    className={cn(
                      "p-3 rounded-lg border",
                      getSubjectColor(subject.subjectId)
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{subject.subjectName}</span>
                      <span className="font-bold">{subject.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs opacity-80">
                      {subject.correct}/{subject.totalQuestions} correct • {subject.wrong} wrong • {subject.skipped} skipped
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
