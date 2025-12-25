// CLR Signal types
export type CLRSignal = 'healthy' | 'needs-attention' | 'immediate-review';

// Per-session metrics from a live assessment
export interface LiveAssessmentSession {
  sessionId: string;
  sessionNumber: number;
  date: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number; // (correct / (correct + wrong)) * 100
  engagement: number; // ((correct + wrong) / total) * 100
}

// CLR Report for a single classroom (class + batch + subject + chapter + teacher)
export interface CLRReport {
  id: string;
  className: string;
  batchName: string;
  subject: string;
  chapter: string;
  teacher: string;
  teacherId: string;
  sessions: LiveAssessmentSession[];
  sessionsCount: number;
  
  // Calculated metrics
  accuracyTrend: number[]; // e.g., [40, 50, 60, 66.7]
  avgEngagement: number;
  engagementTrend: number[]; // e.g., [72, 75, 80, 85]
  signal: CLRSignal;
  
  // Trend analysis
  isAccuracyImproving: boolean;
  isEngagementHealthy: boolean;
  
  // Metadata
  generatedAt: string;
  isEligible: boolean; // true only if 4+ sessions exist
}

// Summary stats for the dashboard
export interface CLRSummary {
  totalClassrooms: number;
  healthy: number;
  needsAttention: number;
  immediateReview: number;
  notEligible: number; // Less than 4 assessments
}
