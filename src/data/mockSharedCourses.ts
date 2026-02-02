import { SharedCourse } from '@/types/course';

// Helper to generate topics for a chapter
const generateTopics = (chapterName: string, count: number) => {
  const topicNames: Record<string, string[]> = {
    'Mechanics': ['Newton\'s Laws', 'Motion in 1D', 'Motion in 2D', 'Friction', 'Circular Motion', 'Work & Energy', 'Power', 'Momentum'],
    'Thermodynamics': ['Heat Transfer', 'First Law', 'Second Law', 'Entropy', 'Carnot Cycle', 'PV Diagrams', 'Specific Heat'],
    'Waves': ['Wave Properties', 'Sound Waves', 'Standing Waves', 'Doppler Effect', 'Interference', 'Diffraction'],
    'Optics': ['Reflection', 'Refraction', 'Lenses', 'Mirrors', 'Optical Instruments', 'Wave Optics'],
    'Electromagnetism': ['Electric Field', 'Magnetic Field', 'Electromagnetic Induction', 'AC Circuits', 'Maxwell\'s Equations'],
    'Modern Physics': ['Photoelectric Effect', 'Atomic Structure', 'Nuclear Physics', 'Radioactivity', 'Quantum Mechanics'],
    'Organic Chemistry': ['Hydrocarbons', 'Functional Groups', 'Reactions', 'Isomerism', 'Polymers', 'Biomolecules'],
    'Inorganic Chemistry': ['Periodic Table', 'Chemical Bonding', 's-Block', 'p-Block', 'd-Block', 'Coordination Compounds'],
    'Physical Chemistry': ['Atomic Structure', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Kinetics'],
    'Cell Biology': ['Cell Structure', 'Cell Division', 'Cell Cycle', 'Transport', 'Enzymes', 'Respiration'],
    'Genetics': ['DNA Structure', 'Replication', 'Transcription', 'Translation', 'Mutations', 'Inheritance'],
    'Ecology': ['Ecosystems', 'Food Chains', 'Biodiversity', 'Conservation', 'Population Dynamics'],
    'Algebra': ['Polynomials', 'Quadratic Equations', 'Complex Numbers', 'Matrices', 'Determinants', 'Sequences'],
    'Calculus': ['Limits', 'Derivatives', 'Integration', 'Applications', 'Differential Equations'],
    'Trigonometry': ['Ratios', 'Identities', 'Equations', 'Inverse Functions', 'Applications'],
    'Statistics': ['Mean', 'Median', 'Mode', 'Variance', 'Probability', 'Distributions'],
  };

  const defaultTopics = ['Introduction', 'Fundamentals', 'Advanced Concepts', 'Applications', 'Problem Solving', 'Practice', 'Review', 'Summary'];
  const topics = topicNames[chapterName] || defaultTopics;
  
  return topics.slice(0, count).map((name, idx) => ({
    id: `topic-${chapterName.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}`,
    name,
    isSelected: true,
  }));
};

// Helper to generate chapters for a subject
const generateChapters = (subjectName: string) => {
  const chapterConfigs: Record<string, { name: string; topicCount: number }[]> = {
    'Physics': [
      { name: 'Mechanics', topicCount: 8 },
      { name: 'Thermodynamics', topicCount: 7 },
      { name: 'Waves', topicCount: 6 },
      { name: 'Optics', topicCount: 6 },
      { name: 'Electromagnetism', topicCount: 5 },
      { name: 'Modern Physics', topicCount: 5 },
      { name: 'Fluid Mechanics', topicCount: 5 },
      { name: 'Gravitation', topicCount: 4 },
      { name: 'Oscillations', topicCount: 5 },
      { name: 'Current Electricity', topicCount: 6 },
    ],
    'Chemistry': [
      { name: 'Organic Chemistry', topicCount: 6 },
      { name: 'Inorganic Chemistry', topicCount: 6 },
      { name: 'Physical Chemistry', topicCount: 6 },
      { name: 'Coordination Compounds', topicCount: 5 },
      { name: 'Electrochemistry', topicCount: 5 },
      { name: 'Chemical Kinetics', topicCount: 5 },
      { name: 'Solutions', topicCount: 4 },
      { name: 'Surface Chemistry', topicCount: 4 },
      { name: 'Polymers', topicCount: 4 },
      { name: 'Biomolecules', topicCount: 5 },
    ],
    'Biology': [
      { name: 'Cell Biology', topicCount: 6 },
      { name: 'Genetics', topicCount: 6 },
      { name: 'Ecology', topicCount: 5 },
      { name: 'Human Physiology', topicCount: 7 },
      { name: 'Plant Physiology', topicCount: 6 },
      { name: 'Evolution', topicCount: 4 },
      { name: 'Biotechnology', topicCount: 5 },
      { name: 'Reproduction', topicCount: 5 },
      { name: 'Animal Kingdom', topicCount: 6 },
      { name: 'Plant Kingdom', topicCount: 5 },
    ],
    'Mathematics': [
      { name: 'Algebra', topicCount: 6 },
      { name: 'Calculus', topicCount: 5 },
      { name: 'Trigonometry', topicCount: 5 },
      { name: 'Statistics', topicCount: 6 },
      { name: 'Coordinate Geometry', topicCount: 5 },
      { name: 'Vectors', topicCount: 4 },
      { name: 'Probability', topicCount: 5 },
      { name: 'Matrices', topicCount: 4 },
      { name: 'Differential Equations', topicCount: 5 },
      { name: '3D Geometry', topicCount: 4 },
    ],
    'English': [
      { name: 'Grammar', topicCount: 6 },
      { name: 'Comprehension', topicCount: 5 },
      { name: 'Writing Skills', topicCount: 5 },
      { name: 'Vocabulary', topicCount: 5 },
      { name: 'Literature', topicCount: 6 },
      { name: 'Speaking Skills', topicCount: 4 },
      { name: 'Listening Skills', topicCount: 4 },
      { name: 'Critical Analysis', topicCount: 5 },
      { name: 'Creative Writing', topicCount: 5 },
      { name: 'Communication', topicCount: 4 },
    ],
  };

  const chapters = chapterConfigs[subjectName] || chapterConfigs['Mathematics'];
  
  return chapters.map((ch, idx) => ({
    id: `chapter-${subjectName.toLowerCase()}-${idx + 1}`,
    name: ch.name,
    isSelected: true,
    topics: generateTopics(ch.name, ch.topicCount),
  }));
};

export const mockSharedCourses: SharedCourse[] = [
  {
    id: 'shared-neet-2025',
    name: 'NEET Foundation 2025',
    description: 'Comprehensive NEET preparation covering Physics, Chemistry, and Biology with extensive practice materials.',
    sharedBy: 'LearnEazy Central',
    className: 'Class 11',
    createdAt: '2024-12-01',
    subjects: [
      {
        id: 'neet-physics',
        name: 'Physics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Physics'),
      },
      {
        id: 'neet-chemistry',
        name: 'Chemistry',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Chemistry'),
      },
      {
        id: 'neet-biology',
        name: 'Biology',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Biology'),
      },
      {
        id: 'neet-math',
        name: 'Mathematics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Mathematics'),
      },
      {
        id: 'neet-english',
        name: 'English',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('English'),
      },
    ],
  },
  {
    id: 'shared-jee-2025',
    name: 'JEE Mains 2025',
    description: 'Complete JEE Mains preparation with Physics, Chemistry, and Mathematics.',
    sharedBy: 'LearnEazy Central',
    className: 'Class 11',
    createdAt: '2024-11-15',
    subjects: [
      {
        id: 'jee-physics',
        name: 'Physics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Physics'),
      },
      {
        id: 'jee-chemistry',
        name: 'Chemistry',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Chemistry'),
      },
      {
        id: 'jee-math',
        name: 'Mathematics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Mathematics'),
      },
    ],
  },
  {
    id: 'shared-olympiad',
    name: 'Olympiad Foundation',
    description: 'Advanced preparation for Science and Mathematics Olympiads.',
    sharedBy: 'Olympiad Academy',
    className: 'Class 10',
    createdAt: '2024-10-20',
    subjects: [
      {
        id: 'olympiad-physics',
        name: 'Physics',
        institute: 'Olympiad Academy',
        isOwner: false,
        chapters: generateChapters('Physics').slice(0, 8),
      },
      {
        id: 'olympiad-math',
        name: 'Mathematics',
        institute: 'Olympiad Academy',
        isOwner: false,
        chapters: generateChapters('Mathematics'),
      },
      {
        id: 'olympiad-chemistry',
        name: 'Chemistry',
        institute: 'Olympiad Academy',
        isOwner: false,
        chapters: generateChapters('Chemistry').slice(0, 7),
      },
    ],
  },
  {
    id: 'shared-board-topper',
    name: 'Board Topper 2025',
    description: 'Comprehensive board exam preparation with all major subjects.',
    sharedBy: 'State Board Excellence',
    className: 'Class 10',
    createdAt: '2024-09-10',
    subjects: [
      {
        id: 'board-physics',
        name: 'Physics',
        institute: 'State Board Excellence',
        isOwner: false,
        chapters: generateChapters('Physics'),
      },
      {
        id: 'board-chemistry',
        name: 'Chemistry',
        institute: 'State Board Excellence',
        isOwner: false,
        chapters: generateChapters('Chemistry'),
      },
      {
        id: 'board-biology',
        name: 'Biology',
        institute: 'State Board Excellence',
        isOwner: false,
        chapters: generateChapters('Biology'),
      },
      {
        id: 'board-math',
        name: 'Mathematics',
        institute: 'State Board Excellence',
        isOwner: false,
        chapters: generateChapters('Mathematics'),
      },
      {
        id: 'board-english',
        name: 'English',
        institute: 'State Board Excellence',
        isOwner: false,
        chapters: generateChapters('English'),
      },
    ],
  },
  {
    id: 'shared-foundation-basic',
    name: 'Foundation Course - Basic',
    description: 'Entry-level foundation course for beginners.',
    sharedBy: 'LearnEazy Central',
    className: 'Class 9',
    createdAt: '2024-08-01',
    subjects: [
      {
        id: 'basic-math',
        name: 'Mathematics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Mathematics').slice(0, 6),
      },
      {
        id: 'basic-physics',
        name: 'Physics',
        institute: 'LearnEazy Central',
        isOwner: false,
        chapters: generateChapters('Physics').slice(0, 5),
      },
    ],
  },
];

// Helper function to get stats for a shared course
export const getSharedCourseStats = (course: SharedCourse) => {
  const subjectCount = course.subjects.length;
  let chapterCount = 0;
  let topicCount = 0;

  course.subjects.forEach((subject) => {
    chapterCount += subject.chapters.length;
    subject.chapters.forEach((chapter) => {
      topicCount += chapter.topics.length;
    });
  });

  return { subjectCount, chapterCount, topicCount };
};
