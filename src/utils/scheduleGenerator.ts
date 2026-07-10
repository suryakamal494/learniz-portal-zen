/**
 * Academic schedule generator.
 *
 * Given a section and an academic window, walks every published cell inside
 * the window in chronological order (week → weekday → periodIndex) and stamps
 * a chapter + topic on each cell drawn from the parent track's curriculum
 * queue. Cells flagged `manuallyEdited=true` are preserved as-is.
 *
 * The queue for a track is: for each chapter (filtered by `track.chapterIds`
 * if any, else all subject chapters), enumerate its topics in order, each
 * topic contributing `topic.periods` consecutive slots.
 */

import { AcademicWindow, Section, SectionCell } from '@/types/section';
import { parseISO } from '@/utils/calendarAutomation';
import { listWeekStarts } from '@/utils/sectionUtils';

interface QueueItem {
  chapterId: string;
  chapterName: string;
  topicId: string;
  topicName: string;
  remaining: number;
}

interface TrackProgress {
  scheduled: number;
  planned: number;
  chapters: Record<string, { name: string; planned: number; scheduled: number; startDate?: string; endDate?: string; topics: Record<string, { name: string; planned: number; scheduled: number; startDate?: string; endDate?: string }> }>;
}

export interface GenerateResult {
  cells: SectionCell[];
  stats: {
    totalCells: number;
    stamped: number;
    manualPreserved: number;
    unassigned: number;
    tracks: Record<string, TrackProgress>;
  };
}

function buildQueue(section: Section, programId: string, subjectId: string, trackId: string): QueueItem[] {
  const prog = section.programs.find((p) => p.id === programId);
  const sub = prog?.subjects.find((s) => s.id === subjectId);
  const track = sub?.tracks.find((t) => t.id === trackId);
  if (!sub || !track) return [];
  const chapterIds = track.chapterIds?.length ? new Set(track.chapterIds) : null;
  const items: QueueItem[] = [];
  for (const ch of sub.chapters) {
    if (chapterIds && !chapterIds.has(ch.id)) continue;
    for (const t of ch.topics) {
      const p = Math.max(0, Math.round(t.periods || 0));
      if (p > 0) items.push({ chapterId: ch.id, chapterName: ch.name, topicId: t.id, topicName: t.name, remaining: p });
    }
  }
  return items;
}

/** Anchored date of a cell (used for chronological ordering and date stamps). */
function cellDate(cell: SectionCell): Date {
  const ws = parseISO(cell.weekStartDate);
  // weekday 1=Mon..6=Sat, 0=Sun. Monday is ws + 0 days.
  const dayOffset = cell.weekday === 0 ? 6 : cell.weekday - 1;
  return new Date(ws.getTime() + dayOffset * 24 * 60 * 60 * 1000);
}

