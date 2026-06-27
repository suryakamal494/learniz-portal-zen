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

/** Returns the period count stored on a topic. Step 2 now writes periods
 *  directly into the `hours` field (no minutes conversion needed). */
export function topicPeriods(topic: { hours: number }): number {
  return Math.max(0, Math.round(topic.hours || 0));
}

/** Available class capacity from setup: working days × periods per day,
 *  honouring holidays and working-day toggles. */
export function computeCapacity(
  config: ScheduleConfig,
): { workingDays: number; periodsAvailable: number; endDateUsed: string } {
  const endIso = config.endDate ?? addDays(config.startDate, 365);
  const holidaySet = new Set((config.holidays ?? []).map((h) => h.date));
  const days = buildWorkingDays(config.startDate, endIso, config.workingDays, holidaySet);
  return {
    workingDays: days.length,
    periodsAvailable: days.length * (config.periodsPerDay || 0),
    endDateUsed: endIso,
  };
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
  // Legacy helper (kept for callers that don't have a full ScheduleConfig).
  const breakMins = 5;
  const lunchAfter = 3;
  let offset = periodIndex * (periodMins + breakMins);
  if (periodIndex > lunchAfter) offset += 25;
  const startTotal = startHour * 60 + offset;
  const endTotal = startTotal + periodMins;
  return { start: fmtTime(startTotal), end: fmtTime(endTotal) };
}

function timeToMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface PeriodTimeRow {
  index: number;          // 0-based period index
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
}

export interface DayLayoutRow {
  kind: 'period' | 'break';
  index?: number;         // period index when kind=period
  label: string;
  startTime: string;
  endTime: string;
  durationMins: number;
}

function periodMinsFor(config: ScheduleConfig, periodNumber1Based: number): number {
  const overrides = (config as { periodOverrides?: Record<number, number> }).periodOverrides;
  const v = overrides?.[periodNumber1Based];
  return v && v > 0 ? v : config.periodLengthMins;
}

/** Computes per-period start/end times honouring `dayStartTime`, per-period
 *  duration overrides and `breaks`. */
export function computePeriodTimes(config: ScheduleConfig): PeriodTimeRow[] {
  const startStr = (config as { dayStartTime?: string }).dayStartTime ?? '09:00';
  const breaks = (config as { breaks?: { afterPeriod: number; durationMins: number }[] }).breaks ?? [];
  const breakAfter = new Map<number, number>();
  breaks.forEach((b) => breakAfter.set(b.afterPeriod, (breakAfter.get(b.afterPeriod) ?? 0) + (b.durationMins || 0)));
  const out: PeriodTimeRow[] = [];
  let cursor = timeToMins(startStr);
  for (let i = 0; i < config.periodsPerDay; i++) {
    const len = periodMinsFor(config, i + 1);
    const s = cursor;
    const e = cursor + len;
    out.push({ index: i, startTime: fmtTime(s), endTime: fmtTime(e) });
    cursor = e;
    const brk = breakAfter.get(i + 1);
    if (brk) cursor += brk;
  }
  return out;
}

/** Full day layout including break rows (for display in Setup). */
export function computeDayLayout(config: ScheduleConfig): DayLayoutRow[] {
  const startStr = (config as { dayStartTime?: string }).dayStartTime ?? '09:00';
  const breaks = (config as { breaks?: { id: string; afterPeriod: number; name: string; durationMins: number }[] }).breaks ?? [];
  const breakAfter = new Map<number, { name: string; durationMins: number }[]>();
  breaks.forEach((b) => {
    const arr = breakAfter.get(b.afterPeriod) ?? [];
    arr.push({ name: b.name, durationMins: b.durationMins });
    breakAfter.set(b.afterPeriod, arr);
  });
  const out: DayLayoutRow[] = [];
  let cursor = timeToMins(startStr);
  for (let i = 0; i < config.periodsPerDay; i++) {
    const len = periodMinsFor(config, i + 1);
    const s = cursor;
    const e = cursor + len;
    out.push({ kind: 'period', index: i, label: `P${i + 1}`, startTime: fmtTime(s), endTime: fmtTime(e), durationMins: len });
    cursor = e;
    const brks = breakAfter.get(i + 1) ?? [];
    brks.forEach((b) => {
      const bs = cursor;
      const be = cursor + b.durationMins;
      out.push({ kind: 'break', label: b.name, startTime: fmtTime(bs), endTime: fmtTime(be), durationMins: b.durationMins });
      cursor = be;
    });
  }
  return out;
}

