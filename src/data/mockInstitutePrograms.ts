import {
  AcademicWindow,
  InstituteFaculty,
  InstituteProgram,
  InstituteSubject,
  ScheduleTrack,
  WeekDay,
} from '@/types/instituteProgram';
import {
  addDays,
  generateFromTimetable,
} from '@/utils/calendarAutomation';


/** Seed data for the institute Programs module.
 *  Class 12 PCM has the full 3 subjects \u00d7 12 chapters \u00d7 5 topics shape
 *  so layout decisions are validated against realistic page lengths.
 */

const SUBJECT_COLORS = {
  physics: 'blue',
  chemistry: 'emerald',
  maths: 'violet',
  biology: 'rose',
  english: 'amber',
  hindi: 'orange',
  social: 'cyan',
} as const;

/* ---------- Class 12 PCM canonical chapter \u2192 topics ---------- */

const PHYSICS_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'Electrostatics', topics: ["Coulomb's Law", "Gauss's Law", 'Electric Potential', 'Capacitance', 'Dielectrics & Polarisation'] },
  { chapter: 'Current Electricity', topics: ["Ohm's Law", "Kirchhoff's Laws", 'Wheatstone Bridge', 'Potentiometer', 'Drift Velocity & Resistivity'] },
  { chapter: 'Magnetic Effects of Current', topics: ['Biot\u2013Savart Law', "Ampere's Circuital Law", 'Force on Moving Charge', 'Solenoid & Toroid', 'Moving Coil Galvanometer'] },
  { chapter: 'Magnetism & Matter', topics: ['Bar Magnet as Solenoid', 'Magnetic Field Lines', 'Earth\u2019s Magnetism', 'Para / Dia / Ferro', 'Magnetic Hysteresis'] },
  { chapter: 'Electromagnetic Induction', topics: ["Faraday's Law", "Lenz's Law", 'Self & Mutual Induction', 'Eddy Currents', 'AC Generator'] },
  { chapter: 'Alternating Current', topics: ['RMS & Average Values', 'AC through R, L, C', 'LCR Series Circuit', 'Resonance & Q-factor', 'Transformer'] },
  { chapter: 'Electromagnetic Waves', topics: ['Displacement Current', 'EM Wave Equation', 'EM Spectrum', 'Properties of EM Waves', 'Applications of EM Waves'] },
  { chapter: 'Ray Optics & Optical Instruments', topics: ['Reflection at Spherical Mirrors', 'Refraction & Snell\u2019s Law', 'Total Internal Reflection', 'Lenses & Lens Maker Formula', 'Microscope & Telescope'] },
  { chapter: 'Wave Optics', topics: ['Huygens Principle', 'Interference & Young\u2019s Experiment', 'Diffraction at Single Slit', 'Polarisation', 'Resolving Power'] },
  { chapter: 'Dual Nature of Radiation & Matter', topics: ['Photoelectric Effect', "Einstein's Equation", 'de Broglie Hypothesis', 'Davisson\u2013Germer', 'Wave Particle Duality'] },
  { chapter: 'Atoms & Nuclei', topics: ['Rutherford Model', 'Bohr Model & Spectra', 'Nuclear Composition', 'Mass\u2013Energy & Binding', 'Radioactivity & Decay'] },
  { chapter: 'Semiconductor Electronics', topics: ['Energy Bands', 'p\u2013n Junction', 'Diode as Rectifier', 'Zener & Photodiode', 'Transistor & Logic Gates'] },
];

