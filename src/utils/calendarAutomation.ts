import {
  InstituteProgram,
  InstituteSubject,
  ProgramRollup,
  ScheduleConfig,
  ScheduleSlot,
  SubjectRollup,
  WeekDay,
} from '@/types/instituteProgram';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function hoursToPeriods(hours: number, periodMins: number): number {
  if (!hours || hours <= 0) return 0;
  return Math.ceil((hours * 60) / Math.max(1, periodMins));
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  return toISO(new Date(parseISO(iso).getTime() + n * MS_PER_DAY));
}

export function formatPretty(iso: string): string {
  if (!iso) return '';
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function rollupProgram(program: InstituteProgram, periodMins: number): ProgramRollup {
  const subjects: SubjectRollup[] = program.subjects.map((s) => rollupSubject(s, periodMins));
  return {
    totalTopics: subjects.reduce((a, s) => a + s.topics, 0),
    topicsConfigured: subjects.reduce((a, s) => a + s.topicsConfigured, 0),
    hours: round1(subjects.reduce((a, s) => a + s.hours, 0)),
    periods: subjects.reduce((a, s) => a + s.periods, 0),
    subjects,
  };
}

export function rollupSubject(subject: InstituteSubject, periodMins: number): SubjectRollup {
  let topics = 0;
  let topicsConfigured = 0;
  let hours = 0;
  let periods = 0;
  subject.chapters.forEach((ch) => {
    ch.topics.forEach((t) => {
      topics += 1;
      if (t.hours > 0) topicsConfigured += 1;
      hours += t.hours || 0;
      periods += hoursToPeriods(t.hours || 0, periodMins);
    });
  });
  return {
    subjectId: subject.id,
    subjectName: subject.name,
    color: subject.color,
    topics,
    topicsConfigured,
    hours: round1(hours),
    periods,
  };
}

export function chapterHours(chapter: { topics: { hours: number }[] }): number {
  return round1(chapter.topics.reduce((a, t) => a + (t.hours || 0), 0));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Build the list of working calendar days between start and end (inclusive). */
export function buildWorkingDays(
  startIso: string,
  endIso: string,
  workingDays: WeekDay[],
  holidaySet: Set<string>,
): string[] {
  const out: string[] = [];
  const startMs = parseISO(startIso).getTime();
  const endMs = parseISO(endIso).getTime();
  if (endMs < startMs) return out;
  for (let t = startMs; t <= endMs; t += MS_PER_DAY) {
    const iso = toISO(new Date(t));
    const dow = new Date(t).getDay() as WeekDay;
    if (!workingDays.includes(dow)) continue;
    if (holidaySet.has(iso)) continue;
    out.push(iso);
  }
  return out;
}

export function periodTime(periodIndex: number, periodMins: number, startHour = 9): { start: string; end: string } {
  // 5-minute break between periods, lunch (30 min) after period 3.
  const breakMins = 5;
  const lunchAfter = 3;
  let offset = periodIndex * (periodMins + breakMins);
  if (periodIndex > lunchAfter) offset += 25; // extra lunch padding
  const startTotal = startHour * 60 + offset;
  const endTotal = startTotal + periodMins;
  return { start: fmtTime(startTotal), end: fmtTime(endTotal) };
}

function fmtTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface GenerateResult {
  slots: ScheduleSlot[];
  unscheduledTopics: { subjectId: string; chapterId: string; topicId: string; periodsShort: number }[];
  endDate: string;
  totalSlotsConsumed: number;
  freeSlots: number;
}

/**
 * Round-robin generator. Walks subjects in order across each working day,
 * consuming `periods_for_topic` consecutive periods per topic (in curriculum
 * order). Preserves locked slots from a previous run.
 */
export function generateSchedule(
  program: InstituteProgram,
  config: ScheduleConfig,
  preservedLocked: ScheduleSlot[] = [],
): GenerateResult {
  const periodMins = config.periodLengthMins;
  // Build the per-subject queue of (topic, periodsNeeded) in curriculum order.
  type Need = { subjectId: string; chapterId: string; topicId: string; remaining: number };
  const queues: Record<string, Need[]> = {};
  program.subjects.forEach((s) => {
    const list: Need[] = [];
    s.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        const p = hoursToPeriods(t.hours, periodMins);
        if (p > 0) list.push({ subjectId: s.id, chapterId: c.id, topicId: t.id, remaining: p });
      });
    });
    queues[s.id] = list;
  });

  // Determine end date: use configured if set, else a generous horizon (2 years).
  const endIso = config.endDate ?? addDays(config.startDate, 730);
  const holidaySet = new Set(config.holidays.map((h) => h.date));
  const workingDays = buildWorkingDays(config.startDate, endIso, config.workingDays, holidaySet);

  // Index locked slots by date+periodIndex.
  const lockedMap = new Map<string, ScheduleSlot>();
  preservedLocked.forEach((sl) => lockedMap.set(`${sl.date}#${sl.periodIndex}`, sl));

  const slots: ScheduleSlot[] = [];
  let consumed = 0;
  let lastUsedDate = config.startDate;

  const subjectIds = program.subjects.map((s) => s.id);
  let rrCursor = 0;

  for (const date of workingDays) {
    for (let p = 0; p < config.periodsPerDay; p++) {
      // Honour locked slot.
      const lockedKey = `${date}#${p}`;
      const locked = lockedMap.get(lockedKey);
      if (locked) {
        slots.push({ ...locked, date, periodIndex: p });
        consumed += 1;
        lastUsedDate = date;
        continue;
      }

      // Find next subject with work remaining starting from rrCursor.
      let pickedSubject: string | null = null;
      for (let i = 0; i < subjectIds.length; i++) {
        const sid = subjectIds[(rrCursor + i) % subjectIds.length];
        if (queues[sid].length > 0) {
          pickedSubject = sid;
          rrCursor = (rrCursor + i + 1) % subjectIds.length;
          break;
        }
      }
      if (!pickedSubject) break;

      const need = queues[pickedSubject][0];
      const t = periodTime(p, periodMins);
      slots.push({
        id: `slot-${date}-${p}`,
        date,
        periodIndex: p,
        startTime: t.start,
        endTime: t.end,
        subjectId: need.subjectId,
        chapterId: need.chapterId,
        topicId: need.topicId,
        facultyId: config.defaultFaculty[need.subjectId] ?? '',
        classUrl: config.classUrlTemplate.replace('{date}', date).replace('{period}', String(p + 1)),
      });
      need.remaining -= 1;
      consumed += 1;
      lastUsedDate = date;
      if (need.remaining <= 0) queues[pickedSubject].shift();
    }

    // Are all queues empty? Done.
    if (subjectIds.every((sid) => queues[sid].length === 0)) break;
  }

  const unscheduledTopics: GenerateResult['unscheduledTopics'] = [];
  subjectIds.forEach((sid) =>
    queues[sid].forEach((n) =>
      unscheduledTopics.push({
        subjectId: n.subjectId,
        chapterId: n.chapterId,
        topicId: n.topicId,
        periodsShort: n.remaining,
      }),
    ),
  );

  // Free slots = available capacity minus consumed across the working days that we actually used.
  const usedDays = workingDays.filter((d) => d <= lastUsedDate);
  const capacity = usedDays.length * config.periodsPerDay;
  const freeSlots = Math.max(0, capacity - consumed);

  return {
    slots,
    unscheduledTopics,
    endDate: lastUsedDate,
    totalSlotsConsumed: consumed,
    freeSlots,
  };
}

/** Quick check: do we have enough days to fit the workload? */
export function capacityCheck(
  program: InstituteProgram,
  config: ScheduleConfig,
): { needed: number; available: number; surplus: number; suggestedEndDate?: string } {
  const periodMins = config.periodLengthMins;
  const needed = rollupProgram(program, periodMins).periods;
  const endIso = config.endDate ?? addDays(config.startDate, 730);
  const holidaySet = new Set(config.holidays.map((h) => h.date));
  const days = buildWorkingDays(config.startDate, endIso, config.workingDays, holidaySet);
  const available = days.length * config.periodsPerDay;
  const surplus = available - needed;
  let suggestedEndDate: string | undefined;
  if (config.endDate && surplus < 0) {
    // Walk forward until we have enough days.
    let extra = 0;
    let cur = endIso;
    const need = -surplus;
    let added = 0;
    while (added < need) {
      cur = addDays(cur, 1);
      const dow = parseISO(cur).getDay() as WeekDay;
      if (!config.workingDays.includes(dow)) continue;
      if (holidaySet.has(cur)) continue;
      extra += 1;
      added = extra * config.periodsPerDay;
    }
    suggestedEndDate = cur;
  }
  return { needed, available, surplus, suggestedEndDate };
}
