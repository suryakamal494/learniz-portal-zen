
## Goal

Fix the section workspace so multiple programs (e.g. CBSE + JEE) are managed **inside** the Period Allocation step via a Program Switcher — not as stacked cards. The current step renders every program at once; the user wants only one program in focus at a time, exactly like the Academic Window switcher pattern.

Scope is presentational only — `useSection` already keys all writes by `programId`, so no store changes.

## Changes

### 1. `src/components/institute/sections/SectionAllocationStep.tsx`

- Add a local `activeProgramId` state, defaulted to `section.programs[0].id`.
- Above the "Allot periods to each subject" block (and below the existing Budget strip), add a **Program Switcher** card with the same visual language as `AcademicWindowSwitcher`:
  - Header: `PROGRAMS · each program manages its own tracks & periods within the section budget`.
  - Pills, one per `section.programs[]`. Each pill shows: program `code` (bold), program `name` (smaller), and a tabular `{N} periods` chip computed from that program's track allotments.
  - Active pill: indigo solid with check icon; others: white with slate border. Pulse ring on switch (mirror existing AcademicWindowSwitcher animation).
  - Below pills, a one-line summary of the active program: `{subjects} subjects · {tracks} tracks · {allocated}/{programBudgetShare or "budget shared"} periods`.
- Render **only the active program's** `ProgramAllocationBlock` underneath (drop the `.map` over all programs, drop the per-block accordion chevron since there is no longer a stack — keep `SubjectRow` and `AddTrackButton` unchanged).
- Hidden-but-present programs keep their data intact in the store; switching back restores them instantly. Add a small `{N} more program(s) hidden — switch above` hint when `section.programs.length > 1`, only on the active program's footer.
- The section-level Budget strip stays as the single source of truth (budget is shared across all programs in the section, which is the documented invariant). Add a sentence under the strip: `Budget is shared across all programs in this section.`

### 2. `src/components/institute/sections/SectionTimetableStep.tsx`

Adjust the cell chip and tooltip so the program label is conditional, per the user's rule "if multiple programs enabled → subject+track+program, otherwise subject+track or subject":

- Compute `showProgram = section.programs.length > 1` once.
- In the rendered cell (around line 402 and 420) wrap the `{program.code}` chip / row in `{showProgram && …}`.
- In the armed-label banner (line 149), conditionally render `program.code · ` prefix only when `showProgram`.
- Track-name chip drops when the subject has only a single track (`subject.tracks.length > 1`); when it's the lone track, show subject only.
- Palette grouping (the program-grouped track palette around line 295) stays as-is — multi-program sections still need it. For single-program sections, hide the program header row to reduce visual noise.

### 3. No type or store changes

`useSection.ts`, `Section`, `SectionProgram`, `SectionCell` already model exactly this. No migrations needed.

## Visual reference (allocation step after change)

```text
┌─ Budget strip (Budget · Allocated · Remaining · Working days) ──────────────┐
│ Budget is shared across all programs in this section.                       │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ PROGRAMS · each program manages its own tracks & periods ──────────────────┐
│  [✓ CBSE  Class 12 CBSE   120 periods]   [ JEE  JEE Advanced   91 periods ] │
│  6 subjects · 9 tracks · 120 periods allocated                              │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ Allot periods to each subject (CBSE) ──────────────────────────────────────┐
│  Physics ▸  Chemistry ▸  Maths ▸  …                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Files touched

- `src/components/institute/sections/SectionAllocationStep.tsx` (add switcher; render only active program)
- `src/components/institute/sections/SectionTimetableStep.tsx` (conditional program/track labels)

No backend, no type, no route, no data changes.
