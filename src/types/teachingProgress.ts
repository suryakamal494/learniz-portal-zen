export type TeachingStatus = 'completed' | 'partial' | 'not-taken' | 'pending';

// Session note recorded by teachers when marking teaching status
export interface TeachingSessionNote {
  sessionId: string;
  date: string;
  time: string;
  teacherName: string;
  status: TeachingStatus;
  notes: string;
  markedAt: string;
}

export interface TeachingProgressLog {
  scheduleId: string;
  teachingStatus: TeachingStatus;
  notes?: string;
  markedBy: string;
  markedAt: string;
  originalTeacher: string;
  substituteTeacher?: string;
}

export interface ScheduleTrackingStats {
  totalClasses: number;
  completedClasses: number;
  partialClasses: number;
  notTakenClasses: number;
  pendingClasses: number;
  totalScheduledHours: number;
  completedHours: number;
  partialHours: number;
  missedHours: number;
}

export interface BatchProgress {
  batchId: string;
  batchName: string;
  className: string;
  plannedClasses: number;
  completedClasses: number;
  partialClasses: number;
  notTakenClasses: number;
  completionPercentage: number;
  plannedHours: number;
  completedHours: number;
}

export interface ChapterProgress {
  chapterId: string;
  chapterName: string;
  subject: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsMissed: number;
  hoursSpent: number;
}

export interface TeacherProgress {
  teacherId: string;
  teacherName: string;
  assignedClasses: number;
  completedClasses: number;
  partialClasses: number;
  notTakenClasses: number;
  completionRate: number;
}

// ============ NEW HIERARCHICAL INTERFACES ============

// Teacher breakdown within a chapter
export interface ChapterTeacherBreakdown {
  teacherId: string;
  teacherName: string;
  hoursSpent: number;
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsMissed: number;
}

// Chapter with teacher breakdown
export interface ChapterWithTeachers {
  chapterId: string;
  chapterName: string;
  totalHours: number;
  completedHours: number;
  sessionsPlanned: number;
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsMissed: number;
  teachers: ChapterTeacherBreakdown[];
  sessionNotes: TeachingSessionNote[];
}

// Subject-level aggregation within a batch
export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalHours: number;
  completedHours: number;
  sessionsPlanned: number;
  sessionsCompleted: number;
  chapters: ChapterWithTeachers[];
}

// Enhanced Batch progress with subjects
export interface BatchProgressEnhanced {
  batchId: string;
  batchName: string;
  className: string;
  totalHours: number;
  completedHours: number;
  sessionsPlanned: number;
  sessionsCompleted: number;
  subjects: SubjectProgress[];
}

// Class-level grouping
export interface ClassProgressEnhanced {
  classId: string;
  className: string;
  totalHours: number;
  completedHours: number;
  batches: BatchProgressEnhanced[];
}

// Teacher's chapter breakdown
export interface TeacherChapterProgress {
  chapterId: string;
  chapterName: string;
  hoursSpent: number;
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsMissed: number;
  sessionNotes: TeachingSessionNote[];
}

// Teacher's subject breakdown
export interface TeacherSubjectProgress {
  subjectId: string;
  subjectName: string;
  hoursSpent: number;
  chapters: TeacherChapterProgress[];
}

// Teacher's class/batch breakdown
export interface TeacherClassBatchProgress {
  classId: string;
  className: string;
  batchId: string;
  batchName: string;
  hoursSpent: number;
  subjects: TeacherSubjectProgress[];
}

// Enhanced Teacher progress with full hierarchy
export interface TeacherProgressEnhanced {
  teacherId: string;
  teacherName: string;
  totalHours: number;
  completedHours: number;
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsMissed: number;
  classBatches: TeacherClassBatchProgress[];
}

export interface TeacherProgress {
  teacherId: string;
  teacherName: string;
  assignedClasses: number;
  completedClasses: number;
  partialClasses: number;
  notTakenClasses: number;
  completionRate: number;
}
