import { GrandTest, GrandTestDetail, getPriorityLevel, getStudentBand } from '@/types/grandTest';

// Total students for our mock data
const TOTAL_STUDENTS = 245;

export const mockGrandTests: GrandTest[] = [
  {
    id: 'gt-001',
    name: 'Half-Yearly Examination 2024',
    type: 'half-yearly',
    date: '2024-09-15',
    totalQuestions: 150,
    totalStudents: 245,
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    overallAccuracy: 64.6,
    overallEngagement: 92.6,
    status: 'completed',
    ranksPublished: false
  },
  {
    id: 'gt-002',
    name: 'Term 1 Assessment 2024',
    type: 'term',
    date: '2024-07-20',
    totalQuestions: 100,
    totalStudents: 238,
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    overallAccuracy: 58.2,
    overallEngagement: 88.4,
    status: 'completed',
    ranksPublished: true,
    competitionExamType: 'jee_mains'
  },
  {
    id: 'gt-003',
    name: 'Annual Examination 2023-24',
    type: 'annual',
    date: '2024-03-15',
    totalQuestions: 200,
    totalStudents: 252,
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    overallAccuracy: 71.3,
    overallEngagement: 94.2,
    status: 'completed',
    ranksPublished: true,
    competitionExamType: 'neet'
  },
  {
    id: 'gt-004',
    name: 'Quarterly Assessment Q1',
    type: 'quarterly',
    date: '2024-11-10',
    totalQuestions: 75,
    totalStudents: 240,
    subjects: ['Mathematics', 'Physics'],
    overallAccuracy: 0,
    overallEngagement: 0,
    status: 'scheduled'
  }
];

