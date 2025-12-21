// Grand Test Types

export type TestType = 'half-yearly' | 'annual' | 'term' | 'quarterly';
export type PriorityLevel = 'healthy' | 'needs_attention' | 'critical';

export interface GrandTest {
  id: string;
  name: string;
  type: TestType;
  date: string;
  totalQuestions: number;
  totalStudents: number;
  subjects: string[];
  overallAccuracy: number;
  overallEngagement: number;
  status: 'completed' | 'in_progress' | 'scheduled';
}

export interface GrandTestDetail extends GrandTest {
  correct: number;
  wrong: number;
  skipped: number;
  subjectPerformance: GrandTestSubject[];
  studentPerformance: GrandTestStudent[];
}

export interface GrandTestSubject {
  id: string;
  name: string;
  color: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  engagement: number;
  priorityLevel: PriorityLevel;
  chapters: GrandTestChapter[];
}

export interface GrandTestChapter {
  id: string;
  name: string;
  subjectId: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  engagement: number;
  priorityLevel: PriorityLevel;
}

export interface GrandTestStudent {
  id: string;
  name: string;
  rollNumber: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  band: 'high' | 'medium' | 'at_risk';
  subjectWise: {
    subjectId: string;
    subjectName: string;
    accuracy: number;
  }[];
}

// Helper function to get priority level based on accuracy
export function getPriorityLevel(accuracy: number): PriorityLevel {
  if (accuracy >= 70) return 'healthy';
  if (accuracy >= 40) return 'needs_attention';
  return 'critical';
}

// Helper function to get student band based on accuracy
export function getStudentBand(accuracy: number): 'high' | 'medium' | 'at_risk' {
  if (accuracy >= 75) return 'high';
  if (accuracy >= 40) return 'medium';
  return 'at_risk';
}