/** Monday-of-week for any ISO date (returns ISO). Weeks start on Monday. */
export function isoWeekStart(iso: string): string {
  const d = parseISO(iso);
  const dow = d.getDay(); // 0=Sun..6=Sat
  const delta = dow === 0 ? -6 : 1 - dow;
  return addDays(iso, delta);
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
  const periodTimes = computePeriodTimes(config);

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
      const t = periodTimes[p];
      const fallback = periodTime(p, periodMins);
      slots.push({
        id: `slot-${date}-${p}`,
        date,
        periodIndex: p,
        startTime: t?.startTime ?? fallback.start,
        endTime: t?.endTime ?? fallback.end,
        subjectId: need.subjectId,
        chapterId: need.chapterId,
        topicId: need.topicId,
        facultyId: config.defaultFaculty[need.subjectId] ?? '',
        ...(config.classUrlTemplate
          ? { classUrl: config.classUrlTemplate.replace('{date}', date).replace('{period}', String(p + 1)) }
          : {}),
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

/* ─────────────────────────────────────────────────────────────────────
 * planDates — lightweight, deterministic date layout per topic.
 * Walks subjects round-robin across working days using periodsPerDay,
 * and emits per-topic, per-chapter, per-subject {start, end} ranges.
 * Used by the curriculum preview so users see WHEN each topic falls
 * even before a full schedule is generated.
 * ───────────────────────────────────────────────────────────────────── */

export interface TopicDateRange {
  topicId: string;
  startDate: string;
  endDate: string;
  periods: number;
}

export interface ChapterDateRange {
  chapterId: string;
  startDate: string;
  endDate: string;
  topics: Record<string, TopicDateRange>;
}

export interface SubjectDateRange {
  subjectId: string;
  startDate: string;
  endDate: string;
  chapters: Record<string, ChapterDateRange>;
}

export interface DatePlan {
  startDate: string;
  endDate: string;
  workingDaysUsed: number;
  totalPeriods: number;
  subjects: Record<string, SubjectDateRange>;
  topicById: Record<string, TopicDateRange>;
  chapterById: Record<string, ChapterDateRange>;
}

export function planDates(program: InstituteProgram, config: ScheduleConfig): DatePlan {
  const periodMins = config.periodLengthMins;
  type Need = { subjectId: string; chapterId: string; topicId: string; remaining: number; totalPeriods: number };
  const queues: Record<string, Need[]> = {};
  program.subjects.forEach((s) => {
    const list: Need[] = [];
    s.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        const p = hoursToPeriods(t.hours, periodMins);
        if (p > 0) list.push({ subjectId: s.id, chapterId: c.id, topicId: t.id, remaining: p, totalPeriods: p });
      });
    });
    queues[s.id] = list;
  });

  const endIso = addDays(config.startDate, 1500);
  const holidaySet = new Set(config.holidays.map((h) => h.date));
  const workingDays = buildWorkingDays(config.startDate, endIso, config.workingDays, holidaySet);

  const topicById: Record<string, TopicDateRange> = {};
  const subjectIds = program.subjects.map((s) => s.id);
  let rrCursor = 0;
  let consumed = 0;
  let lastUsedDate = config.startDate;
  let firstUsedDate = '';

  outer: for (const date of workingDays) {
    for (let p = 0; p < config.periodsPerDay; p++) {
      let pickedSubject: string | null = null;
      for (let i = 0; i < subjectIds.length; i++) {
        const sid = subjectIds[(rrCursor + i) % subjectIds.length];
        if (queues[sid].length > 0) {
          pickedSubject = sid;
          rrCursor = (rrCursor + i + 1) % subjectIds.length;
          break;
        }
      }
      if (!pickedSubject) break outer;
      const need = queues[pickedSubject][0];
      const entry = topicById[need.topicId] ?? {
        topicId: need.topicId,
        startDate: date,
        endDate: date,
        periods: need.totalPeriods,
      };
      entry.endDate = date;
      topicById[need.topicId] = entry;
      if (!firstUsedDate) firstUsedDate = date;
      lastUsedDate = date;
      consumed += 1;
      need.remaining -= 1;
      if (need.remaining <= 0) queues[pickedSubject].shift();
    }
    if (subjectIds.every((sid) => queues[sid].length === 0)) break;
  }

  // Roll up to chapter & subject ranges.
  const chapterById: Record<string, ChapterDateRange> = {};
  const subjects: Record<string, SubjectDateRange> = {};
  program.subjects.forEach((s) => {
    const cMap: Record<string, ChapterDateRange> = {};
    let sStart = '';
    let sEnd = '';
    s.chapters.forEach((c) => {
      const tMap: Record<string, TopicDateRange> = {};
      let cStart = '';
      let cEnd = '';
      c.topics.forEach((t) => {
        const tr = topicById[t.id];
        if (!tr) return;
        tMap[t.id] = tr;
        if (!cStart || tr.startDate < cStart) cStart = tr.startDate;
        if (!cEnd || tr.endDate > cEnd) cEnd = tr.endDate;
      });
      if (cStart) {
        const range: ChapterDateRange = { chapterId: c.id, startDate: cStart, endDate: cEnd, topics: tMap };
        cMap[c.id] = range;
        chapterById[c.id] = range;
        if (!sStart || cStart < sStart) sStart = cStart;
        if (!sEnd || cEnd > sEnd) sEnd = cEnd;
      }
    });
    if (sStart) subjects[s.id] = { subjectId: s.id, startDate: sStart, endDate: sEnd, chapters: cMap };
  });

  return {
    startDate: firstUsedDate || config.startDate,
    endDate: lastUsedDate,
    workingDaysUsed: workingDays.findIndex((d) => d === lastUsedDate) + 1,
    totalPeriods: consumed,
    subjects,
    topicById,
    chapterById,
  };
}