// Realistic cumulative mock data
// 150 questions × 245 students = 36,750 total responses
export const mockGrandTestDetail: GrandTestDetail = {
  id: 'gt-001',
  name: 'Half-Yearly Examination 2024',
  type: 'half-yearly',
  date: '2024-09-15',
  totalQuestions: 150,
  totalStudents: TOTAL_STUDENTS,
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  overallAccuracy: 64.6,
  overallEngagement: 92.6,
  status: 'completed',
  ranksPublished: false,
  // Overall cumulative stats
  totalResponses: 150 * TOTAL_STUDENTS, // 36,750
  totalCorrect: 21931, // ~64.6% of attempted
  totalWrong: 12001,   // Remaining attempted
  totalSkipped: 2818,  // ~7.4% skipped
  studentsAbovePassing: 182, // 74% of students above 60%
  studentsBelowPassing: 28,  // 11% of students below 40%
  avgCorrectPerStudent: 89,  // 21931 / 245 ≈ 89
  subjectPerformance: [
    {
      id: 'math',
      name: 'Mathematics',
      color: '#3B82F6',
      totalQuestions: 50,
      // 50 questions × 245 students = 12,250 responses
      totalResponses: 50 * TOTAL_STUDENTS,
      totalCorrect: 7056,    // ~64% of attempted
      totalWrong: 3969,      // ~36% of attempted
      totalSkipped: 1225,    // ~10% skipped
      accuracy: 64.0,
      engagement: 90.0,
      avgCorrectPerStudent: 29, // 7056/245 ≈ 29 out of 50
      studentsStruggling: 52,   // ~21% with <50% accuracy
      studentsExcelling: 78,    // ~32% with >80% accuracy
      priorityLevel: getPriorityLevel(64.0),
      chapters: [
        {
          id: 'math-linear',
          name: 'Linear Equations',
          subjectId: 'math',
          totalQuestions: 15,
          totalResponses: 15 * TOTAL_STUDENTS, // 3,675
          totalCorrect: 1985,
          totalWrong: 1323,
          totalSkipped: 367,
          accuracy: 60.0,
          engagement: 90.0,
          studentsStruggling: 68, // ~28% need revision
          priorityLevel: getPriorityLevel(60.0)
        },
        {
          id: 'math-quadratic',
          name: 'Quadratic Equations',
          subjectId: 'math',
          totalQuestions: 15,
          totalResponses: 15 * TOTAL_STUDENTS,
          totalCorrect: 2352,
          totalWrong: 941,
          totalSkipped: 382,
          accuracy: 71.4,
          engagement: 89.6,
          studentsStruggling: 42,
          priorityLevel: getPriorityLevel(71.4)
        },
        {
          id: 'math-polynomials',
          name: 'Polynomials',
          subjectId: 'math',
          totalQuestions: 20,
          totalResponses: 20 * TOTAL_STUDENTS,
          totalCorrect: 2719,
          totalWrong: 1631,
          totalSkipped: 550,
          accuracy: 62.5,
          engagement: 88.8,
          studentsStruggling: 58,
          priorityLevel: getPriorityLevel(62.5)
        }
      ]
    },
    {
      id: 'physics',
      name: 'Physics',
      color: '#8B5CF6',
      totalQuestions: 50,
      totalResponses: 50 * TOTAL_STUDENTS,
      totalCorrect: 6174,    // ~56.5% accuracy
      totalWrong: 4753,
      totalSkipped: 1323,
      accuracy: 56.5,
      engagement: 89.2,
      avgCorrectPerStudent: 25,
      studentsStruggling: 78,   // ~32% struggling
      studentsExcelling: 52,    // ~21% excelling
      priorityLevel: getPriorityLevel(56.5),
      chapters: [
        {
          id: 'phy-motion',
          name: 'Motion & Laws',
          subjectId: 'physics',
          totalQuestions: 20,
          totalResponses: 20 * TOTAL_STUDENTS,
          totalCorrect: 2205,
          totalWrong: 2205,
          totalSkipped: 490,
          accuracy: 50.0,
          engagement: 90.0,
          studentsStruggling: 95,
          priorityLevel: getPriorityLevel(50.0)
        },
        {
          id: 'phy-energy',
          name: 'Work & Energy',
          subjectId: 'physics',
          totalQuestions: 15,
          totalResponses: 15 * TOTAL_STUDENTS,
          totalCorrect: 1985,
          totalWrong: 1323,
          totalSkipped: 367,
          accuracy: 60.0,
          engagement: 90.0,
          studentsStruggling: 62,
          priorityLevel: getPriorityLevel(60.0)
        },
        {
          id: 'phy-waves',
          name: 'Waves & Sound',
          subjectId: 'physics',
          totalQuestions: 15,
          totalResponses: 15 * TOTAL_STUDENTS,
          totalCorrect: 1984,
          totalWrong: 1225,
          totalSkipped: 466,
          accuracy: 61.8,
          engagement: 87.3,
          studentsStruggling: 58,
          priorityLevel: getPriorityLevel(61.8)
        }
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      color: '#10B981',
      totalQuestions: 50,
      totalResponses: 50 * TOTAL_STUDENTS,
      totalCorrect: 8701,    // ~76.5% accuracy
      totalWrong: 2671,
      totalSkipped: 878,
      accuracy: 76.5,
      engagement: 92.8,
      avgCorrectPerStudent: 36,
      studentsStruggling: 32,
      studentsExcelling: 125,
      priorityLevel: getPriorityLevel(76.5),
      chapters: [
        {
          id: 'chem-atomic',
          name: 'Atomic Structure',
          subjectId: 'chemistry',
          totalQuestions: 18,
          totalResponses: 18 * TOTAL_STUDENTS,
          totalCorrect: 3175,
          totalWrong: 916,
          totalSkipped: 319,
          accuracy: 77.6,
          engagement: 92.8,
          studentsStruggling: 28,
          priorityLevel: getPriorityLevel(77.6)
        },
        {
          id: 'chem-periodic',
          name: 'Periodic Table',
          subjectId: 'chemistry',
          totalQuestions: 16,
          totalResponses: 16 * TOTAL_STUDENTS,
          totalCorrect: 2793,
          totalWrong: 839,
          totalSkipped: 288,
          accuracy: 76.9,
          engagement: 92.6,
          studentsStruggling: 30,
          priorityLevel: getPriorityLevel(76.9)
        },
        {
          id: 'chem-bonding',
          name: 'Chemical Bonding',
          subjectId: 'chemistry',
          totalQuestions: 16,
          totalResponses: 16 * TOTAL_STUDENTS,
          totalCorrect: 2733,
          totalWrong: 916,
          totalSkipped: 271,
          accuracy: 74.9,
          engagement: 93.1,
          studentsStruggling: 35,
          priorityLevel: getPriorityLevel(74.9)
        }
      ]
    }
  ],
  studentPerformance: [
    {
      id: 'std-001',
      name: 'Aarav Sharma',
      rollNumber: '001',
      totalQuestions: 150,
      correct: 125,
      wrong: 20,
      skipped: 5,
      accuracy: 86.2,
      band: getStudentBand(86.2),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 44, wrong: 5, skipped: 1, accuracy: 89.8 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 41, wrong: 8, skipped: 1, accuracy: 83.7 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 40, wrong: 7, skipped: 3, accuracy: 85.1 }
      ]
    },
    {
      id: 'std-002',
      name: 'Priya Patel',
      rollNumber: '002',
      totalQuestions: 150,
      correct: 118,
      wrong: 27,
      skipped: 5,
      accuracy: 81.4,
      band: getStudentBand(81.4),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 39, wrong: 10, skipped: 1, accuracy: 79.6 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 40, wrong: 10, skipped: 0, accuracy: 80.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 39, wrong: 7, skipped: 4, accuracy: 84.8 }
      ]
    },
    {
      id: 'std-003',
      name: 'Rahul Verma',
      rollNumber: '003',
      totalQuestions: 150,
      correct: 95,
      wrong: 45,
      skipped: 10,
      accuracy: 67.9,
      band: getStudentBand(67.9),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 36, wrong: 12, skipped: 2, accuracy: 75.0 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 28, wrong: 20, skipped: 2, accuracy: 58.3 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 31, wrong: 13, skipped: 6, accuracy: 70.5 }
      ]
    },
    {
      id: 'std-004',
      name: 'Sneha Gupta',
      rollNumber: '004',
      totalQuestions: 150,
      correct: 85,
      wrong: 55,
      skipped: 10,
      accuracy: 60.7,
      band: getStudentBand(60.7),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 32, wrong: 18, skipped: 0, accuracy: 64.0 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 26, wrong: 22, skipped: 2, accuracy: 54.2 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 27, wrong: 15, skipped: 8, accuracy: 64.3 }
      ]
    },
    {
      id: 'std-005',
      name: 'Abdul Khan',
      rollNumber: '005',
      totalQuestions: 150,
      correct: 52,
      wrong: 78,
      skipped: 20,
      accuracy: 40.0,
      band: getStudentBand(40.0),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 19, wrong: 28, skipped: 3, accuracy: 40.4 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 14, wrong: 30, skipped: 6, accuracy: 31.8 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 19, wrong: 20, skipped: 11, accuracy: 48.7 }
      ]
    },
    {
      id: 'std-006',
      name: 'Sia Reddy',
      rollNumber: '006',
      totalQuestions: 150,
      correct: 45,
      wrong: 85,
      skipped: 20,
      accuracy: 34.6,
      band: getStudentBand(34.6),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 16, wrong: 32, skipped: 2, accuracy: 33.3 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 12, wrong: 32, skipped: 6, accuracy: 27.3 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 17, wrong: 21, skipped: 12, accuracy: 44.7 }
      ]
    },
    {
      id: 'std-007',
      name: 'Vikram Singh',
      rollNumber: '007',
      totalQuestions: 150,
      correct: 108,
      wrong: 35,
      skipped: 7,
      accuracy: 75.5,
      band: getStudentBand(75.5),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 39, wrong: 9, skipped: 2, accuracy: 81.3 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 32, wrong: 16, skipped: 2, accuracy: 66.7 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 37, wrong: 10, skipped: 3, accuracy: 78.7 }
      ]
    },
    {
      id: 'std-008',
      name: 'Meera Nair',
      rollNumber: '008',
      totalQuestions: 150,
      correct: 72,
      wrong: 63,
      skipped: 15,
      accuracy: 53.3,
      band: getStudentBand(53.3),
      subjectWise: [
        { subjectId: 'math', subjectName: 'Mathematics', correct: 27, wrong: 20, skipped: 3, accuracy: 57.4 },
        { subjectId: 'physics', subjectName: 'Physics', correct: 22, wrong: 24, skipped: 4, accuracy: 47.8 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', correct: 23, wrong: 19, skipped: 8, accuracy: 54.8 }
      ]
    }
  ]
};

