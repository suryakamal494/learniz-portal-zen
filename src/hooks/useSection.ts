import { useSyncExternalStore } from 'react';
import {
  CellAllocation,
  CellOccupiedError,
  ChangeLogEntry,
  ChangeLogType,
  Section,
  SectionConfig,
  SlotKey,
  SubjectStatus,
  WindowStatus,
  slotKeyEq,
  subjectStatusKey,
} from '@/types/section';
import { MOCK_SECTIONS } from '@/data/mockSections';


/** Session-only in-memory store mirroring useInstitutePrograms. */

let sections: Section[] = JSON.parse(JSON.stringify(MOCK_SECTIONS));
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSections: () => sections,
};

export function useSections(): Section[] {
  return useSyncExternalStore(store.subscribe, store.getSections, store.getSections);
}

export function useSection(id: string | undefined): Section | undefined {
  const list = useSections();
  return list.find((s) => s.id === id);
}

function updateSection(id: string, mut: (s: Section) => Section) {
  sections = sections.map((s) => (s.id === id ? mut(s) : s));
  emit();
}

export function setSectionName(id: string, name: string) {
  updateSection(id, (s) => ({ ...s, name }));
}

export function setSectionConfig(id: string, config: SectionConfig) {
  updateSection(id, (s) => ({ ...s, config }));
}

export function setSectionFacultyPool(id: string, facultyPool: string[]) {
  updateSection(id, (s) => ({ ...s, facultyPool }));
}

export function setActiveWindow(
  sectionId: string,
  start: string,
  end: string,
) {
  updateSection(sectionId, (s) => {
    const wins = [...s.windows];
    if (wins.length === 0) {
      wins.push({ id: `win-${Date.now()}`, startDate: start, endDate: end });
    } else {
      const last = wins[wins.length - 1];
      wins[wins.length - 1] = { ...last, startDate: start, endDate: end };
    }
    return { ...s, windows: wins };
  });
}

export function setTrackAllotment(
  sectionId: string,
  programId: string,
  subjectId: string,
  trackId: string,
  periods: number,
) {
  updateSection(sectionId, (s) => ({
    ...s,
    programs: s.programs.map((p) =>
      p.id !== programId ? p : {
        ...p,
        subjects: p.subjects.map((su) =>
          su.id !== subjectId ? su : {
            ...su,
            tracks: su.tracks.map((t) =>
              t.id !== trackId ? t : { ...t, allottedPeriods: Math.max(0, Math.round(periods)) },
            ),
          },
        ),
      },
    ),
  }));
}

export function setTrackFaculty(
  sectionId: string,
  programId: string,
  subjectId: string,
  trackId: string,
  facultyId: string,
) {
  updateSection(sectionId, (s) => ({
    ...s,
    programs: s.programs.map((p) =>
      p.id !== programId ? p : {
        ...p,
        subjects: p.subjects.map((su) =>
          su.id !== subjectId ? su : {
            ...su,
            tracks: su.tracks.map((t) => (t.id !== trackId ? t : { ...t, facultyId })),
          },
        ),
      },
    ),
  }));
}

export function addTrack(
  sectionId: string,
  programId: string,
  subjectId: string,
  name: string,
  facultyId: string,
) {
  updateSection(sectionId, (s) => ({
    ...s,
    programs: s.programs.map((p) =>
      p.id !== programId ? p : {
        ...p,
        subjects: p.subjects.map((su) =>
          su.id !== subjectId ? su : {
            ...su,
            tracks: [
              ...su.tracks,
              {
                id: `tr-${subjectId}-${Date.now()}`,
                name,
                facultyId,
                chapterIds: [],
                allottedPeriods: 0,
              },
            ],
          },
        ),
      },
    ),
  }));
}

export function removeTrack(sectionId: string, programId: string, subjectId: string, trackId: string) {
  updateSection(sectionId, (s) => ({
    ...s,
    programs: s.programs.map((p) =>
      p.id !== programId ? p : {
        ...p,
        subjects: p.subjects.map((su) =>
          su.id !== subjectId ? su : {
            ...su,
            tracks: su.tracks.filter((t) => t.id !== trackId),
          },
        ),
      },
    ),
    // also drop any cells that pointed at this track
    cells: s.cells.filter((c) => !(c.allocation.programId === programId
      && c.allocation.subjectId === subjectId
      && c.allocation.trackId === trackId)),
  }));
}

/* ──────────────── Cell allocation (the invariant lives here) ──────────────── */

/**
 * Write an allocation to a slot.
 * @throws CellOccupiedError if the slot is already filled and force=false.
 */
export function setCellAllocation(
  sectionId: string,
  slot: SlotKey,
  allocation: CellAllocation,
  opts: { force?: boolean } = {},
): void {
  const sec = sections.find((s) => s.id === sectionId);
  if (!sec) return;
  const existing = sec.cells.find((c) => slotKeyEq(c, slot));
  if (existing && !opts.force) {
    throw new CellOccupiedError(existing.allocation);
  }
  updateSection(sectionId, (s) => ({
    ...s,
    cells: [
      ...s.cells.filter((c) => !slotKeyEq(c, slot)),
      { ...slot, allocation },
    ],
  }));
}

/** Clear a single cell. */
export function clearCell(sectionId: string, slot: SlotKey): void {
  updateSection(sectionId, (s) => ({
    ...s,
    cells: s.cells.filter((c) => !slotKeyEq(c, slot)),
  }));
}

/**
 * Bulk fill (e.g. "Fill this row with armed allocation"). Skips occupied
 * cells; returns counts so the caller can render a summary toast.
 */
export function fillSlotsSkippingOccupied(
  sectionId: string,
  slots: SlotKey[],
  allocation: CellAllocation,
): { filled: number; skipped: number } {
  const sec = sections.find((s) => s.id === sectionId);
  if (!sec) return { filled: 0, skipped: 0 };
  const occupiedSet = new Set(sec.cells.map((c) => `${c.weekStartDate}|${c.weekday}|${c.periodIndex}`));
  let filled = 0;
  let skipped = 0;
  const next: typeof sec.cells = [...sec.cells];
  for (const slot of slots) {
    const k = `${slot.weekStartDate}|${slot.weekday}|${slot.periodIndex}`;
    if (occupiedSet.has(k)) { skipped += 1; continue; }
    next.push({ ...slot, allocation });
    occupiedSet.add(k);
    filled += 1;
  }
  updateSection(sectionId, (s) => ({ ...s, cells: next }));
  return { filled, skipped };
}

/** Override the per-cell faculty (cell must already exist). */
export function setCellFaculty(sectionId: string, slot: SlotKey, facultyId: string | undefined) {
  updateSection(sectionId, (s) => ({
    ...s,
    cells: s.cells.map((c) =>
      slotKeyEq(c, slot)
        ? { ...c, allocation: { ...c.allocation, facultyId } }
        : c,
    ),
  }));
}

export function setSubjectStatus(
  sectionId: string,
  programId: string,
  subjectId: string,
  status: SubjectStatus,
) {
  updateSection(sectionId, (s) => ({
    ...s,
    subjectStatus: { ...s.subjectStatus, [subjectStatusKey(programId, subjectId)]: status },
  }));
}