const CHEM_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'The Solid State', topics: ['Crystal Lattices', 'Unit Cells & Packing', 'Imperfections in Solids', 'Electrical Properties', 'Magnetic Properties'] },
  { chapter: 'Solutions', topics: ['Concentration Terms', "Raoult's Law", 'Ideal & Non-ideal Solutions', 'Colligative Properties', 'Abnormal Molar Mass'] },
  { chapter: 'Electrochemistry', topics: ['Redox & Electrode Potentials', 'Galvanic Cells', 'Nernst Equation', 'Conductance of Electrolytes', 'Batteries & Fuel Cells'] },
  { chapter: 'Chemical Kinetics', topics: ['Rate of Reaction', 'Order & Molecularity', 'Integrated Rate Laws', 'Arrhenius Equation', 'Collision Theory'] },
  { chapter: 'Surface Chemistry', topics: ['Adsorption', 'Catalysis', 'Colloids', 'Emulsions', 'Applications of Colloids'] },
  { chapter: 'p\u2011Block Elements', topics: ['Group 15 Elements', 'Group 16 Elements', 'Group 17 Elements', 'Group 18 Elements', 'Compounds & Trends'] },
  { chapter: 'd & f Block Elements', topics: ['General Trends', 'Transition Metals', 'Inner Transition Metals', 'Lanthanoid Contraction', 'Important Compounds'] },
  { chapter: 'Coordination Compounds', topics: ['Werner\u2019s Theory', 'Nomenclature', 'Isomerism', 'Crystal Field Theory', 'Applications'] },
  { chapter: 'Haloalkanes & Haloarenes', topics: ['Nomenclature & Prep', 'Physical Properties', 'SN1 & SN2', 'Elimination Reactions', 'Polyhalogen Compounds'] },
  { chapter: 'Alcohols, Phenols & Ethers', topics: ['Preparation Methods', 'Physical Properties', 'Reactions of Alcohols', 'Reactions of Phenols', 'Ethers'] },
  { chapter: 'Aldehydes, Ketones & Acids', topics: ['Preparation', 'Nucleophilic Addition', 'Oxidation & Reduction', 'Carboxylic Acids', 'Mechanisms'] },
  { chapter: 'Amines & Biomolecules', topics: ['Amines: Prep & Properties', 'Diazonium Salts', 'Carbohydrates', 'Proteins', 'Nucleic Acids'] },
];

const MATH_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'Relations & Functions', topics: ['Types of Relations', 'Types of Functions', 'Composition & Inverse', 'Binary Operations', 'Practice Problems'] },
  { chapter: 'Inverse Trigonometric Functions', topics: ['Definitions & Domains', 'Principal Value Branch', 'Properties', 'Graphs', 'Identities'] },
  { chapter: 'Matrices', topics: ['Types of Matrices', 'Matrix Operations', 'Transpose & Symmetric', 'Elementary Operations', 'Inverse of a Matrix'] },
  { chapter: 'Determinants', topics: ['Properties of Determinants', 'Area of Triangle', 'Minors & Cofactors', 'Adjoint & Inverse', 'System of Equations'] },
  { chapter: 'Continuity & Differentiability', topics: ['Continuity', 'Differentiability', 'Chain Rule', 'Logarithmic Differentiation', 'Mean Value Theorems'] },
  { chapter: 'Application of Derivatives', topics: ['Rate of Change', 'Tangents & Normals', 'Increasing / Decreasing', 'Maxima & Minima', 'Approximations'] },
  { chapter: 'Integrals', topics: ['Indefinite Integrals', 'Methods of Integration', 'Integration by Parts', 'Definite Integrals', 'Properties of Definite Integrals'] },
  { chapter: 'Application of Integrals', topics: ['Area under Curves', 'Area between Two Curves', 'Standard Regions', 'Mixed Problems', 'Real-life Applications'] },
  { chapter: 'Differential Equations', topics: ['Order & Degree', 'Variable Separable', 'Homogeneous Equations', 'Linear Differential Eqns', 'Applications'] },
  { chapter: 'Vector Algebra', topics: ['Types of Vectors', 'Addition & Subtraction', 'Dot Product', 'Cross Product', 'Scalar Triple Product'] },
  { chapter: 'Three Dimensional Geometry', topics: ['Direction Cosines', 'Equation of a Line', 'Equation of a Plane', 'Angle between Lines / Planes', 'Distance Formulas'] },
  { chapter: 'Linear Programming & Probability', topics: ['LPP Formulation', 'Graphical Method', 'Conditional Probability', "Bayes' Theorem", 'Random Variables'] },
];

const BIO_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'Reproduction in Organisms', topics: ['Asexual Reproduction', 'Sexual Reproduction', 'Pre-fertilisation Events', 'Post-fertilisation Events'] },
  { chapter: 'Sexual Reproduction in Plants', topics: ['Flower Structure', 'Pollination', 'Double Fertilisation', 'Seed & Fruit Development'] },
  { chapter: 'Human Reproduction', topics: ['Reproductive System', 'Gametogenesis', 'Menstrual Cycle', 'Pregnancy & Lactation'] },
  { chapter: 'Principles of Inheritance', topics: ['Mendel\u2019s Laws', 'Chromosomal Theory', 'Sex Determination', 'Mutations & Disorders'] },
  { chapter: 'Molecular Basis of Inheritance', topics: ['DNA Structure', 'Replication', 'Transcription', 'Translation & Gene Regulation'] },
  { chapter: 'Evolution', topics: ['Origin of Life', 'Theories of Evolution', 'Hardy\u2013Weinberg', 'Human Evolution'] },
  { chapter: 'Human Health & Disease', topics: ['Common Diseases', 'Immunity', 'AIDS & Cancer', 'Drugs & Alcohol Abuse'] },
  { chapter: 'Biotechnology', topics: ['Principles & Tools', 'Recombinant DNA', 'Applications in Medicine', 'Applications in Agriculture'] },
];

