import { ChapterProgress, Program, ProgramSubject, SubjectSummary } from '@/types/program';
import { getProgramByBatchId } from '@/data/mockPrograms';

export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function toneForPct(pct: number): 'green' | 'amber' | 'red' {
  if (pct >= 70) return 'green';
  if (pct >= 40) return 'amber';
  return 'red';
}

function computeSubjectPct(subject: ProgramSubject): { pct: number; chapters: number; lessons: number } {
  let planned = 0;
  let spent = 0;
  let lessons = 0;
  for (const ch of subject.chapters) {
    for (const lp of ch.lessonPlans) {
      planned += lp.hoursPlanned;
      spent += lp.hoursSpent;
      lessons += 1;
    }
  }
  const pct = planned > 0 ? Math.round((spent / planned) * 100) : 0;
  return { pct: Math.min(100, pct), chapters: subject.chapters.length, lessons };
}

export function getProgramSummary(batchId: string) {
  const program = getProgramByBatchId(batchId);
  if (!program) return null;

  const subjects: SubjectSummary[] = program.subjects.map((s) => {
    const { pct, chapters, lessons } = computeSubjectPct(s);
    return {
      subjectId: s.id,
      subjectName: s.name,
      completionPct: pct,
      chaptersCount: chapters,
      lessonPlansCount: lessons,
    };
  });

  const overallPct =
    subjects.length === 0
      ? 0
      : Math.round(subjects.reduce((a, b) => a + b.completionPct, 0) / subjects.length);

  return {
    programId: program.id,
    batchId,
    overallPct,
    subjects,
  };
}

export function getChapterProgressList(program: Program, subjectId: string): ChapterProgress[] {
  const subject = program.subjects.find((s) => s.id === subjectId);
  if (!subject) return [];
  return subject.chapters.map((ch) => {
    let planned = 0;
    let spent = 0;
    let completed = 0;
    let partial = 0;
    let lastDate: string | undefined;
    for (const lp of ch.lessonPlans) {
      planned += lp.hoursPlanned;
      spent += lp.hoursSpent;
      if (lp.status === 'completed') completed += 1;
      if (lp.status === 'partial') partial += 1;
      if (lp.lastTaughtDate && (!lastDate || lp.lastTaughtDate > lastDate)) {
        lastDate = lp.lastTaughtDate;
      }
    }
    const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
    return {
      chapterId: ch.id,
      chapterName: ch.name,
      completionPct: pct,
      totalLessonPlans: ch.lessonPlans.length,
      completedLessonPlans: completed,
      partialLessonPlans: partial,
      hoursPlanned: planned,
      hoursSpent: spent,
      lastTaughtDate: lastDate,
    };
  });
}

export function getProgressOverview(batchId: string) {
  const program = getProgramByBatchId(batchId);
  if (!program) return null;
  let planned = 0;
  let spent = 0;
  let completed = 0;
  let partial = 0;
  let notStarted = 0;
  for (const s of program.subjects) {
    for (const ch of s.chapters) {
      for (const lp of ch.lessonPlans) {
        planned += lp.hoursPlanned;
        spent += lp.hoursSpent;
        if (lp.status === 'completed') completed += 1;
        else if (lp.status === 'partial') partial += 1;
        else notStarted += 1;
      }
    }
  }
  return {
    overallPct: planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0,
    hoursPlanned: planned,
    hoursSpent: spent,
    completedLessons: completed,
    partialLessons: partial,
    notStartedLessons: notStarted,
    totalLessons: completed + partial + notStarted,
  };
}

export function meaningFromPct(pct: number, label = 'this subject'): string {
  if (pct >= 70) return `On track in ${label} — keep the current pace.`;
  if (pct >= 40) return `Moderate progress in ${label} — pick up the pace this week.`;
  if (pct > 0) return `${label} is falling behind — prioritise the next few sessions.`;
  return `Not started in ${label} yet — plan the first session soon.`;
}
