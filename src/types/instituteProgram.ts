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
}

export interface InstituteSubject {
  id: string;
  name: string;
  /** Tailwind text/bg color accent (e.g. 'blue', 'emerald', 'amber'). */
  color: string;
  chapters: InstituteChapter[];
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
  /** Recurring weekly timetable template authored in Step 2. */
  weeklyTimetable?: WeeklyTimetable;
}


export interface ScheduleSlot {
  id: string;
  date: string;             // YYYY-MM-DD
  periodIndex: number;      // 0-based within day
  startTime: string;        // HH:mm
  endTime: string;          // HH:mm
  subjectId: string;
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