const ENG_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'Flamingo \u2014 Prose', topics: ['The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap'] },
  { chapter: 'Flamingo \u2014 Poetry', topics: ['My Mother at Sixty-six', 'An Elementary Classroom', 'Keeping Quiet', 'A Thing of Beauty'] },
  { chapter: 'Vistas \u2014 Supplementary', topics: ['The Third Level', 'The Tiger King', 'Journey to the End of the Earth', 'The Enemy'] },
  { chapter: 'Reading Skills', topics: ['Note-making', 'Summary Writing', 'Comprehension', 'Inference Questions'] },
  { chapter: 'Writing Skills', topics: ['Notice & Advertisement', 'Letter Writing', 'Article Writing', 'Report Writing'] },
  { chapter: 'Grammar & Practice', topics: ['Tenses Revision', 'Reported Speech', 'Modals', 'Editing & Omission'] },
];

const HIN_12: { chapter: string; topics: string[] }[] = [
  { chapter: '\u0906\u0930\u094B\u0939 \u2014 \u0915\u093E\u0935\u094D\u092F', topics: ['\u0939\u0930\u093F\u0935\u0902\u0936\u0930\u093E\u092F \u092C\u091A\u094D\u091A\u0928', '\u0906\u0932\u094B\u0915 \u0927\u0928\u094D\u0935\u093E', '\u0915\u0941\u0902\u0935\u0930 \u0928\u093E\u0930\u093E\u092F\u0923', '\u0930\u0918\u0941\u0935\u0940\u0930 \u0938\u0939\u093E\u092F'] },
  { chapter: '\u0906\u0930\u094B\u0939 \u2014 \u0917\u0926\u094D\u092F', topics: ['\u092D\u0915\u094D\u0924\u093F\u0928', '\u092C\u093E\u091C\u093E\u0930 \u0926\u0930\u094D\u0936\u0928', '\u0915\u093E\u0932\u0947 \u092E\u0947\u0918\u093E \u092A\u093E\u0928\u0940 \u0926\u0947', '\u092A\u0939\u0932\u0935\u093E\u0928 \u0915\u0940 \u0922\u094B\u0932\u0915'] },
  { chapter: '\u0935\u093F\u0924\u093E\u0928 \u2014 \u092A\u0942\u0930\u0915 \u092A\u093E\u0920', topics: ['\u0938\u093F\u0932\u094D\u0935\u0930 \u0935\u0948\u0921\u093F\u0902\u0917', '\u091C\u0942\u091D', '\u0905\u0924\u0940\u0924 \u092E\u0947\u0902 \u0926\u092C\u0947 \u092A\u093E\u0901\u0935', '\u0921\u093E\u092F\u0930\u0940 \u0915\u0947 \u092A\u0928\u094D\u0928\u0947'] },
  { chapter: '\u0905\u092A\u0920\u093F\u0924 \u092C\u094B\u0927', topics: ['\u0917\u0926\u094D\u092F\u093E\u0902\u0936', '\u092A\u0926\u094D\u092F\u093E\u0902\u0936', '\u0936\u092C\u094D\u0926 \u0905\u0930\u094D\u0925', '\u0936\u0940\u0930\u094D\u0937\u0915'] },
  { chapter: '\u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0932\u0947\u0916\u0928', topics: ['\u0928\u093F\u092C\u0902\u0927', '\u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928', '\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928', '\u0938\u0941\u091A\u0928\u093E'] },
  { chapter: '\u0935\u094D\u092F\u093E\u0915\u0930\u0923', topics: ['\u0930\u0938 \u0935 \u0905\u0932\u0902\u0915\u093E\u0930', '\u092E\u0941\u0939\u093E\u0935\u0930\u0947', '\u0935\u093E\u0915\u094D\u092F \u0930\u091A\u0928\u093E', '\u0935\u093E\u091A\u094D\u092F'] },
];

