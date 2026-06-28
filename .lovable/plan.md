## Plan

Three connected changes: show full slot identity (subject + track + sub-program) in the generated timetable/preview, seed the mock so multi-track + multi-sub-program is visible out of the box, and add drag-to-swap on the grids in Step 3 and Step 4.

### 1. Slot model — carry sub-program
- `src/types/instituteProgram.ts`: add optional `subProgramId?: string | null` to `ScheduleSlot` (already has `trackId`).
- `src/utils/calendarAutomation.ts` (`generateFromTimetable`): pull `subProgramId` from the cell and persist it on the slot. Locked-preserve path keeps existing value.

### 2. Mock seed — visible multi-track & multi-sub-program
File: `src/data/mockInstitutePrograms.ts` (prog-1 / Class 12 PCM only).
- Add CBSE slice (mirrored into flat fields, since `activeSubProgramId = sp-cbse`):
  - `subjectTracks`: Physics → T1 + T2 (two batches), Mathematics → Algebra + Calculus, Chemistry/Biology/English/Hindi/Social → T1.
  - `subjectTargetPeriods` + `trackTargetPeriods` populated for those tracks.
- Add `subProgramSlices['sp-jee']` for JEE Advanced: only Physics (T1) + Mathematics (T1) with periods > 0; other subjects either 0 or missing so they don't appear in palette.
- Rewrite `PCM_WEEKLY_TIMETABLE` cells so they include both `trackId` and `subProgramId`, mixing CBSE T1, CBSE T2, JEE T1 across the week — e.g. P1 Mon = CBSE Physics T1, P1 Thu = JEE Physics T1, P2 Tue = CBSE Math Algebra, P2 Fri = JEE Math T1, etc. Other subjects remain CBSE T1.

### 3. Show track + sub-program chips on Step 3/Step 4 slot cards
File: `src/pages/institute/programs/ProgramSchedulePage.tsx` — `Step3Cell`.
- Accept (or look up via program) the per-slice `subjectTracks` and `subPrograms` so the cell can resolve the slot's track name and sub-program code regardless of which slice it belongs to.
- Above the subject name, render:
  - Sub-program code chip (indigo) when program has 2+ sub-programs.
  - Track chip (e.g. `T1`, `T2`, `Algebra`) when the subject has 2+ enabled tracks in that slot's slice.
- Cells already painted with only `subjectId` (no track / sub-program) keep working with sensible defaults (active sub-program, first track).

### 4. Drag-to-swap on the grids
Use native HTML5 drag-and-drop (no new dep). On a successful drop:
- Both cells occupied → swap their `(subjectId, trackId, facultyId, subProgramId)` (Step 3 builder) or `(subjectId, trackId, facultyId, subProgramId, chapterId, topicId)` (Step 4 preview). Both cells mark `locked: true` in Step 4.
- Target empty → move source to target; clear source.
- Source empty → no-op.
- Visual: dragging cursor + ring on hover target; toast confirmation with single-level undo (reuses existing `snapshotAndWrite` in the builder; Step 4 mirrors via a local snapshot before mutating).

**Step 3 — `WeeklyTimetableBuilder.tsx`:** add `draggable`, `onDragStart/Over/Drop` handlers on the painted-cell buttons, encoding `{weekday, periodIndex}` in the drag dataset. Swap helper mutates `tt.cells` and routes through `snapshotAndWrite`. Painting (armed click) still works alongside drag.

**Step 4 — `Step3TimetableView`:** wrap `Step3Cell` in a draggable container that carries the slot id; swap helper mutates `slots[]` via `onChangeSlots`, marking both swapped slots as `locked`. Skip drag in the month view (per-day sheet uses the same `Step3Cell` editor, so no drag needed there).

## Files touched

- `src/types/instituteProgram.ts` — add `subProgramId` to `ScheduleSlot`.
- `src/utils/calendarAutomation.ts` — propagate `subProgramId` into generated slots.
- `src/data/mockInstitutePrograms.ts` — seed tracks, JEE slice, and a mixed CBSE/JEE timetable for prog-1.
- `src/pages/institute/programs/ProgramSchedulePage.tsx` — chips on `Step3Cell`; drag-to-swap on Step 4 week view.
- `src/components/institute/programs/WeeklyTimetableBuilder.tsx` — drag-to-swap on Step 3 grid.

## Out of scope

- Drag across weeks/days into the month-view grid.
- Cross-program / cross-section swaps.
- Conflict detection (e.g. faculty double-booking across sub-programs).
