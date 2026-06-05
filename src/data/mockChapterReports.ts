import { ChapterAnalytics, ChapterSummary, TrendDataPoint, PerformanceMetrics, StudentChapterPerformance, TopicPerformance, StudentTopicPerformance } from '@/types/chapterReport';

// Helper to create metrics
const createMetrics = (
  correct: number, 
  wrong: number, 
  skipped: number, 
  trendData: TrendDataPoint[]
): PerformanceMetrics => {
  const total = correct + wrong + skipped;
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  const skipPercentage = total > 0 ? (skipped / total) * 100 : 0;
  const engagement = total > 0 ? (attempted / total) * 100 : 0;
  
  // Calculate trend
  let trend: 'improving' | 'declining' | 'stable' | 'not_enough_data' = 'not_enough_data';
  if (trendData.length >= 2) {
    const first = trendData[0].accuracy;
    const last = trendData[trendData.length - 1].accuracy;
    const diff = last - first;
    if (diff >= 5) trend = 'improving';
    else if (diff <= -5) trend = 'declining';
    else trend = 'stable';
  }
  
  // Calculate category
  let category: 'strong' | 'moderate' | 'weak' = 'weak';
  if (accuracy >= 70) category = 'strong';
  else if (accuracy >= 40) category = 'moderate';
  
  return { correct, wrong, skipped, accuracy, skipPercentage, engagement, trend, trendData, category };
};

// Mock student data for Linear Equations chapter
const linearEquationsStudents: StudentChapterPerformance[] = [
  {
    studentId: 'std-1',
    studentName: 'Riya Sharma',
    rollNumber: 'R001',
    chapterAccuracy: 78,
    skipPercentage: 8,
    masteryLevel: 'mastered',
    trend: 'improving',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 55, correct: 5, wrong: 4, skipped: 1 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 67, correct: 6, wrong: 3, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 78, correct: 7, wrong: 2, skipped: 1 },
    ],
    comparisonWithClass: 12,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 85, category: 'strong' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 70, category: 'strong' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 80, category: 'strong' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-2',
    studentName: 'Arjun Patel',
    rollNumber: 'R002',
    chapterAccuracy: 72,
    skipPercentage: 5,
    masteryLevel: 'mastered',
    trend: 'stable',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 70, correct: 7, wrong: 3, skipped: 0 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 73, correct: 8, wrong: 3, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 72, correct: 7, wrong: 3, skipped: 0 },
    ],
    comparisonWithClass: 6,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 80, category: 'strong' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 65, category: 'moderate' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 75, category: 'strong' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-3',
    studentName: 'Priya Menon',
    rollNumber: 'R003',
    chapterAccuracy: 65,
    skipPercentage: 12,
    masteryLevel: 'near_mastery',
    trend: 'improving',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 45, correct: 4, wrong: 5, skipped: 1 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 55, correct: 5, wrong: 4, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 65, correct: 6, wrong: 3, skipped: 1 },
    ],
    comparisonWithClass: -1,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 75, category: 'strong' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 50, category: 'moderate' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 70, category: 'strong' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-4',
    studentName: 'Aryan Singh',
    rollNumber: 'R004',
    chapterAccuracy: 52,
    skipPercentage: 18,
    masteryLevel: 'near_mastery',
    trend: 'declining',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 68, correct: 6, wrong: 3, skipped: 1 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 58, correct: 5, wrong: 4, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 52, correct: 4, wrong: 5, skipped: 2 },
    ],
    comparisonWithClass: -14,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 60, category: 'moderate' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 35, category: 'weak' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 55, category: 'moderate' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-5',
    studentName: 'Neha Gupta',
    rollNumber: 'R005',
    chapterAccuracy: 58,
    skipPercentage: 15,
    masteryLevel: 'near_mastery',
    trend: 'declining',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 72, correct: 7, wrong: 3, skipped: 0 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 65, correct: 6, wrong: 4, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 58, correct: 5, wrong: 4, skipped: 2 },
    ],
    comparisonWithClass: -8,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 65, category: 'moderate' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 45, category: 'moderate' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 60, category: 'moderate' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-6',
    studentName: 'Abdul Khan',
    rollNumber: 'R006',
    chapterAccuracy: 32,
    skipPercentage: 25,
    masteryLevel: 'needs_improvement',
    trend: 'stable',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 30, correct: 3, wrong: 7, skipped: 2 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 35, correct: 3, wrong: 6, skipped: 3 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 32, correct: 3, wrong: 6, skipped: 3 },
    ],
    comparisonWithClass: -34,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 40, category: 'moderate' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 25, category: 'weak' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 30, category: 'weak' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-7',
    studentName: 'Sia Reddy',
    rollNumber: 'R007',
    chapterAccuracy: 28,
    skipPercentage: 30,
    masteryLevel: 'needs_improvement',
    trend: 'declining',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 38, correct: 3, wrong: 5, skipped: 4 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 32, correct: 3, wrong: 6, skipped: 4 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 28, correct: 2, wrong: 5, skipped: 5 },
    ],
    comparisonWithClass: -38,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 35, category: 'weak' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 20, category: 'weak' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 28, category: 'weak' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-8',
    studentName: 'Manish Kumar',
    rollNumber: 'R008',
    chapterAccuracy: 82,
    skipPercentage: 3,
    masteryLevel: 'mastered',
    trend: 'improving',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 65, correct: 6, wrong: 4, skipped: 0 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 75, correct: 8, wrong: 2, skipped: 1 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 82, correct: 9, wrong: 2, skipped: 0 },
    ],
    comparisonWithClass: 16,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 90, category: 'strong' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 75, category: 'strong' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 85, category: 'strong' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-9',
    studentName: 'Asha Devi',
    rollNumber: 'R009',
    chapterAccuracy: 45,
    skipPercentage: 20,
    masteryLevel: 'near_mastery',
    trend: 'improving',
    trendData: [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 30, correct: 2, wrong: 5, skipped: 3 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 38, correct: 3, wrong: 5, skipped: 2 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 45, correct: 4, wrong: 5, skipped: 2 },
    ],
    comparisonWithClass: -21,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 55, category: 'moderate' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 35, category: 'weak' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 45, category: 'moderate' },
    ],
    testsAttempted: 3
  },
  {
    studentId: 'std-10',
    studentName: 'Pranav Joshi',
    rollNumber: 'R010',
    chapterAccuracy: 55,
    skipPercentage: 10,
    masteryLevel: 'near_mastery',
    trend: 'not_enough_data',
    trendData: [
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 55, correct: 5, wrong: 4, skipped: 1 },
    ],
    comparisonWithClass: -11,
    topicPerformance: [
      { topicId: 't1', topicName: 'One-Variable Equations', accuracy: 60, category: 'moderate' },
      { topicId: 't2', topicName: 'Word Problems', accuracy: 50, category: 'moderate' },
      { topicId: 't3', topicName: 'Graphical Solutions', accuracy: 55, category: 'moderate' },
    ],
    testsAttempted: 1
  },
];

