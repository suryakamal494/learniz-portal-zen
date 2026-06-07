import { Program, ProgramChapter, ProgramLessonPlan, ProgramTopic, TopicStatus } from '@/types/program';

/* ──────────────────────────────────────────────────────────────────────────
 * Year-long academic schedule generator for Class 12 · Section A (batchId '1').
 * Today (mock "now") is Sunday, 7 Jun 2026 — the generator seeds statuses so
 * the chapter overlapping that week reads as "in progress" and earlier ones
 * are mostly "done" with one realistic slip to drive "behind schedule".
 * ────────────────────────────────────────────────────────────────────────── */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ACADEMIC_START = '2026-05-18';
const MOCK_TODAY = '2026-06-07';

/** Date ranges to skip while scheduling chapters — exams + breaks. */
const SKIP_RANGES: Array<[string, string]> = [
  ['2026-10-01', '2026-10-05'], // Dussehra
  ['2026-11-07', '2026-11-12'], // Diwali
  ['2026-12-22', '2027-01-02'], // Winter break
  ['2027-02-15', '2027-02-25'], // Pre-board prep
];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(iso: string, n: number): string {
  return toISO(new Date(parseISO(iso).getTime() + n * MS_PER_DAY));
}
function isSundayOrSkipped(iso: string): boolean {
  const d = parseISO(iso);
  if (d.getDay() === 0) return true; // Sunday off
  const t = d.getTime();
  return SKIP_RANGES.some(([s, e]) => t >= parseISO(s).getTime() && t <= parseISO(e).getTime());
}
function nextWorking(iso: string): string {
  let cur = iso;
  while (isSundayOrSkipped(cur)) cur = addDays(cur, 1);
  return cur;
}
function advanceWorkingDays(startIso: string, days: number): { start: string; end: string; next: string } {
  const start = nextWorking(startIso);
  let cur = start;
  for (let i = 1; i < days; i++) {
    cur = addDays(cur, 1);
    cur = nextWorking(cur);
  }
  return { start, end: cur, next: nextWorking(addDays(cur, 1)) };
}

/* ──────────────── Lesson plan pool (reusable across chapters) ──────────── */

type LpTemplate = {
  key: string;
  title: string;
  summary: string;
  hours: number;
  contents: Array<{ type: 'ppt' | 'html' | 'video' | 'pdf' | 'note'; title: string; duration?: string }>;
};

const LP_POOL: LpTemplate[] = [
  {
    key: 'intro',
    title: 'Concept introduction',
    summary: 'Definitions, terminology and an overview of the chapter.',
    hours: 1.5,
    contents: [
      { type: 'ppt', title: 'Concept slides', duration: '18 slides' },
      { type: 'video', title: 'Intro lecture', duration: '12 min' },
      { type: 'note', title: 'One-page summary' },
    ],
  },
  {
    key: 'derivation',
    title: 'Derivation walkthrough',
    summary: 'Step-by-step derivations of the key formulae.',
    hours: 2,
    contents: [
      { type: 'ppt', title: 'Derivation deck', duration: '20 slides' },
      { type: 'pdf', title: 'Derivation notes', duration: '8 pages' },
    ],
  },
  {
    key: 'examples',
    title: 'Worked examples',
    summary: 'Solved problems showing typical exam-style applications.',
    hours: 1.5,
    contents: [
      { type: 'pdf', title: 'Example set A', duration: '6 pages' },
      { type: 'video', title: 'Examples walkthrough', duration: '15 min' },
    ],
  },
  {
    key: 'numericals',
    title: 'Numericals drill',
    summary: 'Mixed-difficulty numericals for class-time practice.',
    hours: 2,
    contents: [
      { type: 'pdf', title: 'Numericals worksheet', duration: '4 pages' },
      { type: 'html', title: 'Practice tracker' },
    ],
  },
  {
    key: 'quiz',
    title: 'Quick formative quiz',
    summary: '10-question quiz to check understanding before moving on.',
    hours: 0.5,
    contents: [
      { type: 'html', title: 'Online quiz' },
      { type: 'pdf', title: 'Answer key', duration: '2 pages' },
    ],
  },
  {
    key: 'recap',
    title: 'Recap & doubts',
    summary: 'Targeted recap of weak spots plus an open doubts session.',
    hours: 1,
    contents: [
      { type: 'ppt', title: 'Recap highlights', duration: '10 slides' },
      { type: 'note', title: 'Common-mistakes list' },
    ],
  },
  {
    key: 'lab',
    title: 'Lab / demonstration',
    summary: 'In-class demo or virtual lab tying theory to observation.',
    hours: 1.5,
    contents: [
      { type: 'video', title: 'Demo recording', duration: '9 min' },
      { type: 'html', title: 'Interactive simulator' },
    ],
  },
];

