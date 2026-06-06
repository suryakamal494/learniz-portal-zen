import type {
  AIExamConfig,
  GeneratedQuestion,
  DifficultyLevel,
} from '@/types/aiExamGenerator'

export interface SubjectOption {
  id: string
  name: string
  chapters: ChapterOption[]
}

export interface ChapterOption {
  id: string
  name: string
  topics: string[]
}

export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    id: 'physics',
    name: 'Physics',
    chapters: [
      {
        id: 'phy-1',
        name: 'Electric Charges and Fields',
        topics: ['Coulomb\u2019s Law', 'Electric Field', 'Gauss\u2019s Law', 'Electric Flux'],
      },
      {
        id: 'phy-2',
        name: 'Current Electricity',
        topics: ['Ohm\u2019s Law', 'Drift Velocity', 'Kirchhoff\u2019s Laws', 'Wheatstone Bridge'],
      },
      {
        id: 'phy-3',
        name: 'Wave Optics',
        topics: ['Interference', 'Diffraction', 'Polarization'],
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    chapters: [
      {
        id: 'chem-1',
        name: 'Chemical Effects of Electric Current',
        topics: ['Electrolysis', 'Faraday\u2019s Laws', 'Electroplating', 'Electrochemical Cells'],
      },
      {
        id: 'chem-2',
        name: 'Solutions',
        topics: ['Molarity', 'Molality', 'Colligative Properties', 'Raoult\u2019s Law'],
      },
      {
        id: 'chem-3',
        name: 'Chemical Kinetics',
        topics: ['Rate of Reaction', 'Order of Reaction', 'Activation Energy'],
      },
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    chapters: [
      {
        id: 'math-1',
        name: 'Integrals',
        topics: ['Definite Integrals', 'Indefinite Integrals', 'Integration by Parts'],
      },
      {
        id: 'math-2',
        name: 'Vectors',
        topics: ['Scalar Product', 'Vector Product', 'Direction Cosines'],
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    chapters: [
      {
        id: 'bio-1',
        name: 'Human Reproduction',
        topics: ['Gametogenesis', 'Fertilization', 'Pregnancy'],
      },
      {
        id: 'bio-2',
        name: 'Genetics and Evolution',
        topics: ['Mendel\u2019s Laws', 'DNA Structure', 'Natural Selection'],
      },
    ],
  },
]

export const QUESTION_CATEGORIES = [
  'Formulae',
  'Conceptual',
  'Memory',
  'Logical',
  'Analytical',
]

const QUESTION_TEMPLATES: Record<string, { q: string; opts: string[]; correct: number }[]> = {
  default: [
    {
      q: 'Which of the following best describes the principle behind {{topic}}?',
      opts: [
        'It depends on the conservation of energy',
        'It is governed by an inverse-square relationship',
        'It only applies under standard conditions',
        'It is independent of external factors',
      ],
      correct: 1,
    },
    {
      q: 'In the context of {{chapter}}, what is the primary outcome when {{topic}} is applied?',
      opts: [
        'The system reaches equilibrium instantly',
        'A measurable change occurs proportional to the input',
        'No observable effect is produced',
        'The reaction becomes irreversible',
      ],
      correct: 1,
    },
    {
      q: 'A student is asked to identify the correct statement about {{topic}}. Which one is true?',
      opts: [
        'It is unaffected by temperature',
        'It follows a logarithmic relationship',
        'It is directly proportional to the applied stimulus',
        'It cannot be quantified experimentally',
      ],
      correct: 2,
    },
    {
      q: 'Which formula is most commonly associated with {{topic}}?',
      opts: [
        'F = ma',
        'E = mc²',
        'PV = nRT',
        'Depends on the specific scenario',
      ],
      correct: 3,
    },
    {
      q: 'What is a key application of {{topic}} in real-world systems?',
      opts: [
        'Used in everyday electronics',
        'Limited to laboratory settings only',
        'Has no practical applications',
        'Only used in theoretical models',
      ],
      correct: 0,
    },
  ],
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

let globalSerial = 0

export function generateMockQuestions(
  config: AIExamConfig,
  batchId: string,
  marksPerQuestion: number,
  count?: number,
): GeneratedQuestion[] {
  const total = count ?? config.numberOfQuestions
  const templates = QUESTION_TEMPLATES.default
  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === config.subject)
  const chapterMeta = subjectMeta?.chapters.find((c) => c.id === config.chapter)
  const chapterName = chapterMeta?.name ?? 'this chapter'

  const out: GeneratedQuestion[] = []
  for (let i = 0; i < total; i++) {
    const topic = config.topics.length
      ? pickRandom(config.topics)
      : chapterMeta?.topics[0] ?? 'this topic'
    const tpl = templates[i % templates.length]
    const difficulty: DifficultyLevel = config.difficulties.length
      ? pickRandom(config.difficulties)
      : 'medium'
    const category = config.categories.length ? pickRandom(config.categories) : 'Conceptual'

    globalSerial += 1
    out.push({
      id: `${batchId}-q${i + 1}`,
      batchId,
      serial: globalSerial,
      questionText: tpl.q.replace('{{topic}}', topic).replace('{{chapter}}', chapterName),
      options: ['A', 'B', 'C', 'D'].map((label, idx) => ({
        label,
        text: tpl.opts[idx],
      })),
      correctAnswerIndex: tpl.correct,
      difficulty,
      category,
      marks: marksPerQuestion || 1,
      estimatedMinutes: difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
      status: 'available',
      selected: true,
      chapter: chapterName,
      topic,
    })
  }
  return out
}