export function formatShort(iso: string): string {
  if (!iso) return '—';
  return parseISO(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / MS_PER_DAY) + 1;
}

/* ─────────────────────────────────────────────────────────────────────
 * Coverage cursor — "where each subject left off in prior windows".
 * Derived from previously-generated slots that fall BEFORE the new
 * window's start date. Used by the timetable-driven generator so a
 * July plan resumes the syllabus from where June ended.
 * ───────────────────────────────────────────────────────────────────── */

export interface CoverageEntry {
  /** Last topic ID that was scheduled before the new window. */
  lastTopicId: string;
  lastChapterId: string;
  lastDate: string;
}

export function computeCoverageCursor(
  program: InstituteProgram,
  windowStartIso: string,
): Record<string, CoverageEntry> {
  const out: Record<string, CoverageEntry> = {};
  const prior = (program.generatedSlots ?? []).filter((s) => s.date < windowStartIso);
  prior.forEach((s) => {
    const cur = out[s.subjectId];
    if (!cur || s.date > cur.lastDate) {
      out[s.subjectId] = { lastTopicId: s.topicId, lastChapterId: s.chapterId, lastDate: s.date };
    }
  });
  return out;
}

/** Returns the next-topic index in a subject's flat topic order, given the
 *  last covered topic. -1 means "subject not started yet". */
function indexAfterTopic(subject: InstituteSubject, lastTopicId: string | undefined): number {
  if (!lastTopicId) return 0;
  let i = 0;
  for (const c of subject.chapters) {
    for (const t of c.topics) {
      if (t.id === lastTopicId) return i + 1;
      i += 1;
    }
  }
  return 0;
}

interface FlatTopic {
  subjectId: string;
  chapterId: string;
  topicId: string;
  periods: number;
}

function flattenSubjectQueue(subject: InstituteSubject, periodMins: number, startIndex: number): FlatTopic[] {
  const out: FlatTopic[] = [];
  let i = 0;
  for (const c of subject.chapters) {
    for (const t of c.topics) {
      if (i >= startIndex) {
        const p = hoursToPeriods(t.hours, periodMins);
        if (p > 0) out.push({ subjectId: subject.id, chapterId: c.id, topicId: t.id, periods: p });
      }
      i += 1;
    }
  }
  return out;
}

/**
 * Generates slots driven by the **weekly timetable template**, resuming each
 * subject's syllabus from the coverage cursor (so window-by-window planning
 * preserves continuity). Falls back to the round-robin generator when no
 * timetable is configured.
 */
