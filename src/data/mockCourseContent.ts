import { AvailableSubject, ClassOption } from '@/types/course';

export const availableClasses: ClassOption[] = [
  { id: 'class-6', name: 'Class 6' },
  { id: 'class-7', name: 'Class 7' },
  { id: 'class-8', name: 'Class 8' },
  { id: 'class-9', name: 'Class 9' },
  { id: 'class-10', name: 'Class 10' },
  { id: 'class-11', name: 'Class 11' },
  { id: 'class-12', name: 'Class 12' },
];

export const availableSubjects: AvailableSubject[] = [
  {
    id: 'physics-1',
    name: 'Physics',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'phy-ch-1',
        name: 'Mechanics',
        topics: [
          { id: 'phy-t-1', name: "Newton's Laws of Motion" },
          { id: 'phy-t-2', name: 'Equations of Motion' },
          { id: 'phy-t-3', name: 'Friction and Its Types' },
          { id: 'phy-t-4', name: 'Circular Motion' },
          { id: 'phy-t-5', name: 'Work, Energy and Power' },
        ],
      },
      {
        id: 'phy-ch-2',
        name: 'Thermodynamics',
        topics: [
          { id: 'phy-t-6', name: 'Heat and Temperature' },
          { id: 'phy-t-7', name: 'Laws of Thermodynamics' },
          { id: 'phy-t-8', name: 'Heat Transfer Mechanisms' },
          { id: 'phy-t-9', name: 'Entropy and Its Applications' },
        ],
      },
      {
        id: 'phy-ch-3',
        name: 'Waves and Optics',
        topics: [
          { id: 'phy-t-10', name: 'Wave Motion' },
          { id: 'phy-t-11', name: 'Sound Waves' },
          { id: 'phy-t-12', name: 'Light Reflection' },
          { id: 'phy-t-13', name: 'Light Refraction' },
          { id: 'phy-t-14', name: 'Interference and Diffraction' },
        ],
      },
      {
        id: 'phy-ch-4',
        name: 'Electromagnetism',
        topics: [
          { id: 'phy-t-15', name: 'Electric Charges and Fields' },
          { id: 'phy-t-16', name: 'Electric Potential' },
          { id: 'phy-t-17', name: 'Current Electricity' },
          { id: 'phy-t-18', name: 'Magnetic Effects of Current' },
          { id: 'phy-t-19', name: 'Electromagnetic Induction' },
        ],
      },
      {
        id: 'phy-ch-5',
        name: 'Modern Physics',
        topics: [
          { id: 'phy-t-20', name: 'Photoelectric Effect' },
          { id: 'phy-t-21', name: 'Atomic Models' },
          { id: 'phy-t-22', name: 'Nuclear Physics' },
          { id: 'phy-t-23', name: 'Radioactivity' },
        ],
      },
      {
        id: 'phy-ch-6',
        name: 'Gravitation',
        topics: [
          { id: 'phy-t-24', name: "Newton's Law of Gravitation" },
          { id: 'phy-t-25', name: 'Gravitational Potential Energy' },
          { id: 'phy-t-26', name: 'Satellite Motion' },
          { id: 'phy-t-27', name: 'Escape Velocity' },
        ],
      },
    ],
  },
  {
    id: 'chemistry-1',
    name: 'Chemistry',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'chem-ch-1',
        name: 'Organic Chemistry',
        topics: [
          { id: 'chem-t-1', name: 'Alkanes and Alkenes' },
          { id: 'chem-t-2', name: 'Functional Groups' },
          { id: 'chem-t-3', name: 'Isomerism' },
          { id: 'chem-t-4', name: 'Reaction Mechanisms' },
          { id: 'chem-t-5', name: 'Aromatic Compounds' },
        ],
      },
      {
        id: 'chem-ch-2',
        name: 'Inorganic Chemistry',
        topics: [
          { id: 'chem-t-6', name: 'Periodic Table Trends' },
          { id: 'chem-t-7', name: 'Chemical Bonding' },
          { id: 'chem-t-8', name: 'Coordination Compounds' },
          { id: 'chem-t-9', name: 'Metallurgy' },
        ],
      },
      {
        id: 'chem-ch-3',
        name: 'Physical Chemistry',
        topics: [
          { id: 'chem-t-10', name: 'Atomic Structure' },
          { id: 'chem-t-11', name: 'Chemical Equilibrium' },
          { id: 'chem-t-12', name: 'Thermochemistry' },
          { id: 'chem-t-13', name: 'Electrochemistry' },
          { id: 'chem-t-14', name: 'Chemical Kinetics' },
        ],
      },
      {
        id: 'chem-ch-4',
        name: 'Solutions and Colloids',
        topics: [
          { id: 'chem-t-15', name: 'Types of Solutions' },
          { id: 'chem-t-16', name: 'Colligative Properties' },
          { id: 'chem-t-17', name: 'Colloids and Suspensions' },
        ],
      },
      {
        id: 'chem-ch-5',
        name: 'Acids, Bases and Salts',
        topics: [
          { id: 'chem-t-18', name: 'pH and Buffer Solutions' },
          { id: 'chem-t-19', name: 'Acid-Base Titrations' },
          { id: 'chem-t-20', name: 'Salt Hydrolysis' },
        ],
      },
    ],
  },
  {
    id: 'biology-1',
    name: 'Biology',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'bio-ch-1',
        name: 'Cell Biology',
        topics: [
          { id: 'bio-t-1', name: 'Cell Structure and Function' },
          { id: 'bio-t-2', name: 'Cell Division - Mitosis' },
          { id: 'bio-t-3', name: 'Cell Division - Meiosis' },
          { id: 'bio-t-4', name: 'Cell Organelles' },
        ],
      },
      {
        id: 'bio-ch-2',
        name: 'Genetics',
        topics: [
          { id: 'bio-t-5', name: "Mendel's Laws" },
          { id: 'bio-t-6', name: 'DNA Structure and Replication' },
          { id: 'bio-t-7', name: 'Gene Expression' },
          { id: 'bio-t-8', name: 'Genetic Disorders' },
          { id: 'bio-t-9', name: 'Biotechnology Basics' },
        ],
      },
      {
        id: 'bio-ch-3',
        name: 'Human Physiology',
        topics: [
          { id: 'bio-t-10', name: 'Digestive System' },
          { id: 'bio-t-11', name: 'Respiratory System' },
          { id: 'bio-t-12', name: 'Circulatory System' },
          { id: 'bio-t-13', name: 'Nervous System' },
          { id: 'bio-t-14', name: 'Excretory System' },
        ],
      },
      {
        id: 'bio-ch-4',
        name: 'Plant Biology',
        topics: [
          { id: 'bio-t-15', name: 'Photosynthesis' },
          { id: 'bio-t-16', name: 'Plant Hormones' },
          { id: 'bio-t-17', name: 'Transport in Plants' },
          { id: 'bio-t-18', name: 'Plant Reproduction' },
        ],
      },
      {
        id: 'bio-ch-5',
        name: 'Ecology',
        topics: [
          { id: 'bio-t-19', name: 'Ecosystem Components' },
          { id: 'bio-t-20', name: 'Food Chains and Webs' },
          { id: 'bio-t-21', name: 'Biodiversity' },
          { id: 'bio-t-22', name: 'Environmental Issues' },
        ],
      },
    ],
  },
  {
    id: 'mathematics-1',
    name: 'Mathematics',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'math-ch-1',
        name: 'Algebra',
        topics: [
          { id: 'math-t-1', name: 'Linear Equations' },
          { id: 'math-t-2', name: 'Quadratic Equations' },
          { id: 'math-t-3', name: 'Polynomials' },
          { id: 'math-t-4', name: 'Sequences and Series' },
          { id: 'math-t-5', name: 'Matrices and Determinants' },
        ],
      },
      {
        id: 'math-ch-2',
        name: 'Calculus',
        topics: [
          { id: 'math-t-6', name: 'Limits and Continuity' },
          { id: 'math-t-7', name: 'Differentiation' },
          { id: 'math-t-8', name: 'Applications of Derivatives' },
          { id: 'math-t-9', name: 'Integration' },
          { id: 'math-t-10', name: 'Definite Integrals' },
        ],
      },
      {
        id: 'math-ch-3',
        name: 'Geometry',
        topics: [
          { id: 'math-t-11', name: 'Coordinate Geometry' },
          { id: 'math-t-12', name: 'Straight Lines' },
          { id: 'math-t-13', name: 'Circles' },
          { id: 'math-t-14', name: 'Conic Sections' },
        ],
      },
      {
        id: 'math-ch-4',
        name: 'Trigonometry',
        topics: [
          { id: 'math-t-15', name: 'Trigonometric Ratios' },
          { id: 'math-t-16', name: 'Trigonometric Identities' },
          { id: 'math-t-17', name: 'Inverse Trigonometric Functions' },
          { id: 'math-t-18', name: 'Height and Distance Problems' },
        ],
      },
      {
        id: 'math-ch-5',
        name: 'Probability and Statistics',
        topics: [
          { id: 'math-t-19', name: 'Basic Probability' },
          { id: 'math-t-20', name: 'Random Variables' },
          { id: 'math-t-21', name: 'Probability Distributions' },
          { id: 'math-t-22', name: 'Mean, Median, Mode' },
        ],
      },
    ],
  },
  {
    id: 'english-1',
    name: 'English',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'eng-ch-1',
        name: 'Grammar',
        topics: [
          { id: 'eng-t-1', name: 'Tenses' },
          { id: 'eng-t-2', name: 'Voice - Active and Passive' },
          { id: 'eng-t-3', name: 'Reported Speech' },
          { id: 'eng-t-4', name: 'Sentence Structure' },
        ],
      },
      {
        id: 'eng-ch-2',
        name: 'Comprehension',
        topics: [
          { id: 'eng-t-5', name: 'Reading Comprehension' },
          { id: 'eng-t-6', name: 'Inference and Analysis' },
          { id: 'eng-t-7', name: 'Vocabulary in Context' },
        ],
      },
      {
        id: 'eng-ch-3',
        name: 'Writing Skills',
        topics: [
          { id: 'eng-t-8', name: 'Essay Writing' },
          { id: 'eng-t-9', name: 'Letter Writing' },
          { id: 'eng-t-10', name: 'Report Writing' },
          { id: 'eng-t-11', name: 'Creative Writing' },
        ],
      },
    ],
  },
  {
    id: 'reasoning-1',
    name: 'Reasoning & Aptitude',
    institute: 'LearnEazy Inst',
    isOwner: false,
    chapters: [
      {
        id: 'reas-ch-1',
        name: 'Logical Reasoning',
        topics: [
          { id: 'reas-t-1', name: 'Syllogisms' },
          { id: 'reas-t-2', name: 'Blood Relations' },
          { id: 'reas-t-3', name: 'Coding-Decoding' },
          { id: 'reas-t-4', name: 'Direction Sense' },
        ],
      },
      {
        id: 'reas-ch-2',
        name: 'Analytical Reasoning',
        topics: [
          { id: 'reas-t-5', name: 'Seating Arrangements' },
          { id: 'reas-t-6', name: 'Puzzles' },
          { id: 'reas-t-7', name: 'Data Sufficiency' },
        ],
      },
      {
        id: 'reas-ch-3',
        name: 'Quantitative Aptitude',
        topics: [
          { id: 'reas-t-8', name: 'Number Series' },
          { id: 'reas-t-9', name: 'Percentage and Ratio' },
          { id: 'reas-t-10', name: 'Time, Speed and Distance' },
          { id: 'reas-t-11', name: 'Profit and Loss' },
        ],
      },
    ],
  },
  {
    id: 'telugu-1',
    name: 'Telugu',
    institute: 'LearnEazy Inst',
    isOwner: true,
    chapters: [
      {
        id: 'tel-ch-1',
        name: 'Grammar (వ్యాకరణం)',
        topics: [
          { id: 'tel-t-1', name: 'Sandhi (సంధి)' },
          { id: 'tel-t-2', name: 'Samasa (సమాసం)' },
          { id: 'tel-t-3', name: 'Vibhakti (విభక్తి)' },
        ],
      },
      {
        id: 'tel-ch-2',
        name: 'Literature (సాహిత్యం)',
        topics: [
          { id: 'tel-t-4', name: 'Poetry (పద్యం)' },
          { id: 'tel-t-5', name: 'Prose (గద్యం)' },
          { id: 'tel-t-6', name: 'Classical Works' },
        ],
      },
      {
        id: 'tel-ch-3',
        name: 'Writing (రచన)',
        topics: [
          { id: 'tel-t-7', name: 'Essay Writing (వ్యాసం)' },
          { id: 'tel-t-8', name: 'Letter Writing (లేఖ)' },
        ],
      },
    ],
  },
];
