import { InstituteFaculty, InstituteProgram, InstituteSubject } from '@/types/instituteProgram';

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
];

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
    ],
    schedule: defaultSchedule(),
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