const SOC_12: { chapter: string; topics: string[] }[] = [
  { chapter: 'Politics in India since Independence', topics: ['Challenges of Nation Building', 'Era of One-Party Dominance', 'Politics of Planned Development', 'India\u2019s External Relations'] },
  { chapter: 'Contemporary World Politics', topics: ['Cold War Era', 'End of Bipolarity', 'US Hegemony', 'Alternative Centres of Power'] },
  { chapter: 'Indian Society', topics: ['Demographic Structure', 'Social Institutions', 'Cultural Diversity', 'Patterns of Change'] },
  { chapter: 'Themes in Indian History', topics: ['Bricks, Beads & Bones', 'Kings, Farmers & Towns', 'Bhakti\u2013Sufi Traditions', 'Colonialism & Countryside'] },
  { chapter: 'Macroeconomics', topics: ['National Income', 'Money & Banking', 'Government Budget', 'Balance of Payments'] },
  { chapter: 'Indian Economic Development', topics: ['Pre-independence Economy', 'Planning & Five-Year Plans', 'Liberalisation & Reforms', 'Poverty & Employment'] },
];

/* ---------- Hour seeding strategy ----------
   We want hours to vary so totals look real. We use a small deterministic
   pattern keyed on chapter index + topic index so reloading is stable.
*/

function hoursFor(chIdx: number, tIdx: number): number {
  // Cycle through [1.5, 2, 1, 2.5, 1.5] with a chapter offset of 0.25h on even chapters.
  const base = [1.5, 2, 1, 2.5, 1.5][tIdx % 5];
  const bump = chIdx % 2 === 0 ? 0 : 0.25;
  // Make a few chapters lighter to vary the rollup.
  if (chIdx === 5 || chIdx === 10) return base - 0.5 > 0 ? base - 0.5 : base;
  return base + bump;
}

let topicSeq = 0;
let chapterSeq = 0;

function buildSubject(
  id: string,
  name: string,
  color: string,
  spec: { chapter: string; topics: string[] }[],
  seedHours: boolean,
): InstituteSubject {
  return {
    id,
    name,
    color,
    chapters: spec.map((ch, chIdx) => ({
      id: `c-${id}-${++chapterSeq}`,
      name: ch.chapter,
      topics: ch.topics.map((tName, tIdx) => ({
        id: `t-${id}-${++topicSeq}`,
        name: tName,
        hours: seedHours ? hoursFor(chIdx, tIdx) : 0,
      })),
    })),
  };
}

const ACADEMIC_START = '2025-04-14'; // Monday

function defaultSchedule(startDate = ACADEMIC_START) {
  return {
    startDate,
    workingDays: [1, 2, 3, 4, 5, 6] as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
    periodsPerDay: 6,
    periodLengthMins: 40,
    dayStartTime: '08:30',
    breaks: [
      { id: 'brk-short', afterPeriod: 2, name: 'Short break', durationMins: 15 },
      { id: 'brk-lunch', afterPeriod: 4, name: 'Lunch', durationMins: 30 },
    ],
    holidays: [] as { date: string; name?: string }[],
    holidayOverrides: { removed: [] as string[], added: [] as { date: string; name?: string }[] },
    defaultFaculty: {} as Record<string, string>,
  };
}

/* ---------- Programs ---------- */

export const MOCK_FACULTY: InstituteFaculty[] = [
  { id: 'fac-1', name: 'Ms. Anika Rao', subjectId: 'subj-phy-12' },
  { id: 'fac-2', name: 'Mr. Vivek Menon', subjectId: 'subj-phy-12' },
  { id: 'fac-3', name: 'Ms. Priya Sharma', subjectId: 'subj-chem-12' },
  { id: 'fac-4', name: 'Dr. Kavita Nair', subjectId: 'subj-chem-12' },
  { id: 'fac-5', name: 'Mr. Arjun Kapoor', subjectId: 'subj-math-12' },
  { id: 'fac-6', name: 'Ms. Neha Gupta', subjectId: 'subj-math-12' },
  { id: 'fac-7', name: 'Dr. Meera Iyer', subjectId: 'subj-bio-12' },
  { id: 'fac-8', name: 'Mr. Rohit Das', subjectId: 'subj-bio-12' },
  { id: 'fac-9', name: 'Ms. Sneha Pillai', subjectId: 'subj-eng-12' },
  { id: 'fac-10', name: 'Mr. James Thomas', subjectId: 'subj-eng-12' },
  { id: 'fac-11', name: 'Mrs. Kavya Joshi', subjectId: 'subj-hin-12' },
  { id: 'fac-12', name: 'Mr. Suresh Yadav', subjectId: 'subj-hin-12' },
  { id: 'fac-13', name: 'Ms. Riya Khanna', subjectId: 'subj-soc-12' },
  { id: 'fac-14', name: 'Mr. Aakash Verma', subjectId: 'subj-soc-12' },
];

