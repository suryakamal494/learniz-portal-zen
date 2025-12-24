
import React from 'react';
import { User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TeacherProgress } from '@/types/teachingProgress';

interface TeacherProgressGridProps {
  teacherProgress: TeacherProgress[];
}

export function TeacherProgressGrid({ teacherProgress }: TeacherProgressGridProps) {
  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge className="bg-green-500/10 text-green-600 border-0">{rate}%</Badge>;
    }
    if (rate >= 50) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-0">{rate}%</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-600 border-0">{rate}%</Badge>;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Teacher-wise Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherProgress.map(teacher => (
            <div 
              key={teacher.teacherId}
              className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{teacher.teacherName}</div>
                    <div className="text-sm text-muted-foreground">
                      {teacher.assignedClasses} classes assigned
                    </div>
                  </div>
                </div>
                {getCompletionBadge(teacher.completionRate)}
              </div>
              
              <Progress value={teacher.completionRate} className="h-2 mb-3" />
              
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {teacher.completedClasses} done
                </div>
                {teacher.partialClasses > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {teacher.partialClasses} partial
                  </div>
                )}
                {teacher.notTakenClasses > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3.5 w-3.5" />
                    {teacher.notTakenClasses} missed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
