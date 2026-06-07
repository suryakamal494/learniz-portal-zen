import { Program, ProgramChapter, ProgramSubject, ProgramTopic, TopicStatus } from '@/types/program';

export type ScheduleState = 'on-track' | 'behind' | 'ahead' | 'done' | 'not-started';

export interface ScheduleDelta {
  state: ScheduleState;
  /** Positive = ahead by N days; negative = behind by N days; 0 = on track. */
  deltaDays: number;
  /** Plain-English explanation suitable for tooltips. */
  explanation: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STALE_DAYS_THRESHOLD = 7;

function parseISODate(iso: string): Date {
  // Treat dates as local-midnight so "today" comparisons don't drift by tz.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

/** All topics across the program, flat. */
export function flattenTopics(program: Program): Array<{ subject: ProgramSubject; chapter: ProgramChapter; topic: ProgramTopic }> {
  const out: Array<{ subject: ProgramSubject; chapter: ProgramChapter; topic: ProgramTopic }> = [];
  for (const s of program.subjects) {
    for (const ch of s.chapters) {
      for (const t of ch.topics ?? []) out.push({ subject: s, chapter: ch, topic: t });
    }
  }
  return out;
}

/**
 * The topic the teacher should be teaching today: the first topic whose
 * planned window contains today, falling back to the next upcoming topic.
 */
export function getTodayFocus(program: Program, today: Date = new Date()) {
  const all = flattenTopics(program);
  const todayMs = startOfDay(today).getTime();

  // Currently scheduled
  const current = all.find(({ topic }) => {
    const start = parseISODate(topic.plannedStartDate).getTime();
    const end = parseISODate(topic.plannedEndDate).getTime();
    return start <= todayMs && todayMs <= end;
  });
  if (current) return current;

  // Next upcoming
  const upcoming = all
    .filter(({ topic }) => parseISODate(topic.plannedStartDate).getTime() > todayMs)
    .sort((a, b) => a.topic.plannedStartDate.localeCompare(b.topic.plannedStartDate))[0];
  return upcoming ?? null;
}

/**
 * Schedule delta for a chapter — computed from the latest in-progress / not-started
 * topic vs its planned end date.
 */
export function getScheduleDeltaForChapter(chapter: ProgramChapter, today: Date = new Date()): ScheduleDelta {
  const topics = chapter.topics ?? [];
  if (topics.length === 0) {
    return { state: 'not-started', deltaDays: 0, explanation: 'No schedule assigned for this chapter yet.' };
  }

  const allDone = topics.every((t) => t.status === 'done');
  if (allDone) {
    return { state: 'done', deltaDays: 0, explanation: 'All topics in this chapter are marked done.' };
  }

  const allNotStarted = topics.every((t) => t.status === 'not-started');
  const firstStart = parseISODate(topics[0].plannedStartDate);
  if (allNotStarted && diffInDays(firstStart, today) > 0) {
    const days = diffInDays(firstStart, today);
    return { state: 'not-started', deltaDays: days, explanation: `Scheduled to start in ${days} day${days === 1 ? '' : 's'}.` };
  }

  // Find the earliest topic that is not done — that's our "current" anchor.
  const pending = topics.find((t) => t.status !== 'done');
  if (!pending) {
    return { state: 'done', deltaDays: 0, explanation: 'All topics in this chapter are marked done.' };
  }

  const plannedEnd = parseISODate(pending.plannedEndDate);
  const delta = diffInDays(today, plannedEnd); // positive = today is past planned end

  if (delta > 0 && pending.status !== 'done') {
    return {
      state: 'behind',
      deltaDays: -delta,
      explanation: `"${pending.name}" was scheduled to finish on ${pending.plannedEndDate}. You're ${delta} day${delta === 1 ? '' : 's'} behind.`,
    };
  }
  if (delta < 0) {
    const ahead = Math.abs(delta);
    return {
      state: pending.status === 'in-progress' ? 'on-track' : 'on-track',
      deltaDays: ahead,
      explanation: `On track — "${pending.name}" is due by ${pending.plannedEndDate}.`,
    };
  }
  return {
    state: 'on-track',
    deltaDays: 0,
    explanation: `On track — "${pending.name}" is due today.`,
  };
}

export interface StaleStatusInfo {
  daysSinceLastUpdate: number | null;
  isStale: boolean;
  lastUpdatedAt?: string;
}

/** How long since the teacher marked any topic on this program. */
export function getStaleStatusInfo(program: Program, today: Date = new Date()): StaleStatusInfo {
  const all = flattenTopics(program);
  const lastIso = all
    .map(({ topic }) => topic.lastUpdatedAt)
    .filter((x): x is string => !!x)
    .sort()
    .pop();

  if (!lastIso) {
    return { daysSinceLastUpdate: null, isStale: true };
  }
  const days = diffInDays(today, new Date(lastIso));
  return {
    daysSinceLastUpdate: days,
    isStale: days >= STALE_DAYS_THRESHOLD,
    lastUpdatedAt: lastIso,
  };
}

/** "18h of 50h marked taught — 36%" style tooltip line. */
export function explainPct(spentHrs: number, plannedHrs: number): string {
  if (plannedHrs <= 0) return 'No hours planned yet for this scope.';
  const pct = Math.min(100, Math.round((spentHrs / plannedHrs) * 100));
  return `${formatHrs(spentHrs)} of ${formatHrs(plannedHrs)} marked taught — ${pct}%.`;
}

function formatHrs(h: number): string {
  if (!h || h <= 0) return '0h';
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (whole === 0) return `${m}m`;
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
}

/** Counts used by the status overview strip. */
export function getStatusOverview(program: Program, today: Date = new Date()) {
  let chaptersInProgress = 0;
  let chaptersBehind = 0;
  let plannedHrs = 0;
  let spentHrs = 0;

  for (const s of program.subjects) {
    for (const ch of s.chapters) {
      for (const t of ch.topics ?? []) {
        plannedHrs += t.plannedHours;
        if (t.status === 'done') spentHrs += t.plannedHours;
        else if (t.status === 'in-progress') spentHrs += t.plannedHours * 0.5;
      }
      const delta = getScheduleDeltaForChapter(ch, today);
      if (delta.state === 'behind') chaptersBehind += 1;
      // A chapter is "in progress" whenever at least one topic is started but not all done.
      const topics = ch.topics ?? [];
      const hasStarted = topics.some((t) => t.status === 'in-progress' || t.status === 'done');
      const allDone = topics.length > 0 && topics.every((t) => t.status === 'done');
      if (hasStarted && !allDone) chaptersInProgress += 1;
    }
  }

  const pct = plannedHrs > 0 ? Math.min(100, Math.round((spentHrs / plannedHrs) * 100)) : 0;
  return {
    completionPct: pct,
    plannedHrs,
    spentHrs,
    chaptersInProgress,
    chaptersBehind,
  };
}

export const SCHEDULE_STALE_DAYS = STALE_DAYS_THRESHOLD;

export type { TopicStatus };
