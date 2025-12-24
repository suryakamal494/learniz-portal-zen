
export type TeachingStatus = 'completed' | 'partial' | 'not-taken' | 'pending';

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
