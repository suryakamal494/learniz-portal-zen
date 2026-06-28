import { Section } from '@/types/section';
import { MOCK_FACULTY } from './mockInstitutePrograms';

/** One canonical demo section with two programs (CBSE + JEE), three subjects
 *  each, and a couple of tracks so the timetable can show the
 *  "one cell, one allocation" invariant against realistic data. */

const PHY_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-phy-1`, name: 'Mechanics', topics: [
    { id: `t-${prog}-phy-1-1`, name: 'Vectors', periods: 6 },
    { id: `t-${prog}-phy-1-2`, name: 'Kinematics', periods: 8 },
    { id: `t-${prog}-phy-1-3`, name: 'Newton’s Laws', periods: 10 },
  ]},
  { id: `c-${prog}-phy-2`, name: 'Thermodynamics', topics: [
    { id: `t-${prog}-phy-2-1`, name: 'Zeroth & First Law', periods: 6 },
    { id: `t-${prog}-phy-2-2`, name: 'Carnot Cycle', periods: 6 },
  ]},
  { id: `c-${prog}-phy-3`, name: 'Optics', topics: [
    { id: `t-${prog}-phy-3-1`, name: 'Ray Optics', periods: 8 },
    { id: `t-${prog}-phy-3-2`, name: 'Wave Optics', periods: 6 },
  ]},
];

const CHEM_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-chm-1`, name: 'Atomic Structure', topics: [
    { id: `t-${prog}-chm-1-1`, name: 'Bohr Model', periods: 5 },
    { id: `t-${prog}-chm-1-2`, name: 'Quantum Numbers', periods: 6 },
  ]},
  { id: `c-${prog}-chm-2`, name: 'Chemical Bonding', topics: [
    { id: `t-${prog}-chm-2-1`, name: 'Ionic Bonds', periods: 5 },
    { id: `t-${prog}-chm-2-2`, name: 'Covalent Bonds', periods: 7 },
    { id: `t-${prog}-chm-2-3`, name: 'VSEPR Theory', periods: 6 },
  ]},
  { id: `c-${prog}-chm-3`, name: 'Organic Basics', topics: [
    { id: `t-${prog}-chm-3-1`, name: 'Nomenclature', periods: 5 },
    { id: `t-${prog}-chm-3-2`, name: 'Isomerism', periods: 6 },
  ]},
];

const MATH_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-mth-1`, name: 'Calculus', topics: [
    { id: `t-${prog}-mth-1-1`, name: 'Limits', periods: 6 },
    { id: `t-${prog}-mth-1-2`, name: 'Derivatives', periods: 10 },
    { id: `t-${prog}-mth-1-3`, name: 'Integrals', periods: 10 },
  ]},
  { id: `c-${prog}-mth-2`, name: 'Algebra', topics: [
    { id: `t-${prog}-mth-2-1`, name: 'Complex Numbers', periods: 6 },
    { id: `t-${prog}-mth-2-2`, name: 'Matrices', periods: 8 },
  ]},
];

export const MOCK_SECTIONS: Section[] = [
  {
    id: 'sec-cls11-morning',
    name: 'Class 11 Morning',
    className: 'Class 11',
    windows: [
      { id: 'win-1', startDate: '2026-07-01', endDate: '2026-09-30' },
    ],
    facultyPool: MOCK_FACULTY.slice(0, 10).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 6,
      periodLengthMins: 50,
      dayStartTime: '08:00',
      breaks: [
        { id: 'brk-a', afterPeriod: 2, name: 'Short break', durationMins: 15 },
        { id: 'brk-b', afterPeriod: 4, name: 'Lunch', durationMins: 40 },
      ],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse',
        name: 'CBSE Class 11',
        code: 'CBSE',
        subjects: [
          {
            id: 'sub-cbse-phy', name: 'Physics', color: 'blue',
            chapters: PHY_CHAPTERS('cbse'),
            tracks: [
              { id: 'tr-cbse-phy-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 0 },
              { id: 'tr-cbse-phy-2', name: 'T2', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 0 },
            ],
          },
          {
            id: 'sub-cbse-chm', name: 'Chemistry', color: 'emerald',
            chapters: CHEM_CHAPTERS('cbse'),
            tracks: [
              { id: 'tr-cbse-chm-1', name: 'T1', facultyId: 'fac-3', chapterIds: [], allottedPeriods: 0 },
            ],
          },
          {
            id: 'sub-cbse-mth', name: 'Mathematics', color: 'violet',
            chapters: MATH_CHAPTERS('cbse'),
            tracks: [
              { id: 'tr-cbse-mth-1', name: 'T1', facultyId: 'fac-5', chapterIds: [], allottedPeriods: 0 },
            ],
          },
        ],
      },
      {
        id: 'prog-jee',
        name: 'JEE Foundation',
        code: 'JEE',
        subjects: [
          {
            id: 'sub-jee-phy', name: 'Physics', color: 'sky',
            chapters: PHY_CHAPTERS('jee'),
            tracks: [
              { id: 'tr-jee-phy-1', name: 'T1', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 0 },
            ],
          },
          {
            id: 'sub-jee-chm', name: 'Chemistry', color: 'teal',
            chapters: CHEM_CHAPTERS('jee'),
            tracks: [
              { id: 'tr-jee-chm-1', name: 'T1', facultyId: 'fac-4', chapterIds: [], allottedPeriods: 0 },
            ],
          },
          {
            id: 'sub-jee-mth', name: 'Mathematics', color: 'fuchsia',
            chapters: MATH_CHAPTERS('jee'),
            tracks: [
              { id: 'tr-jee-mth-1', name: 'T1', facultyId: 'fac-6', chapterIds: [], allottedPeriods: 0 },
            ],
          },
        ],
      },
    ],
    cells: [],
    subjectStatus: {},
  },
];