/* ──────────────── Chapter specs — Physics & Chemistry ──────────────── */

type ChapterSpec = {
  name: string;
  days: number; // working days the chapter spans
  topics: string[]; // topic names
  lpKeys?: string[]; // which lesson-plan templates to include (defaults below)
};

const DEFAULT_LP_KEYS = ['intro', 'derivation', 'examples', 'numericals', 'recap'];

const PHYSICS_CHAPTERS: ChapterSpec[] = [
  {
    name: 'Electrostatics',
    days: 12,
    topics: ["Coulomb's Law & Electric Field", "Gauss's Law", 'Electric Potential', 'Capacitance', 'Combination of Capacitors'],
  },
  {
    name: 'Current Electricity',
    days: 10,
    topics: ["Ohm's Law & Resistivity", "Kirchhoff's Laws", 'Wheatstone Bridge', 'Potentiometer', 'EMF & Internal Resistance'],
  },
  {
    name: 'Magnetic Effects of Current',
    days: 9,
    topics: ['Biot–Savart Law', "Ampère's Circuital Law", 'Force on Moving Charge', 'Moving Coil Galvanometer'],
  },
  {
    name: 'Magnetism & Matter',
    days: 6,
    topics: ['Bar Magnet & Magnetic Dipole', "Earth's Magnetism", 'Para/Dia/Ferromagnetism'],
  },
  {
    name: 'Electromagnetic Induction',
    days: 8,
    topics: ["Faraday's Law", "Lenz's Law", 'Self & Mutual Induction', 'Eddy Currents'],
  },
  {
    name: 'Alternating Current',
    days: 9,
    topics: ['AC Fundamentals', 'LCR Circuits', 'Resonance & Power Factor', 'Transformers'],
  },
  {
    name: 'Electromagnetic Waves',
    days: 5,
    topics: ['EM Wave Theory', 'EM Spectrum', 'Applications of EM Waves'],
  },
  {
    name: 'Ray Optics',
    days: 10,
    topics: ['Reflection & Mirrors', 'Refraction & TIR', 'Lenses & Lens Formula', 'Optical Instruments', 'Prisms & Dispersion'],
  },
  {
    name: 'Wave Optics',
    days: 8,
    topics: ['Huygens Principle', 'Interference (YDSE)', 'Diffraction & Polarisation'],
  },
  {
    name: 'Dual Nature of Matter',
    days: 6,
    topics: ['Photoelectric Effect', 'de Broglie Hypothesis', 'Davisson–Germer Experiment'],
  },
  {
    name: 'Atoms',
    days: 6,
    topics: ['Rutherford Model', 'Bohr Model & Hydrogen Spectrum', 'Energy Levels'],
  },
  {
    name: 'Nuclei',
    days: 6,
    topics: ['Nuclear Structure', 'Radioactivity & Decay Law', 'Mass Defect & Binding Energy'],
  },
  {
    name: 'Semiconductors',
    days: 9,
    topics: ['Energy Bands', 'p-n Junction & Diode', 'Rectifiers', 'Transistors & Logic Gates'],
  },
  {
    name: 'Revision & Mock Tests',
    days: 12,
    topics: ['Mechanics quick recap', 'Electrostatics + Current Electricity recap', 'Magnetism + EMI + AC recap', 'Optics recap', 'Modern Physics recap'],
    lpKeys: ['recap', 'examples', 'numericals', 'quiz'],
  },
];

