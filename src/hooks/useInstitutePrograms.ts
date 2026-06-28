import { useSyncExternalStore } from 'react';
import { MOCK_FACULTY, MOCK_INSTITUTE_PROGRAMS } from '@/data/mockInstitutePrograms';
import {
  AcademicWindow,
  Holiday,
  InstituteFaculty,
  InstituteProgram,
  ScheduleConfig,
  ScheduleSlot,
  WeekDay,
} from '@/types/instituteProgram';

/** Session-only in-memory store. Survives navigation, lost on reload. */

let programs: InstituteProgram[] = JSON.parse(JSON.stringify(MOCK_INSTITUTE_PROGRAMS));
let faculty: InstituteFaculty[] = [...MOCK_FACULTY];
let instituteHolidays: Holiday[] = [
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-20', name: 'Diwali' },
  { date: '2025-12-25', name: 'Christmas' },
];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getPrograms: () => programs,
  getFaculty: () => faculty,
  getInstituteHolidays: () => instituteHolidays,
};

export function useInstitutePrograms() {
  const list = useSyncExternalStore(store.subscribe, store.getPrograms, store.getPrograms);
  return list;
}

export function useFaculty() {
  return useSyncExternalStore(store.subscribe, store.getFaculty, store.getFaculty);
}

export function useInstituteHolidays(): Holiday[] {
  return useSyncExternalStore(store.subscribe, store.getInstituteHolidays, store.getInstituteHolidays);
}

export function setInstituteHolidays(list: Holiday[]) {
  instituteHolidays = [...list].sort((a, b) => a.date.localeCompare(b.date));
  emit();
}

export function getInstituteHolidaysSnapshot(): Holiday[] {
  return instituteHolidays;
}

/** Merge institute-wide holidays with per-program overrides. */
export function effectiveHolidays(
  schedule: ScheduleConfig | undefined,
  institute: Holiday[] = instituteHolidays,
): Holiday[] {
  const map = new Map<string, Holiday>();
  institute.forEach((h) => map.set(h.date, h));
  const ov = schedule?.holidayOverrides ?? { removed: [], added: [] };
  ov.added.forEach((h) => map.set(h.date, h));
  // legacy per-program holidays
  (schedule?.holidays ?? []).forEach((h) => map.set(h.date, h));
  ov.removed.forEach((d) => map.delete(d));
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Returns a ScheduleConfig with `holidays` set to the effective list (for generator input). */
export function configWithEffectiveHolidays(
  schedule: ScheduleConfig,
  institute: Holiday[] = instituteHolidays,
): ScheduleConfig {
  return { ...schedule, holidays: effectiveHolidays(schedule, institute) };
}

export function useInstituteProgram(id: string | undefined): InstituteProgram | undefined {
  const list = useInstitutePrograms();
  return list.find((p) => p.id === id);
}

export function updateProgram(id: string, mut: (p: InstituteProgram) => InstituteProgram) {
  programs = programs.map((p) => (p.id === id ? mut(p) : p));
  emit();
}

export function setSchedule(programId: string, config: ScheduleConfig) {
  updateProgram(programId, (p) => ({ ...p, schedule: config }));
}

export function setGeneratedSlots(programId: string, slots: ScheduleSlot[]) {
  updateProgram(programId, (p) => ({ ...p, generatedSlots: slots }));
}

export function addFaculty(name: string, subjectId?: string): InstituteFaculty {
  const f: InstituteFaculty = { id: `fac-${Date.now()}`, name, subjectId };
  faculty = [...faculty, f];
  emit();
  return f;
}

export function addTopic(programId: string, subjectId: string, chapterId: string, name: string) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) =>
      s.id !== subjectId
        ? s
        : {
            ...s,
            chapters: s.chapters.map((c) =>
              c.id !== chapterId
                ? c
                : { ...c, topics: [...c.topics, { id: `t-${Date.now()}`, name, hours: 0 }] },
            ),
          },
    ),
  }));
}

