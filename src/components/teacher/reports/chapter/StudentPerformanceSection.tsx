import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentChapterPerformance } from '@/types/chapterReport';
import { StudentDetailModal } from './StudentDetailModal';
import { 
  getTrendIcon, 
  getMasteryLabel, 
  getMasteryColor,
  formatComparison,
  getComparisonColor
} from '@/utils/chapterAnalyticsUtils';
import { ChevronDown, ChevronUp, Eye, ArrowUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface StudentPerformanceSectionProps {
  students: StudentChapterPerformance[];
  classAverage: number;
  defaultOpen?: boolean;
}

type SortField = 'name' | 'accuracy' | 'trend' | 'comparison';

export function StudentPerformanceSection({ students, classAverage, defaultOpen = true }: StudentPerformanceSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [sortField, setSortField] = useState<SortField>('accuracy');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentChapterPerformance | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.studentName.localeCompare(b.studentName);
        break;
      case 'accuracy':
        comparison = a.chapterAccuracy - b.chapterAccuracy;
        break;
      case 'trend':
        const trendOrder = { improving: 3, stable: 2, declining: 1, not_enough_data: 0 };
        comparison = trendOrder[a.trend] - trendOrder[b.trend];
        break;
      case 'comparison':
        comparison = a.comparisonWithClass - b.comparisonWithClass;
        break;
    }
    return sortAsc ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 hover:bg-muted"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader className="pb-2">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-left">
                  👨‍🎓 Individual Student Performance
                </CardTitle>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CollapsibleTrigger>
            <p className="text-sm text-muted-foreground text-left">
              See how each student is performing in this chapter. Click "View" for detailed breakdown.
            </p>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                Class Average: <span className="font-bold text-foreground">{classAverage.toFixed(1)}%</span>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <SortButton field="name">Student</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="accuracy">Accuracy</SortButton>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <SortButton field="trend">Trend</SortButton>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <SortButton field="comparison">vs Class</SortButton>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Mastery</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.studentName}</div>
                            <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'font-bold',
                            student.chapterAccuracy >= 70 ? 'text-green-600' :
                            student.chapterAccuracy >= 40 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {student.chapterAccuracy.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="flex items-center gap-1">
                            {getTrendIcon(student.trend)}
                            <span className="text-sm capitalize">{student.trend.replace('_', ' ')}</span>
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className={getComparisonColor(student.comparisonWithClass)}>
                            {formatComparison(student.comparisonWithClass)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className={getMasteryColor(student.masteryLevel)}>
                            {getMasteryLabel(student.masteryLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          classAverage={classAverage}
          open={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
}
