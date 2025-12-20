import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChapterAnalytics } from '@/types/chapterReport';
import { InsightCard } from './InsightCard';
import { generateStudentGroupInsight, getTrendIcon, getMasteryLabel, getMasteryColor } from '@/utils/chapterAnalyticsUtils';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, HelpCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StudentGroupingSectionProps {
  analytics: ChapterAnalytics;
  defaultOpen?: boolean;
}

export function StudentGroupingSection({ analytics, defaultOpen = true }: StudentGroupingSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const { studentGroups, totalStudents } = analytics;

  const groups = [
    {
      key: 'improving',
      label: 'Improving Students',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-700',
      students: studentGroups.improving.students,
      description: 'These students are showing consistent improvement. Keep encouraging them!'
    },
    {
      key: 'declining',
      label: 'Declining Students',
      icon: TrendingDown,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      students: studentGroups.declining.students,
      description: 'These students need attention. Their performance is dropping over time.'
    },
    {
      key: 'consistentlyLow',
      label: 'Need Support',
      icon: AlertTriangle,
      color: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      badgeColor: 'bg-amber-100 text-amber-700',
      students: studentGroups.consistentlyLow.students,
      description: 'These students consistently score below 40%. Consider remedial sessions.'
    },
    {
      key: 'notEnoughData',
      label: 'Not Enough Data',
      icon: HelpCircle,
      color: 'bg-muted border-border',
      iconColor: 'text-muted-foreground',
      badgeColor: 'bg-muted text-muted-foreground',
      students: studentGroups.notEnoughData.students,
      description: 'These students have attempted fewer than 2 tests. Need more data to classify.'
    },
  ];

  const insight = generateStudentGroupInsight(
    studentGroups.improving.students.length,
    studentGroups.declining.students.length,
    studentGroups.consistentlyLow.students.length,
    studentGroups.notEnoughData.students.length,
    totalStudents
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-left">
                👥 Student Grouping
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
          <p className="text-sm text-muted-foreground text-left">
            Students automatically grouped based on their performance patterns for quick diagnosis.
          </p>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Group Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(({ key, label, icon: Icon, color, iconColor, badgeColor, students, description }) => (
                <div key={key} className={`border rounded-lg p-4 ${color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                      <span className="font-semibold">{label}</span>
                    </div>
                    <Badge className={badgeColor}>
                      {students.length} students
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">{description}</p>
                  
                  {students.length > 0 ? (
                    <div className="space-y-2">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.studentId} className="flex items-center justify-between text-sm bg-background/80 rounded px-2 py-1">
                          <span>{student.studentName}</span>
                          <span className="font-medium">{student.chapterAccuracy.toFixed(0)}%</span>
                        </div>
                      ))}
                      {students.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{students.length - 5} more students
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No students in this group
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <InsightCard type={insight.type} title={insight.title} message={insight.message} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
