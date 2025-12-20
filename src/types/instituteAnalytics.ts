// Institute Analytics Types

export type TimeFilterOption = 'all-time' | '7-days' | '30-days' | 'custom';

export interface TimeFilter {
  option: TimeFilterOption;
  startDate?: Date;
  endDate?: Date;
}

export type PerformanceStatus = 'strong' | 'moderate' | 'weak';
export type TrendDirection = 'improving' | 'declining' | 'stable' | 'not_enough_data';

// Teacher Types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subjects: string[];
  classes: string[];
  batches: string[];
  joinedDate: string;
}

export interface TeacherPerformanceData {
  teacherId: string;
  teacher: Teacher;
  overallAccuracy: number;
  overallEngagement: number;
  trend: TrendDirection;
  totalStudents: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  subjectPerformance: TeacherSubjectPerformance[];
}

export interface TeacherSubjectPerformance {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  engagement: number;
  trend: TrendDirection;
  chapters: TeacherChapterPerformance[];
  classes: string[];
  batches: string[];
}

export interface TeacherChapterPerformance {
  chapterId: string;
  chapterName: string;
  accuracy: number;
  engagement: number;
  trend: TrendDirection;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  batchBreakdown: BatchPerformance[];
  lastTestDate: string;
}

export interface BatchPerformance {
  batchId: string;
  batchName: string;
  className: string;
  accuracy: number;
  engagement: number;
  studentCount: number;
}

// Subject Types (Institute-wide aggregation)
export interface InstituteSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
  overallAccuracy: number;
  overallEngagement: number;
  trend: TrendDirection;
  totalStudents: number;
  totalQuestions: number;
  teacherCount: number;
  classCount: number;
  chapters: InstituteChapter[];
}

export interface InstituteChapter {
  id: string;
  name: string;
  subjectId: string;
  accuracy: number;
  engagement: number;
  trend: TrendDirection;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  teacherContributions: {
    teacherId: string;
    teacherName: string;
    accuracy: number;
  }[];
  lastActivityDate: string;
}

// Class Types
export interface InstituteClass {
  id: string;
  name: string;
  grade: number;
  batches: InstituteBatch[];
  overallAccuracy: number;
  overallEngagement: number;
  trend: TrendDirection;
  totalStudents: number;
  subjectPerformance: ClassSubjectPerformance[];
}

export interface InstituteBatch {
  id: string;
  name: string;
  classId: string;
  className: string;
  studentCount: number;
  accuracy: number;
  engagement: number;
}

export interface ClassSubjectPerformance {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  engagement: number;
  trend: TrendDirection;
}

// Institute Snapshot
export interface InstituteSnapshot {
  overallAccuracy: number;
  overallEngagement: number;
  overallTrend: TrendDirection;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  subjectSummary: SubjectSummary[];
  recentlyActiveChapters: RecentChapter[];
  attentionAreas: AttentionArea[];
}

export interface SubjectSummary {
  id: string;
  name: string;
  color: string;
  accuracy: number;
  engagement: number;
  trend: TrendDirection;
  chapterCount: number;
}

export interface RecentChapter {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  accuracy: number;
  trend: TrendDirection;
  lastActivityDate: string;
}

export interface AttentionArea {
  type: 'chapter' | 'subject' | 'class' | 'teacher';
  id: string;
  name: string;
  context: string;
  accuracy: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Trend Data for Charts
export interface TrendDataPoint {
  date: string;
  accuracy: number;
  engagement: number;
  label?: string;
}