export function addChapter(programId: string, subjectId: string, name: string) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) =>
      s.id !== subjectId ? s : { ...s, chapters: [...s.chapters, { id: `c-${Date.now()}`, name, topics: [] }] },
    ),
  }));
}

export function updateTopicHours(programId: string, topicId: string, hours: number) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) => ({
        ...c,
        topics: c.topics.map((t) => (t.id === topicId ? { ...t, hours: Math.max(0, hours) } : t)),
      })),
    })),
  }));
}

export function setChapterTopicsHours(programId: string, chapterId: string, hours: number) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id !== chapterId ? c : { ...c, topics: c.topics.map((t) => ({ ...t, hours: Math.max(0, hours) })) },
      ),
    })),
  }));
}

export function finaliseHours(programId: string, value: boolean) {
  updateProgram(programId, (p) => ({ ...p, hoursFinalised: value }));
}

/** Phase C+ — assign a chapter to a specific track (or clear with null). */
export function setChapterTrack(programId: string, chapterId: string, trackId: string | null) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) => (c.id === chapterId ? { ...c, trackId } : c)),
    })),
  }));
}

/* ─────────── Phase F — Sub-Programs (CBSE, JEE, …) ─────────── */

import type { SubProgramSlice } from '@/types/instituteProgram';

export function sliceFromSubProgramConfig(c: ScheduleConfig): SubProgramSlice {
  return {
    subjectTargetPeriods: c.subjectTargetPeriods ?? {},
    subjectTracks: c.subjectTracks ?? {},
    trackTargetPeriods: c.trackTargetPeriods ?? {},
    subjectLocks: c.subjectLocks ?? {},
    weeklyTimetable: c.weeklyTimetable ?? { cells: [] },
  };
}

const emptySlice: SubProgramSlice = {
  subjectTargetPeriods: {},
  subjectTracks: {},
  trackTargetPeriods: {},
  subjectLocks: {},
  weeklyTimetable: { cells: [] },
};

/** Persist the current flat slice into the outgoing sub-program, then load
 *  the next sub-program's slice into the flat ScheduleConfig fields. Pure. */
export function switchSubProgram(c: ScheduleConfig, nextId: string): ScheduleConfig {
  const slices = { ...(c.subProgramSlices ?? {}) };
  const currentId = c.activeSubProgramId;
  if (currentId) {
    slices[currentId] = sliceFromSubProgramConfig(c);
  }
  const incoming = slices[nextId] ?? emptySlice;
  return {
    ...c,
    subProgramSlices: slices,
    activeSubProgramId: nextId,
    subjectTargetPeriods: incoming.subjectTargetPeriods,
    subjectTracks: incoming.subjectTracks,
    trackTargetPeriods: incoming.trackTargetPeriods,
    subjectLocks: incoming.subjectLocks,
    weeklyTimetable: incoming.weeklyTimetable,
  };
}


/* ─────────── Phase B — Multiple Academic Windows ─────────── */

/** Per-window slice fields. Schedule-level (shared): periodLengthMins,
 *  dayStartTime, breaks, defaultFaculty, facultyPool, classUrlTemplate. */
export function sliceFromConfig(c: ScheduleConfig, id: string, label: string): AcademicWindow {
  return {
    id,
    label,
    startDate: c.startDate,
    endDate: c.endDate,
    workingDays: c.workingDays,
    periodsPerDay: c.periodsPerDay,
    weeklyTimetable: c.weeklyTimetable,
    subjectTargetPeriods: c.subjectTargetPeriods,
    subjectTracks: c.subjectTracks,
    trackTargetPeriods: c.trackTargetPeriods,
    subjectLocks: c.subjectLocks,
    holidayOverrides: c.holidayOverrides,
  };
}