/* ---------- Seeded weekly timetable for Class 12 PCM (W1) ----------
   Layout (P1..P6 × Mon..Sat) — mixes all 7 subjects realistically.
*/
const PCM_W1_START = '2025-04-14'; // Monday
const PCM_TT_PATTERN: Record<number, string[]> = {
  // periodIndex -> [Mon, Tue, Wed, Thu, Fri, Sat]
  0: ['subj-phy-12',  'subj-chem-12', 'subj-math-12', 'subj-phy-12',  'subj-chem-12', 'subj-math-12'],
  1: ['subj-math-12', 'subj-phy-12',  'subj-chem-12', 'subj-math-12', 'subj-phy-12',  'subj-chem-12'],
  2: ['subj-bio-12',  'subj-eng-12',  'subj-hin-12',  'subj-soc-12',  'subj-bio-12',  'subj-eng-12'],
  3: ['subj-hin-12',  'subj-soc-12',  'subj-bio-12',  'subj-eng-12',  'subj-hin-12',  'subj-soc-12'],
  4: ['subj-chem-12', 'subj-math-12', 'subj-phy-12',  'subj-bio-12',  'subj-math-12', 'subj-phy-12'],
  5: ['subj-eng-12',  'subj-bio-12',  'subj-soc-12',  'subj-hin-12',  'subj-soc-12',  'subj-bio-12'],
};
const PCM_WEEKDAYS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
const PCM_WEEKLY_TIMETABLE = {
  cells: Object.entries(PCM_TT_PATTERN).flatMap(([pIdxStr, row]) =>
    PCM_WEEKDAYS.map((wd, dayCol) => ({
      weekStartDate: PCM_W1_START,
      weekday: wd as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      periodIndex: Number(pIdxStr),
      subjectId: row[dayCol],
    })),
  ),
};

const PCM_DEFAULT_FACULTY: Record<string, string> = {
  'subj-phy-12': 'fac-1',
  'subj-chem-12': 'fac-3',
  'subj-math-12': 'fac-5',
  'subj-bio-12': 'fac-7',
  'subj-eng-12': 'fac-9',
  'subj-hin-12': 'fac-11',
  'subj-soc-12': 'fac-13',
};

const PCM_END_DATE = '2026-03-28'; // ~ 1 academic year

export const MOCK_INSTITUTE_PROGRAMS: InstituteProgram[] = [
  {
    id: 'prog-1',
    name: 'Class 12 PCM \u2014 Excellence',
    className: 'Class 12',
    sections: ['A', 'B'],
    fee: 85000,
    hoursFinalised: true,
    subjects: [
      buildSubject('subj-phy-12', 'Physics', SUBJECT_COLORS.physics, PHYSICS_12, true),
      buildSubject('subj-chem-12', 'Chemistry', SUBJECT_COLORS.chemistry, CHEM_12, true),
      buildSubject('subj-math-12', 'Mathematics', SUBJECT_COLORS.maths, MATH_12, true),
      buildSubject('subj-bio-12', 'Biology', SUBJECT_COLORS.biology, BIO_12, true),
      buildSubject('subj-eng-12', 'English', SUBJECT_COLORS.english, ENG_12, true),
      buildSubject('subj-hin-12', 'Hindi', SUBJECT_COLORS.hindi, HIN_12, true),
      buildSubject('subj-soc-12', 'Social Studies', SUBJECT_COLORS.social, SOC_12, true),
    ],
    schedule: {
      ...defaultSchedule(),
      endDate: PCM_END_DATE,
      defaultFaculty: PCM_DEFAULT_FACULTY,
      weeklyTimetable: PCM_WEEKLY_TIMETABLE,
    },
  },
  {
    id: 'prog-2',
    name: 'Class 11 PCM Foundation',
    className: 'Class 11',
    sections: ['A', 'B'],
    fee: 78000,
    hoursFinalised: false,
    subjects: [
      buildSubject('subj-phy-11', 'Physics', SUBJECT_COLORS.physics, PHYSICS_12.slice(0, 8), false),
      buildSubject('subj-chem-11', 'Chemistry', SUBJECT_COLORS.chemistry, CHEM_12.slice(0, 8), false),
      buildSubject('subj-math-11', 'Mathematics', SUBJECT_COLORS.maths, MATH_12.slice(0, 8), false),
    ],
    schedule: defaultSchedule('2025-06-02'),
  },
  {
    id: 'prog-3',
    name: 'Class 10 CBSE Core',
    className: 'Class 10',
    sections: ['A', 'B', 'C'],
    fee: 65000,
    hoursFinalised: false,
    subjects: [
      buildSubject('subj-math-10', 'Mathematics', SUBJECT_COLORS.maths, MATH_12.slice(0, 6), false),
    ],
    schedule: defaultSchedule('2025-04-21'),
  },
];

