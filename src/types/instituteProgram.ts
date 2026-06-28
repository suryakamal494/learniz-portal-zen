/**
 * Institute-side program model — drives Teaching Hours capture and the
 * Calendar Automation engine. Independent from teacher-side `Program`.
 */

export interface InstituteTopic {
  id: string;
  name: string;
  /** Teaching hours for this topic. 0 = not configured yet. */
  hours: number;
}

export interface InstituteChapter {
  id: string;
  name: string;
  topics: InstituteTopic[];
  /** Phase C+ — when the parent subject has ≥2 tracks, the chapter belongs to one track.
   *  null / undefined means "unassigned". */
  trackId?: string | null;
}

export interface InstituteSubject {
  id: string;
  name: string;
  /** Tailwind text/bg color accent (e.g. 'blue', 'emerald', 'amber'). */
  color: string;
  chapters: InstituteChapter[];
}

export interface ScheduleTrack {
  id: string;
  subjectId: string;
  name: string;
  facultyId?: string;
  allottedPeriods: number;
  /** Phase C — disabled tracks keep their config but don't appear in Step 3 palette
   *  and are excluded from capacity totals & generation. Undefined = enabled. */
  enabled?: boolean;
}

export interface InstituteFaculty {
  id: string;
  name: string;
  subjectId?: string;
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Holiday {
  date: string;       // YYYY-MM-DD
  name?: string;
}

export interface PeriodBreak {
  id: string;
  /** Insert this break after period number N (1-based). */
  afterPeriod: number;
  name: string;
  durationMins: number;
}

export interface HolidayOverrides {
  /** Dates to skip from institute-level holidays for this program. */
  removed: string[];
  /** Program-only additional holidays. */
  added: Holiday[];
}

/** One cell in the weekly recurring timetable template. */
export interface WeeklyTimetableCell {
  /** ISO date of the Monday of the week this cell belongs to. */
  weekStartDate: string;
  weekday: WeekDay;
  /** 0-based period index within the day. */
  periodIndex: number;
  /** Selected subject for this slot. Null means "free / no class". */
  subjectId: string | null;
  /** Selected parallel track for this subject. Null/undefined means default T1. */
  trackId?: string | null;
  /** Optional per-cell faculty override. When null/undefined, the default
   *  faculty configured for the subject (config.defaultFaculty) is used. */
  facultyId?: string | null;
}

export interface WeeklyTimetable {
  cells: WeeklyTimetableCell[];
}

export interface ScheduleConfig {
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD (optional — auto-computed)
  workingDays: WeekDay[];   // e.g. [1,2,3,4,5,6]
  periodsPerDay: number;
  /** Default period length in minutes (used when no per-period override is set). */
  periodLengthMins: number;
  /** Per-period duration overrides keyed by 1-based period number. */
  periodOverrides?: Record<number, number>;
  /** When the first period of the day begins, "HH:mm". */
  dayStartTime: string;
  /** Breaks between periods (short break, lunch, …). */
  breaks: PeriodBreak[];
  /** Legacy program-only holiday list (still honoured as program-only adds). */
  holidays: Holiday[];
  /** Per-program overrides on top of the institute-wide holiday list. */
  holidayOverrides?: HolidayOverrides;
  /** Default faculty per subjectId. */
  defaultFaculty: Record<string, string>;
  classUrlTemplate?: string;
  /** Recurring weekly timetable template authored in Step 3. */
  weeklyTimetable?: WeeklyTimetable;
  /** Step 2 — per-subject period budget (subject.id → periods to allot). */
  subjectTargetPeriods?: Record<string, number>;
  /** Step 2 — tracks under each subject. Empty/undefined means each subject has one default T1 track. */
  subjectTracks?: Record<string, ScheduleTrack[]>;
  /** Step 2 — per-track period budget (track.id → periods to allot). */
  trackTargetPeriods?: Record<string, number>;
  /** Phase A — section-level faculty pool. When set & non-empty, faculty
   *  dropdowns in Step 1 (default) & Step 2 (per track) filter to this list. */
  facultyPool?: string[];
  /** Phase C — when a subject is locked, all its targets/tracks/topic-period
   *  inputs are read-only in Step 2. */
  subjectLocks?: Record<string, boolean>;
  /** Phase B — multiple academic windows. The "active" slice is mirrored into
   *  the flat fields above for backward-compat with existing UI. */
  windows?: AcademicWindow[];
  activeWindowId?: string;
  /** Phase F — sub-programs (e.g. CBSE, JEE) sharing this section's grid.
   *  When >1, the Period Allocation step exposes a switcher. Each slice
   *  stores its own targets/tracks/locks AND its own weeklyTimetable. */
  subProgramSlices?: Record<string, SubProgramSlice>;
  activeSubProgramId?: string;
}

/** Phase F — per-sub-program slice. Schedule-level fields (window, working
 *  days, periods/day, breaks, faculty pool, dayStartTime) stay shared. */
export interface SubProgramSlice {
  subjectTargetPeriods: Record<string, number>;
  subjectTracks: Record<string, ScheduleTrack[]>;
  trackTargetPeriods: Record<string, number>;
  subjectLocks: Record<string, boolean>;
  weeklyTimetable: WeeklyTimetable;
}

/** Phase F — sub-program metadata (CBSE / JEE / NEET …). */
export interface SubProgram {
  id: string;
  code: string;
  name: string;
  /** Optional accent color name (subject-palette compatible). */
  color?: string;
}



/** Phase B — a per-window slice of the schedule. Switching the active window
 *  loads its slice into the flat ScheduleConfig fields. Schedule-level fields
 *  that stay shared across windows: periodLengthMins, dayStartTime, breaks,
 *  defaultFaculty, facultyPool, classUrlTemplate. */
export interface AcademicWindow {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
  workingDays: WeekDay[];
  periodsPerDay: number;
  weeklyTimetable?: WeeklyTimetable;
  subjectTargetPeriods?: Record<string, number>;
  subjectTracks?: Record<string, ScheduleTrack[]>;
  trackTargetPeriods?: Record<string, number>;
  subjectLocks?: Record<string, boolean>;
  holidayOverrides?: HolidayOverrides;
}


export interface ScheduleSlot {
  id: string;
  date: string;             // YYYY-MM-DD
  periodIndex: number;      // 0-based within day
  startTime: string;        // HH:mm
  endTime: string;          // HH:mm
  subjectId: string;
  trackId?: string;
  chapterId: string;
  topicId: string;
  facultyId: string;
  classUrl?: string;
  /** True when user dragged/edited this slot — preserved across regenerate. */
  locked?: boolean;
  /** Manually added extra class beyond the auto plan. */
  isExtra?: boolean;
}

export interface InstituteProgram {
  id: string;
  name: string;
  className: string;
  sections: string[];
  fee: number;
  subjects: InstituteSubject[];
  /** Hours marked as final → unlocks scheduling. */
  hoursFinalised: boolean;
  schedule?: ScheduleConfig;
  generatedSlots?: ScheduleSlot[];
}

export interface SubjectRollup {
  subjectId: string;
  subjectName: string;
  color: string;
  topics: number;
  topicsConfigured: number;
  hours: number;
  periods: number;
}

export interface ProgramRollup {
  totalTopics: number;
  topicsConfigured: number;
  hours: number;
  periods: number;
  subjects: SubjectRollup[];
}
