import { InstituteFaculty, InstituteProgram } from '@/types/instituteProgram';

/** Lightweight seed for the institute-side Programs module.
 * Topic hours are intentionally left 0 for some programs so the gating flow
 * (set hours → unlock scheduling) is visible during demos.
 */

const SUBJECT_COLORS = {
  physics: 'blue',
  chemistry: 'emerald',
  maths: 'violet',
  biology: 'rose',
  english: 'amber',
  cs: 'cyan',
} as const;

function topics(names: string[], hours: number[] = []) {
  return names.map((name, i) => ({
    id: `t-${Math.random().toString(36).slice(2, 9)}`,
    name,
    hours: hours[i] ?? 0,
  }));
}

function chapter(name: string, ts: { id: string; name: string; hours: number }[]) {
  return { id: `c-${Math.random().toString(36).slice(2, 9)}`, name, topics: ts };
}

function buildPhysics12(seeded = false): InstituteProgram['subjects'][number] {
  return {
    id: 'subj-phy',
    name: 'Physics',
    color: SUBJECT_COLORS.physics,
    chapters: [
      chapter('Electrostatics', topics(
        ["Coulomb's Law", "Gauss's Law", 'Electric Potential', 'Capacitance'],
        seeded ? [2, 2, 1.5, 2] : [],
      )),
      chapter('Current Electricity', topics(
        ["Ohm's Law", "Kirchhoff's Laws", 'Wheatstone Bridge', 'Potentiometer'],
        seeded ? [1.5, 2, 1, 1.5] : [],
      )),
      chapter('Magnetic Effects', topics(
        ['Biot–Savart Law', "Ampère's Law", 'Force on Moving Charge'],
        seeded ? [2, 2, 1.5] : [],
      )),
      chapter('Electromagnetic Induction', topics(
        ["Faraday's Law", "Lenz's Law", 'Self & Mutual Induction'],
        seeded ? [1.5, 1, 2] : [],
      )),
    ],
  };
}

function buildChemistry12(seeded = false): InstituteProgram['subjects'][number] {
  return {
    id: 'subj-chem',
    name: 'Chemistry',
    color: SUBJECT_COLORS.chemistry,
    chapters: [
      chapter('Solid State', topics(['Crystal Lattices', 'Packing Efficiency', 'Imperfections'], seeded ? [1.5, 1, 1] : [])),
      chapter('Solutions', topics(['Concentration Terms', "Raoult's Law", 'Colligative Properties'], seeded ? [1, 1.5, 2] : [])),
      chapter('Electrochemistry', topics(['Redox & Electrode Potentials', 'Galvanic Cells', 'Nernst Equation'], seeded ? [2, 1.5, 1.5] : [])),
      chapter('Chemical Kinetics', topics(['Rate of Reaction', 'Order & Molecularity', 'Arrhenius Equation'], seeded ? [1, 1, 1.5] : [])),
    ],
  };
}

function buildMaths12(seeded = false): InstituteProgram['subjects'][number] {
  return {
    id: 'subj-math',
    name: 'Mathematics',
    color: SUBJECT_COLORS.maths,
    chapters: [
      chapter('Relations & Functions', topics(['Types of Relations', 'Types of Functions', 'Composition & Inverse'], seeded ? [1, 1.5, 2] : [])),
      chapter('Matrices', topics(['Matrix Operations', 'Transpose & Symmetric', 'Elementary Operations'], seeded ? [1.5, 1, 1.5] : [])),
      chapter('Determinants', topics(['Properties', 'Area of Triangle', 'Adjoint & Inverse'], seeded ? [1.5, 1, 2] : [])),
      chapter('Continuity & Differentiability', topics(['Continuity', 'Differentiability', 'Logarithmic Differentiation'], seeded ? [2, 2, 1.5] : [])),
    ],
  };
}

function buildBiology12(): InstituteProgram['subjects'][number] {
  return {
    id: 'subj-bio',
    name: 'Biology',
    color: SUBJECT_COLORS.biology,
    chapters: [
      chapter('Reproduction', topics(['Sexual Reproduction', 'Human Reproduction', 'Reproductive Health'])),
      chapter('Genetics & Evolution', topics(["Mendel's Principles", 'Molecular Basis', 'Evolution'])),
      chapter('Biology & Human Welfare', topics(['Health & Disease', 'Strategies for Enhancement'])),
    ],
  };
}

function buildEnglish12(): InstituteProgram['subjects'][number] {
  return {
    id: 'subj-eng',
    name: 'English',
    color: SUBJECT_COLORS.english,
    chapters: [
      chapter('Reading Skills', topics(['Comprehension', 'Note Making', 'Summary Writing'])),
      chapter('Writing Skills', topics(['Notice & Advertisement', 'Letter Writing', 'Article Writing'])),
      chapter('Literature', topics(['Flamingo Poems', 'Flamingo Prose', 'Vistas Stories'])),
    ],
  };
}

export const MOCK_FACULTY: InstituteFaculty[] = [
  { id: 'fac-1', name: 'Ms. Anika Rao', subjectId: 'subj-phy' },
  { id: 'fac-2', name: 'Mr. Vivek Menon', subjectId: 'subj-phy' },
  { id: 'fac-3', name: 'Ms. Priya Sharma', subjectId: 'subj-chem' },
  { id: 'fac-4', name: 'Dr. Kavita Nair', subjectId: 'subj-chem' },
  { id: 'fac-5', name: 'Mr. Arjun Kapoor', subjectId: 'subj-math' },
  { id: 'fac-6', name: 'Ms. Neha Gupta', subjectId: 'subj-math' },
  { id: 'fac-7', name: 'Dr. Ravi Patel', subjectId: 'subj-bio' },
  { id: 'fac-8', name: 'Ms. Sunita Joshi', subjectId: 'subj-eng' },
];

export const MOCK_INSTITUTE_PROGRAMS: InstituteProgram[] = [
  {
    id: 'prog-1',
    name: 'Class 12 PCM — Excellence',
    className: 'Class 12',
    sections: ['A', 'B'],
    fee: 85000,
    hoursFinalised: true,
    subjects: [buildPhysics12(true), buildChemistry12(true), buildMaths12(true)],
  },
  {
    id: 'prog-2',
    name: 'Class 12 PCB — Medical Edge',
    className: 'Class 12',
    sections: ['C'],
    fee: 92000,
    hoursFinalised: false,
    subjects: [buildPhysics12(true), buildChemistry12(true), buildBiology12()],
  },
  {
    id: 'prog-3',
    name: 'Class 11 PCM Foundation',
    className: 'Class 11',
    sections: ['A', 'B'],
    fee: 78000,
    hoursFinalised: false,
    subjects: [buildPhysics12(), buildChemistry12(), buildMaths12()],
  },
  {
    id: 'prog-4',
    name: 'Class 10 CBSE Core',
    className: 'Class 10',
    sections: ['A', 'B', 'C'],
    fee: 65000,
    hoursFinalised: false,
    subjects: [buildMaths12(), buildEnglish12()],
  },
  {
    id: 'prog-5',
    name: 'Class 11 Bio Foundation',
    className: 'Class 11',
    sections: ['C'],
    fee: 76000,
    hoursFinalised: false,
    subjects: [buildBiology12(), buildChemistry12(), buildEnglish12()],
  },
  {
    id: 'prog-6',
    name: 'Class 12 Commerce',
    className: 'Class 12',
    sections: ['D'],
    fee: 58000,
    hoursFinalised: false,
    subjects: [buildEnglish12(), buildMaths12()],
  },
];
