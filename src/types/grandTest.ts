// Grand Test Types

export type TestType = 'half-yearly' | 'annual' | 'term' | 'quarterly';
export type PriorityLevel = 'healthy' | 'needs_attention' | 'critical';
export type CompetitionExamType = 'jee_mains' | 'neet' | 'eamcet';

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
  ranksPublished?: boolean;
  competitionExamType?: CompetitionExamType;
}

export interface GrandTestDetail extends GrandTest {
  // Overall cumulative stats (across all students)
  totalResponses: number;        // totalQuestions × totalStudents
  totalCorrect: number;          // Sum of all correct answers from all students
  totalWrong: number;            // Sum of all wrong answers from all students
  totalSkipped: number;          // Sum of all skipped answers from all students
  studentsAbovePassing: number;  // Students who scored >= 60%
  studentsBelowPassing: number;  // Students who scored < 40%
  avgCorrectPerStudent: number;  // Average correct answers per student
  subjectPerformance: GrandTestSubject[];
  studentPerformance: GrandTestStudent[];
}

export interface GrandTestSubject {
  id: string;
  name: string;
  color: string;
  totalQuestions: number;
  // Cumulative stats (across all students for this subject)
  totalResponses: number;        // totalQuestions × totalStudents
  totalCorrect: number;          // Sum of all correct answers
  totalWrong: number;            // Sum of all wrong answers
  totalSkipped: number;          // Sum of all skipped answers
  accuracy: number;              // totalCorrect / (totalCorrect + totalWrong) * 100
  engagement: number;            // (totalCorrect + totalWrong) / totalResponses * 100
  avgCorrectPerStudent: number;  // Average correct per student for this subject
  studentsStruggling: number;    // Students with <50% accuracy in this subject
  studentsExcelling: number;     // Students with >80% accuracy in this subject
  priorityLevel: PriorityLevel;
  chapters: GrandTestChapter[];
}

export interface GrandTestChapter {
  id: string;
  name: string;
  subjectId: string;
  totalQuestions: number;
  // Cumulative stats
  totalResponses: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  accuracy: number;
  engagement: number;
  studentsStruggling: number;    // Students needing revision on this chapter
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
    correct: number;
    wrong: number;
    skipped: number;
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

// Competition exam type labels
export const competitionExamLabels: Record<CompetitionExamType, string> = {
  jee_mains: 'JEE Mains',
  neet: 'NEET',
  eamcet: 'EAMCET'
};
