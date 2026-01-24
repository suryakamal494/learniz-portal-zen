// Student performance at class/section level
export interface StudentOverview {
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  classId: string;
  sectionId: string;
  overallAccuracy: number;
  classAverage: number;
  performanceStatus: 'above_average' | 'average' | 'below_average';
  subjectsCount: number;
  testsAttempted: number;
  lastActive: string;
}

// Test types for chapter-level reports
export type ChapterTestType = 'live_assessment' | 'lms_quiz' | 'assignment';

// Individual test result
export interface StudentTestResult {
  testId: string;
  testName: string;
  testType: ChapterTestType;
  testDate: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  timeTaken?: string;
  classAverage: number;
  rank?: number;
  totalStudents?: number;
}

// Difficulty analysis metrics
export interface DifficultyMetrics {
  accuracy: number;
  attempted: number;
  total: number;
}

// Cognitive analysis metrics
export interface CognitiveMetrics {
  accuracy: number;
  attempted: number;
}

// Chapter performance for a student
export interface StudentChapterPerformance {
  chapterId: string;
  chapterName: string;
  overallAccuracy: number;
  totalTests: number;
  testsAttempted: number;
  classAverage: number;
  comparisonWithClass: number;
  trend: 'improving' | 'declining' | 'stable' | 'not_enough_data';
  testsByType: {
    liveAssessments: StudentTestResult[];
    lmsQuizzes: StudentTestResult[];
    assignments: StudentTestResult[];
  };
  difficultyAnalysis?: {
    easy: DifficultyMetrics;
    medium: DifficultyMetrics;
    hard: DifficultyMetrics;
  };
  cognitiveAnalysis?: {
    conceptual: CognitiveMetrics;
    logical: CognitiveMetrics;
    memory: CognitiveMetrics;
    analytical: CognitiveMetrics;
  };
}

// Aggregated analysis for subjects
export interface AggregatedDifficultyAnalysis {
  easy: { avgAccuracy: number };
  medium: { avgAccuracy: number };
  hard: { avgAccuracy: number };
}

export interface AggregatedCognitiveAnalysis {
  conceptual: { avgAccuracy: number };
  logical: { avgAccuracy: number };
  memory: { avgAccuracy: number };
  analytical: { avgAccuracy: number };
}

// Subject performance for a student
export interface StudentSubjectPerformance {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  overallAccuracy: number;
  classAverage: number;
  chapters: StudentChapterPerformance[];
  testsTotal: number;
  testsAttempted: number;
  aggregatedDifficulty?: AggregatedDifficultyAnalysis;
  aggregatedCognitive?: AggregatedCognitiveAnalysis;
}

// Grand test subject result
export interface GrandTestSubjectResult {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  correct: number;
  wrong: number;
  skipped: number;
  totalQuestions: number;
}

// Grand test result for a student
export interface StudentGrandTestResult {
  testId: string;
  testName: string;
  testType: 'half-yearly' | 'annual' | 'term' | 'quarterly';
  testDate: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  rank?: number;
  totalStudents: number;
  band: 'high' | 'medium' | 'at_risk';
  subjectWise: GrandTestSubjectResult[];
}

// Complete student report
export interface StudentReport {
  student: StudentOverview;
  subjects: StudentSubjectPerformance[];
  grandTests: StudentGrandTestResult[];
}

// Class and section structure for listing
export interface ClassSection {
  sectionId: string;
  sectionName: string;
  studentCount: number;
  averageAccuracy: number;
}

export interface ClassGroup {
  classId: string;
  className: string;
  sections: ClassSection[];
  totalStudents: number;
}

// Helper function to get performance status
export const getPerformanceStatus = (studentAccuracy: number, classAverage: number): 'above_average' | 'average' | 'below_average' => {
  const diff = studentAccuracy - classAverage;
  if (diff >= 3) return 'above_average';
  if (diff <= -3) return 'below_average';
  return 'average';
};

// Helper function to get band
export const getBand = (accuracy: number): 'high' | 'medium' | 'at_risk' => {
  if (accuracy >= 75) return 'high';
  if (accuracy >= 40) return 'medium';
  return 'at_risk';
};

// Helper function to get trend
export const getTrend = (tests: StudentTestResult[]): 'improving' | 'declining' | 'stable' | 'not_enough_data' => {
  if (tests.length < 3) return 'not_enough_data';
  
  const recentTests = tests.slice(0, 3);
  const avgRecent = recentTests.reduce((sum, t) => sum + t.accuracy, 0) / recentTests.length;
  
  const olderTests = tests.slice(-3);
  const avgOlder = olderTests.reduce((sum, t) => sum + t.accuracy, 0) / olderTests.length;
  
  const diff = avgRecent - avgOlder;
  if (diff >= 5) return 'improving';
  if (diff <= -5) return 'declining';
  return 'stable';
};
