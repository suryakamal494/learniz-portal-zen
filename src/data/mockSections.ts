import { Section, SectionCell } from '@/types/section';
import { MOCK_FACULTY } from './mockInstitutePrograms';

/** Mock data for the Schedule Workspace.
 *  Five sections cover a variety of shapes: 6/7 periods, single vs multi-program,
 *  single vs multi-track subjects. Class 12 PCM — Excellence lands as the demo
 *  default: Term 1 is published with a rich seeded weekly timetable and a
 *  change-log entry so the Academic Schedule tab has something to render.
 */

const PHY_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-phy-1`, name: 'Mechanics', topics: [
    { id: `t-${prog}-phy-1-1`, name: 'Vectors', periods: 6 },
    { id: `t-${prog}-phy-1-2`, name: 'Kinematics', periods: 8 },
    { id: `t-${prog}-phy-1-3`, name: 'Newton\u2019s Laws', periods: 10 },
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

const BIO_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-bio-1`, name: 'Cell Biology', topics: [
    { id: `t-${prog}-bio-1-1`, name: 'Cell Structure', periods: 6 },
    { id: `t-${prog}-bio-1-2`, name: 'Cell Cycle', periods: 6 },
  ]},
  { id: `c-${prog}-bio-2`, name: 'Genetics', topics: [
    { id: `t-${prog}-bio-2-1`, name: 'Mendelian', periods: 6 },
    { id: `t-${prog}-bio-2-2`, name: 'Molecular Basis', periods: 8 },
  ]},
];

const ENG_CHAPTERS = (prog: string) => [
  { id: `c-${prog}-eng-1`, name: 'Prose', topics: [
    { id: `t-${prog}-eng-1-1`, name: 'Short Stories', periods: 6 },
    { id: `t-${prog}-eng-1-2`, name: 'Essays', periods: 5 },
  ]},
  { id: `c-${prog}-eng-2`, name: 'Grammar', topics: [
    { id: `t-${prog}-eng-2-1`, name: 'Tenses', periods: 4 },
    { id: `t-${prog}-eng-2-2`, name: 'Voice & Speech', periods: 4 },
  ]},
];

