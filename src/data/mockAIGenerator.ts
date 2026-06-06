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
        name: 'Laws of Motion',
        topics: ['Newton\u2019s Laws', 'Friction', 'Momentum'],
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    chapters: [
      {
        id: 'chem-1',
        name: 'Chemical Bonding',
        topics: ['Ionic Bond', 'Covalent Bond', 'VSEPR Theory', 'Hybridisation'],
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

const CIRCUIT_SVG = `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="116" height="76" rx="6" fill="hsl(210 40% 98%)" stroke="hsl(215 20% 80%)"/><path d="M15 60 H40 M60 60 H80 M100 60 V35 H15 V60" stroke="hsl(220 60% 40%)" stroke-width="2" fill="none"/><rect x="40" y="55" width="20" height="10" fill="hsl(45 90% 60%)" stroke="hsl(220 60% 40%)" stroke-width="1.5"/><circle cx="90" cy="60" r="6" fill="none" stroke="hsl(220 60% 40%)" stroke-width="1.5"/><text x="48" y="63" font-size="7" font-family="monospace" fill="hsl(220 60% 25%)">R</text><text x="86" y="63" font-size="7" font-family="monospace" fill="hsl(220 60% 25%)">L</text><line x1="12" y1="55" x2="12" y2="65" stroke="hsl(220 60% 40%)" stroke-width="3"/><line x1="18" y1="50" x2="18" y2="70" stroke="hsl(220 60% 40%)" stroke-width="1.5"/></svg>`

const H2O_SVG = `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="116" height="76" rx="6" fill="hsl(210 40% 98%)" stroke="hsl(215 20% 80%)"/><line x1="60" y1="40" x2="35" y2="60" stroke="hsl(215 25% 50%)" stroke-width="2"/><line x1="60" y1="40" x2="85" y2="60" stroke="hsl(215 25% 50%)" stroke-width="2"/><circle cx="60" cy="40" r="12" fill="hsl(0 70% 60%)"/><circle cx="35" cy="60" r="8" fill="hsl(210 80% 70%)"/><circle cx="85" cy="60" r="8" fill="hsl(210 80% 70%)"/><text x="56" y="44" font-size="10" font-weight="700" fill="white">O</text><text x="32" y="64" font-size="8" font-weight="700" fill="white">H</text><text x="82" y="64" font-size="8" font-weight="700" fill="white">H</text><text x="50" y="20" font-size="8" fill="hsl(220 30% 40%)">~104.5°</text></svg>`

const PARABOLA_SVG = `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="116" height="76" rx="6" fill="hsl(210 40% 98%)" stroke="hsl(215 20% 80%)"/><line x1="15" y1="70" x2="110" y2="70" stroke="hsl(215 20% 50%)" stroke-width="1"/><line x1="20" y1="10" x2="20" y2="75" stroke="hsl(215 20% 50%)" stroke-width="1"/><path d="M20 70 Q 65 -20 110 70" stroke="hsl(260 70% 55%)" stroke-width="2" fill="none"/><path d="M20 70 Q 65 -20 110 70 L110 70 L20 70 Z" fill="hsl(260 70% 55% / 0.18)"/><text x="100" y="78" font-size="7" fill="hsl(220 30% 40%)">x</text><text x="10" y="14" font-size="7" fill="hsl(220 30% 40%)">y</text></svg>`

interface Template {
  q: string
  opts: string[]
  correct: number
  explanation: string
  diagram?: string
  category?: string
  difficulty?: DifficultyLevel
}

const TEMPLATES: Record<string, Template[]> = {
  physics: [
    {
      q: 'A constant force $F$ acts on a $2\\,\\text{kg}$ mass, accelerating it at $3\\,\\text{m/s}^2$. Using $F = ma$, find $F$.',
      opts: ['$3\\,\\text{N}$', '$6\\,\\text{N}$', '$1.5\\,\\text{N}$', '$9\\,\\text{N}$'],
      correct: 1,
      explanation: 'By Newton\u2019s second law, $F = ma = 2 \\times 3 = 6\\,\\text{N}$.',
      category: 'Formulae',
      difficulty: 'easy',
    },
    {
      q: 'A car uniformly accelerates from $4\\,\\text{m/s}$ to $10\\,\\text{m/s}$ in $3\\,\\text{s}$. Compute its acceleration.',
      opts: ['$1\\,\\text{m/s}^2$', '$2\\,\\text{m/s}^2$', '$3\\,\\text{m/s}^2$', '$0.5\\,\\text{m/s}^2$'],
      correct: 1,
      explanation: '$a = (v - u)/t = (10 - 4)/3 = 2\\,\\text{m/s}^2$.',
      category: 'Analytical',
      difficulty: 'medium',
    },
    {
      q: 'In the circuit shown, identify component $R$ and state its role.',
      opts: ['Capacitor — stores charge', 'Resistor — limits current', 'Inductor — stores flux', 'Battery — provides EMF'],
      correct: 1,
      explanation: 'The zig-zag symbol denotes a resistor, which opposes current flow (Ohm\u2019s law: $V = IR$).',
      diagram: CIRCUIT_SVG,
      category: 'Conceptual',
      difficulty: 'easy',
    },
    {
      q: 'Two point charges $+q$ and $-q$ are separated by distance $r$. The electric dipole moment magnitude is:',
      opts: ['$q/r$', '$qr$', '$q r^2$', '$2qr$'],
      correct: 1,
      explanation: 'Dipole moment $p = q \\cdot r$ directed from $-q$ to $+q$.',
      category: 'Formulae',
      difficulty: 'medium',
    },
    {
      q: 'A ball is thrown upward with $u = 20\\,\\text{m/s}$. Taking $g = 10\\,\\text{m/s}^2$, the maximum height reached is:',
      opts: ['$10\\,\\text{m}$', '$20\\,\\text{m}$', '$40\\,\\text{m}$', '$5\\,\\text{m}$'],
      correct: 1,
      explanation: 'Using $v^2 = u^2 - 2gh$ with $v = 0$: $h = u^2/(2g) = 400/20 = 20\\,\\text{m}$.',
      category: 'Analytical',
      difficulty: 'medium',
    },
    {
      q: 'Which statement about Newton\u2019s third law is correct?',
      opts: [
        'Action and reaction act on the same body',
        'Action and reaction are equal but opposite, acting on different bodies',
        'Reaction is always greater than action',
        'Reaction only exists when bodies are in contact',
      ],
      correct: 1,
      explanation: 'Newton\u2019s third law: forces of action and reaction act on two different bodies, equal in magnitude, opposite in direction.',
      category: 'Conceptual',
      difficulty: 'easy',
    },
  ],
  chemistry: [
    {
      q: 'The molecular shape of water ($H_2O$) according to VSEPR theory is:',
      opts: ['Linear', 'Bent / V-shaped', 'Trigonal planar', 'Tetrahedral'],
      correct: 1,
      explanation: 'Oxygen in $H_2O$ has 2 bond pairs and 2 lone pairs, giving a bent shape with bond angle $\\approx 104.5°$.',
      diagram: H2O_SVG,
      category: 'Conceptual',
      difficulty: 'easy',
    },
    {
      q: 'Calculate molarity of a solution containing $4\\,\\text{g}$ NaOH ($M = 40$) in $500\\,\\text{mL}$ water.',
      opts: ['$0.1\\,\\text{M}$', '$0.2\\,\\text{M}$', '$0.5\\,\\text{M}$', '$1\\,\\text{M}$'],
      correct: 1,
      explanation: 'Moles $= 4/40 = 0.1$. Molarity $= 0.1/0.5\\,\\text{L} = 0.2\\,\\text{M}$.',
      category: 'Formulae',
      difficulty: 'medium',
    },
    {
      q: 'For a first-order reaction, the half-life $t_{1/2}$ is:',
      opts: ['$\\ln 2 / k$', '$1/k$', '$2/k$', 'Depends on initial concentration'],
      correct: 0,
      explanation: 'First-order half-life is independent of $[A]_0$ and equals $t_{1/2} = \\ln 2 / k = 0.693/k$.',
      category: 'Formulae',
      difficulty: 'medium',
    },
    {
      q: 'Which of the following has the highest boiling point elevation per mole?',
      opts: ['NaCl', '$CaCl_2$', 'Glucose', 'Urea'],
      correct: 1,
      explanation: '$CaCl_2$ dissociates into 3 ions giving van\u2019t Hoff factor $i = 3$, the largest among these solutes.',
      category: 'Analytical',
      difficulty: 'hard',
    },
    {
      q: 'During electrolysis of CuSO\u2084 solution with copper electrodes, what happens at the cathode?',
      opts: ['$O_2$ is liberated', '$Cu$ is deposited', '$H_2$ is liberated', '$SO_4^{2-}$ is oxidised'],
      correct: 1,
      explanation: '$Cu^{2+} + 2e^- \\rightarrow Cu$ takes place at the cathode; copper is deposited.',
      category: 'Conceptual',
      difficulty: 'medium',
    },
  ],
  mathematics: [
    {
      q: 'Evaluate $\\int x^2\\,dx$.',
      opts: ['$\\frac{x^3}{3} + C$', '$2x + C$', '$\\frac{x^2}{2} + C$', '$x^3 + C$'],
      correct: 0,
      explanation: 'Power rule: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\neq -1$.',
      diagram: PARABOLA_SVG,
      category: 'Formulae',
      difficulty: 'easy',
    },
    {
      q: 'Compute the definite integral $\\int_0^3 x^2\\,dx$.',
      opts: ['$3$', '$9$', '$27$', '$\\frac{27}{3}$'],
      correct: 1,
      explanation: '$\\int_0^3 x^2\\,dx = [x^3/3]_0^3 = 9$.',
      diagram: PARABOLA_SVG,
      category: 'Analytical',
      difficulty: 'medium',
    },
    {
      q: 'For vectors $\\vec{a} = \\hat{i} + 2\\hat{j}$ and $\\vec{b} = 2\\hat{i} - \\hat{j}$, the dot product $\\vec{a}\\cdot\\vec{b}$ is:',
      opts: ['$0$', '$1$', '$3$', '$5$'],
      correct: 0,
      explanation: '$\\vec{a}\\cdot\\vec{b} = (1)(2) + (2)(-1) = 2 - 2 = 0$ \u2014 the vectors are perpendicular.',
      category: 'Analytical',
      difficulty: 'medium',
    },
    {
      q: 'Evaluate $\\int e^x\\,dx$.',
      opts: ['$e^x + C$', '$x e^x + C$', '$\\frac{e^x}{x} + C$', '$\\ln x + C$'],
      correct: 0,
      explanation: 'The exponential function is its own integral: $\\int e^x\\,dx = e^x + C$.',
      category: 'Memory',
      difficulty: 'easy',
    },
    {
      q: 'Using integration by parts, $\\int x e^x\\,dx$ equals:',
      opts: ['$x e^x + C$', '$(x - 1)e^x + C$', '$(x + 1)e^x + C$', '$\\frac{x^2 e^x}{2} + C$'],
      correct: 1,
      explanation: 'Take $u = x$, $dv = e^x dx$: result is $x e^x - e^x + C = (x-1)e^x + C$.',
      category: 'Logical',
      difficulty: 'hard',
    },
  ],
  biology: [
    {
      q: 'Which of these is the basic unit of heredity?',
      opts: ['Cell', 'Gene', 'Chromosome', 'Nucleotide'],
      correct: 1,
      explanation: 'A gene is the basic functional and physical unit of heredity, comprising a stretch of DNA.',
      category: 'Memory',
      difficulty: 'easy',
    },
    {
      q: 'Mendel\u2019s law of segregation states that:',
      opts: [
        'Genes always assort independently',
        'Allele pairs separate during gamete formation',
        'Dominant alleles always express',
        'Phenotype determines genotype',
      ],
      correct: 1,
      explanation: 'Each parent passes only one allele of each gene to its offspring; alleles separate during meiosis.',
      category: 'Conceptual',
      difficulty: 'medium',
    },
    {
      q: 'In humans, fertilization typically occurs in the:',
      opts: ['Uterus', 'Ovary', 'Fallopian tube', 'Cervix'],
      correct: 2,
      explanation: 'The sperm fuses with the ovum in the ampullary region of the fallopian tube.',
      category: 'Memory',
      difficulty: 'easy',
    },
    {
      q: 'Which base pairs with Adenine in DNA?',
      opts: ['Uracil', 'Thymine', 'Cytosine', 'Guanine'],
      correct: 1,
      explanation: 'In DNA: A pairs with T (via 2 H-bonds); G pairs with C (via 3 H-bonds).',
      category: 'Memory',
      difficulty: 'easy',
    },
    {
      q: 'Natural selection acts directly on:',
      opts: ['Genotype', 'Phenotype', 'DNA mutations', 'Gametes'],
      correct: 1,
      explanation: 'Selection pressures act on the phenotype; this indirectly changes allele frequencies in the gene pool.',
      category: 'Conceptual',
      difficulty: 'medium',
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
  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === config.subject)
  const chapterMeta = subjectMeta?.chapters.find((c) => c.id === config.chapter)
  const chapterName = chapterMeta?.name ?? 'this chapter'
  const pool = TEMPLATES[config.subject] ?? TEMPLATES.physics
  // Shuffle a copy so each batch feels different
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  const out: GeneratedQuestion[] = []
  for (let i = 0; i < total; i++) {
    const tpl = shuffled[i % shuffled.length]
    const topic = config.topics.length
      ? pickRandom(config.topics)
      : chapterMeta?.topics[i % (chapterMeta?.topics.length || 1)] ?? 'this topic'
    const difficulty: DifficultyLevel =
      tpl.difficulty && (!config.difficulties.length || config.difficulties.includes(tpl.difficulty))
        ? tpl.difficulty
        : config.difficulties.length
          ? pickRandom(config.difficulties)
          : 'medium'
    const category =
      tpl.category && (!config.categories.length || config.categories.includes(tpl.category))
        ? tpl.category
        : config.categories.length
          ? pickRandom(config.categories)
          : 'Conceptual'

    globalSerial += 1
    out.push({
      id: `${batchId}-q${i + 1}-${globalSerial}`,
      batchId,
      serial: globalSerial,
      questionText: tpl.q,
      options: ['A', 'B', 'C', 'D'].map((label, idx) => ({ label, text: tpl.opts[idx] })),
      correctAnswerIndex: tpl.correct,
      difficulty,
      category,
      marks: marksPerQuestion || 1,
      estimatedMinutes: difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
      status: 'available',
      selected: true,
      chapter: chapterName,
      topic,
      explanation: tpl.explanation,
      diagramSvg: tpl.diagram,
    })
  }
  return out
}
