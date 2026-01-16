
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Users, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ClassProgressEnhanced, SubjectProgress, ChapterWithTeachers, TeachingSessionNote } from '@/types/teachingProgress';
import { ChapterNotesButton } from './ChapterNotesButton';
import { TeachingNotesPanel } from './TeachingNotesPanel';

interface BatchWiseTrackingProps {
  classProgress: ClassProgressEnhanced[];
}

export function BatchWiseTracking({ classProgress }: BatchWiseTrackingProps) {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Notes panel state
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [selectedChapterNotes, setSelectedChapterNotes] = useState<{
    chapterName: string;
    subjectName: string;
    contextInfo: string;
    notes: TeachingSessionNote[];
  } | null>(null);

  const openNotesPanel = (
    chapterName: string, 
    subjectName: string, 
    contextInfo: string, 
    notes: TeachingSessionNote[]
  ) => {
    setSelectedChapterNotes({ chapterName, subjectName, contextInfo, notes });
    setNotesPanelOpen(true);
  };

  const closeNotesPanel = () => {
    setNotesPanelOpen(false);
    setSelectedChapterNotes(null);
  };

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
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'Physics': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
      'Mathematics': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
      'Chemistry': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
      'Biology': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
      'English': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
      'Accountancy': { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/30' }
    };
    return colors[subject] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  };

  if (classProgress.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No schedule data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classProgress.map(classData => {
        const isClassExpanded = expandedClasses.has(classData.classId);
        const classCompletion = getCompletionPercentage(classData.completedHours, classData.totalHours);

        return (
          <Card key={classData.classId} className="bg-card border-border overflow-hidden">
            {/* Class Level */}
            <Collapsible 
              open={isClassExpanded} 
              onOpenChange={() => toggleSet(expandedClasses, setExpandedClasses, classData.classId)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    {isClassExpanded ? (
                      <ChevronDown className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{classData.className}</div>
                      <div className="text-sm text-muted-foreground">
                        {classData.batches.length} batches
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {classData.completedHours.toFixed(1)}h / {classData.totalHours.toFixed(1)}h
                      </div>
                      <div className="text-xs text-muted-foreground">Hours completed</div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={classCompletion >= 70 ? 'text-green-600 border-green-500/30' : 
                                 classCompletion >= 40 ? 'text-amber-600 border-amber-500/30' : 
                                 'text-red-600 border-red-500/30'}
                    >
                      {classCompletion}%
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="border-t border-border">
                  {classData.batches.map(batch => {
                    const batchKey = `${classData.classId}-${batch.batchId}`;
                    const isBatchExpanded = expandedBatches.has(batchKey);
                    const batchCompletion = getCompletionPercentage(batch.completedHours, batch.totalHours);

                    return (
                      <div key={batch.batchId} className="border-b border-border last:border-b-0">
                        {/* Batch Level */}
                        <Collapsible 
                          open={isBatchExpanded} 
                          onOpenChange={() => toggleSet(expandedBatches, setExpandedBatches, batchKey)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 pl-8 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                {isBatchExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                  <div className="font-medium text-foreground">{batch.batchName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {batch.subjects.length} subjects • {batch.sessionsPlanned} sessions
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{batch.completedHours.toFixed(1)}h / {batch.totalHours.toFixed(1)}h</span>
                                </div>
                                <div className="w-20">
                                  <Progress value={batchCompletion} className="h-2" />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{batchCompletion}%</span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="bg-muted/30">
                              {batch.subjects.map(subject => {
                                const subjectKey = `${batchKey}-${subject.subjectId}`;
                                const isSubjectExpanded = expandedSubjects.has(subjectKey);
                                const subjectColors = getSubjectColor(subject.subjectName);

                                return (
                                  <div key={subject.subjectId} className="border-t border-border/50">
                                    {/* Subject Level */}
                                    <Collapsible 
                                      open={isSubjectExpanded} 
                                      onOpenChange={() => toggleSet(expandedSubjects, setExpandedSubjects, subjectKey)}
                                    >
                                      <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-3 pl-14 hover:bg-muted/60 transition-colors">
                                          <div className="flex items-center gap-3">
                                            {isSubjectExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <Badge className={`${subjectColors.bg} ${subjectColors.text} border-0`}>
                                              {subject.subjectName}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {subject.chapters.length} chapters
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                            <span className={subjectColors.text}>
                                              {subject.completedHours.toFixed(1)}h
                                            </span>
                                            <span className="text-muted-foreground">/ {subject.totalHours.toFixed(1)}h</span>
                                          </div>
                                        </div>
                                      </CollapsibleTrigger>
                                      
                                      <CollapsibleContent>
                                        <div className="pl-20 pr-4 pb-3 space-y-2">
                                          {subject.chapters.map(chapter => {
                                            const chapterKey = `${subjectKey}-${chapter.chapterId}`;
                                            const isChapterExpanded = expandedChapters.has(chapterKey);
                                            const hasMultipleTeachers = chapter.teachers.length > 1;

                                            return (
                                              <div key={chapter.chapterId} className={`rounded-lg border ${subjectColors.border} bg-card p-3`}>
                                                {/* Chapter Level */}
                                                {hasMultipleTeachers ? (
                                                  <Collapsible 
                                                    open={isChapterExpanded} 
                                                    onOpenChange={() => toggleSet(expandedChapters, setExpandedChapters, chapterKey)}
                                                  >
                                                    <CollapsibleTrigger className="w-full">
                                                      <ChapterRow 
                                                        chapter={chapter} 
                                                        isExpanded={isChapterExpanded}
                                                        hasMultipleTeachers={hasMultipleTeachers}
                                                        subjectName={subject.subjectName}
                                                        batchContext={`${classData.className} - ${batch.batchName}`}
                                                        onNotesClick={openNotesPanel}
                                                      />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                      <TeacherBreakdown teachers={chapter.teachers} />
                                                    </CollapsibleContent>
                                                  </Collapsible>
                                                ) : (
                                                  <ChapterRow 
                                                    chapter={chapter} 
                                                    isExpanded={false}
                                                    hasMultipleTeachers={false}
                                                    subjectName={subject.subjectName}
                                                    batchContext={`${classData.className} - ${batch.batchName}`}
                                                    onNotesClick={openNotesPanel}
                                                  />
                                                )}
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
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
      {/* Notes Panel */}
      {selectedChapterNotes && (
        <TeachingNotesPanel
          isOpen={notesPanelOpen}
          onClose={closeNotesPanel}
          chapterName={selectedChapterNotes.chapterName}
          subjectName={selectedChapterNotes.subjectName}
          contextInfo={selectedChapterNotes.contextInfo}
          notes={selectedChapterNotes.notes}
        />
      )}
    </div>
  );
}

// Chapter row component
interface ChapterRowProps {
  chapter: ChapterWithTeachers;
  isExpanded: boolean;
  hasMultipleTeachers: boolean;
  subjectName: string;
  batchContext: string;
  onNotesClick: (chapterName: string, subjectName: string, contextInfo: string, notes: TeachingSessionNote[]) => void;
}

function ChapterRow({ chapter, isExpanded, hasMultipleTeachers, subjectName, batchContext, onNotesClick }: ChapterRowProps) {
  const notesCount = chapter.sessionNotes?.length || 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {hasMultipleTeachers && (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{chapter.chapterName}</span>
            {notesCount > 0 && (
              <ChapterNotesButton
                notesCount={notesCount}
                onClick={() => onNotesClick(chapter.chapterName, subjectName, batchContext, chapter.sessionNotes)}
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {chapter.sessionsCompleted > 0 && (
              <span className="text-green-600">{chapter.sessionsCompleted} done</span>
            )}
            {chapter.sessionsPartial > 0 && (
              <span className="text-amber-600">{chapter.sessionsPartial} partial</span>
            )}
            {chapter.sessionsMissed > 0 && (
              <span className="text-red-600">{chapter.sessionsMissed} missed</span>
            )}
            {!hasMultipleTeachers && chapter.teachers[0] && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {chapter.teachers[0].teacherName}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-foreground">
          {chapter.completedHours.toFixed(1)}h
        </div>
        <div className="text-xs text-muted-foreground">
          of {chapter.totalHours.toFixed(1)}h
        </div>
      </div>
    </div>
  );
}

// Teacher breakdown within a chapter
function TeacherBreakdown({ teachers }: { teachers: ChapterWithTeachers['teachers'] }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Teacher Breakdown
      </div>
      {teachers.map(teacher => (
        <div 
          key={teacher.teacherId}
          className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">{teacher.teacherName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {teacher.sessionsCompleted > 0 && (
              <span className="text-green-600">{teacher.sessionsCompleted} done</span>
            )}
            {teacher.sessionsPartial > 0 && (
              <span className="text-amber-600">{teacher.sessionsPartial} partial</span>
            )}
            <span className="font-medium text-foreground">{teacher.hoursSpent.toFixed(1)}h</span>
          </div>
        </div>
      ))}
    </div>
  );
}
