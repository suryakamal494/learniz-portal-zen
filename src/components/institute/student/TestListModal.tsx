import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StudentTestResult, ChapterTestType } from '@/types/studentReport';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tests: StudentTestResult[];
  testType: ChapterTestType;
  chapterName: string;
}

const ITEMS_PER_PAGE = 8;

export const TestListModal: React.FC<TestListModalProps> = ({
  open,
  onOpenChange,
  tests,
  testType,
  chapterName
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const totalPages = Math.ceil(tests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTests = tests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTypeLabel = (type: ChapterTestType) => {
    switch (type) {
      case 'live_assessment': return 'Live Assessments';
      case 'lms_quiz': return 'LMS Quizzes';
      case 'assignment': return 'Assignments';
      default: return 'Tests';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-50';
    if (accuracy >= 40) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getComparisonBadge = (accuracy: number, classAvg: number) => {
    const diff = accuracy - classAvg;
    if (diff >= 3) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{diff.toFixed(1)}%
        </Badge>
      );
    }
    if (diff <= -3) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
          <TrendingDown className="h-3 w-3 mr-1" />
          {diff.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
        At avg
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <span>{getTypeLabel(testType)}</span>
            <Badge variant="secondary">{tests.length} tests</Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{chapterName}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-160px)]">
          <div className="px-4 py-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Test Name</TableHead>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[80px] text-center">Score</TableHead>
                  <TableHead className="w-[100px] text-center">vs Class</TableHead>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTests.map((test) => (
                  <React.Fragment key={test.testId}>
                    <TableRow 
                      className={cn(
                        "cursor-pointer transition-colors",
                        expandedTest === test.testId ? "bg-muted/50" : "hover:bg-muted/30"
                      )}
                      onClick={() => setExpandedTest(
                        expandedTest === test.testId ? null : test.testId
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1 h-8 rounded-full", getAccuracyColor(test.accuracy).replace('text-', 'bg-'))} />
                          <span className="truncate max-w-[160px]">{test.testName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(test.testDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("font-bold", getAccuracyColor(test.accuracy))}>
                          {test.accuracy.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getComparisonBadge(test.accuracy, test.classAverage)}
                      </TableCell>
                      <TableCell className="text-center">
                        {test.rank && test.totalStudents ? (
                          <div className="flex items-center justify-center gap-1">
                            <Award className="h-3 w-3 text-amber-500" />
                            <span className="text-sm">
                              {test.rank}/{test.totalStudents}
                            </span>
                          </div>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {expandedTest === test.testId && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={5}>
                          <div className="py-2 grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Total Questions</div>
                              <div className="text-lg font-semibold">{test.totalQuestions}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Correct</div>
                              <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {test.correct}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Wrong</div>
                              <div className="text-lg font-semibold text-red-600 flex items-center justify-center gap-1">
                                <XCircle className="h-4 w-4" />
                                {test.wrong}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Skipped</div>
                              <div className="text-lg font-semibold text-gray-500 flex items-center justify-center gap-1">
                                <MinusCircle className="h-4 w-4" />
                                {test.skipped}
                              </div>
                            </div>
                          </div>
                          {test.timeTaken && (
                            <div className="text-center pt-2 border-t">
                              <span className="text-xs text-muted-foreground">Time taken: </span>
                              <span className="text-sm font-medium">{test.timeTaken}</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, tests.length)} of {tests.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
