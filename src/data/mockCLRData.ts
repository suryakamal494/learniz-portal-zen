import { CLRReport, CLRSignal, CLRSummary, LiveAssessmentSession } from '@/types/clrReport';

// Helper function to calculate accuracy (excluding skipped)
export const calculateAccuracy = (correct: number, wrong: number): number => {
  const attempted = correct + wrong;
  if (attempted === 0) return 0;
  return Math.round((correct / attempted) * 100);
};

// Helper function to calculate engagement
export const calculateEngagement = (correct: number, wrong: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round(((correct + wrong) / total) * 100);
};

// Helper function to determine if accuracy is improving
export const isAccuracyTrendPositive = (trend: number[]): boolean => {
  if (trend.length < 2) return false;
  // Check if last value is greater than first value and there's general upward movement
  const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
  const secondHalf = trend.slice(Math.floor(trend.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  return secondAvg > firstAvg;
};

// Helper function to check if engagement is healthy
export const isEngagementHealthy = (avgEngagement: number): boolean => {
  return avgEngagement >= 80;
};

// Determine CLR signal based on accuracy trend and engagement
export const determineSignal = (
  accuracyTrend: number[],
  avgEngagement: number,
  engagementTrend: number[]
): CLRSignal => {
  const isImproving = isAccuracyTrendPositive(accuracyTrend);
  const lastAccuracy = accuracyTrend[accuracyTrend.length - 1] || 0;
  const hasLowAccuracy = lastAccuracy < 40;
  const hasLowEngagement = avgEngagement < 60;
  const hasMediumEngagement = avgEngagement >= 60 && avgEngagement < 80;
  
  // Count how many "bad" conditions are true for immediate review
  let badConditions = 0;
  if (!isImproving && hasLowAccuracy) badConditions++;
  if (hasLowEngagement) badConditions++;
  if (!isImproving && accuracyTrend.every((a, i) => i === 0 || a <= accuracyTrend[i - 1])) badConditions++;
  
  if (badConditions >= 2) {
    return 'immediate-review';
  }
  
  // Needs attention if flat/inconsistent accuracy or medium engagement
  if (!isImproving || hasMediumEngagement) {
    return 'needs-attention';
  }
  
  // Healthy if accuracy improving and engagement >= 80%
  if (isImproving && avgEngagement >= 80) {
    return 'healthy';
  }
  
  return 'needs-attention';
};

// Generate mock session data
const generateSessions = (
  count: number,
  pattern: 'improving' | 'flat' | 'declining' | 'mixed'
): LiveAssessmentSession[] => {
  const sessions: LiveAssessmentSession[] = [];
  const baseDate = new Date('2024-01-15');
  
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (i * 3));
    
    let correct: number, wrong: number, skipped: number;
    const totalQuestions = 30;
    
    switch (pattern) {
      case 'improving':
        correct = 12 + (i * 3);
        wrong = 18 - (i * 2);
        skipped = Math.max(0, 6 - i);
        break;
      case 'declining':
        correct = 20 - (i * 3);
        wrong = 10 + (i * 2);
        skipped = i * 2;
        break;
      case 'flat':
        correct = 14 + (Math.random() > 0.5 ? 1 : -1);
        wrong = 12 + (Math.random() > 0.5 ? 1 : -1);
        skipped = 4;
        break;
      case 'mixed':
        correct = 12 + Math.floor(Math.random() * 8);
        wrong = 10 + Math.floor(Math.random() * 6);
        skipped = Math.floor(Math.random() * 8);
        break;
    }
    
    sessions.push({
      sessionId: `session-${i + 1}`,
      sessionNumber: i + 1,
      date: date.toISOString().split('T')[0],
      totalQuestions,
      correct,
      wrong,
      skipped,
      accuracy: calculateAccuracy(correct, wrong),
      engagement: calculateEngagement(correct, wrong, totalQuestions)
    });
  }
  
  return sessions;
};

// Create a CLR report from sessions
const createCLRReport = (
  id: string,
  className: string,
  batchName: string,
  subject: string,
  chapter: string,
  teacher: string,
  teacherId: string,
  sessions: LiveAssessmentSession[]
): CLRReport => {
  const isEligible = sessions.length >= 4;
  const accuracyTrend = sessions.map(s => s.accuracy);
  const engagementTrend = sessions.map(s => s.engagement);
  const avgEngagement = Math.round(
    engagementTrend.reduce((a, b) => a + b, 0) / engagementTrend.length
  );
  
  const signal = isEligible
    ? determineSignal(accuracyTrend, avgEngagement, engagementTrend)
    : 'needs-attention';
  
  return {
    id,
    className,
    batchName,
    subject,
    chapter,
    teacher,
    teacherId,
    sessions,
    sessionsCount: sessions.length,
    accuracyTrend,
    avgEngagement,
    engagementTrend,
    signal,
    isAccuracyImproving: isAccuracyTrendPositive(accuracyTrend),
    isEngagementHealthy: isEngagementHealthy(avgEngagement),
    generatedAt: new Date().toISOString(),
    isEligible
  };
};

