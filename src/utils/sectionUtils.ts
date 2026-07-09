import { addDays, buildWorkingDays, computePeriodTimes, isoWeekStart, parseISO, toISO } from '@/utils/calendarAutomation';
import { AcademicWindow, Section, SectionConfig } from '@/types/section';
import { Holiday, WeekDay } from '@/types/instituteProgram';

/** Total period capacity for the section across the active window. */
export function computeSectionCapacity(
  config: SectionConfig,
  window: AcademicWindow,
  instituteHolidays: Holiday[] = [],
): { workingDays: number; totalPeriods: number; weeks: number } {
  const holidaySet = new Set([
    ...instituteHolidays.map((h) => h.date),
    ...(config.holidays ?? []).map((h) => h.date),
  ]);
  const days = buildWorkingDays(window.startDate, window.endDate, config.workingDays, holidaySet);
  const weeks = Math.max(1, Math.ceil(days.length / Math.max(1, config.workingDays.length)));
  return {
    workingDays: days.length,
    totalPeriods: days.length * (config.periodsPerDay || 0),
    weeks,
  };
}

/** All week-start ISO dates (Mondays) in the academic window. */
export function listWeekStarts(window: AcademicWindow): string[] {
  const out: string[] = [];
  let cursor = isoWeekStart(window.startDate);
  const endMs = parseISO(window.endDate).getTime();
  while (parseISO(cursor).getTime() <= endMs) {
    out.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return out;
}

/** Sum of all allotted periods across every track in the section. */
export function totalAllocated(section: Section): number {
  let sum = 0;
  for (const p of section.programs) {
    for (const su of p.subjects) {
      for (const t of su.tracks) sum += t.allottedPeriods || 0;
    }
  }
  return sum;
}

/** Count how many cells reference a given track. */
export function placedByTrack(section: Section): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of section.cells) {
    const k = c.allocation.trackId;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Find subject + track + program triple by ids. */
export function findAllocationLabel(
  section: Section,
  programId: string,
  subjectId: string,
  trackId: string,
): { programCode: string; subjectName: string; trackName: string; color: string } | null {
  const p = section.programs.find((p) => p.id === programId);
  if (!p) return null;
  const su = p.subjects.find((s) => s.id === subjectId);
  if (!su) return null;
  const tr = su.tracks.find((t) => t.id === trackId);
  if (!tr) return null;
  return {
    programCode: p.code,
    subjectName: su.name,
    trackName: tr.name,
    color: su.color,
  };
}

export { computePeriodTimes };

export const WEEKDAY_LABELS: { d: WeekDay; short: string; long: string }[] = [
  { d: 1, short: 'Mon', long: 'Monday' },
  { d: 2, short: 'Tue', long: 'Tuesday' },
  { d: 3, short: 'Wed', long: 'Wednesday' },
  { d: 4, short: 'Thu', long: 'Thursday' },
  { d: 5, short: 'Fri', long: 'Friday' },
  { d: 6, short: 'Sat', long: 'Saturday' },
  { d: 0, short: 'Sun', long: 'Sunday' },
];

export function formatRange(window: AcademicWindow): string {
  const fmt = (iso: string) =>
    parseISO(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(window.startDate)} → ${fmt(window.endDate)}`;
}

/** How much of a window's capacity is filled by cells inside its date range. */
export function windowCompleteness(
  section: Section,
  window: AcademicWindow,
  instituteHolidays: Holiday[] = [],
): { filled: number; capacity: number; pct: number; complete: boolean } {
  const cap = computeSectionCapacity(section.config, window, instituteHolidays);
  const weekStartsInWindow = new Set(listWeekStarts(window));
  const filled = section.cells.filter((c) => weekStartsInWindow.has(c.weekStartDate)).length;
  const pct = cap.totalPeriods === 0 ? 0 : Math.min(100, Math.round((filled / cap.totalPeriods) * 100));
  return { filled, capacity: cap.totalPeriods, pct, complete: filled >= cap.totalPeriods && cap.totalPeriods > 0 };
}

export { toISO };

