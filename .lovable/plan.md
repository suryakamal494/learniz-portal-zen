
## Problem

Today each sub-program (CBSE, JEE Mains) has its own isolated slice that includes its own `weeklyTimetable`. When you switch sub-programs in Period Allocation, the timetable swaps too — so only the active sub-program's tracks appear in the timetable palette (e.g. only CBSE Physics T1, T2 OR only JEE Physics T1, never together).

Expected: the weekly timetable is one shared grid for the section. The palette must show every track from every sub-program at once, prefixed by the sub-program (e.g. "CBSE · Physics T1", "CBSE · Physics T2", "JEE Mains · Physics T1"), and each painted cell remembers which sub-program it belongs to.

## Plan

### 1. Data model — share the timetable, keep allocation sliced
- `SubProgramSlice` keeps its own `subjectTargetPeriods`, `subjectTracks`, `trackTargetPeriods`, `subjectLocks` (allocation is per sub-program — correct today).
- Remove `weeklyTimetable` from `SubProgramSlice`. The single `config.weeklyTimetable` becomes the shared grid for the whole section.
- Extend `WeeklyTimetableCell` with `subProgramId: string` so each painted cell carries its origin. Tracks `trk-…` are already unique per sub-program because they live inside per-sub-program `subjectTracks`.

### 2. Hook — stop swapping the timetable on switch
- `switchSubProgram` (`useInstitutePrograms.ts`): marshal only allocation fields into the outgoing slice and hydrate only allocation fields from the incoming slice. Leave `config.weeklyTimetable` untouched across switches.
- `sliceFromSubProgramConfig` / `emptySlice`: drop `weeklyTimetable`.

### 3. Palette — merge tracks across all sub-programs
- `PeriodAllocationWorkspace` passes `program.subPrograms` and `program.subProgramSlices` into `WeeklyTimetableBuilder` (or precomputes a merged track list and passes that).
- `WeeklyTimetableBuilder` builds `allocationOptions` by iterating every sub-program's slice (`subjectTracks`, `subjectTargetPeriods`, `trackTargetPeriods`) plus the active flat config for the currently-edited sub-program. Each option carries `{subProgramId, subProgramCode, subjectId, subjectName, subjectColor, trackId, trackName, target, facultyId}`.
- Palette pills render as `[color dot] Subject  [SubProgramCode · TrackName]  placed/target` so CBSE Physics T1, CBSE Physics T2, JEE Mains Physics T1 all coexist.
- When a program has no sub-programs (or just one), behavior is unchanged — palette shows the existing flat tracks without a sub-program chip.

### 4. Painting & rendering cells
- `armCell` and `setCellSubject` also persist `subProgramId` from the armed option onto the cell.
- Cell rendering reads `cell.subProgramId`, looks up the sub-program (code + color) and the track from that sub-program's slice, and renders the sub-program code chip above the subject + track when the program has 2+ sub-programs (already the rule we set previously).
- "Fill row" / "Plan this day" carry `subProgramId` through alongside `subjectId` / `trackId`.

### 5. Placed counts & validation
- `placedByTrack` keys on `trackId` (already unique across sub-programs since track ids are namespaced inside each slice). No collision risk.
- Capacity strip / unused-capacity math in `PeriodAllocationWorkspace` continues to use the active slice only (per sub-program allocation). The shared timetable's placed counts compare against each track's own target.

### 6. Mock data migration
- `mockInstitutePrograms.ts`: remove the per-slice `weeklyTimetable` seeds (or keep one shared seed at the top level). Existing prog-1 keeps CBSE + JEE Advanced sub-programs.

### 7. Cleanup
- Drop unused imports for `WeeklyTimetable` inside the slice type.
- No new routes. No UI removed from the period allocation card.

## Files to touch

- `src/types/instituteProgram.ts` — slice no longer carries `weeklyTimetable`; cell gets `subProgramId`.
- `src/hooks/useInstitutePrograms.ts` — `switchSubProgram`, `sliceFromSubProgramConfig`, `emptySlice` updated.
- `src/data/mockInstitutePrograms.ts` — drop per-slice timetable seeds.
- `src/components/institute/programs/PeriodAllocationWorkspace.tsx` — pass sub-program context into the builder.
- `src/components/institute/programs/WeeklyTimetableBuilder.tsx` — merged palette, sub-program-aware painting & cell rendering, fill-row / plan-day carry `subProgramId`.

## Out of scope

- Conflict detection across sub-programs sharing a slot (a future enhancement — say, warning if CBSE Physics T1 and JEE Physics T1 land on the same Mon P3 with the same faculty).
- Changing the look of the sub-program switcher itself.
