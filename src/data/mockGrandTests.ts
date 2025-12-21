import { GrandTest, GrandTestDetail, getPriorityLevel, getStudentBand } from '@/types/grandTest';

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
    status: 'completed'
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
    status: 'completed'
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
    status: 'completed'
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

export const mockGrandTestDetail: GrandTestDetail = {
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
  correct: 420,
  wrong: 230,
  skipped: 100,
  subjectPerformance: [
    {
      id: 'math',
      name: 'Mathematics',
      color: '#3B82F6',
      totalQuestions: 50,
      correct: 160,
      wrong: 90,
      skipped: 20,
      accuracy: 64.0,
      engagement: 92.6,
      priorityLevel: getPriorityLevel(64.0),
      chapters: [
        {
          id: 'math-linear',
          name: 'Linear Equations',
          subjectId: 'math',
          totalQuestions: 15,
          correct: 60,
          wrong: 40,
          skipped: 10,
          accuracy: 60.0,
          engagement: 90.9,
          priorityLevel: getPriorityLevel(60.0)
        },
        {
          id: 'math-quadratic',
          name: 'Quadratic Equations',
          subjectId: 'math',
          totalQuestions: 15,
          correct: 50,
          wrong: 20,
          skipped: 5,
          accuracy: 71.4,
          engagement: 93.3,
          priorityLevel: getPriorityLevel(71.4)
        },
        {
          id: 'math-polynomials',
          name: 'Polynomials',
          subjectId: 'math',
          totalQuestions: 20,
          correct: 50,
          wrong: 30,
          skipped: 5,
          accuracy: 62.5,
          engagement: 94.1,
          priorityLevel: getPriorityLevel(62.5)
        }
      ]
    },
    {
      id: 'physics',
      name: 'Physics',
      color: '#8B5CF6',
      totalQuestions: 50,
      correct: 130,
      wrong: 100,
      skipped: 30,
      accuracy: 56.5,
      engagement: 88.5,
      priorityLevel: getPriorityLevel(56.5),
      chapters: [
        {
          id: 'phy-motion',
          name: 'Motion & Laws',
          subjectId: 'physics',
          totalQuestions: 20,
          correct: 45,
          wrong: 45,
          skipped: 15,
          accuracy: 50.0,
          engagement: 85.7,
          priorityLevel: getPriorityLevel(50.0)
        },
        {
          id: 'phy-energy',
          name: 'Work & Energy',
          subjectId: 'physics',
          totalQuestions: 15,
          correct: 42,
          wrong: 28,
          skipped: 8,
          accuracy: 60.0,
          engagement: 89.7,
          priorityLevel: getPriorityLevel(60.0)
        },
        {
          id: 'phy-waves',
          name: 'Waves & Sound',
          subjectId: 'physics',
          totalQuestions: 15,
          correct: 43,
          wrong: 27,
          skipped: 7,
          accuracy: 61.4,
          engagement: 90.3,
          priorityLevel: getPriorityLevel(61.4)
        }
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      color: '#10B981',
      totalQuestions: 50,
      correct: 130,
      wrong: 40,
      skipped: 50,
      accuracy: 76.5,
      engagement: 77.3,
      priorityLevel: getPriorityLevel(76.5),
      chapters: [
        {
          id: 'chem-atomic',
          name: 'Atomic Structure',
          subjectId: 'chemistry',
          totalQuestions: 18,
          correct: 52,
          wrong: 15,
          skipped: 18,
          accuracy: 77.6,
          engagement: 78.8,
          priorityLevel: getPriorityLevel(77.6)
        },
        {
          id: 'chem-periodic',
          name: 'Periodic Table',
          subjectId: 'chemistry',
          totalQuestions: 16,
          correct: 40,
          wrong: 12,
          skipped: 16,
          accuracy: 76.9,
          engagement: 76.5,
          priorityLevel: getPriorityLevel(76.9)
        },
        {
          id: 'chem-bonding',
          name: 'Chemical Bonding',
          subjectId: 'chemistry',
          totalQuestions: 16,
          correct: 38,
          wrong: 13,
          skipped: 16,
          accuracy: 74.5,
          engagement: 75.9,
          priorityLevel: getPriorityLevel(74.5)
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 88.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 82.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 90.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 78.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 80.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 86.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 72.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 58.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 74.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 64.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 52.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 68.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 38.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 35.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 48.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 32.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 30.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 42.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 78.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 70.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 80.0 }
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
        { subjectId: 'math', subjectName: 'Mathematics', accuracy: 55.0 },
        { subjectId: 'physics', subjectName: 'Physics', accuracy: 48.0 },
        { subjectId: 'chemistry', subjectName: 'Chemistry', accuracy: 58.0 }
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
    status: test.status
  };
}
