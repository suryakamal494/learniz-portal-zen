export type QuestionStatus = 'available' | 'deleted'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export type QuestionTypeValue = 'single' | 'multiple' | 'fillInBlanks'

export interface AIExamConfig {
  subject: string
  chapter: string
  topics: string[]
  numberOfQuestions: number
  difficulties: DifficultyLevel[]
  questionType: QuestionTypeValue
  categories: string[]
  customInstructions: string
}

export interface TestDetails {
  testName: string
  durationMinutes: number
  marksPerQuestion: number
  negativeMarkingPct: number
  examType: 'No Section, No Timer' | 'Section with No Timer' | 'Section with Timer'
  instructionId: string
}

export interface GeneratedQuestionOption {
  label: string // A, B, C, D
  text: string
}

export interface GeneratedQuestion {
  id: string
  batchId: string
  serial: number
  questionText: string
  options: GeneratedQuestionOption[]
  correctAnswerIndex: number
  difficulty: DifficultyLevel
  category: string
  marks: number
  estimatedMinutes: number
  status: QuestionStatus
  selected: boolean
  chapter: string
  topic: string
  explanation?: string
  diagramSvg?: string
}

export interface AIQuestionBatch {
  id: string
  index: number
  createdAt: string
  config: AIExamConfig
}
