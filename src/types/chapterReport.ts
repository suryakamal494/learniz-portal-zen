// Chapter Analytics Types

export interface TrendDataPoint {
  testName: string;
  testDate: string;
  accuracy: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'not_enough_data';
export type PerformanceCategory = 'strong' | 'moderate' | 'weak';
export type MasteryLevel = 'mastered' | 'near_mastery' | 'needs_improvement';
export type StudentGroupType = 'improving' | 'declining' | 'consistently_low' | 'not_enough_data';

export interface PerformanceMetrics {
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  skipPercentage: number;
  engagement: number;
  trend: TrendDirection;
  trendData: TrendDataPoint[];
  category: PerformanceCategory;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  metrics: PerformanceMetrics;
  questionCount: number;
}

export interface DifficultyPerformance {
  easy: PerformanceMetrics;
  medium: PerformanceMetrics;
  hard: PerformanceMetrics;
}

export interface QuestionTypePerformance {
  conceptual: PerformanceMetrics;
  logical: PerformanceMetrics;
  memory: PerformanceMetrics;
  analytical: PerformanceMetrics;
}

export interface StudentTopicPerformance {
  topicId: string;
  topicName: string;
  accuracy: number;
  category: PerformanceCategory;
}

export interface StudentChapterPerformance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  chapterAccuracy: number;
  skipPercentage: number;
  masteryLevel: MasteryLevel;
  trend: TrendDirection;
  trendData: TrendDataPoint[];
  comparisonWithClass: number; // positive = above average, negative = below
  topicPerformance: StudentTopicPerformance[];
  testsAttempted: number;
}

export interface StudentGroup {
  type: StudentGroupType;
  students: StudentChapterPerformance[];
  description: string;
}

export interface ChapterAnalytics {
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  batchId: string;
  batchName: string;
  
  // Overall chapter metrics
  overallMetrics: PerformanceMetrics;
  totalQuestions: number;
  totalStudents: number;
  testsContributing: number;
  lastUpdated: string;
  
  // Topic-wise breakdown
  topicPerformance: TopicPerformance[];
  
  // Difficulty analysis
  difficultyPerformance: DifficultyPerformance;
  
  // Question type analysis
  questionTypePerformance: QuestionTypePerformance;
  
  // Student-level data
  studentPerformance: StudentChapterPerformance[];
  
  // Student groups
  studentGroups: {
    improving: StudentGroup;
    declining: StudentGroup;
    consistentlyLow: StudentGroup;
    notEnoughData: StudentGroup;
  };
}

export interface ChapterSummary {
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  accuracy: number;
  trend: TrendDirection;
  category: PerformanceCategory;
  topicsCount: number;
  studentsCount: number;
  lastUpdated: string;
}

export interface ChapterAnalyticsFilters {
  batchId: string;
  subjectId: string;
  search: string;
}

// Insight types for teacher-friendly messages
export interface InsightMessage {
  type: 'info' | 'success' | 'warning' | 'action';
  title: string;
  message: string;
  icon?: string;
}
