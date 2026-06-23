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

export interface ScheduleConfig {
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD (optional — auto-computed)
  workingDays: WeekDay[];   // e.g. [1,2,3,4,5,6]
  periodsPerDay: number;
  periodLengthMins: number;
  holidays: Holiday[];
  /** Default faculty per subjectId. */
  defaultFaculty: Record<string, string>;
  classUrlTemplate: string;
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
  classUrl: string;
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
