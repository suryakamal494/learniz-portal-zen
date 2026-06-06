export type LessonPlanContentType = 'ppt' | 'html' | 'video' | 'pdf' | 'note';

export interface LessonPlanContent {
  id: string;
  type: LessonPlanContentType;
  title: string;
  url?: string;
  duration?: string;
}

export type LessonPlanStatus = 'completed' | 'partial' | 'not-started';

export interface ProgramLessonPlan {
  id: string;
  title: string;
  summary: string;
  contents: LessonPlanContent[];
  lmsSeriesId?: string;
  status: LessonPlanStatus;
  hoursPlanned: number;
  hoursSpent: number;
  lastTaughtDate?: string;
}

export interface ProgramChapter {
  id: string;
  name: string;
  order: number;
  lessonPlans: ProgramLessonPlan[];
}

export interface ProgramSubject {
  id: string;
  name: string;
  chapters: ProgramChapter[];
}

export interface Program {
  id: string;
  batchId: string;
  subjects: ProgramSubject[];
}

export interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  completionPct: number;
  chaptersCount: number;
  lessonPlansCount: number;
}

export interface ProgramSummary {
  programId: string;
  batchId: string;
  overallPct: number;
  subjects: SubjectSummary[];
}

export interface ChapterProgress {
  chapterId: string;
  chapterName: string;
  completionPct: number;
  totalLessonPlans: number;
  completedLessonPlans: number;
  partialLessonPlans: number;
  hoursPlanned: number;
  hoursSpent: number;
  lastTaughtDate?: string;
}