const CHEMISTRY_CHAPTERS: ChapterSpec[] = [
  {
    name: 'Solid State',
    days: 7,
    topics: ['Crystal Lattices & Unit Cells', 'Packing Efficiency', 'Imperfections in Solids', 'Electrical & Magnetic Properties'],
  },
  {
    name: 'Solutions',
    days: 8,
    topics: ['Concentration Terms', "Raoult's Law", 'Colligative Properties', 'Abnormal Molar Mass'],
  },
  {
    name: 'Electrochemistry',
    days: 9,
    topics: ['Redox & Electrode Potentials', 'Galvanic Cells', 'Nernst Equation', 'Conductance & Kohlrausch', 'Electrolysis & Batteries'],
  },
  {
    name: 'Chemical Kinetics',
    days: 7,
    topics: ['Rate of Reaction', 'Order & Molecularity', 'Integrated Rate Laws', 'Arrhenius Equation'],
  },
  {
    name: 'Surface Chemistry',
    days: 5,
    topics: ['Adsorption', 'Catalysis', 'Colloids & Emulsions'],
  },
  {
    name: 'General Principles of Metallurgy',
    days: 5,
    topics: ['Concentration of Ores', 'Reduction Methods', 'Refining of Metals'],
  },
  {
    name: 'p-Block Elements',
    days: 11,
    topics: ['Group 15 Elements', 'Group 16 Elements', 'Group 17 Elements', 'Group 18 Elements', 'Important Compounds'],
  },
  {
    name: 'd & f Block Elements',
    days: 8,
    topics: ['Transition Metals: Trends', 'Important Compounds (KMnO4, K2Cr2O7)', 'Lanthanoids & Actinoids'],
  },
  {
    name: 'Coordination Compounds',
    days: 8,
    topics: ['Nomenclature & Isomerism', "Werner's Theory", 'Bonding (VBT, CFT)', 'Applications'],
  },
  {
    name: 'Haloalkanes & Haloarenes',
    days: 7,
    topics: ['Nomenclature & Preparation', 'SN1, SN2 Reactions', 'Elimination Reactions', 'Polyhalogen Compounds'],
  },
  {
    name: 'Alcohols, Phenols & Ethers',
    days: 7,
    topics: ['Alcohols: Prep & Properties', 'Phenols: Acidity & Reactions', 'Ethers'],
  },
  {
    name: 'Aldehydes, Ketones & Acids',
    days: 8,
    topics: ['Aldehydes & Ketones: Prep', 'Nucleophilic Addition', 'Carboxylic Acids', 'Important Named Reactions'],
  },
  {
    name: 'Amines',
    days: 6,
    topics: ['Classification & Preparation', 'Basicity of Amines', 'Diazonium Salts'],
  },
  {
    name: 'Biomolecules',
    days: 8,
    topics: ['Carbohydrates', 'Proteins & Enzymes', 'Vitamins', 'Nucleic Acids'],
  },
];

/* ──────────────── Build helpers ──────────────── */

function statusFromDates(startIso: string, endIso: string, todayIso: string): TopicStatus {
  if (endIso < todayIso) return 'done';
  if (startIso > todayIso) return 'not-started';
  return 'in-progress';
}

function splitTopicDates(start: string, end: string, n: number): Array<{ s: string; e: string }> {
  // Distribute calendar days (including non-working) across n topics, rounding evenly.
  const totalDays = Math.max(1, Math.round((parseISO(end).getTime() - parseISO(start).getTime()) / MS_PER_DAY) + 1);
  const per = Math.max(1, Math.floor(totalDays / n));
  const out: Array<{ s: string; e: string }> = [];
  let cursor = start;
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    const sIso = nextWorking(cursor);
    const eIso = isLast ? end : nextWorking(addDays(sIso, Math.max(0, per - 1)));
    out.push({ s: sIso, e: eIso < sIso ? sIso : eIso });
    cursor = addDays(eIso, 1);
  }
  return out;
}