/* ─── Seed a full week timetable for Class 12 PCM — Excellence · Term 1 ─── */
// 7 periods × 6 working days = 42 slots. We'll fill 40 (leave 2 empty to show
// the progress bar as "40 / 42").
const PCM_WEEK = '2026-06-29'; // Monday of first ISO week ≥ 2026-07-01
const PCM_SEED_TEMPLATE: Array<Omit<SectionCell, 'weekStartDate'>> = [
  // P1
  { weekday: 1, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-1' } },
  { weekday: 2, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  { weekday: 3, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-alg' } },
  { weekday: 4, periodIndex: 0, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-jee-phy-1'  } },
  { weekday: 5, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  { weekday: 6, periodIndex: 0, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-jee-mth-1'  } },
  // P2
  { weekday: 1, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-alg' } },
  { weekday: 2, periodIndex: 1, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-jee-phy-1'  } },
  { weekday: 3, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-2' } },
  { weekday: 4, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-cal' } },
  { weekday: 5, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-1' } },
  { weekday: 6, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  // P3
  { weekday: 1, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  { weekday: 2, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-cal' } },
  { weekday: 3, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  { weekday: 4, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  { weekday: 5, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-alg' } },
  { weekday: 6, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-2' } },
  // P4
  { weekday: 1, periodIndex: 3, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-jee-mth-1'  } },
  { weekday: 2, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-1' } },
  { weekday: 3, periodIndex: 3, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-chm',  trackId: 'tr-jee-chm-1'  } },
  { weekday: 4, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  { weekday: 5, periodIndex: 3, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-jee-mth-1'  } },
  { weekday: 6, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-cal' } },
  // P5
  { weekday: 1, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  { weekday: 2, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-alg' } },
  { weekday: 3, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-1' } },
  { weekday: 4, periodIndex: 4, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-chm',  trackId: 'tr-jee-chm-1'  } },
  { weekday: 5, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  { weekday: 6, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-cbse-chm-1' } },
  // P6
  { weekday: 1, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-2' } },
  { weekday: 2, periodIndex: 5, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-jee-mth-1'  } },
  { weekday: 3, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-cal' } },
  { weekday: 4, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-1' } },
  { weekday: 5, periodIndex: 5, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-jee-phy-1'  } },
  { weekday: 6, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  // P7 (short — leaves last two slots empty as a partial-fill demo)
  { weekday: 1, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-eng', trackId: 'tr-cbse-eng-1' } },
  { weekday: 2, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-cbse-phy-2' } },
  { weekday: 3, periodIndex: 6, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-chm',  trackId: 'tr-jee-chm-1'  } },
  { weekday: 4, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-cbse-mth-alg' } },
];

// Compute Monday-anchored week starts by adding 7·N days to PCM_WEEK.
const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const PCM_WEEK_2 = addDays(PCM_WEEK, 7);
const PCM_WEEK_3 = addDays(PCM_WEEK, 14);
const PCM_WEEK_4 = addDays(PCM_WEEK, 21);
const PCM_WEEK_5 = addDays(PCM_WEEK, 28);
const PCM_WEEK_6 = addDays(PCM_WEEK, 35);

// Variant for W2–W4: swap CBSE Physics T1 ↔ T2 and rotate JEE tracks so it
// visibly differs from W1 but stays ~90% filled.
const rotateTrack = (trackId: string): string => {
  switch (trackId) {
    case 'tr-cbse-phy-1': return 'tr-cbse-phy-2';
    case 'tr-cbse-phy-2': return 'tr-cbse-phy-1';
    case 'tr-cbse-mth-alg': return 'tr-cbse-mth-cal';
    case 'tr-cbse-mth-cal': return 'tr-cbse-mth-alg';
    default: return trackId;
  }
};
const variantTemplate = (drop: number): Array<Omit<SectionCell, 'weekStartDate'>> =>
  PCM_SEED_TEMPLATE.slice(0, PCM_SEED_TEMPLATE.length - drop).map((c) => ({
    ...c,
    allocation: { ...c.allocation, trackId: rotateTrack(c.allocation.trackId) },
  }));

const PCM_SEED: SectionCell[] = [
  ...PCM_SEED_TEMPLATE.map((c) => ({ ...c, weekStartDate: PCM_WEEK })),
  // W2–W4: rotated tracks, ~all filled
  ...variantTemplate(4).map((c) => ({ ...c, weekStartDate: PCM_WEEK_2 })),
  ...PCM_SEED_TEMPLATE.slice(0, PCM_SEED_TEMPLATE.length - 3).map((c) => ({ ...c, weekStartDate: PCM_WEEK_3 })),
  ...variantTemplate(5).map((c) => ({ ...c, weekStartDate: PCM_WEEK_4 })),
  // W5–W6: ~60% filled to show partial-progress demo
  ...PCM_SEED_TEMPLATE.slice(0, 26).map((c) => ({ ...c, weekStartDate: PCM_WEEK_5 })),
  ...variantTemplate(18).map((c) => ({ ...c, weekStartDate: PCM_WEEK_6 })),
];

/* ─── Seed timetable for Class 11 Morning (CBSE + JEE), 3 terms ─── */
const CLS11M_TEMPLATE: Array<Omit<SectionCell, 'weekStartDate'>> = [
  // P1
  { weekday: 1, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  { weekday: 2, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 3, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 4, periodIndex: 0, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-11m-jee-phy-1' } },
  { weekday: 5, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-2' } },
  { weekday: 6, periodIndex: 0, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-11m-jee-mth-1' } },
  // P2
  { weekday: 1, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 2, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  { weekday: 3, periodIndex: 1, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-11m-jee-phy-1' } },
  { weekday: 4, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 5, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 6, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-2' } },
  // P3
  { weekday: 1, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 2, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 3, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  { weekday: 4, periodIndex: 2, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-11m-jee-mth-1' } },
  { weekday: 5, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 6, periodIndex: 2, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  // P4
  { weekday: 1, periodIndex: 3, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-11m-jee-phy-1' } },
  { weekday: 2, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-2' } },
  { weekday: 3, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 4, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 5, periodIndex: 3, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-11m-jee-mth-1' } },
  { weekday: 6, periodIndex: 3, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  // P5
  { weekday: 1, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-2' } },
  { weekday: 2, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 3, periodIndex: 4, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-11m-jee-mth-1' } },
  { weekday: 4, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 5, periodIndex: 4, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  { weekday: 6, periodIndex: 4, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-11m-jee-phy-1' } },
  // P6
  { weekday: 1, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  { weekday: 2, periodIndex: 5, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-phy',  trackId: 'tr-11m-jee-phy-1' } },
  { weekday: 3, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 4, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-1' } },
  { weekday: 5, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 6, periodIndex: 5, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
  // P7
  { weekday: 1, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-mth', trackId: 'tr-11m-mth-1' } },
  { weekday: 2, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-11m-phy-2' } },
  { weekday: 3, periodIndex: 6, allocation: { programId: 'prog-jee',  subjectId: 'sub-jee-mth',  trackId: 'tr-11m-jee-mth-1' } },
  { weekday: 4, periodIndex: 6, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-chm', trackId: 'tr-11m-chm-1' } },
];

function seedWeeks(
  template: Array<Omit<SectionCell, 'weekStartDate'>>,
  firstMonday: string,
  weekCount: number,
  fillPattern: number[], // periods dropped from end per week (cycles)
): SectionCell[] {
  const out: SectionCell[] = [];
  for (let w = 0; w < weekCount; w++) {
    const drop = fillPattern[w % fillPattern.length];
    const monday = addDays(firstMonday, w * 7);
    const slice = drop > 0 ? template.slice(0, template.length - drop) : template;
    for (const c of slice) out.push({ ...c, weekStartDate: monday });
  }
  return out;
}

const CLS11M_SEED: SectionCell[] = [
  // Term 1 · 2026-07-01 → 2026-09-30 (Monday of first ISO week = 2026-06-29), 14 weeks, mostly full
  ...seedWeeks(CLS11M_TEMPLATE, '2026-06-29', 14, [0, 0, 2, 0, 3, 0, 0, 5, 0, 0, 4, 0, 6, 8]),
  // Term 2 · 2026-10-01 → 2026-12-31 (Mon = 2026-09-28), 13 weeks
  ...seedWeeks(CLS11M_TEMPLATE, '2026-09-28', 13, [0, 0, 3, 0, 4, 0, 6, 0, 5, 0, 7, 9, 12]),
  // Term 3 · 2027-01-05 → 2027-03-31 (Mon = 2027-01-04), 12 weeks
  ...seedWeeks(CLS11M_TEMPLATE, '2027-01-04', 12, [0, 0, 2, 0, 4, 0, 5, 0, 6, 8, 10, 14]),
];

const nowIso = new Date().toISOString();
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

export const MOCK_SECTIONS: Section[] = [
  /* 1 · Demo default — richest seeded state */
  {
    id: 'sec-cls12-pcm',
    name: 'Class 12 PCM \u2014 Excellence',
    className: 'Class 12',
    windows: [
      {
        id: 'win-pcm-t1',
        label: 'Term 1 \u00b7 Foundation',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        status: 'published',
        publishedAt: twoHoursAgo,
        lastGeneratedAt: oneHourAgo,
        changeLog: [
          {
            id: 'chg-seed-1',
            at: nowIso,
            actor: 'Arjun Kapoor',
            type: 'cell.paint',
            summary: 'Mon P5 \u00b7 CBSE Chemistry replaced JEE Physics',
            affectedDates: ['2026-07-06', '2026-07-13', '2026-07-20'],
            acknowledged: false,
          },
          {
            id: 'chg-seed-2',
            at: nowIso,
            actor: 'Anika Rao',
            type: 'cell.delete',
            summary: 'Sat P7 \u00b7 slot cleared',
            affectedDates: ['2026-07-04', '2026-07-11'],
            acknowledged: false,
          },
        ],
      },
      {
        id: 'win-pcm-t2',
        label: 'Term 2 \u00b7 Board Prep',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        status: 'draft',
        changeLog: [],
      },
      {
        id: 'win-pcm-t3',
        label: 'Term 3 \u00b7 Revision Sprint',
        startDate: '2027-01-05',
        endDate: '2027-03-31',
        status: 'draft',
        changeLog: [],
      },
    ],
    facultyPool: MOCK_FACULTY.slice(0, 12).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 7,
      periodLengthMins: 45,
      dayStartTime: '08:00',
      breaks: [
        { id: 'brk-pcm-a', afterPeriod: 2, name: 'Short break', durationMins: 15 },
        { id: 'brk-pcm-b', afterPeriod: 4, name: 'Lunch', durationMins: 30 },
      ],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse',
        name: 'CBSE Class 12',
        code: 'CBSE',
        subjects: [
          {
            id: 'sub-cbse-phy', name: 'Physics', color: 'blue',
            chapters: PHY_CHAPTERS('pcm-cbse'),
            tracks: [
              { id: 'tr-cbse-phy-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 40 },
              { id: 'tr-cbse-phy-2', name: 'T2', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 30 },
            ],
          },
          {
            id: 'sub-cbse-chm', name: 'Chemistry', color: 'emerald',
            chapters: CHEM_CHAPTERS('pcm-cbse'),
            tracks: [
              { id: 'tr-cbse-chm-1', name: 'T1', facultyId: 'fac-3', chapterIds: [], allottedPeriods: 35 },
            ],
          },
          {
            id: 'sub-cbse-mth', name: 'Mathematics', color: 'violet',
            chapters: MATH_CHAPTERS('pcm-cbse'),
            tracks: [
              { id: 'tr-cbse-mth-alg', name: 'Algebra',  facultyId: 'fac-5', chapterIds: [], allottedPeriods: 28 },
              { id: 'tr-cbse-mth-cal', name: 'Calculus', facultyId: 'fac-6', chapterIds: [], allottedPeriods: 22 },
            ],
          },
          {
            id: 'sub-cbse-eng', name: 'English', color: 'amber',
            chapters: ENG_CHAPTERS('pcm-cbse'),
            tracks: [
              { id: 'tr-cbse-eng-1', name: 'T1', facultyId: 'fac-9', chapterIds: [], allottedPeriods: 20 },
            ],
          },
        ],
      },
      {
        id: 'prog-jee',
        name: 'JEE Advanced',
        code: 'JEE',
        subjects: [
          {
            id: 'sub-jee-phy', name: 'Physics', color: 'sky',
            chapters: PHY_CHAPTERS('pcm-jee'),
            tracks: [
              { id: 'tr-jee-phy-1', name: 'T1', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 25 },
            ],
          },
          {
            id: 'sub-jee-chm', name: 'Chemistry', color: 'teal',
            chapters: CHEM_CHAPTERS('pcm-jee'),
            tracks: [
              { id: 'tr-jee-chm-1', name: 'T1', facultyId: 'fac-4', chapterIds: [], allottedPeriods: 20 },
            ],
          },
          {
            id: 'sub-jee-mth', name: 'Mathematics', color: 'fuchsia',
            chapters: MATH_CHAPTERS('pcm-jee'),
            tracks: [
              { id: 'tr-jee-mth-1', name: 'T1', facultyId: 'fac-6', chapterIds: [], allottedPeriods: 20 },
            ],
          },
        ],
      },
    ],
    cells: PCM_SEED,
    subjectStatus: {},
  },

  /* 2 · Class 12 PCB — NEET */
  {
    id: 'sec-cls12-pcb',
    name: 'Class 12 PCB \u2014 NEET Track',
    className: 'Class 12',
    windows: [
      {
        id: 'win-pcb-t1', label: 'Term 1 \u00b7 Foundation',
        startDate: '2026-07-01', endDate: '2026-09-30',
        status: 'draft', changeLog: [],
      },
      {
        id: 'win-pcb-t2', label: 'Term 2 \u00b7 NEET Prep',
        startDate: '2026-10-01', endDate: '2026-12-31',
        status: 'draft', changeLog: [],
      },
    ],
    facultyPool: MOCK_FACULTY.slice(0, 10).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 7,
      periodLengthMins: 45,
      dayStartTime: '08:00',
      breaks: [
        { id: 'brk-pcb-a', afterPeriod: 2, name: 'Short break', durationMins: 15 },
        { id: 'brk-pcb-b', afterPeriod: 4, name: 'Lunch', durationMins: 30 },
      ],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse', name: 'CBSE Class 12', code: 'CBSE',
        subjects: [
          { id: 'sub-cbse-phy', name: 'Physics', color: 'blue', chapters: PHY_CHAPTERS('pcb-cbse'),
            tracks: [{ id: 'tr-pcb-phy-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 35 }] },
          { id: 'sub-cbse-chm', name: 'Chemistry', color: 'emerald', chapters: CHEM_CHAPTERS('pcb-cbse'),
            tracks: [{ id: 'tr-pcb-chm-1', name: 'T1', facultyId: 'fac-3', chapterIds: [], allottedPeriods: 35 }] },
          { id: 'sub-cbse-bio', name: 'Biology', color: 'rose', chapters: BIO_CHAPTERS('pcb-cbse'),
            tracks: [
              { id: 'tr-pcb-bio-1', name: 'T1', facultyId: 'fac-7', chapterIds: [], allottedPeriods: 30 },
              { id: 'tr-pcb-bio-2', name: 'T2', facultyId: 'fac-8', chapterIds: [], allottedPeriods: 20 },
            ] },
          { id: 'sub-cbse-eng', name: 'English', color: 'amber', chapters: ENG_CHAPTERS('pcb-cbse'),
            tracks: [{ id: 'tr-pcb-eng-1', name: 'T1', facultyId: 'fac-9', chapterIds: [], allottedPeriods: 20 }] },
        ],
      },
      {
        id: 'prog-neet', name: 'NEET Advanced', code: 'NEET',
        subjects: [
          { id: 'sub-neet-bio', name: 'Biology', color: 'fuchsia', chapters: BIO_CHAPTERS('pcb-neet'),
            tracks: [{ id: 'tr-neet-bio-1', name: 'T1', facultyId: 'fac-8', chapterIds: [], allottedPeriods: 25 }] },
          { id: 'sub-neet-chm', name: 'Chemistry', color: 'teal', chapters: CHEM_CHAPTERS('pcb-neet'),
            tracks: [{ id: 'tr-neet-chm-1', name: 'T1', facultyId: 'fac-4', chapterIds: [], allottedPeriods: 20 }] },
        ],
      },
    ],
    cells: [
      { weekStartDate: '2026-06-29', weekday: 1, periodIndex: 0, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-phy', trackId: 'tr-pcb-phy-1' } },
      { weekStartDate: '2026-06-29', weekday: 1, periodIndex: 1, allocation: { programId: 'prog-cbse', subjectId: 'sub-cbse-bio', trackId: 'tr-pcb-bio-1' } },
      { weekStartDate: '2026-06-29', weekday: 2, periodIndex: 0, allocation: { programId: 'prog-neet', subjectId: 'sub-neet-bio', trackId: 'tr-neet-bio-1' } },
    ],
    subjectStatus: {},
  },

  /* 3 · Class 11 Morning — CBSE + JEE */
  {
    id: 'sec-cls11-morning',
    name: 'Class 11 Morning',
    className: 'Class 11',
    windows: [
      { id: 'win-11m-t1', label: 'Term 1 \u00b7 Foundation',
        startDate: '2026-07-01', endDate: '2026-09-30',
        status: 'published', publishedAt: twoHoursAgo, lastGeneratedAt: oneHourAgo,
        changeLog: [
          { id: 'chg-11m-1', at: nowIso, actor: 'Priya Menon', type: 'cell.paint',
            summary: 'Tue P3 \u00b7 CBSE Mathematics replaced JEE Physics',
            affectedDates: ['2026-07-07', '2026-07-14'], acknowledged: false },
        ] },
      { id: 'win-11m-t2', label: 'Term 2 \u00b7 Advanced',
        startDate: '2026-10-01', endDate: '2026-12-31',
        status: 'draft', changeLog: [] },
      { id: 'win-11m-t3', label: 'Term 3 \u00b7 Revision Sprint',
        startDate: '2027-01-05', endDate: '2027-03-31',
        status: 'draft', changeLog: [] },
    ],
    facultyPool: MOCK_FACULTY.slice(0, 10).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 7,
      periodLengthMins: 45,
      dayStartTime: '08:00',
      breaks: [
        { id: 'brk-11m-a', afterPeriod: 2, name: 'Short break', durationMins: 15 },
        { id: 'brk-11m-b', afterPeriod: 4, name: 'Lunch', durationMins: 30 },
      ],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse', name: 'CBSE Class 11', code: 'CBSE',
        subjects: [
          { id: 'sub-cbse-phy', name: 'Physics', color: 'blue', chapters: PHY_CHAPTERS('11m-cbse'),
            tracks: [
              { id: 'tr-11m-phy-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 40 },
              { id: 'tr-11m-phy-2', name: 'T2', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 30 },
            ] },
          { id: 'sub-cbse-chm', name: 'Chemistry', color: 'emerald', chapters: CHEM_CHAPTERS('11m-cbse'),
            tracks: [{ id: 'tr-11m-chm-1', name: 'T1', facultyId: 'fac-3', chapterIds: [], allottedPeriods: 35 }] },
          { id: 'sub-cbse-mth', name: 'Mathematics', color: 'violet', chapters: MATH_CHAPTERS('11m-cbse'),
            tracks: [{ id: 'tr-11m-mth-1', name: 'T1', facultyId: 'fac-5', chapterIds: [], allottedPeriods: 40 }] },
        ],
      },
      {
        id: 'prog-jee', name: 'JEE Foundation', code: 'JEE',
        subjects: [
          { id: 'sub-jee-phy', name: 'Physics', color: 'sky', chapters: PHY_CHAPTERS('11m-jee'),
            tracks: [{ id: 'tr-11m-jee-phy-1', name: 'T1', facultyId: 'fac-2', chapterIds: [], allottedPeriods: 25 }] },
          { id: 'sub-jee-mth', name: 'Mathematics', color: 'fuchsia', chapters: MATH_CHAPTERS('11m-jee'),
            tracks: [{ id: 'tr-11m-jee-mth-1', name: 'T1', facultyId: 'fac-6', chapterIds: [], allottedPeriods: 20 }] },
        ],
      },
    ],
    cells: CLS11M_SEED,
    subjectStatus: {},
  },

  /* 4 · Class 11 Evening — CBSE only, 5 working days, 6 periods */
  {
    id: 'sec-cls11-evening',
    name: 'Class 11 Evening',
    className: 'Class 11',
    windows: [
      { id: 'win-11e-t1', label: 'Term 1 \u00b7 Foundation',
        startDate: '2026-07-01', endDate: '2026-09-30',
        status: 'draft', changeLog: [] },
    ],
    facultyPool: MOCK_FACULTY.slice(2, 12).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5],
      periodsPerDay: 6,
      periodLengthMins: 45,
      dayStartTime: '14:00',
      breaks: [{ id: 'brk-11e-a', afterPeriod: 3, name: 'Tea break', durationMins: 15 }],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse', name: 'CBSE Class 11', code: 'CBSE',
        subjects: [
          { id: 'sub-cbse-phy', name: 'Physics', color: 'blue', chapters: PHY_CHAPTERS('11e-cbse'),
            tracks: [{ id: 'tr-11e-phy-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 30 }] },
          { id: 'sub-cbse-mth', name: 'Mathematics', color: 'violet', chapters: MATH_CHAPTERS('11e-cbse'),
            tracks: [{ id: 'tr-11e-mth-1', name: 'T1', facultyId: 'fac-5', chapterIds: [], allottedPeriods: 30 }] },
          { id: 'sub-cbse-eng', name: 'English', color: 'amber', chapters: ENG_CHAPTERS('11e-cbse'),
            tracks: [{ id: 'tr-11e-eng-1', name: 'T1', facultyId: 'fac-9', chapterIds: [], allottedPeriods: 20 }] },
        ],
      },
    ],
    cells: [],
    subjectStatus: {},
  },

  /* 5 · Class 10 Foundation — CBSE only, single-track, 6 periods */
  {
    id: 'sec-cls10-foundation',
    name: 'Class 10 Foundation',
    className: 'Class 10',
    windows: [
      { id: 'win-10-t1', label: 'Term 1 \u00b7 Foundation',
        startDate: '2026-07-01', endDate: '2026-09-30',
        status: 'draft', changeLog: [] },
      { id: 'win-10-t2', label: 'Term 2 \u00b7 Board Prep',
        startDate: '2026-10-01', endDate: '2026-12-31',
        status: 'draft', changeLog: [] },
    ],
    facultyPool: MOCK_FACULTY.slice(0, 14).map((f) => f.id),
    config: {
      workingDays: [1, 2, 3, 4, 5, 6],
      periodsPerDay: 6,
      periodLengthMins: 40,
      dayStartTime: '08:30',
      breaks: [
        { id: 'brk-10-a', afterPeriod: 2, name: 'Short break', durationMins: 10 },
        { id: 'brk-10-b', afterPeriod: 4, name: 'Lunch', durationMins: 25 },
      ],
      holidays: [],
    },
    programs: [
      {
        id: 'prog-cbse', name: 'CBSE Class 10', code: 'CBSE',
        subjects: [
          { id: 'sub-cbse-phy', name: 'Science', color: 'blue', chapters: PHY_CHAPTERS('10-cbse'),
            tracks: [{ id: 'tr-10-sci-1', name: 'T1', facultyId: 'fac-1', chapterIds: [], allottedPeriods: 40 }] },
          { id: 'sub-cbse-mth', name: 'Mathematics', color: 'violet', chapters: MATH_CHAPTERS('10-cbse'),
            tracks: [{ id: 'tr-10-mth-1', name: 'T1', facultyId: 'fac-5', chapterIds: [], allottedPeriods: 40 }] },
          { id: 'sub-cbse-eng', name: 'English', color: 'amber', chapters: ENG_CHAPTERS('10-cbse'),
            tracks: [{ id: 'tr-10-eng-1', name: 'T1', facultyId: 'fac-9', chapterIds: [], allottedPeriods: 30 }] },
          { id: 'sub-cbse-soc', name: 'Social Studies', color: 'cyan', chapters: ENG_CHAPTERS('10-cbse-soc'),
            tracks: [{ id: 'tr-10-soc-1', name: 'T1', facultyId: 'fac-13', chapterIds: [], allottedPeriods: 30 }] },
        ],
      },
    ],
    cells: [],
    subjectStatus: {},
  },
];
