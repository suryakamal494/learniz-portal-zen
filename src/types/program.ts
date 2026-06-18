export interface ChapterStudyNote {
  id: string;
  title: string;
  fileName: string;
  description?: string;
  sharedAt: string;
}

export type ChapterTestSource = 'admin' | 'library' | 'created';

export interface ChapterTest {
  id: string;
  chapterId: string;
  title: string;
  source: ChapterTestSource;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  enabledForStudents: boolean;
  sharedAt: string;
}

export type LessonPlanContentType = 'ppt' | 'html' | 'video' | 'pdf' | 'note';

export interface LessonPlanContent {
  id: string;
  type: LessonPlanContentType;
  title: string;
  url?: string;
  duration?: string;
  /** Rich text body for `note` content type (preview mode renders this). */
  body?: string;
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
  /** Source of this lesson plan — admin-provisioned (default) or teacher-created inline. */
  createdBy?: 'admin' | 'teacher';
}

export type TopicStatus = 'not-started' | 'in-progress' | 'done';

export interface ProgramTopic {
  id: string;
  name: string;
  plannedHours: number;
  /** ISO date (YYYY-MM-DD) the topic is scheduled to start. */
  plannedStartDate: string;
  /** ISO date (YYYY-MM-DD) the topic is scheduled to end. */
  plannedEndDate: string;
  status: TopicStatus;
  /** ISO datetime the teacher last updated this topic's status. */
  lastUpdatedAt?: string;
  /** Optional links to lesson plans inside the same chapter. */
  lessonPlanIds?: string[];
}

export interface ProgramEducator {
  id: string;
  name: string;
  avatarColor?: string;
}

export interface ProgramChapter {
  id: string;
  name: string;
  order: number;
  lessonPlans: ProgramLessonPlan[];
  /** Schedule fields — optional so legacy chapters still render. */
  topics?: ProgramTopic[];
  plannedStartDate?: string;
  plannedEndDate?: string;
  educators?: ProgramEducator[];
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