/* ---------- Seed prior coverage for prog-1 ----------
   `computeCoverageCursor` reads from `program.generatedSlots` and picks the
   slot with the latest `date` per subject. We seed one slot per subject
   so the "Previously covered up to" panel shows a populated state.
*/
(() => {
  const prog = MOCK_INSTITUTE_PROGRAMS[0];
  const findIds = (subjectId: string, chIdx: number, tIdx: number) => {
    const subj = prog.subjects.find((s) => s.id === subjectId);
    const ch = subj?.chapters[chIdx];
    const tp = ch?.topics[tIdx];
    return ch && tp ? { chapterId: ch.id, topicId: tp.id } : null;
  };
  const coverage: { subjectId: string; chIdx: number; tIdx: number; date: string }[] = [
    { subjectId: 'subj-phy-12',  chIdx: 0, tIdx: 3, date: '2025-04-11' }, // Capacitance
    { subjectId: 'subj-chem-12', chIdx: 0, tIdx: 2, date: '2025-04-12' }, // Imperfections in Solids
    { subjectId: 'subj-math-12', chIdx: 0, tIdx: 2, date: '2025-04-10' }, // Composition & Inverse
    { subjectId: 'subj-bio-12',  chIdx: 0, tIdx: 2, date: '2025-04-09' }, // Pre-fertilisation Events
    { subjectId: 'subj-eng-12',  chIdx: 0, tIdx: 2, date: '2025-04-11' }, // Deep Water
    { subjectId: 'subj-hin-12',  chIdx: 0, tIdx: 1, date: '2025-04-12' }, // आलोक धन्वा
    { subjectId: 'subj-soc-12',  chIdx: 0, tIdx: 1, date: '2025-04-10' }, // Era of One-Party Dominance
  ];
  const priorSlots = coverage
    .map((c, i) => {
      const ids = findIds(c.subjectId, c.chIdx, c.tIdx);
      if (!ids) return null;
      return {
        id: `seed-prior-${i}`,
        date: c.date,
        periodIndex: 0,
        startTime: '08:30',
        endTime: '09:10',
        subjectId: c.subjectId,
        chapterId: ids.chapterId,
        topicId: ids.topicId,
        facultyId: PCM_DEFAULT_FACULTY[c.subjectId] ?? '',
      };
    })
    .filter(Boolean) as NonNullable<InstituteProgram['generatedSlots']>;

  // Clone the W1 timetable template across every week in the academic window
  // so Step 2's week chips all read as "filled" and Step 3 renders a full grid.
  if (prog.schedule.weeklyTimetable) {
    const baseCells = prog.schedule.weeklyTimetable.cells.filter(
      (c) => c.weekStartDate === PCM_W1_START,
    );
    const start = PCM_W1_START;
    const end = prog.schedule.endDate ?? PCM_END_DATE;
    const weeks: string[] = [];
    let cur = start;
    let safety = 0;
    while (cur <= end && safety < 260) {
      weeks.push(cur);
      cur = addDays(cur, 7);
      safety += 1;
    }
    const allCells = weeks.flatMap((ws) =>
      baseCells.map((c) => ({ ...c, weekStartDate: ws })),
    );
    prog.schedule = {
      ...prog.schedule,
      weeklyTimetable: { cells: allCells },
    };
  }

  // Pre-generate the full schedule so Step 3 opens populated.
  try {
    const out = generateFromTimetable(prog, prog.schedule, []);
    prog.generatedSlots = [...priorSlots, ...out.slots];
  } catch {
    prog.generatedSlots = priorSlots;
  }
})();

