import { Course } from '@/types/course';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    serialNumber: 1,
    title: 'Test Course 1',
    className: 'Class 10',
    programName: 'Test course 1',
    fee: 5000,
    description: 'A comprehensive test course for Class 10 students',
    subjects: [
      {
        id: 'sub-1',
        name: 'Biology',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'bio-ch-1',
            name: 'Cell Biology',
            isSelected: true,
            topics: [
              { id: 'bio-t-1', name: 'Cell Structure and Function', isSelected: true, hours: 2 },
              { id: 'bio-t-2', name: 'Cell Division - Mitosis', isSelected: true, hours: 1.5 },
            ],
          },
          {
            id: 'bio-ch-2',
            name: 'Genetics',
            isSelected: true,
            topics: [
              { id: 'bio-t-5', name: "Mendel's Laws", isSelected: true, hours: 2.5 },
              { id: 'bio-t-6', name: 'DNA Structure and Replication', isSelected: true, hours: 3 },
            ],
          },
        ],
      },
      {
        id: 'sub-2',
        name: 'Chemistry',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'chem-ch-1',
            name: 'Organic Chemistry',
            isSelected: true,
            topics: [
              { id: 'chem-t-1', name: 'Alkanes and Alkenes', isSelected: true, hours: 2 },
              { id: 'chem-t-2', name: 'Functional Groups', isSelected: true, hours: 2.5 },
            ],
          },
        ],
      },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'course-2',
    serialNumber: 2,
    title: 'Disha 2',
    className: 'Class 6',
    programName: 'Disha 2',
    fee: 8000,
    description: 'Foundation course for Class 6 students covering all core subjects',
    subjects: [
      {
        id: 'sub-3',
        name: 'Biology',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'bio-ch-1',
            name: 'Cell Biology',
            isSelected: true,
            topics: [
              { id: 'bio-t-1', name: 'Cell Structure and Function', isSelected: true },
              { id: 'bio-t-2', name: 'Cell Division - Mitosis', isSelected: true },
              { id: 'bio-t-3', name: 'Cell Division - Meiosis', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-4',
        name: 'Chemistry',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'chem-ch-2',
            name: 'Inorganic Chemistry',
            isSelected: true,
            topics: [
              { id: 'chem-t-6', name: 'Periodic Table Trends', isSelected: true },
              { id: 'chem-t-7', name: 'Chemical Bonding', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-5',
        name: 'Mathematics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'math-ch-1',
            name: 'Algebra',
            isSelected: true,
            topics: [
              { id: 'math-t-1', name: 'Linear Equations', isSelected: true },
              { id: 'math-t-2', name: 'Quadratic Equations', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-6',
        name: 'Physics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'phy-ch-1',
            name: 'Mechanics',
            isSelected: true,
            topics: [
              { id: 'phy-t-1', name: "Newton's Laws of Motion", isSelected: true },
              { id: 'phy-t-2', name: 'Equations of Motion', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-7',
        name: 'Reasoning & Aptitude',
        institute: 'LearnEazy Inst',
        isOwner: false,
        chapters: [
          {
            id: 'reas-ch-1',
            name: 'Logical Reasoning',
            isSelected: true,
            topics: [
              { id: 'reas-t-1', name: 'Syllogisms', isSelected: true },
              { id: 'reas-t-2', name: 'Blood Relations', isSelected: true },
            ],
          },
        ],
      },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
  },
  {
    id: 'course-3',
    serialNumber: 3,
    title: 'Disha 1',
    className: 'Class 10',
    programName: 'Disha 1',
    fee: 12000,
    description: 'Advanced course for Class 10 students preparing for competitive exams',
    subjects: [
      {
        id: 'sub-8',
        name: 'Physics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'phy-ch-1',
            name: 'Mechanics',
            isSelected: true,
            topics: [
              { id: 'phy-t-1', name: "Newton's Laws of Motion", isSelected: true },
              { id: 'phy-t-2', name: 'Equations of Motion', isSelected: true },
              { id: 'phy-t-3', name: 'Friction and Its Types', isSelected: true },
            ],
          },
          {
            id: 'phy-ch-2',
            name: 'Thermodynamics',
            isSelected: true,
            topics: [
              { id: 'phy-t-6', name: 'Heat and Temperature', isSelected: true },
              { id: 'phy-t-7', name: 'Laws of Thermodynamics', isSelected: true },
            ],
          },
          {
            id: 'phy-ch-4',
            name: 'Electromagnetism',
            isSelected: true,
            topics: [
              { id: 'phy-t-15', name: 'Electric Charges and Fields', isSelected: true },
              { id: 'phy-t-16', name: 'Electric Potential', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-9',
        name: 'Mathematics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'math-ch-1',
            name: 'Algebra',
            isSelected: true,
            topics: [
              { id: 'math-t-1', name: 'Linear Equations', isSelected: true },
              { id: 'math-t-2', name: 'Quadratic Equations', isSelected: true },
              { id: 'math-t-3', name: 'Polynomials', isSelected: true },
            ],
          },
          {
            id: 'math-ch-2',
            name: 'Calculus',
            isSelected: true,
            topics: [
              { id: 'math-t-6', name: 'Limits and Continuity', isSelected: true },
              { id: 'math-t-7', name: 'Differentiation', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-10',
        name: 'Chemistry',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'chem-ch-1',
            name: 'Organic Chemistry',
            isSelected: true,
            topics: [
              { id: 'chem-t-1', name: 'Alkanes and Alkenes', isSelected: true },
              { id: 'chem-t-2', name: 'Functional Groups', isSelected: true },
              { id: 'chem-t-3', name: 'Isomerism', isSelected: true },
            ],
          },
          {
            id: 'chem-ch-3',
            name: 'Physical Chemistry',
            isSelected: true,
            topics: [
              { id: 'chem-t-10', name: 'Atomic Structure', isSelected: true },
              { id: 'chem-t-11', name: 'Chemical Equilibrium', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-11',
        name: 'Reasoning & Aptitude',
        institute: 'LearnEazy Inst',
        isOwner: false,
        chapters: [
          {
            id: 'reas-ch-1',
            name: 'Logical Reasoning',
            isSelected: true,
            topics: [
              { id: 'reas-t-1', name: 'Syllogisms', isSelected: true },
              { id: 'reas-t-2', name: 'Blood Relations', isSelected: true },
              { id: 'reas-t-3', name: 'Coding-Decoding', isSelected: true },
            ],
          },
          {
            id: 'reas-ch-3',
            name: 'Quantitative Aptitude',
            isSelected: true,
            topics: [
              { id: 'reas-t-8', name: 'Number Series', isSelected: true },
              { id: 'reas-t-9', name: 'Percentage and Ratio', isSelected: true },
            ],
          },
        ],
      },
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
  },
  {
    id: 'course-4',
    serialNumber: 4,
    title: 'Tejas',
    className: 'Class 10',
    programName: 'Tejas',
    fee: 15000,
    description: 'Premium comprehensive course covering all subjects for Class 10',
    subjects: [
      {
        id: 'sub-12',
        name: 'Biology',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'bio-ch-1',
            name: 'Cell Biology',
            isSelected: true,
            topics: [
              { id: 'bio-t-1', name: 'Cell Structure and Function', isSelected: true },
              { id: 'bio-t-2', name: 'Cell Division - Mitosis', isSelected: true },
            ],
          },
          {
            id: 'bio-ch-3',
            name: 'Human Physiology',
            isSelected: true,
            topics: [
              { id: 'bio-t-10', name: 'Digestive System', isSelected: true },
              { id: 'bio-t-11', name: 'Respiratory System', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-13',
        name: 'Chemistry',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'chem-ch-1',
            name: 'Organic Chemistry',
            isSelected: true,
            topics: [
              { id: 'chem-t-1', name: 'Alkanes and Alkenes', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-14',
        name: 'Physics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'phy-ch-1',
            name: 'Mechanics',
            isSelected: true,
            topics: [
              { id: 'phy-t-1', name: "Newton's Laws of Motion", isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-15',
        name: 'Mathematics',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'math-ch-1',
            name: 'Algebra',
            isSelected: true,
            topics: [
              { id: 'math-t-1', name: 'Linear Equations', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-16',
        name: 'English',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'eng-ch-1',
            name: 'Grammar',
            isSelected: true,
            topics: [
              { id: 'eng-t-1', name: 'Tenses', isSelected: true },
              { id: 'eng-t-2', name: 'Voice - Active and Passive', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-17',
        name: 'Reasoning & Aptitude',
        institute: 'LearnEazy Inst',
        isOwner: false,
        chapters: [
          {
            id: 'reas-ch-1',
            name: 'Logical Reasoning',
            isSelected: true,
            topics: [
              { id: 'reas-t-1', name: 'Syllogisms', isSelected: true },
            ],
          },
        ],
      },
      {
        id: 'sub-18',
        name: 'Telugu',
        institute: 'LearnEazy Inst',
        isOwner: true,
        chapters: [
          {
            id: 'tel-ch-1',
            name: 'Grammar (వ్యాకరణం)',
            isSelected: true,
            topics: [
              { id: 'tel-t-1', name: 'Sandhi (సంధి)', isSelected: true },
            ],
          },
        ],
      },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
  },
];
