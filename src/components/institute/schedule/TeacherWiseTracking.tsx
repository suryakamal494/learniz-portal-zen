
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TeacherProgressEnhanced, TeacherClassBatchProgress, TeacherSubjectProgress } from '@/types/teachingProgress';

interface TeacherWiseTrackingProps {
  teacherProgress: TeacherProgressEnhanced[];
}

export function TeacherWiseTracking({ teacherProgress }: TeacherWiseTrackingProps) {
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const [expandedClassBatches, setExpandedClassBatches] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const toggleSet = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setFn(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Physics': { bg: 'bg-blue-500/10', text: 'text-blue-600' },
      'Mathematics': { bg: 'bg-purple-500/10', text: 'text-purple-600' },
      'Chemistry': { bg: 'bg-green-500/10', text: 'text-green-600' },
      'Biology': { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
      'English': { bg: 'bg-amber-500/10', text: 'text-amber-600' },
      'Accountancy': { bg: 'bg-rose-500/10', text: 'text-rose-600' }
    };
    return colors[subject] || { bg: 'bg-muted', text: 'text-muted-foreground' };
  };

  if (teacherProgress.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No teacher data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {teacherProgress.map(teacher => {
        const isTeacherExpanded = expandedTeachers.has(teacher.teacherId);
        const completionRate = getCompletionPercentage(teacher.completedHours, teacher.totalHours);
        const totalSessions = teacher.sessionsCompleted + teacher.sessionsPartial + teacher.sessionsMissed;

        return (
          <Card key={teacher.teacherId} className="bg-card border-border overflow-hidden">
            <Collapsible 
              open={isTeacherExpanded} 
              onOpenChange={() => toggleSet(expandedTeachers, setExpandedTeachers, teacher.teacherId)}
            >
              {/* Teacher Header */}
              <CollapsibleTrigger className="w-full">
                <div className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{teacher.teacherName}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.classBatches.length} class-batches
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacherExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {teacher.completedHours.toFixed(1)}h
                        </span>
                        <span className="text-muted-foreground">
                          / {teacher.totalHours.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={completionRate >= 70 ? 'text-green-600 border-green-500/30' : 
                                 completionRate >= 40 ? 'text-amber-600 border-amber-500/30' : 
                                 'text-red-600 border-red-500/30'}
                    >
                      {completionRate}%
                    </Badge>
                  </div>

                  <Progress value={completionRate} className="h-2 mb-3" />

                  {/* Session Stats */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-green-600">{teacher.sessionsCompleted} completed</span>
                    {teacher.sessionsPartial > 0 && (
                      <span className="text-amber-600">{teacher.sessionsPartial} partial</span>
                    )}
                    {teacher.sessionsMissed > 0 && (
                      <span className="text-red-600">{teacher.sessionsMissed} missed</span>
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Expanded Content */}
              <CollapsibleContent>
                <div className="border-t border-border bg-muted/20">
                  {teacher.classBatches.map(classBatch => {
                    const classBatchKey = `${teacher.teacherId}-${classBatch.batchId}`;
                    const isClassBatchExpanded = expandedClassBatches.has(classBatchKey);

                    return (
                      <div key={classBatchKey} className="border-b border-border/50 last:border-b-0">
                        {/* Class/Batch Level */}
                        <Collapsible 
                          open={isClassBatchExpanded} 
                          onOpenChange={() => toggleSet(expandedClassBatches, setExpandedClassBatches, classBatchKey)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 pl-6 hover:bg-muted/40 transition-colors">
                              <div className="flex items-center gap-2">
                                {isClassBatchExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  {classBatch.className} - {classBatch.batchName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {classBatch.hoursSpent.toFixed(1)}h
                                </span>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="pl-10 pr-4 pb-3 space-y-2">
                              {classBatch.subjects.map(subject => {
                                const subjectKey = `${classBatchKey}-${subject.subjectId}`;
                                const isSubjectExpanded = expandedSubjects.has(subjectKey);
                                const subjectColors = getSubjectColor(subject.subjectName);

                                return (
                                  <div key={subject.subjectId}>
                                    {/* Subject Level */}
                                    <Collapsible 
                                      open={isSubjectExpanded} 
                                      onOpenChange={() => toggleSet(expandedSubjects, setExpandedSubjects, subjectKey)}
                                    >
                                      <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/60 transition-colors">
                                          <div className="flex items-center gap-2">
                                            {isSubjectExpanded ? (
                                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <Badge className={`${subjectColors.bg} ${subjectColors.text} border-0 text-xs`}>
                                              {subject.subjectName}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {subject.chapters.length} chapters
                                            </span>
                                          </div>
                                          <span className={`text-sm font-medium ${subjectColors.text}`}>
                                            {subject.hoursSpent.toFixed(1)}h
                                          </span>
                                        </div>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent>
                                        <div className="pl-6 pt-2 space-y-1.5">
                                          {subject.chapters.map(chapter => (
                                            <div 
                                              key={chapter.chapterId}
                                              className="flex items-center justify-between p-2 rounded bg-card border border-border/50"
                                            >
                                              <div className="flex items-center gap-2">
                                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm text-foreground">{chapter.chapterName}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-xs">
                                                {chapter.sessionsCompleted > 0 && (
                                                  <span className="text-green-600">{chapter.sessionsCompleted} done</span>
                                                )}
                                                {chapter.sessionsPartial > 0 && (
                                                  <span className="text-amber-600">{chapter.sessionsPartial} partial</span>
                                                )}
                                                {chapter.sessionsMissed > 0 && (
                                                  <span className="text-red-600">{chapter.sessionsMissed} missed</span>
                                                )}
                                                <span className="font-medium text-foreground">
                                                  {chapter.hoursSpent.toFixed(1)}h
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
