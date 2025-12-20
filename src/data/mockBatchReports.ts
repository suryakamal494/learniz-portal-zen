
import { BatchExamReport, StudentExamResult, QuestionAnalysis, DetailedExamReport } from '@/types/batchReport'

export const mockBatchExamReports: BatchExamReport[] = [
  {
    id: 'report-1',
    date: '2024-01-15',
    batchName: 'Physics - Grade 12A',
    batchId: 'batch-1',
    examTitle: 'Mechanics Mid-term',
    examId: 'exam-1',
    averagePerformance: 78.5,
    passPercentage: 85.7,
    totalStudents: 25,
    totalQuestions: 20
  },
  {
    id: 'report-2',
    date: '2024-01-20',
    batchName: 'Chemistry - Grade 12B',
    batchId: 'batch-2',
    examTitle: 'Organic Chemistry Test',
    examId: 'exam-2',
    averagePerformance: 82.3,
    passPercentage: 90.0,
    totalStudents: 30,
    totalQuestions: 25
  },
  {
    id: 'report-3',
    date: '2024-01-25',
    batchName: 'Mathematics - Grade 11A',
    batchId: 'batch-3',
    examTitle: 'Calculus Assessment',
    examId: 'exam-3',
    averagePerformance: 75.8,
    passPercentage: 78.6,
    totalStudents: 28,
    totalQuestions: 15
  },
  {
    id: 'report-4',
    date: '2024-02-01',
    batchName: 'Physics - Grade 12A',
    batchId: 'batch-1',
    examTitle: 'Waves and Optics Quiz',
    examId: 'exam-4',
    averagePerformance: 71.2,
    passPercentage: 72.0,
    totalStudents: 25,
    totalQuestions: 18
  }
]