export function mergeWindowIntoConfig(c: ScheduleConfig, w: AcademicWindow): ScheduleConfig {
  return {
    ...c,
    startDate: w.startDate,
    endDate: w.endDate,
    workingDays: w.workingDays,
    periodsPerDay: w.periodsPerDay,
    weeklyTimetable: w.weeklyTimetable,
    subjectTargetPeriods: w.subjectTargetPeriods,
    subjectTracks: w.subjectTracks,
    trackTargetPeriods: w.trackTargetPeriods,
    subjectLocks: w.subjectLocks,
    holidayOverrides: w.holidayOverrides,
    activeWindowId: w.id,
  };
}

/** Ensure a config has at least one window. Wraps current flat slice into a
 *  default "Window 1" if none exists. Pure — returns a new config. */
export function ensureWindows(c: ScheduleConfig): ScheduleConfig {
  if (c.windows && c.windows.length > 0 && c.activeWindowId) return c;
  const id = c.activeWindowId ?? `win-${Date.now()}`;
  const first = sliceFromConfig(c, id, 'Window 1');
  return { ...c, windows: [first], activeWindowId: id };
}

/** Persist the current flat slice back into the active window, then return
 *  a new config with the chosen window loaded as active. */
export function switchActiveWindow(c: ScheduleConfig, nextId: string): ScheduleConfig {
  const base = ensureWindows(c);
  const windows = (base.windows ?? []).map((w) =>
    w.id === base.activeWindowId ? sliceFromConfig(base, w.id, w.label) : w,
  );
  const next = windows.find((w) => w.id === nextId);
  if (!next) return base;
  return mergeWindowIntoConfig({ ...base, windows }, next);
}

export function addWindow(
  c: ScheduleConfig,
  fields: { label: string; startDate: string; endDate?: string; workingDays: WeekDay[]; periodsPerDay: number },
): ScheduleConfig {
  const base = ensureWindows(c);
  const id = `win-${Date.now()}`;
  // Persist current slice into its window
  const windows = (base.windows ?? []).map((w) =>
    w.id === base.activeWindowId ? sliceFromConfig(base, w.id, w.label) : w,
  );
  const newWindow: AcademicWindow = {
    id,
    label: fields.label,
    startDate: fields.startDate,
    endDate: fields.endDate,
    workingDays: fields.workingDays,
    periodsPerDay: fields.periodsPerDay,
    weeklyTimetable: { cells: [] },
    subjectTargetPeriods: {},
    subjectTracks: {},
    trackTargetPeriods: {},
    subjectLocks: {},
    holidayOverrides: { removed: [], added: [] },
  };
  return mergeWindowIntoConfig({ ...base, windows: [...windows, newWindow] }, newWindow);
}

export function renameActiveWindow(c: ScheduleConfig, label: string): ScheduleConfig {
  const base = ensureWindows(c);
  const windows = (base.windows ?? []).map((w) =>
    w.id === base.activeWindowId ? { ...w, label } : w,
  );
  return { ...base, windows };
}

/** Update timing fields (dates, working days, periods/day) on the active window. */
export function updateActiveWindowMeta(
  c: ScheduleConfig,
  patch: Partial<Pick<AcademicWindow, 'startDate' | 'endDate' | 'workingDays' | 'periodsPerDay' | 'label'>>,
): ScheduleConfig {
  const base = ensureWindows(c);
  const merged: ScheduleConfig = { ...base, ...patch };
  const windows = (merged.windows ?? []).map((w) =>
    w.id === merged.activeWindowId ? { ...sliceFromConfig(merged, w.id, w.label), ...patch } : w,
  );
  return { ...merged, windows };
}

export function deleteWindow(c: ScheduleConfig, id: string): ScheduleConfig {
  const base = ensureWindows(c);
  if ((base.windows ?? []).length <= 1) return base;
  const remaining = (base.windows ?? []).filter((w) => w.id !== id);
  if (base.activeWindowId === id) {
    return mergeWindowIntoConfig({ ...base, windows: remaining }, remaining[0]);
  }
  return { ...base, windows: remaining };
}