function buildSubject(
  subjectPrefix: string,
  subjectName: string,
  specs: ChapterSpec[],
  startIso: string,
  todayIso: string,
): { id: string; name: string; chapters: ProgramChapter[] } {
  const chapters: ProgramChapter[] = [];
  let cursor = startIso;

  specs.forEach((spec, ci) => {
    const { start, end, next } = advanceWorkingDays(cursor, spec.days);
    cursor = next;

    const chId = `${subjectPrefix}-ch-${ci + 1}`;
    const lpKeys = spec.lpKeys ?? DEFAULT_LP_KEYS;

    // Materialise lesson plans for this chapter from the pool.
    const lessonPlans: ProgramLessonPlan[] = lpKeys.map((key, li) => {
      const tmpl = LP_POOL.find((p) => p.key === key)!;
      return {
        id: `${chId}-lp-${li + 1}`,
        title: tmpl.title,
        summary: tmpl.summary,
        status: 'not-started',
        hoursPlanned: tmpl.hours,
        hoursSpent: 0,
        contents: tmpl.contents.map((c, ci2) => ({
          id: `${chId}-lp-${li + 1}-c${ci2 + 1}`,
          type: c.type,
          title: c.title,
          duration: c.duration,
          url: '#',
        })),
      };
    });

    // Materialise topics with date windows split across the chapter range.
    const topicWindows = splitTopicDates(start, end, spec.topics.length);
    const topics: ProgramTopic[] = spec.topics.map((tName, ti) => {
      const { s, e } = topicWindows[ti];
      const status = statusFromDates(s, e, todayIso);
      // Link each topic to ~2 lesson plans (round-robin from the pool).
      const lp1 = lessonPlans[ti % lessonPlans.length].id;
      const lp2 = lessonPlans[(ti + 1) % lessonPlans.length].id;
      return {
        id: `${chId}-t${ti + 1}`,
        name: tName,
        plannedHours: 2,
        plannedStartDate: s,
        plannedEndDate: e,
        status,
        lastUpdatedAt: status !== 'not-started' ? `${e}T15:00:00Z` : undefined,
        lessonPlanIds: [lp1, lp2],
      };
    });

    // Roll lesson-plan status up from the topics that link to it.
    for (const lp of lessonPlans) {
      const linked = topics.filter((t) => t.lessonPlanIds?.includes(lp.id));
      if (linked.length === 0) continue;
      const allDone = linked.every((t) => t.status === 'done');
      const anyStarted = linked.some((t) => t.status !== 'not-started');
      lp.status = allDone ? 'completed' : anyStarted ? 'partial' : 'not-started';
      lp.hoursSpent = allDone ? lp.hoursPlanned : anyStarted ? +(lp.hoursPlanned * 0.5).toFixed(2) : 0;
      const lastDone = linked.filter((t) => t.status === 'done').sort((a, b) => b.plannedEndDate.localeCompare(a.plannedEndDate))[0];
      if (lastDone) lp.lastTaughtDate = lastDone.plannedEndDate;
    }

    chapters.push({
      id: chId,
      name: spec.name,
      order: ci + 1,
      plannedStartDate: start,
      plannedEndDate: end,
      topics,
      lessonPlans,
    });
  });

  // Introduce one realistic slip: in the chapter that ended most recently before
  // today, leave the last topic 'not-started' (drives "behind schedule").
  const recentlyFinished = [...chapters]
    .filter((c) => c.plannedEndDate! < todayIso)
    .sort((a, b) => b.plannedEndDate!.localeCompare(a.plannedEndDate!))[0];
  if (recentlyFinished?.topics?.length) {
    const last = recentlyFinished.topics[recentlyFinished.topics.length - 1];
    last.status = 'not-started';
    last.lastUpdatedAt = undefined;
    // Roll its lesson plans back to partial.
    for (const lpId of last.lessonPlanIds ?? []) {
      const lp = recentlyFinished.lessonPlans.find((p) => p.id === lpId);
      if (lp && lp.status === 'completed') {
        lp.status = 'partial';
        lp.hoursSpent = +(lp.hoursPlanned * 0.6).toFixed(2);
      }
    }
  }

  return {
    id: `sub-1-${subjectPrefix}`,
    name: subjectName,
    chapters,
  };
}