export const mockStudentResults: Record<string, StudentExamResult[]> = {
  'exam-1': [
    {
      studentId: 'student-1',
      studentName: 'John Doe',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 45 },
        { questionId: 'q2', questionNumber: 2, status: 'wrong', selectedAnswer: 'B', correctAnswer: 'C', timeSpent: 60 },
        { questionId: 'q3', questionNumber: 3, status: 'skipped', correctAnswer: 'D', timeSpent: 0 },
        { questionId: 'q4', questionNumber: 4, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 50 }
      ],
      totalScore: 14,
      percentage: 70,
      passed: true
    },
    {
      studentId: 'student-2',
      studentName: 'Jane Smith',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 40 },
        { questionId: 'q2', questionNumber: 2, status: 'correct', selectedAnswer: 'C', correctAnswer: 'C', timeSpent: 55 },
        { questionId: 'q3', questionNumber: 3, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 65 },
        { questionId: 'q4', questionNumber: 4, status: 'wrong', selectedAnswer: 'A', correctAnswer: 'D', timeSpent: 70 }
      ],
      totalScore: 18,
      percentage: 90,
      passed: true
    },
    {
      studentId: 'student-3',
      studentName: 'Mike Johnson',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'wrong', selectedAnswer: 'B', correctAnswer: 'A', timeSpent: 50 },
        { questionId: 'q2', questionNumber: 2, status: 'correct', selectedAnswer: 'C', correctAnswer: 'C', timeSpent: 45 },
        { questionId: 'q3', questionNumber: 3, status: 'skipped', correctAnswer: 'D', timeSpent: 0 },
        { questionId: 'q4', questionNumber: 4, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 55 }
      ],
      totalScore: 12,
      percentage: 60,
      passed: false
    }
  ],
  'exam-2': [
    {
      studentId: 'student-4',
      studentName: 'Sarah Wilson',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'B', correctAnswer: 'B', timeSpent: 50 },
        { questionId: 'q2', questionNumber: 2, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 45 }
      ],
      totalScore: 20,
      percentage: 85,
      passed: true
    }
  ],
  'exam-3': [
    {
      studentId: 'student-5',
      studentName: 'David Brown',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'C', correctAnswer: 'C', timeSpent: 60 },
        { questionId: 'q2', questionNumber: 2, status: 'wrong', selectedAnswer: 'A', correctAnswer: 'B', timeSpent: 55 }
      ],
      totalScore: 15,
      percentage: 75,
      passed: true
    }
  ],
  'exam-4': [
    {
      studentId: 'student-1',
      studentName: 'John Doe',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 120 },
        { questionId: 'q2', questionNumber: 2, status: 'wrong', selectedAnswer: 'B', correctAnswer: 'C', timeSpent: 180 },
        { questionId: 'q3', questionNumber: 3, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 150 },
        { questionId: 'q4', questionNumber: 4, status: 'skipped', correctAnswer: 'A', timeSpent: 0 },
        { questionId: 'q5', questionNumber: 5, status: 'correct', selectedAnswer: 'B', correctAnswer: 'B', timeSpent: 200 },
        { questionId: 'q6', questionNumber: 6, status: 'wrong', selectedAnswer: 'C', correctAnswer: 'A', timeSpent: 160 }
      ],
      totalScore: 12,
      percentage: 67,
      passed: true
    },
    {
      studentId: 'student-2',
      studentName: 'Jane Smith',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 100 },
        { questionId: 'q2', questionNumber: 2, status: 'correct', selectedAnswer: 'C', correctAnswer: 'C', timeSpent: 140 },
        { questionId: 'q3', questionNumber: 3, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 130 },
        { questionId: 'q4', questionNumber: 4, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 170 },
        { questionId: 'q5', questionNumber: 5, status: 'wrong', selectedAnswer: 'C', correctAnswer: 'B', timeSpent: 190 },
        { questionId: 'q6', questionNumber: 6, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 150 }
      ],
      totalScore: 15,
      percentage: 83,
      passed: true
    },
    {
      studentId: 'student-3',
      studentName: 'Mike Johnson',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'wrong', selectedAnswer: 'B', correctAnswer: 'A', timeSpent: 180 },
        { questionId: 'q2', questionNumber: 2, status: 'skipped', correctAnswer: 'C', timeSpent: 0 },
        { questionId: 'q3', questionNumber: 3, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 200 },
        { questionId: 'q4', questionNumber: 4, status: 'wrong', selectedAnswer: 'B', correctAnswer: 'A', timeSpent: 160 },
        { questionId: 'q5', questionNumber: 5, status: 'correct', selectedAnswer: 'B', correctAnswer: 'B', timeSpent: 140 },
        { questionId: 'q6', questionNumber: 6, status: 'skipped', correctAnswer: 'A', timeSpent: 0 }
      ],
      totalScore: 6,
      percentage: 33,
      passed: false
    },
    {
      studentId: 'student-6',
      studentName: 'Emily Davis',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 110 },
        { questionId: 'q2', questionNumber: 2, status: 'correct', selectedAnswer: 'C', correctAnswer: 'C', timeSpent: 120 },
        { questionId: 'q3', questionNumber: 3, status: 'wrong', selectedAnswer: 'A', correctAnswer: 'D', timeSpent: 180 },
        { questionId: 'q4', questionNumber: 4, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 160 },
        { questionId: 'q5', questionNumber: 5, status: 'correct', selectedAnswer: 'B', correctAnswer: 'B', timeSpent: 150 },
        { questionId: 'q6', questionNumber: 6, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 140 }
      ],
      totalScore: 15,
      percentage: 83,
      passed: true
    },
    {
      studentId: 'student-7',
      studentName: 'Alex Chen',
      answers: [
        { questionId: 'q1', questionNumber: 1, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 90 },
        { questionId: 'q2', questionNumber: 2, status: 'wrong', selectedAnswer: 'A', correctAnswer: 'C', timeSpent: 200 },
        { questionId: 'q3', questionNumber: 3, status: 'correct', selectedAnswer: 'D', correctAnswer: 'D', timeSpent: 170 },
        { questionId: 'q4', questionNumber: 4, status: 'correct', selectedAnswer: 'A', correctAnswer: 'A', timeSpent: 130 },
        { questionId: 'q5', questionNumber: 5, status: 'skipped', correctAnswer: 'B', timeSpent: 0 },
        { questionId: 'q6', questionNumber: 6, status: 'wrong', selectedAnswer: 'C', correctAnswer: 'A', timeSpent: 180 }
      ],
      totalScore: 9,
      percentage: 50,
      passed: false
    }
  ]
}

