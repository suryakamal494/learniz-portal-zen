
## Goal

Two scoped changes — no other UI moves:

1. Delete the "Section workspace · shared period pool" promo card on the Programs list page (you don't want this entry).
2. On the existing section page (`/institute/programs/:programId/schedule`, the one in your screenshot), add the **Program Switcher** inside Step 2 — Period Allocation. Sub-programs (CBSE, JEE, …) live INSIDE each section/program and each carries its own subject targets, tracks and chapter splits. Timetable cells show the sub-program code only when there are 2+ sub-programs.

## Changes

### 1. Remove the section workspace promo card

`src/pages/institute/programs/ProgramsListPage.tsx` — delete the block guarded by `multiProgramSections.length > 0` (lines ~89–115 today, header "Section workspace · shared period pool"). Drop the now-unused `useSections` import. The individual section cards (Class 12 PCM, Class 11 PCM…) stay untouched.

The standalone `/institute/sections/:id/schedule` route + `SectionSchedulePage.tsx` are left in place, just no longer linked from the list — per your "delete only the card" instruction.

### 2. Add Sub-Program layer to `InstituteProgram`

`src/types/instituteProgram.ts` — add:

```ts
export interface SubProgram {
  id: string;     // e.g. 'sp-cbse'
  code: string;   // 'CBSE' — shown on switcher pill & timetable chip
  name: string;   // 'CBSE Class 12'
  color?: string; // optional accent
}

export interface InstituteProgram {
  ...
  /** Sub-programs (CBSE, JEE, NEET, …) that share this section's grid. */
  subPrograms?: SubProgram[];
  /** Which sub-program is currently being edited. */
  activeSubProgramId?: string;
}

export interface ScheduleConfig {
  ...
  /** Per-sub-program allocation slices. Key = subProgramId. */
  subProgramSlices?: Record<string, {
    subjectTargetPeriods: Record<string, number>;
    subjectTracks: Record<string, ScheduleTrack[]>;
    trackTargetPeriods: Record<string, number>;
    subjectLocks: Record<string, boolean>;
  }>;
  /** Mirrored from the active slice for backward compat. */
  activeSubProgramId?: string;
}
```

The flat `subjectTargetPeriods` / `subjectTracks` / `trackTargetPeriods` / `subjectLocks` keep working — they always mirror the active sub-program's slice (same pattern as the existing window swap in `useInstitutePrograms.ts`).

### 3. Mock CBSE + JEE inside `prog-1`

`src/data/mockInstitutePrograms.ts` — add to `prog-1` (Class 12 PCM):

```ts
subPrograms: [
  { id: 'sp-cbse', code: 'CBSE', name: 'CBSE Class 12',  color: 'blue'   },
  { id: 'sp-jee',  code: 'JEE',  name: 'JEE Advanced',   color: 'violet' },
],
activeSubProgramId: 'sp-cbse',
```

Other programs (prog-2, prog-3) keep a single implicit sub-program — switcher hides when `subPrograms.length <= 1`.

### 4. Sub-program swap helpers

`src/hooks/useInstitutePrograms.ts` — mirror the window-swap helpers:

- `ensureSubPrograms(program)` — guarantees at least one sub-program; wraps current flat slice into "Default" if none.
- `switchActiveSubProgram(programId, subProgramId)` — persists current flat slice into the outgoing sub-program's `subProgramSlices` entry, then hydrates the flat fields from the incoming entry. Re-emits.
- All existing setters (`setSchedule`, target/track mutations done via PeriodAllocationWorkspace's `onConfigChange`) continue writing to the flat fields — `switchActiveSubProgram` is the only place that moves data into the slice store.

### 5. Wire the switcher into `PeriodAllocationWorkspace`

`src/components/institute/programs/PeriodAllocationWorkspace.tsx`:

- Take `program` (already in props) and read `program.subPrograms`.
- When `subPrograms.length > 1`, render a sticky **Program Switcher** card directly above the "Allot periods to each subject" panel (matches the placement & visual language used in `SectionAllocationStep` — indigo pill row, code + name, periods-allocated chip, pulse on switch).
- Clicking a pill calls `switchActiveSubProgram(program.id, sp.id)`. The component then re-renders with the new sub-program's `subjectTargetPeriods` / `subjectTracks` already mirrored into `config`.
- A single sub-program (or none defined) renders nothing — page looks identical to today.

### 6. Conditional sub-program label on Weekly Timetable

`src/components/institute/programs/WeeklyTimetableBuilder.tsx`:

- Compute `showSubProgram = (program.subPrograms?.length ?? 0) > 1`.
- When painting / rendering a cell, look up the sub-program from the cell's stored `subProgramId` (new optional field on `WeeklyTimetableCell`, defaulted to `activeSubProgramId` at write time). When `showSubProgram` is true, render `<chip>{subProgram.code}</chip>` above the subject name; otherwise show subject only (and track when the subject has 2+ tracks).
- `WeeklyTimetableCell` in `src/types/instituteProgram.ts` gains `subProgramId?: string`.

### 7. Cell-write call sites

Wherever a `WeeklyTimetableCell` is written today (timetable builder click/drag handlers), stamp the current `activeSubProgramId` onto the cell. Cells without `subProgramId` (legacy) display as if they belong to the active sub-program.

## Files touched

- `src/pages/institute/programs/ProgramsListPage.tsx` (delete the promo card)
- `src/types/instituteProgram.ts` (`SubProgram`, slices, optional cell `subProgramId`)
- `src/data/mockInstitutePrograms.ts` (seed CBSE + JEE on prog-1)
- `src/hooks/useInstitutePrograms.ts` (`ensureSubPrograms`, `switchActiveSubProgram`, slice marshalling)
- `src/components/institute/programs/PeriodAllocationWorkspace.tsx` (render switcher; everything else is driven by the mirrored flat slice)
- `src/components/institute/programs/WeeklyTimetableBuilder.tsx` (conditional sub-program chip; stamp `subProgramId` on writes)

No new routes. No data loss for programs without sub-programs. The `SectionSchedulePage` and `useSection` store are untouched.

## Visual reference (Period Allocation, after change)

```text
┌─ ACADEMIC WINDOW [Term 1 · Foundation] [Term 2] [Term 3] ───────────────────┐
└──────────────────────────────────────────────────────────────────────────────┘
   Setup ─── (2) Period Allocation ─── 3 Weekly Timetable ─── 4 Preview

┌─ Working 119 · Available 714 · Allocated 211/714 · Remaining 503 ───────────┐
└──────────────────────────────────────────────────────────────────────────────┘

┌─ PROGRAMS · each sub-program owns its tracks & period split ────────────────┐
│  [ ✓ CBSE  CBSE Class 12  120p ]   [  JEE   JEE Advanced   91p ]            │
│  CBSE active · 7 subjects · 9 tracks · 120 periods allocated                │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Allot periods to each subject (CBSE) ──────────────────────────────────────┐
│  Physics 40   Chemistry 35   Maths 50   Biology 30   …                       │
└──────────────────────────────────────────────────────────────────────────────┘
```