/* ──────────────── Compose the full program for batch '1' ──────────────── */

const physicsSubject = buildSubject('phy', 'Physics', PHYSICS_CHAPTERS, ACADEMIC_START, MOCK_TODAY);
const chemistrySubject = buildSubject('chem', 'Chemistry', CHEMISTRY_CHAPTERS, ACADEMIC_START, MOCK_TODAY);

function lpManual(
  id: string,
  title: string,
  summary: string,
  status: 'completed' | 'partial' | 'not-started',
  hoursPlanned: number,
  hoursSpent: number,
  contents: Array<{ type: 'ppt' | 'html' | 'video' | 'pdf' | 'note'; title: string; duration?: string }>,
  lastTaughtDate?: string,
): ProgramLessonPlan {
  return {
    id,
    title,
    summary,
    status,
    hoursPlanned,
    hoursSpent,
    lastTaughtDate,
    contents: contents.map((c, i) => ({
      id: `${id}-c${i + 1}`,
      type: c.type,
      title: c.title,
      duration: c.duration,
      url: '#',
    })),
  };
}

export const mockPrograms: Program[] = [
  // Batch 1 — Class 12 · Section A — full academic year mock
  {
    id: 'prog-1',
    batchId: '1',
    subjects: [physicsSubject, chemistrySubject],
  },

  // Batch 2 — single subject
  {
    id: 'prog-2',
    batchId: '2',
    subjects: [
      {
        id: 'sub-2-math',
        name: 'Mathematics',
        chapters: [
          {
            id: 'ch-2-1',
            name: 'Sets, Relations & Functions',
            order: 1,
            lessonPlans: [
              lpManual('lp-2-1', 'Set Theory Basics', 'Set operations, Venn diagrams.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Sets intro', duration: '20 slides' },
                { type: 'html', title: 'Venn diagram practice' },
              ], '2026-05-15'),
              lpManual('lp-2-2', 'Relations & Functions', 'Domain, range, types of functions.', 'completed', 3, 3, [
                { type: 'ppt', title: 'Function types', duration: '24 slides' },
                { type: 'pdf', title: 'Worked examples' },
              ], '2026-05-22'),
            ],
          },
          {
            id: 'ch-2-2',
            name: 'Trigonometric Functions',
            order: 2,
            lessonPlans: [
              lpManual('lp-2-3', 'Identities & Equations', 'Standard identities, conditional equations.', 'partial', 3, 1.5, [
                { type: 'ppt', title: 'Trig identities', duration: '20 slides' },
                { type: 'video', title: 'Solving trig equations', duration: '14 min' },
              ], '2026-05-30'),
              lpManual('lp-2-4', 'Inverse Trig Functions', 'Principal values, properties.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'Inverse trig', duration: '16 slides' },
              ]),
            ],
          },
        ],
      },
    ],
  },

  // Batch 3 — single subject
  {
    id: 'prog-3',
    batchId: '3',
    subjects: [
      {
        id: 'sub-3-chem',
        name: 'Chemistry',
        chapters: [
          {
            id: 'ch-3-1',
            name: 'Chemical Kinetics',
            order: 1,
            lessonPlans: [
              lpManual('lp-3-1', 'Rate of Reaction', 'Average vs instantaneous rate.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Kinetics intro', duration: '20 slides' },
                { type: 'video', title: 'Reaction rate demo', duration: '9 min' },
              ], '2026-05-18'),
              lpManual('lp-3-2', 'Order & Molecularity', 'First and second order reactions.', 'partial', 3, 1.5, [
                { type: 'ppt', title: 'Order of reactions', duration: '22 slides' },
                { type: 'pdf', title: 'Numerical practice' },
              ], '2026-05-28'),
            ],
          },
        ],
      },
    ],
  },
];

export function getProgramByBatchId(batchId: string): Program | undefined {
  return mockPrograms.find((p) => p.batchId === batchId);
}