// Full chapter analytics for Linear Equations
export const mockChapterAnalytics: ChapterAnalytics[] = [
  {
    chapterId: 'ch-linear-eq',
    chapterName: 'Linear Equations',
    subjectId: 'sub-math',
    subjectName: 'Mathematics',
    batchId: 'section-10a',
    batchName: 'Class 10-A',
    
    overallMetrics: createMetrics(58, 42, 12, [
      { testName: 'Test 1', testDate: '2024-01-15', accuracy: 52, correct: 45, wrong: 42, skipped: 13 },
      { testName: 'Test 2', testDate: '2024-01-22', accuracy: 58, correct: 52, wrong: 38, skipped: 10 },
      { testName: 'Test 3', testDate: '2024-01-29', accuracy: 66, correct: 58, wrong: 30, skipped: 12 },
    ]),
    totalQuestions: 30,
    totalStudents: 10,
    testsContributing: 3,
    lastUpdated: '2024-01-29',
    
    topicPerformance: [
      {
        topicId: 't1',
        topicName: 'One-Variable Equations',
        questionCount: 12,
        metrics: createMetrics(28, 10, 2, [
          { testName: 'Test 1', testDate: '2024-01-15', accuracy: 60, correct: 24, wrong: 16, skipped: 0 },
          { testName: 'Test 2', testDate: '2024-01-22', accuracy: 68, correct: 27, wrong: 13, skipped: 2 },
          { testName: 'Test 3', testDate: '2024-01-29', accuracy: 74, correct: 28, wrong: 10, skipped: 2 },
        ]),
      },
      {
        topicId: 't2',
        topicName: 'Word Problems',
        questionCount: 10,
        metrics: createMetrics(18, 20, 7, [
          { testName: 'Test 1', testDate: '2024-01-15', accuracy: 38, correct: 12, wrong: 20, skipped: 8 },
          { testName: 'Test 2', testDate: '2024-01-22', accuracy: 42, correct: 15, wrong: 21, skipped: 6 },
          { testName: 'Test 3', testDate: '2024-01-29', accuracy: 47, correct: 18, wrong: 20, skipped: 7 },
        ]),
      },
      {
        topicId: 't3',
        topicName: 'Graphical Solutions',
        questionCount: 8,
        metrics: createMetrics(22, 12, 3, [
          { testName: 'Test 1', testDate: '2024-01-15', accuracy: 58, correct: 18, wrong: 13, skipped: 5 },
          { testName: 'Test 2', testDate: '2024-01-22', accuracy: 62, correct: 20, wrong: 12, skipped: 4 },
          { testName: 'Test 3', testDate: '2024-01-29', accuracy: 65, correct: 22, wrong: 12, skipped: 3 },
        ]),
      },
    ],
    
    difficultyPerformance: {
      easy: createMetrics(32, 5, 1, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 82, correct: 30, wrong: 6, skipped: 2 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 85, correct: 32, wrong: 6, skipped: 1 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 86, correct: 32, wrong: 5, skipped: 1 },
      ]),
      medium: createMetrics(20, 22, 5, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 42, correct: 16, wrong: 22, skipped: 6 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 48, correct: 18, wrong: 20, skipped: 5 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 48, correct: 20, wrong: 22, skipped: 5 },
      ]),
      hard: createMetrics(8, 18, 6, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 28, correct: 5, wrong: 13, skipped: 7 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 32, correct: 6, wrong: 13, skipped: 5 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 31, correct: 8, wrong: 18, skipped: 6 },
      ]),
    },
    
    questionTypePerformance: {
      memory: createMetrics(28, 8, 2, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 72, correct: 25, wrong: 10, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 76, correct: 27, wrong: 9, skipped: 2 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 78, correct: 28, wrong: 8, skipped: 2 },
      ]),
      conceptual: createMetrics(20, 18, 4, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 48, correct: 16, wrong: 18, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 52, correct: 18, wrong: 17, skipped: 4 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 53, correct: 20, wrong: 18, skipped: 4 },
      ]),
      logical: createMetrics(12, 16, 4, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 38, correct: 10, wrong: 16, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 42, correct: 11, wrong: 15, skipped: 4 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 43, correct: 12, wrong: 16, skipped: 4 },
      ]),
      analytical: createMetrics(8, 14, 5, [
        { testName: 'Test 1', testDate: '2024-01-15', accuracy: 32, correct: 6, wrong: 13, skipped: 6 },
        { testName: 'Test 2', testDate: '2024-01-22', accuracy: 35, correct: 7, wrong: 13, skipped: 5 },
        { testName: 'Test 3', testDate: '2024-01-29', accuracy: 36, correct: 8, wrong: 14, skipped: 5 },
      ]),
    },
    
    studentPerformance: linearEquationsStudents,
    
    studentGroups: {
      improving: {
        type: 'improving',
        students: linearEquationsStudents.filter(s => s.trend === 'improving'),
        description: 'Students showing consistent improvement in this chapter',
      },
      declining: {
        type: 'declining',
        students: linearEquationsStudents.filter(s => s.trend === 'declining'),
        description: 'Students whose performance is dropping - may need intervention',
      },
      consistentlyLow: {
        type: 'consistently_low',
        students: linearEquationsStudents.filter(s => s.chapterAccuracy < 40 && s.trend !== 'improving'),
        description: 'Students consistently scoring below 40% - need immediate support',
      },
      notEnoughData: {
        type: 'not_enough_data',
        students: linearEquationsStudents.filter(s => s.trend === 'not_enough_data'),
        description: 'Students with insufficient test data to determine trend',
      },
    },
  },
  {
    chapterId: 'ch-quadratic-eq',
    chapterName: 'Quadratic Equations',
    subjectId: 'sub-math',
    subjectName: 'Mathematics',
    batchId: 'section-10a',
    batchName: 'Class 10-A',
    
    overallMetrics: createMetrics(45, 48, 15, [
      { testName: 'Test 1', testDate: '2024-02-05', accuracy: 42, correct: 40, wrong: 55, skipped: 15 },
      { testName: 'Test 2', testDate: '2024-02-12', accuracy: 48, correct: 45, wrong: 48, skipped: 15 },
    ]),
    totalQuestions: 22,
    totalStudents: 10,
    testsContributing: 2,
    lastUpdated: '2024-02-12',
    
    topicPerformance: [
      {
        topicId: 't4',
        topicName: 'Factorization Method',
        questionCount: 8,
        metrics: createMetrics(22, 15, 3, [
          { testName: 'Test 1', testDate: '2024-02-05', accuracy: 55, correct: 20, wrong: 16, skipped: 4 },
          { testName: 'Test 2', testDate: '2024-02-12', accuracy: 59, correct: 22, wrong: 15, skipped: 3 },
        ]),
      },
      {
        topicId: 't5',
        topicName: 'Quadratic Formula',
        questionCount: 8,
        metrics: createMetrics(15, 20, 8, [
          { testName: 'Test 1', testDate: '2024-02-05', accuracy: 38, correct: 12, wrong: 20, skipped: 8 },
          { testName: 'Test 2', testDate: '2024-02-12', accuracy: 43, correct: 15, wrong: 20, skipped: 8 },
        ]),
      },
      {
        topicId: 't6',
        topicName: 'Nature of Roots',
        questionCount: 6,
        metrics: createMetrics(8, 13, 4, [
          { testName: 'Test 1', testDate: '2024-02-05', accuracy: 32, correct: 6, wrong: 13, skipped: 5 },
          { testName: 'Test 2', testDate: '2024-02-12', accuracy: 38, correct: 8, wrong: 13, skipped: 4 },
        ]),
      },
    ],
    
    difficultyPerformance: {
      easy: createMetrics(28, 10, 2, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 70, correct: 26, wrong: 11, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 74, correct: 28, wrong: 10, skipped: 2 },
      ]),
      medium: createMetrics(12, 22, 6, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 32, correct: 10, wrong: 22, skipped: 7 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 35, correct: 12, wrong: 22, skipped: 6 },
      ]),
      hard: createMetrics(5, 16, 7, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 22, correct: 4, wrong: 14, skipped: 8 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 24, correct: 5, wrong: 16, skipped: 7 },
      ]),
    },
    
    questionTypePerformance: {
      memory: createMetrics(18, 8, 2, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 65, correct: 16, wrong: 9, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 69, correct: 18, wrong: 8, skipped: 2 },
      ]),
      conceptual: createMetrics(15, 18, 5, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 42, correct: 13, wrong: 18, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 45, correct: 15, wrong: 18, skipped: 5 },
      ]),
      logical: createMetrics(8, 14, 4, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 32, correct: 6, wrong: 13, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 36, correct: 8, wrong: 14, skipped: 4 },
      ]),
      analytical: createMetrics(4, 8, 4, [
        { testName: 'Test 1', testDate: '2024-02-05', accuracy: 28, correct: 3, wrong: 8, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-02-12', accuracy: 33, correct: 4, wrong: 8, skipped: 4 },
      ]),
    },
    
    studentPerformance: linearEquationsStudents.map(s => ({
      ...s,
      chapterAccuracy: Math.max(20, s.chapterAccuracy - 12),
      masteryLevel: s.chapterAccuracy - 12 >= 70 ? 'mastered' as const : s.chapterAccuracy - 12 >= 40 ? 'near_mastery' as const : 'needs_improvement' as const,
    })),
    
    studentGroups: {
      improving: { type: 'improving', students: [], description: 'Students showing improvement' },
      declining: { type: 'declining', students: [], description: 'Students declining' },
      consistentlyLow: { type: 'consistently_low', students: [], description: 'Students needing support' },
      notEnoughData: { type: 'not_enough_data', students: [], description: 'Not enough data' },
    },
  },
  {
    chapterId: 'ch-motion',
    chapterName: 'Motion and Force',
    subjectId: 'sub-physics',
    subjectName: 'Physics',
    batchId: 'section-10a',
    batchName: 'Class 10-A',
    
    overallMetrics: createMetrics(52, 38, 10, [
      { testName: 'Physics Test 1', testDate: '2024-01-18', accuracy: 55, correct: 50, wrong: 40, skipped: 10 },
      { testName: 'Physics Test 2', testDate: '2024-01-25', accuracy: 58, correct: 52, wrong: 38, skipped: 10 },
    ]),
    totalQuestions: 25,
    totalStudents: 10,
    testsContributing: 2,
    lastUpdated: '2024-01-25',
    
    topicPerformance: [
      {
        topicId: 't7',
        topicName: 'Speed and Velocity',
        questionCount: 10,
        metrics: createMetrics(25, 12, 3, [
          { testName: 'Test 1', testDate: '2024-01-18', accuracy: 65, correct: 23, wrong: 13, skipped: 4 },
          { testName: 'Test 2', testDate: '2024-01-25', accuracy: 68, correct: 25, wrong: 12, skipped: 3 },
        ]),
      },
      {
        topicId: 't8',
        topicName: 'Newtons Laws',
        questionCount: 10,
        metrics: createMetrics(20, 18, 5, [
          { testName: 'Test 1', testDate: '2024-01-18', accuracy: 50, correct: 18, wrong: 18, skipped: 6 },
          { testName: 'Test 2', testDate: '2024-01-25', accuracy: 53, correct: 20, wrong: 18, skipped: 5 },
        ]),
      },
      {
        topicId: 't9',
        topicName: 'Friction',
        questionCount: 5,
        metrics: createMetrics(7, 8, 2, [
          { testName: 'Test 1', testDate: '2024-01-18', accuracy: 42, correct: 6, wrong: 8, skipped: 3 },
          { testName: 'Test 2', testDate: '2024-01-25', accuracy: 47, correct: 7, wrong: 8, skipped: 2 },
        ]),
      },
    ],
    
    difficultyPerformance: {
      easy: createMetrics(30, 8, 2, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 76, correct: 28, wrong: 9, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 79, correct: 30, wrong: 8, skipped: 2 },
      ]),
      medium: createMetrics(16, 20, 5, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 42, correct: 14, wrong: 20, skipped: 6 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 44, correct: 16, wrong: 20, skipped: 5 },
      ]),
      hard: createMetrics(6, 10, 3, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 35, correct: 5, wrong: 10, skipped: 4 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 38, correct: 6, wrong: 10, skipped: 3 },
      ]),
    },
    
    questionTypePerformance: {
      memory: createMetrics(22, 10, 3, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 65, correct: 20, wrong: 11, skipped: 4 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 69, correct: 22, wrong: 10, skipped: 3 },
      ]),
      conceptual: createMetrics(18, 15, 4, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 52, correct: 16, wrong: 15, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 55, correct: 18, wrong: 15, skipped: 4 },
      ]),
      logical: createMetrics(8, 10, 2, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 42, correct: 7, wrong: 10, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 44, correct: 8, wrong: 10, skipped: 2 },
      ]),
      analytical: createMetrics(4, 3, 1, [
        { testName: 'Test 1', testDate: '2024-01-18', accuracy: 50, correct: 3, wrong: 3, skipped: 2 },
        { testName: 'Test 2', testDate: '2024-01-25', accuracy: 57, correct: 4, wrong: 3, skipped: 1 },
      ]),
    },
    
    studentPerformance: linearEquationsStudents.map(s => ({
      ...s,
      chapterAccuracy: Math.min(95, s.chapterAccuracy + 5),
      masteryLevel: s.chapterAccuracy + 5 >= 70 ? 'mastered' as const : s.chapterAccuracy + 5 >= 40 ? 'near_mastery' as const : 'needs_improvement' as const,
    })),
    
    studentGroups: {
      improving: { type: 'improving', students: [], description: 'Students showing improvement' },
      declining: { type: 'declining', students: [], description: 'Students declining' },
      consistentlyLow: { type: 'consistently_low', students: [], description: 'Students needing support' },
      notEnoughData: { type: 'not_enough_data', students: [], description: 'Not enough data' },
    },
  },
  {
    chapterId: 'ch-chemical-reactions',
    chapterName: 'Chemical Reactions',
    subjectId: 'sub-chemistry',
    subjectName: 'Chemistry',
    batchId: 'section-10a',
    batchName: 'Class 10-A',
    
    overallMetrics: createMetrics(48, 42, 8, [
      { testName: 'Chemistry Test 1', testDate: '2024-01-20', accuracy: 50, correct: 45, wrong: 45, skipped: 10 },
      { testName: 'Chemistry Test 2', testDate: '2024-01-27', accuracy: 53, correct: 48, wrong: 42, skipped: 8 },
    ]),
    totalQuestions: 20,
    totalStudents: 10,
    testsContributing: 2,
    lastUpdated: '2024-01-27',
    
    topicPerformance: [
      {
        topicId: 't10',
        topicName: 'Types of Reactions',
        questionCount: 8,
        metrics: createMetrics(22, 14, 2, [
          { testName: 'Test 1', testDate: '2024-01-20', accuracy: 58, correct: 20, wrong: 15, skipped: 3 },
          { testName: 'Test 2', testDate: '2024-01-27', accuracy: 61, correct: 22, wrong: 14, skipped: 2 },
        ]),
      },
      {
        topicId: 't11',
        topicName: 'Balancing Equations',
        questionCount: 7,
        metrics: createMetrics(16, 18, 4, [
          { testName: 'Test 1', testDate: '2024-01-20', accuracy: 45, correct: 14, wrong: 17, skipped: 5 },
          { testName: 'Test 2', testDate: '2024-01-27', accuracy: 47, correct: 16, wrong: 18, skipped: 4 },
        ]),
      },
      {
        topicId: 't12',
        topicName: 'Oxidation-Reduction',
        questionCount: 5,
        metrics: createMetrics(10, 10, 2, [
          { testName: 'Test 1', testDate: '2024-01-20', accuracy: 48, correct: 9, wrong: 10, skipped: 3 },
          { testName: 'Test 2', testDate: '2024-01-27', accuracy: 50, correct: 10, wrong: 10, skipped: 2 },
        ]),
      },
    ],
    
    difficultyPerformance: {
      easy: createMetrics(28, 10, 2, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 72, correct: 26, wrong: 11, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 74, correct: 28, wrong: 10, skipped: 2 },
      ]),
      medium: createMetrics(14, 20, 4, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 38, correct: 12, wrong: 20, skipped: 5 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 41, correct: 14, wrong: 20, skipped: 4 },
      ]),
      hard: createMetrics(6, 12, 2, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 30, correct: 5, wrong: 12, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 33, correct: 6, wrong: 12, skipped: 2 },
      ]),
    },
    
    questionTypePerformance: {
      memory: createMetrics(24, 12, 2, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 64, correct: 22, wrong: 13, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 67, correct: 24, wrong: 12, skipped: 2 },
      ]),
      conceptual: createMetrics(14, 16, 3, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 45, correct: 12, wrong: 15, skipped: 4 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 47, correct: 14, wrong: 16, skipped: 3 },
      ]),
      logical: createMetrics(6, 8, 2, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 40, correct: 5, wrong: 8, skipped: 3 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 43, correct: 6, wrong: 8, skipped: 2 },
      ]),
      analytical: createMetrics(4, 6, 1, [
        { testName: 'Test 1', testDate: '2024-01-20', accuracy: 38, correct: 3, wrong: 5, skipped: 2 },
        { testName: 'Test 2', testDate: '2024-01-27', accuracy: 40, correct: 4, wrong: 6, skipped: 1 },
      ]),
    },
    
    studentPerformance: linearEquationsStudents.map(s => ({
      ...s,
      chapterAccuracy: Math.max(25, s.chapterAccuracy - 8),
    })),
    
    studentGroups: {
      improving: { type: 'improving', students: [], description: 'Students showing improvement' },
      declining: { type: 'declining', students: [], description: 'Students declining' },
      consistentlyLow: { type: 'consistently_low', students: [], description: 'Students needing support' },
      notEnoughData: { type: 'not_enough_data', students: [], description: 'Not enough data' },
    },
  },
];

// Chapter summaries for the list view
export const mockChapterSummaries: ChapterSummary[] = mockChapterAnalytics.map(ch => ({
  chapterId: ch.chapterId,
  chapterName: ch.chapterName,
  subjectId: ch.subjectId,
  subjectName: ch.subjectName,
  accuracy: ch.overallMetrics.accuracy,
  trend: ch.overallMetrics.trend,
  category: ch.overallMetrics.category,
  topicsCount: ch.topicPerformance.length,
  studentsCount: ch.totalStudents,
  lastUpdated: ch.lastUpdated,
}));

// Available batches and subjects for filters
export const mockBatchesForFilter = [
  { id: 'section-10a', name: 'Class 10-A' },
  { id: 'section-10b', name: 'Class 10-B' },
  { id: 'section-9a', name: 'Class 9-A' },
];

export const mockSubjectsForFilter = [
  { id: 'sub-math', name: 'Mathematics' },
  { id: 'sub-physics', name: 'Physics' },
  { id: 'sub-chemistry', name: 'Chemistry' },
];