/* ---------- Phase B — seed multiple Academic Windows per program ----------
   Each program gets 3 windows with visibly different working days, periods/day,
   allocations, tracks and timetables — so switching windows in the
   AcademicWindowSwitcher produces clearly different content on all 3 steps.
*/
(() => {
  type WinSeed = {
    id: string;
    label: string;
    startDate: string;
    endDate: string;
    workingDays: WeekDay[];
    periodsPerDay: number;
    /** subjectId -> target periods */
    targets: Record<string, number>;
    /** subjectId -> tracks (omit for single default track) */
    tracks?: Record<string, ScheduleTrack[]>;
    /** trackId -> target periods */
    trackTargets?: Record<string, number>;
    /** fraction (0..1) of weekly grid to fill from base pattern */
    fillRatio: number;
    holidayAdds?: { date: string; name?: string }[];
    holidayRemoves?: string[];
  };

  const buildTimetableCells = (
    weekStart: string,
    pattern: Record<number, string[]>,
    weekdays: WeekDay[],
    periodsPerDay: number,
    fillRatio: number,
  ) => {
    const cells: { weekStartDate: string; weekday: WeekDay; periodIndex: number; subjectId: string | null }[] = [];
    const totalSlots = weekdays.length * periodsPerDay;
    let filled = 0;
    const target = Math.floor(totalSlots * fillRatio);
    for (let p = 0; p < periodsPerDay; p++) {
      const row = pattern[p];
      if (!row) continue;
      weekdays.forEach((wd, col) => {
        if (filled >= target) return;
        const subj = row[col % row.length];
        if (!subj) return;
        cells.push({ weekStartDate: weekStart, weekday: wd, periodIndex: p, subjectId: subj });
        filled++;
      });
    }
    return cells;
  };

  const seedProgram = (programId: string, seeds: WinSeed[]) => {
    const prog = MOCK_INSTITUTE_PROGRAMS.find((p) => p.id === programId);
    if (!prog || !prog.schedule) return;

    const wdsByPeriod: Record<number, string[]> = {};
    prog.subjects.forEach((s, i) => {
      // round-robin a base pattern from the program's own subjects
      for (let p = 0; p < 8; p++) {
        wdsByPeriod[p] = wdsByPeriod[p] ?? [];
        wdsByPeriod[p].push(prog.subjects[(p + i) % prog.subjects.length].id);
      }
    });

    const windows: AcademicWindow[] = seeds.map((s, idx) => {
      const cells = buildTimetableCells(
        s.startDate,
        wdsByPeriod,
        s.workingDays,
        s.periodsPerDay,
        s.fillRatio,
      );
      // For the first window, prefer the program's existing fully-built timetable
      // so the demo opens with the rich seeded grid.
      const weeklyTimetable =
        idx === 0 && prog.schedule?.weeklyTimetable
          ? prog.schedule.weeklyTimetable
          : { cells };
      return {
        id: s.id,
        label: s.label,
        startDate: s.startDate,
        endDate: s.endDate,
        workingDays: s.workingDays,
        periodsPerDay: s.periodsPerDay,
        weeklyTimetable,
        subjectTargetPeriods: s.targets,
        subjectTracks: s.tracks ?? {},
        trackTargetPeriods: s.trackTargets ?? {},
        subjectLocks: {},
        holidayOverrides: {
          removed: s.holidayRemoves ?? [],
          added: s.holidayAdds ?? [],
        },
      };
    });

    // Mirror the first window's slice into the flat ScheduleConfig fields so
    // the page opens consistent with the active window.
    const first = windows[0];
    prog.schedule = {
      ...prog.schedule,
      windows,
      activeWindowId: first.id,
      startDate: first.startDate,
      endDate: first.endDate,
      workingDays: first.workingDays,
      periodsPerDay: first.periodsPerDay,
      weeklyTimetable: first.weeklyTimetable,
      subjectTargetPeriods: first.subjectTargetPeriods,
      subjectTracks: first.subjectTracks,
      trackTargetPeriods: first.trackTargetPeriods,
      subjectLocks: first.subjectLocks,
      holidayOverrides: first.holidayOverrides,
    };
  };

  // ── prog-1: Class 12 PCM ───────────────────────────────────────────────
  seedProgram('prog-1', [
    {
      id: 'win-pcm-t1',
      label: 'Term 1 · Foundation',
      startDate: '2025-04-14',
      endDate: '2025-08-30',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 6,
      targets: {
        'subj-phy-12': 40, 'subj-chem-12': 35, 'subj-math-12': 50,
        'subj-bio-12': 30, 'subj-eng-12': 20, 'subj-hin-12': 18, 'subj-soc-12': 18,
      },
      tracks: {
        'subj-math-12': [
          { id: 'trk-math-t1-a', subjectId: 'subj-math-12', name: 'Algebra', facultyId: 'fac-5', allottedPeriods: 28, enabled: true },
          { id: 'trk-math-t1-b', subjectId: 'subj-math-12', name: 'Calculus', facultyId: 'fac-6', allottedPeriods: 22, enabled: true },
        ],
      },
      trackTargets: { 'trk-math-t1-a': 28, 'trk-math-t1-b': 22 },
      fillRatio: 1,
      holidayAdds: [{ date: '2025-08-15', name: 'Independence Day (program note)' }],
    },
    {
      id: 'win-pcm-t2',
      label: 'Term 2 · Board Prep',
      startDate: '2025-09-01',
      endDate: '2025-12-20',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 8,
      targets: {
        'subj-phy-12': 55, 'subj-chem-12': 50, 'subj-math-12': 60,
        'subj-bio-12': 40, 'subj-eng-12': 22, 'subj-hin-12': 20, 'subj-soc-12': 20,
      },
      tracks: {
        'subj-phy-12': [
          { id: 'trk-phy-t2-a', subjectId: 'subj-phy-12', name: 'Mechanics', facultyId: 'fac-1', allottedPeriods: 30, enabled: true },
          { id: 'trk-phy-t2-b', subjectId: 'subj-phy-12', name: 'Optics & Modern', facultyId: 'fac-2', allottedPeriods: 25, enabled: true },
        ],
      },
      trackTargets: { 'trk-phy-t2-a': 30, 'trk-phy-t2-b': 25 },
      fillRatio: 1,
      holidayAdds: [{ date: '2025-11-01', name: 'Diwali' }],
      holidayRemoves: ['2025-10-02'],
    },
    {
      id: 'win-pcm-t3',
      label: 'Term 3 · Revision Sprint',
      startDate: '2026-01-05',
      endDate: '2026-03-15',
      workingDays: [1, 2, 3, 4, 5],
      periodsPerDay: 5,
      targets: {
        'subj-phy-12': 30, 'subj-chem-12': 30, 'subj-math-12': 35,
        'subj-bio-12': 25, 'subj-eng-12': 12, 'subj-hin-12': 10, 'subj-soc-12': 10,
      },
      fillRatio: 0.55,
    },
  ]);

  // ── prog-2: Class 11 PCM Foundation ────────────────────────────────────
  seedProgram('prog-2', [
    {
      id: 'win-11-s1',
      label: 'Semester 1',
      startDate: '2025-06-02',
      endDate: '2025-10-31',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 6,
      targets: { 'subj-phy-11': 35, 'subj-chem-11': 30, 'subj-math-11': 45 },
      fillRatio: 0.85,
    },
    {
      id: 'win-11-s2',
      label: 'Semester 2',
      startDate: '2025-11-03',
      endDate: '2026-02-28',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 7,
      targets: { 'subj-phy-11': 45, 'subj-chem-11': 40, 'subj-math-11': 50 },
      tracks: {
        'subj-math-11': [
          { id: 'trk-math11-s2-a', subjectId: 'subj-math-11', name: 'Algebra & Trig', facultyId: 'fac-5', allottedPeriods: 28, enabled: true },
          { id: 'trk-math11-s2-b', subjectId: 'subj-math-11', name: 'Coordinate & Calc', facultyId: 'fac-6', allottedPeriods: 22, enabled: true },
        ],
      },
      trackTargets: { 'trk-math11-s2-a': 28, 'trk-math11-s2-b': 22 },
      fillRatio: 0.7,
    },
    {
      id: 'win-11-rev',
      label: 'Revision',
      startDate: '2026-03-02',
      endDate: '2026-03-28',
      workingDays: [1, 2, 3, 4, 5],
      periodsPerDay: 4,
      targets: { 'subj-phy-11': 12, 'subj-chem-11': 10, 'subj-math-11': 15 },
      fillRatio: 0.4,
    },
  ]);

  // ── prog-3: Class 10 CBSE Core ─────────────────────────────────────────
  seedProgram('prog-3', [
    {
      id: 'win-10-q1',
      label: 'Quarter 1',
      startDate: '2025-04-21',
      endDate: '2025-07-31',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 5,
      targets: { 'subj-math-10': 40 },
      fillRatio: 0.8,
    },
    {
      id: 'win-10-q2',
      label: 'Quarter 2',
      startDate: '2025-08-04',
      endDate: '2025-11-15',
      workingDays: [1, 2, 3, 4, 5],
      periodsPerDay: 6,
      targets: { 'subj-math-10': 50 },
      fillRatio: 0.65,
    },
    {
      id: 'win-10-boards',
      label: 'Pre-Board Sprint',
      startDate: '2026-01-12',
      endDate: '2026-03-10',
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 7,
      targets: { 'subj-math-10': 35 },
      fillRatio: 0.5,
    },
  ]);
})();



