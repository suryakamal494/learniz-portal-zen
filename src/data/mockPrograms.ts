import { Program } from '@/types/program';

// Two batches with multiple subjects ('1' Physics+Chemistry, '4' two subjects);
// rest are single-subject. Tweak as new mock batches come in.

function lp(
  id: string,
  title: string,
  summary: string,
  status: 'completed' | 'partial' | 'not-started',
  hoursPlanned: number,
  hoursSpent: number,
  contents: Array<{ type: 'ppt' | 'html' | 'video' | 'pdf' | 'note'; title: string; duration?: string }>,
  lastTaughtDate?: string,
) {
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
  // Batch 1 — Physics Advanced Section A — 2 subjects (Physics + Chemistry)
  {
    id: 'prog-1',
    batchId: '1',
    subjects: [
      {
        id: 'sub-1-phy',
        name: 'Physics',
        chapters: [
          {
            id: 'ch-1-phy-1',
            name: 'Electrostatics',
            order: 1,
            plannedStartDate: '2026-05-18',
            plannedEndDate: '2026-06-01',
            topics: [
              { id: 't-1-phy-1-a', name: "Coulomb's Law & Electric Field", plannedHours: 2, plannedStartDate: '2026-05-18', plannedEndDate: '2026-05-22', status: 'done', lastUpdatedAt: '2026-05-22T15:00:00Z', lessonPlanIds: ['lp-1-1'] },
              { id: 't-1-phy-1-b', name: "Gauss's Law", plannedHours: 2, plannedStartDate: '2026-05-23', plannedEndDate: '2026-05-26', status: 'done', lastUpdatedAt: '2026-05-26T15:00:00Z', lessonPlanIds: ['lp-1-2'] },
              { id: 't-1-phy-1-c', name: 'Electric Potential & Capacitance', plannedHours: 3, plannedStartDate: '2026-05-27', plannedEndDate: '2026-06-01', status: 'in-progress', lastUpdatedAt: '2026-05-30T15:00:00Z', lessonPlanIds: ['lp-1-3'] },
            ],
            lessonPlans: [
              lp('lp-1-1', 'Coulomb\'s Law & Electric Field', 'Foundations of static charges and field calculation.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Coulomb\'s Law slides', duration: '24 slides' },
                { type: 'video', title: 'Field lines walkthrough', duration: '12 min' },
                { type: 'html', title: 'Interactive charge simulator' },
              ], '2026-05-22'),
              lp('lp-1-2', 'Gauss\'s Law', 'Symmetry-based field calculation.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Gauss\'s Law derivation', duration: '18 slides' },
                { type: 'pdf', title: 'Worked examples', duration: '10 pages' },
              ], '2026-05-26'),
              lp('lp-1-3', 'Electric Potential & Capacitance', 'Potential energy, capacitors in series/parallel.', 'partial', 3, 1.5, [
                { type: 'ppt', title: 'Capacitance basics', duration: '20 slides' },
                { type: 'video', title: 'Parallel plate demo', duration: '8 min' },
                { type: 'html', title: 'Capacitor lab' },
                { type: 'note', title: 'Quick reference sheet' },
              ], '2026-05-30'),
            ],
          },
          {
            id: 'ch-1-phy-2',
            name: 'Current Electricity',
            order: 2,
            plannedStartDate: '2026-06-02',
            plannedEndDate: '2026-06-12',
            topics: [
              { id: 't-1-phy-2-a', name: "Ohm's Law & Resistivity", plannedHours: 2, plannedStartDate: '2026-06-02', plannedEndDate: '2026-06-04', status: 'in-progress', lastUpdatedAt: '2026-06-02T15:00:00Z', lessonPlanIds: ['lp-1-4'] },
              { id: 't-1-phy-2-b', name: "Kirchhoff's Laws", plannedHours: 2, plannedStartDate: '2026-06-05', plannedEndDate: '2026-06-08', status: 'not-started', lessonPlanIds: ['lp-1-5'] },
              { id: 't-1-phy-2-c', name: 'Wheatstone Bridge & Potentiometer', plannedHours: 2, plannedStartDate: '2026-06-09', plannedEndDate: '2026-06-12', status: 'not-started', lessonPlanIds: ['lp-1-6'] },
            ],
            lessonPlans: [
              lp('lp-1-4', 'Ohm\'s Law & Resistivity', 'Conductors, resistance, drift velocity.', 'partial', 2, 1, [
                { type: 'ppt', title: 'Ohm\'s Law deep dive', duration: '22 slides' },
                { type: 'video', title: 'Resistivity experiment', duration: '10 min' },
              ], '2026-06-02'),
              lp('lp-1-5', 'Kirchhoff\'s Laws', 'Circuit analysis techniques.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'KCL & KVL', duration: '16 slides' },
                { type: 'html', title: 'Circuit solver practice' },
              ]),
              lp('lp-1-6', 'Wheatstone Bridge & Potentiometer', 'Null-deflection instruments.', 'not-started', 2, 0, [
                { type: 'pdf', title: 'Lab manual extract' },
                { type: 'video', title: 'Wheatstone walkthrough', duration: '9 min' },
              ]),
            ],
          },
          {
            id: 'ch-1-phy-3',
            name: 'Magnetic Effects of Current',
            order: 3,
            plannedStartDate: '2026-06-13',
            plannedEndDate: '2026-06-22',
            topics: [
              { id: 't-1-phy-3-a', name: "Biot-Savart & Ampere's Law", plannedHours: 3, plannedStartDate: '2026-06-13', plannedEndDate: '2026-06-18', status: 'not-started', lessonPlanIds: ['lp-1-7'] },
              { id: 't-1-phy-3-b', name: 'Force on Moving Charge', plannedHours: 2, plannedStartDate: '2026-06-19', plannedEndDate: '2026-06-22', status: 'not-started', lessonPlanIds: ['lp-1-8'] },
            ],
            lessonPlans: [
              lp('lp-1-7', 'Biot-Savart & Ampere\'s Law', 'Magnetic field of currents.', 'not-started', 3, 0, [
                { type: 'ppt', title: 'Magnetic field intro', duration: '20 slides' },
                { type: 'video', title: 'Solenoid field demo', duration: '11 min' },
              ]),
              lp('lp-1-8', 'Force on Moving Charge', 'Lorentz force, cyclotron motion.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'Lorentz force', duration: '14 slides' },
              ]),
            ],
          },
        ],
      },
      {
        id: 'sub-1-chem',
        name: 'Chemistry',
        chapters: [
          {
            id: 'ch-1-chem-1',
            name: 'Solid State',
            order: 1,
            lessonPlans: [
              lp('lp-1-c1', 'Crystal Lattices & Unit Cells', 'Bravais lattices and packing fractions.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Lattice types', duration: '22 slides' },
                { type: 'html', title: '3D lattice viewer' },
              ], '2026-05-20'),
              lp('lp-1-c2', 'Imperfections in Solids', 'Point defects, electrical properties.', 'partial', 2, 1, [
                { type: 'ppt', title: 'Defect types', duration: '16 slides' },
                { type: 'pdf', title: 'Practice problems' },
              ], '2026-05-28'),
            ],
          },
          {
            id: 'ch-1-chem-2',
            name: 'Solutions',
            order: 2,
            lessonPlans: [
              lp('lp-1-c3', 'Concentration Terms', 'Molarity, molality, mole fraction.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'Concentration formulas', duration: '18 slides' },
              ]),
              lp('lp-1-c4', 'Colligative Properties', 'BP elevation, FP depression, osmotic pressure.', 'not-started', 3, 0, [
                { type: 'ppt', title: 'Colligative properties', duration: '24 slides' },
                { type: 'video', title: 'Osmosis demo', duration: '7 min' },
              ]),
            ],
          },
        ],
      },
    ],
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
              lp('lp-2-1', 'Set Theory Basics', 'Set operations, Venn diagrams.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Sets intro', duration: '20 slides' },
                { type: 'html', title: 'Venn diagram practice' },
              ], '2026-05-15'),
              lp('lp-2-2', 'Relations & Functions', 'Domain, range, types of functions.', 'completed', 3, 3, [
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
              lp('lp-2-3', 'Identities & Equations', 'Standard identities, conditional equations.', 'partial', 3, 1.5, [
                { type: 'ppt', title: 'Trig identities', duration: '20 slides' },
                { type: 'video', title: 'Solving trig equations', duration: '14 min' },
              ], '2026-05-30'),
              lp('lp-2-4', 'Inverse Trig Functions', 'Principal values, properties.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'Inverse trig', duration: '16 slides' },
              ]),
            ],
          },
          {
            id: 'ch-2-3',
            name: 'Sequences & Series',
            order: 3,
            lessonPlans: [
              lp('lp-2-5', 'AP & GP', 'Arithmetic and geometric progressions.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'AP & GP', duration: '18 slides' },
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
              lp('lp-3-1', 'Rate of Reaction', 'Average vs instantaneous rate.', 'completed', 2, 2, [
                { type: 'ppt', title: 'Kinetics intro', duration: '20 slides' },
                { type: 'video', title: 'Reaction rate demo', duration: '9 min' },
              ], '2026-05-18'),
              lp('lp-3-2', 'Order & Molecularity', 'First and second order reactions.', 'partial', 3, 1.5, [
                { type: 'ppt', title: 'Order of reactions', duration: '22 slides' },
                { type: 'pdf', title: 'Numerical practice' },
              ], '2026-05-28'),
            ],
          },
          {
            id: 'ch-3-2',
            name: 'Electrochemistry',
            order: 2,
            lessonPlans: [
              lp('lp-3-3', 'Galvanic Cells', 'EMF, electrode potentials.', 'not-started', 3, 0, [
                { type: 'ppt', title: 'Galvanic cells', duration: '18 slides' },
                { type: 'html', title: 'Cell simulator' },
              ]),
              lp('lp-3-4', 'Nernst Equation', 'Concentration effects on EMF.', 'not-started', 2, 0, [
                { type: 'ppt', title: 'Nernst equation', duration: '14 slides' },
              ]),
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