export function generateAcademicSchedule(section: Section, window: AcademicWindow): GenerateResult {
  const weekSet = new Set(listWeekStarts(window));
  const inWindow = (c: SectionCell) => weekSet.has(c.weekStartDate);

  // Sort all cells in the window chronologically.
  const windowCells = section.cells
    .filter(inWindow)
    .sort((a, b) => {
      if (a.weekStartDate !== b.weekStartDate) return a.weekStartDate < b.weekStartDate ? -1 : 1;
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.periodIndex - b.periodIndex;
    });

  // Per-track queue.
  const queues: Record<string, QueueItem[]> = {};
  const trackKey = (a: SectionCell['allocation']) => `${a.programId}|${a.subjectId}|${a.trackId}`;
  for (const c of windowCells) {
    const k = trackKey(c.allocation);
    if (!queues[k]) queues[k] = buildQueue(section, c.allocation.programId, c.allocation.subjectId, c.allocation.trackId);
  }

  const stats: GenerateResult['stats'] = {
    totalCells: windowCells.length,
    stamped: 0,
    manualPreserved: 0,
    unassigned: 0,
    tracks: {},
  };

  const trackProgress = (k: string): TrackProgress => {
    if (!stats.tracks[k]) stats.tracks[k] = { scheduled: 0, planned: 0, chapters: {} };
    return stats.tracks[k];
  };

  // Pre-compute planned totals per track from its full queue.
  for (const [k, q] of Object.entries(queues)) {
    const tp = trackProgress(k);
    tp.planned = q.reduce((a, x) => a + x.remaining, 0);
    for (const item of q) {
      const ch = tp.chapters[item.chapterId] ??= { name: item.chapterName, planned: 0, scheduled: 0, topics: {} };
      ch.planned += item.remaining;
      const to = ch.topics[item.topicId] ??= { name: item.topicName, planned: 0, scheduled: 0 };
      to.planned += item.remaining;
    }
  }

  // Update cells in place: preserve manuallyEdited, else pull next queue item.
  const updatedById = new Map<string, SectionCell>();
  const cellId = (c: SectionCell) => `${c.weekStartDate}|${c.weekday}|${c.periodIndex}`;

  for (const c of windowCells) {
    const k = trackKey(c.allocation);
    const tp = trackProgress(k);
    if (c.manuallyEdited && c.allocation.chapterId) {
      stats.manualPreserved += 1;
      tp.scheduled += 1;
      const ch = tp.chapters[c.allocation.chapterId];
      if (ch) {
        ch.scheduled += 1;
        const iso = cellDate(c).toISOString().slice(0, 10);
        ch.startDate = ch.startDate && ch.startDate < iso ? ch.startDate : iso;
        ch.endDate = ch.endDate && ch.endDate > iso ? ch.endDate : iso;
        if (c.allocation.topicId) {
          const to = ch.topics[c.allocation.topicId];
          if (to) {
            to.scheduled += 1;
            to.startDate = to.startDate && to.startDate < iso ? to.startDate : iso;
            to.endDate = to.endDate && to.endDate > iso ? to.endDate : iso;
          }
        }
      }
      updatedById.set(cellId(c), c);
      continue;
    }
    const q = queues[k];
    const next = q?.[0];
    if (!next) {
      stats.unassigned += 1;
      const cleared: SectionCell = {
        ...c,
        allocation: { programId: c.allocation.programId, subjectId: c.allocation.subjectId, trackId: c.allocation.trackId, facultyId: c.allocation.facultyId },
      };
      updatedById.set(cellId(c), cleared);
      continue;
    }
    const stamped: SectionCell = {
      ...c,
      manuallyEdited: false,
      allocation: {
        ...c.allocation,
        chapterId: next.chapterId,
        chapterName: next.chapterName,
        topicId: next.topicId,
        topicName: next.topicName,
      },
    };
    updatedById.set(cellId(c), stamped);
    stats.stamped += 1;

    // Progress bookkeeping.
    tp.scheduled += 1;
    const ch = tp.chapters[next.chapterId];
    if (ch) {
      ch.scheduled += 1;
      const iso = cellDate(c).toISOString().slice(0, 10);
      ch.startDate = ch.startDate && ch.startDate < iso ? ch.startDate : iso;
      ch.endDate = ch.endDate && ch.endDate > iso ? ch.endDate : iso;
      const to = ch.topics[next.topicId];
      if (to) {
        to.scheduled += 1;
        to.startDate = to.startDate && to.startDate < iso ? to.startDate : iso;
        to.endDate = to.endDate && to.endDate > iso ? to.endDate : iso;
      }
    }

    next.remaining -= 1;
    if (next.remaining <= 0) q.shift();
  }

  // Merge back: cells outside the window stay untouched.
  const merged: SectionCell[] = section.cells.map((c) => {
    if (!inWindow(c)) return c;
    return updatedById.get(`${c.weekStartDate}|${c.weekday}|${c.periodIndex}`) ?? c;
  });

  return { cells: merged, stats };
}

/** Convenience — does any cell in the window already carry chapter metadata? */
export function windowHasGeneratedContent(section: Section, window: AcademicWindow): boolean {
  const weekSet = new Set(listWeekStarts(window));
  return section.cells.some((c) => weekSet.has(c.weekStartDate) && !!c.allocation.chapterId);
}