export const mockQuestionAnalysis: Record<string, QuestionAnalysis[]> = {
  'exam-1': [
    {
      questionId: 'q1',
      questionNumber: 1,
      questionText: 'A particle moves with constant acceleration. If its initial velocity is 5 m/s and acceleration is 2 m/s², what is its velocity after 3 seconds?',
      correctCount: 22,
      wrongCount: 2,
      skippedCount: 1,
      totalStudents: 25,
      correctPercentage: 88
    },
    {
      questionId: 'q2',
      questionNumber: 2,
      questionText: 'What is the force required to accelerate a 10 kg mass at 3 m/s²?',
      correctCount: 18,
      wrongCount: 5,
      skippedCount: 2,
      totalStudents: 25,
      correctPercentage: 72
    },
    {
      questionId: 'q3',
      questionNumber: 3,
      questionText: 'A projectile is launched at 45° with initial velocity 20 m/s. What is the maximum height reached?',
      correctCount: 8,
      wrongCount: 12,
      skippedCount: 5,
      totalStudents: 25,
      correctPercentage: 32
    },
    {
      questionId: 'q4',
      questionNumber: 4,
      questionText: 'Calculate the kinetic energy of a 5 kg object moving at 10 m/s.',
      correctCount: 21,
      wrongCount: 3,
      skippedCount: 1,
      totalStudents: 25,
      correctPercentage: 84
    },
    {
      questionId: 'q5',
      questionNumber: 5,
      questionText: 'What is the momentum of a 2 kg ball traveling at 15 m/s?',
      correctCount: 23,
      wrongCount: 2,
      skippedCount: 0,
      totalStudents: 25,
      correctPercentage: 92
    },
    {
      questionId: 'q6',
      questionNumber: 6,
      questionText: 'Calculate the work done when a force of 50 N moves an object 10 m in the direction of force.',
      correctCount: 16,
      wrongCount: 6,
      skippedCount: 3,
      totalStudents: 25,
      correctPercentage: 64
    },
    {
      questionId: 'q7',
      questionNumber: 7,
      questionText: 'A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?',
      correctCount: 20,
      wrongCount: 4,
      skippedCount: 1,
      totalStudents: 25,
      correctPercentage: 80
    },
    {
      questionId: 'q8',
      questionNumber: 8,
      questionText: 'Calculate the gravitational potential energy of a 10 kg mass at height 5 m (g=10 m/s²).',
      correctCount: 7,
      wrongCount: 10,
      skippedCount: 8,
      totalStudents: 25,
      correctPercentage: 28
    }
  ],
  'exam-4': [
    {
      questionId: 'q1',
      questionNumber: 1,
      questionText: 'What is the frequency of a wave with wavelength 2m and speed 10 m/s?',
      correctCount: 4,
      wrongCount: 1,
      skippedCount: 0,
      totalStudents: 5,
      correctPercentage: 80
    },
    {
      questionId: 'q2',
      questionNumber: 2,
      questionText: 'A light ray travels from air to glass. What happens to its speed?',
      correctCount: 2,
      wrongCount: 2,
      skippedCount: 1,
      totalStudents: 5,
      correctPercentage: 40
    },
    {
      questionId: 'q3',
      questionNumber: 3,
      questionText: 'Calculate the refractive index if light bends 30° from normal in the medium.',
      correctCount: 4,
      wrongCount: 1,
      skippedCount: 0,
      totalStudents: 5,
      correctPercentage: 80
    },
    {
      questionId: 'q4',
      questionNumber: 4,
      questionText: 'What is the critical angle for total internal reflection in diamond (n=2.4)?',
      correctCount: 3,
      wrongCount: 1,
      skippedCount: 1,
      totalStudents: 5,
      correctPercentage: 60
    },
    {
      questionId: 'q5',
      questionNumber: 5,
      questionText: 'A concave mirror has focal length 20cm. Where should object be placed for magnification of 2?',
      correctCount: 3,
      wrongCount: 1,
      skippedCount: 1,
      totalStudents: 5,
      correctPercentage: 60
    },
    {
      questionId: 'q6',
      questionNumber: 6,
      questionText: 'Calculate the power of a lens with focal length 25cm.',
      correctCount: 3,
      wrongCount: 2,
      skippedCount: 0,
      totalStudents: 5,
      correctPercentage: 60
    }
  ]
}

export const getDetailedExamReport = (examId: string): DetailedExamReport | null => {
  const examReport = mockBatchExamReports.find(report => report.examId === examId)
  const studentResults = mockStudentResults[examId]
  const questionAnalysis = mockQuestionAnalysis[examId]
  
  if (!examReport || !studentResults || !questionAnalysis) {
    return null
  }
  
  return {
    examReport,
    studentResults,
    questionAnalysis
  }
}