// Function to get grand test by ID
export function getGrandTestById(id: string): GrandTestDetail | undefined {
  if (id === 'gt-001') {
    return mockGrandTestDetail;
  }
  // For other tests, generate similar mock data
  const test = mockGrandTests.find(t => t.id === id);
  if (!test || test.status !== 'completed') return undefined;
  
  const totalResponses = test.totalQuestions * test.totalStudents;
  const attemptedRate = test.overallEngagement / 100;
  const attemptedResponses = Math.round(totalResponses * attemptedRate);
  const totalCorrect = Math.round(attemptedResponses * (test.overallAccuracy / 100));
  const totalWrong = attemptedResponses - totalCorrect;
  const totalSkipped = totalResponses - attemptedResponses;
  
  // Return a modified version based on the test
  return {
    ...mockGrandTestDetail,
    id: test.id,
    name: test.name,
    type: test.type,
    date: test.date,
    totalQuestions: test.totalQuestions,
    totalStudents: test.totalStudents,
    subjects: test.subjects,
    overallAccuracy: test.overallAccuracy,
    overallEngagement: test.overallEngagement,
    status: test.status,
    ranksPublished: test.ranksPublished,
    competitionExamType: test.competitionExamType,
    totalResponses,
    totalCorrect,
    totalWrong,
    totalSkipped,
    studentsAbovePassing: Math.round(test.totalStudents * 0.74),
    studentsBelowPassing: Math.round(test.totalStudents * 0.11),
    avgCorrectPerStudent: Math.round(totalCorrect / test.totalStudents)
  };
}
