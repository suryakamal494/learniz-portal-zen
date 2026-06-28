/**
 * Section-scoped scheduling model.
 *
 * Replaces the program-scoped scheduling flow for the new 4-step workspace:
 *   Setup → Period Allocation → Weekly Timetable → Preview
 *
 * Core invariant (enforced in the store):
 *   ONE CELL = ONE ALLOCATION. A `(weekStartDate, weekday, periodIndex)`
 *   slot can hold at most one `{programId, subjectId, trackId}`.
 *   Tracks of the same subject occupy different cells.
 */

import { Holiday, PeriodBreak, WeekDay } from './instituteProgram';

export type SubjectColor =
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'orange'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'fuchsia'
  | 'teal'
  | 'sky'
  | 'lime'
  | 'indigo';

export interface SectionTopic {
  id: string;
  name: string;
  periods: number;
}

export interface SectionChapter {
  id: string;
  name: string;
  topics: SectionTopic[];
}

export interface SectionTrack {
  /** Stable id, e.g. `tr-phy-1`. */
  id: string;
  /** Display label e.g. "T1", "Advanced", "Repeat batch". */
  name: string;
  /** Faculty assigned to teach this track. Drawn from `Section.facultyPool`. */
  facultyId: string;
  /** Subset of parent subject chapters this track covers. Empty = all. */
  chapterIds: string[];
  /** Period budget allotted to this track in Step 2. */
  allottedPeriods: number;
}

export interface SectionSubject {
  id: string;
  name: string;
  color: SubjectColor;
  chapters: SectionChapter[];
  /** Each subject has at least one track (T1) by default. */
  tracks: SectionTrack[];
}

export interface SectionProgram {
  id: string;
  name: string;
  /** Short code e.g. "CBSE", "JEE", "NEET" — used in cell chips. */
  code: string;
  subjects: SectionSubject[];
}

export interface AcademicWindow {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  /** Past windows become read-only. */
  locked?: boolean;
}

export interface SectionConfig {
  workingDays: WeekDay[];
  periodsPerDay: number;
  periodLengthMins: number;
  periodOverrides?: Record<number, number>;
  dayStartTime: string;
  breaks: PeriodBreak[];
  /** Section-only holidays in addition to institute-wide list. */
  holidays: Holiday[];
}

/** A pointer to one weekly grid cell. Together these three fields are UNIQUE. */
export interface SlotKey {
  /** ISO date of the Monday of the week this cell belongs to. */
  weekStartDate: string;
  weekday: WeekDay;
  periodIndex: number;
}

/** What sits inside a single cell. Always exactly one of these, or null. */
export interface CellAllocation {
  programId: string;
  subjectId: string;
  trackId: string;
  /** Optional faculty override; falls back to the track's faculty. */
  facultyId?: string;
}

export interface SectionCell extends SlotKey {
  allocation: CellAllocation;
}

export type SubjectStatus = 'draft' | 'locked' | 'published';

export interface Section {
  id: string;
  name: string;
  /** e.g. "Class 11", "Class 12 Morning" — surfaced in headers. */
  className: string;
  /** Active academic windows (chronological). The last one is currently editable. */
  windows: AcademicWindow[];
  /** Faculty ids drawn from institute roster that this section can use. */
  facultyPool: string[];
  config: SectionConfig;
  programs: SectionProgram[];
  /** Weekly timetable cells. UNIQUE on (weekStartDate, weekday, periodIndex). */
  cells: SectionCell[];
  /** Per (program+subject) status. Key = `${programId}:${subjectId}`. */
  subjectStatus: Record<string, SubjectStatus>;
}

/** Helper for `useSection.setCellAllocation` — thrown when a slot is already
 *  occupied and the caller didn't pass `{ force: true }`. */
export class CellOccupiedError extends Error {
  constructor(public readonly existing: CellAllocation) {
    super('Slot is already occupied');
    this.name = 'CellOccupiedError';
  }
}

export function slotKeyEq(a: SlotKey, b: SlotKey): boolean {
  return a.weekStartDate === b.weekStartDate && a.weekday === b.weekday && a.periodIndex === b.periodIndex;
}

export function slotKeyToString(s: SlotKey): string {
  return `${s.weekStartDate}|${s.weekday}|${s.periodIndex}`;
}

export function allocationKey(a: CellAllocation): string {
  return `${a.programId}:${a.subjectId}:${a.trackId}`;
}

export function subjectStatusKey(programId: string, subjectId: string): string {
  return `${programId}:${subjectId}`;
}