// Mock CLR Reports data
export const mockCLRReports: CLRReport[] = [
  // Healthy classrooms
  createCLRReport(
    'clr-001',
    'Class 10',
    'Batch A',
    'Mathematics',
    'Quadratic Equations',
    'Mr. Sharma',
    'teacher-1',
    generateSessions(5, 'improving')
  ),
  createCLRReport(
    'clr-002',
    'Class 10',
    'Batch B',
    'Physics',
    'Laws of Motion',
    'Mrs. Patel',
    'teacher-2',
    generateSessions(4, 'improving')
  ),
  createCLRReport(
    'clr-003',
    'Class 9',
    'Batch A',
    'Chemistry',
    'Chemical Bonding',
    'Dr. Rao',
    'teacher-3',
    generateSessions(6, 'improving')
  ),
  
  // Needs Attention classrooms
  createCLRReport(
    'clr-004',
    'Class 10',
    'Batch C',
    'Mathematics',
    'Trigonometry',
    'Mr. Kumar',
    'teacher-4',
    generateSessions(4, 'flat')
  ),
  createCLRReport(
    'clr-005',
    'Class 9',
    'Batch B',
    'Physics',
    'Gravitation',
    'Mrs. Singh',
    'teacher-5',
    generateSessions(5, 'mixed')
  ),
  createCLRReport(
    'clr-006',
    'Class 11',
    'Batch A',
    'Biology',
    'Cell Division',
    'Dr. Verma',
    'teacher-6',
    generateSessions(4, 'flat')
  ),
  
  // Immediate Review classrooms
  createCLRReport(
    'clr-007',
    'Class 10',
    'Batch D',
    'Chemistry',
    'Organic Chemistry',
    'Mr. Gupta',
    'teacher-7',
    generateSessions(4, 'declining')
  ),
  createCLRReport(
    'clr-008',
    'Class 9',
    'Batch C',
    'Mathematics',
    'Linear Equations',
    'Mrs. Iyer',
    'teacher-8',
    generateSessions(5, 'declining')
  ),
  
  // Not Eligible (less than 4 sessions)
  createCLRReport(
    'clr-009',
    'Class 11',
    'Batch B',
    'Physics',
    'Thermodynamics',
    'Mr. Reddy',
    'teacher-9',
    generateSessions(2, 'improving')
  ),
  createCLRReport(
    'clr-010',
    'Class 10',
    'Batch E',
    'Biology',
    'Genetics',
    'Dr. Nair',
    'teacher-10',
    generateSessions(3, 'flat')
  )
];

// Calculate summary from reports
export const calculateCLRSummary = (reports: CLRReport[]): CLRSummary => {
  const eligible = reports.filter(r => r.isEligible);
  
  return {
    totalClassrooms: reports.length,
    healthy: eligible.filter(r => r.signal === 'healthy').length,
    needsAttention: eligible.filter(r => r.signal === 'needs-attention').length,
    immediateReview: eligible.filter(r => r.signal === 'immediate-review').length,
    notEligible: reports.filter(r => !r.isEligible).length
  };
};

// Get reports by signal type
export const getReportsBySignal = (reports: CLRReport[], signal: CLRSignal): CLRReport[] => {
  return reports.filter(r => r.isEligible && r.signal === signal);
};

// Get not eligible reports
export const getNotEligibleReports = (reports: CLRReport[]): CLRReport[] => {
  return reports.filter(r => !r.isEligible);
};

// Filter reports by class and/or subject
export const filterCLRReports = (
  reports: CLRReport[],
  classFilter?: string,
  subjectFilter?: string
): CLRReport[] => {
  return reports.filter(report => {
    const matchesClass = !classFilter || classFilter === 'all' || report.className === classFilter;
    const matchesSubject = !subjectFilter || subjectFilter === 'all' || report.subject === subjectFilter;
    return matchesClass && matchesSubject;
  });
};

// Get unique classes from reports
export const getUniqueClasses = (reports: CLRReport[]): string[] => {
  return [...new Set(reports.map(r => r.className))].sort();
};

// Get unique subjects from reports
export const getUniqueSubjects = (reports: CLRReport[]): string[] => {
  return [...new Set(reports.map(r => r.subject))].sort();
};