export function generateFromTimetable(
  program: InstituteProgram,
  config: ScheduleConfig,
  preservedLocked: ScheduleSlot[] = [],
): GenerateResult {
  const tt = config.weeklyTimetable;
  if (!tt || tt.cells.length === 0) {
    return generateSchedule(program, config, preservedLocked);
  }

  // Build per-week cell lookup: weekStart -> weekday -> periodIndex -> subjectId.
  const byWeek = new Map<string, Map<number, Map<number, string | null>>>();
  tt.cells.forEach((c) => {
    let week = byWeek.get(c.weekStartDate);
    if (!week) {
      week = new Map();
      byWeek.set(c.weekStartDate, week);
    }
    let day = week.get(c.weekday);
    if (!day) {
      day = new Map();
      week.set(c.weekday, day);
    }
    day.set(c.periodIndex, c.subjectId);
  });

  // For any week not explicitly authored, fall back to the *latest* authored
  // week ≤ that date (so "copy week → all" semantics works).
  const authoredWeekStarts = [...byWeek.keys()].sort();
  const lookupWeek = (weekStart: string) => {
    if (byWeek.has(weekStart)) return byWeek.get(weekStart)!;
    let fallback: string | undefined;
    for (const w of authoredWeekStarts) {
      if (w <= weekStart) fallback = w;
      else break;
    }
    return fallback ? byWeek.get(fallback)! : undefined;
  };

  // Resume each subject from its cursor.
  const cursor = computeCoverageCursor(program, config.startDate);
  const queues: Record<string, FlatTopic[]> = {};
  program.subjects.forEach((s) => {
    const startIdx = indexAfterTopic(s, cursor[s.id]?.lastTopicId);
    queues[s.id] = flattenSubjectQueue(s, config.periodLengthMins, startIdx);
  });

  const endIso = config.endDate ?? addDays(config.startDate, 730);
  const holidaySet = new Set(config.holidays.map((h) => h.date));
  const workingDays = buildWorkingDays(config.startDate, endIso, config.workingDays, holidaySet);
  const periodTimes = computePeriodTimes(config);

  const lockedMap = new Map<string, ScheduleSlot>();
  preservedLocked.forEach((sl) => lockedMap.set(`${sl.date}#${sl.periodIndex}`, sl));

  const slots: ScheduleSlot[] = [];
  let consumed = 0;
  let lastUsedDate = config.startDate;
  // Track remaining counter per topic for unscheduled report.
  const remainingByTopic = new Map<string, FlatTopic>();
  Object.values(queues).flat().forEach((t) => remainingByTopic.set(t.topicId, { ...t }));

  for (const date of workingDays) {
    const weekStart = isoWeekStart(date);
    const week = lookupWeek(weekStart);
    if (!week) continue;
    const weekday = parseISO(date).getDay() as WeekDay;
    const dayCells = week.get(weekday);
    if (!dayCells) continue;

    for (let p = 0; p < config.periodsPerDay; p++) {
      const locked = lockedMap.get(`${date}#${p}`);
      if (locked) {
        slots.push({ ...locked, date, periodIndex: p });
        consumed += 1;
        lastUsedDate = date;
        continue;
      }
      const subjectId = dayCells.get(p);
      if (!subjectId) continue; // free period
      const q = queues[subjectId];
      if (!q || q.length === 0) continue;
      const need = q[0];
      const t = periodTimes[p];
      slots.push({
        id: `slot-${date}-${p}`,
        date,
        periodIndex: p,
        startTime: t?.startTime ?? '09:00',
        endTime: t?.endTime ?? '09:40',
        subjectId: need.subjectId,
        chapterId: need.chapterId,
        topicId: need.topicId,
        facultyId: config.defaultFaculty[need.subjectId] ?? '',
      });
      need.periods -= 1;
      consumed += 1;
      lastUsedDate = date;
      const trk = remainingByTopic.get(need.topicId);
      if (trk) trk.periods = Math.max(0, trk.periods - 1);
      if (need.periods <= 0) q.shift();
    }
  }

  const unscheduledTopics: GenerateResult['unscheduledTopics'] = [];
  remainingByTopic.forEach((t) => {
    if (t.periods > 0) {
      unscheduledTopics.push({
        subjectId: t.subjectId,
        chapterId: t.chapterId,
        topicId: t.topicId,
        periodsShort: t.periods,
      });
    }
  });

  const usedDays = workingDays.filter((d) => d <= lastUsedDate);
  const capacity = usedDays.length * config.periodsPerDay;
  return {
    slots,
    unscheduledTopics,
    endDate: lastUsedDate,
    totalSlotsConsumed: consumed,
    freeSlots: Math.max(0, capacity - consumed),
  };
}


