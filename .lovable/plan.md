## Goal

Create a single, comprehensive markdown documentation file for the **Institute → Sections** scheduling workspace (the 4-step flow: Setup → Period Allocation → Weekly Timetable → Preview). It will be shareable with the development team and cover behavior, data model, calculations, edge cases, and resolutions.

## Deliverable

**New file:** `docs/SECTIONS_UI.md` (~1,200–1,800 lines of structured Markdown, no code changes anywhere else).

I'll source content directly from the live implementation:
- `src/pages/institute/sections/SectionSchedulePage.tsx` (shell + stepper + budget strip)
- `src/components/institute/sections/SectionSetupStep.tsx`
- `src/components/institute/sections/SectionAllocationStep.tsx`
- `src/components/institute/sections/SectionTimetableStep.tsx`
- `src/components/institute/sections/SectionPreviewStep.tsx`
- `src/hooks/useSection.ts` (store + mutations + invariants)
- `src/types/section.ts` (data model, `CellOccupiedError`, slot uniqueness rule)
- `src/utils/sectionUtils.ts` + `src/utils/calendarAutomation.ts` (capacity & working-day math)
- `src/pages/institute/programs/InstituteHolidaysPage.tsx` + `useInstituteHolidays` (holiday source-of-truth)

## Documentation Outline

### 1. Overview
- What a "Section" is, terminology mapping (Programs vs Sections vs Sub-programs CBSE/JEE, Tracks T1/T2).
- The 4-step flow at a glance; **free navigation** — any step is clickable, no enforced order.
- Where the page lives (`/institute/sections/:sectionId/schedule`).

### 2. Shared chrome
- Sticky stepper (Setup → Allocation → Timetable → Preview); active/done/pending states.
- Section title + `formatRange(activeWindow)` badge.
- **Budget strip** (visible from Step 2 onward): Budget vs Allocated vs Remaining/Over + % bar; color rules (rose over, emerald exact, indigo under).
- Auto-save indicator.

### 3. Data model (single source of truth)
- `Section`, `SectionProgram`, `SectionSubject`, `SectionTrack`, `SectionChapter`, `SectionTopic`.
- `AcademicWindow[]` — last entry is the editable one; older = `locked`.
- `SectionConfig` (workingDays, periodsPerDay, periodLengthMins, periodOverrides, dayStartTime, breaks, holidays).
- `SectionCell` keyed by `(weekStartDate, weekday, periodIndex)` — **uniqueness invariant**.
- `subjectStatus: 'draft' | 'locked' | 'published'`.

### 4. Step 1 — Setup
For each control: what it does → how it's stored → edge cases → resolution.
- **Section name** — free text; empty string allowed in store but warned in UI.
- **Academic start / end** — writes to `activeWindow`; if `end < start`, capacity = 0 days (handled by `buildWorkingDays`). Resolution: inline warning + disable Next.
- **Working days** — M/T/W/T/F/S/S toggles; at least one required (edge: zero days → capacity 0).
- **Periods/day** (1–12), **Period length** (15–120m), **Day starts** (HH:mm).
- **Faculty pool** — drawn from institute roster; selections persist as `section.facultyPool`; downstream filters Step 2 dropdowns.
- **Capacity panel** (right rail): Working days, Periods/day, Total budget = `workingDays × periodsPerDay`. Programs list and Breaks summary.
- **Edge cases**: end < start, all working days unchecked, periodsPerDay = 0, breaks overlap, faculty pool empty.

### 5. Where holidays come from
- **Institute-wide holidays** live in `/institute/programs/holidays` (`InstituteHolidaysPage`), surfaced via `useInstituteHolidays()`.
- **Section-only holidays** live in `section.config.holidays`.
- `computeSectionCapacity` merges both sets via `holidaySet`.
- Resolution rules when an institute holiday is later removed/added (capacity recomputes; placed cells on that date become "off-day" overlays in Preview).

### 6. Academic windows & "Previously covered up to"
- Multiple windows allowed; only the **last (active)** window is editable; previous windows are read-only snapshots.
- "Previously covered up to" = sum of topic-period progress drawn from prior windows' published cells. Updates automatically when a new window is opened.
- Edge: opening a new window with overlapping dates → reject in `setActiveWindow`; resolution: shift start to previous end + 1.

### 7. Step 2 — Period Allocation
- **Per-program → per-subject → per-track** budgeting.
- **Tracks**: how chapters group into tracks (`SectionTrack.chapterIds`); empty = all chapters in subject.
- Faculty per track (filtered by Step 1 pool).
- `allottedPeriods` per track rolls up to subject → program → section.
- **Budget math**: `Σ track.allottedPeriods` must ≤ `cap.totalPeriods`. Over-allocation tinted rose in budget strip but **not blocked** (so users can reshuffle).
- **Subject status**: draft → locked → published. Locked subjects are read-only here.
- **Edge cases**: over-allocation, zero-allotment track, faculty unassigned, track with no chapters (excluded from Timetable palette).

### 8. Step 3 — Weekly Timetable
- Recurring weekly grid (weekday × periodIndex); painted with `(programId, subjectId, trackId)` allocations.
- **One cell = one allocation** invariant (`SectionCell` uniqueness on `SlotKey`); `CellOccupiedError` is thrown unless `force: true`.
- Cell chips: program code (CBSE/JEE), subject color, track label (T1/T2). Show track chip whenever a track exists.
- **Drag-to-swap** between painted cells; swap preserves `locked: true` on both.
- Palette filtered by Step 1 faculty pool + Step 2 enabled tracks; tracks with 0 allotted periods are hidden.
- Multiple weeks supported when sub-program slices change across weeks.
- **Edge cases**:
  - Painting onto an occupied cell → `CellOccupiedError`. Resolution: prompt "Replace?" or use drag-swap.
  - Faculty double-booking across programs in the same slot → highlighted amber, soft-warn.
  - Cells on holiday dates → visually struck through, not deleted.
  - Resizing periods/day from Step 1 after painting → cells past new `periodsPerDay` are quarantined (kept in store, hidden in grid, restored if user expands again).

### 9. Step 4 — Preview
- Resolves the recurring weekly template against the academic window → concrete dated `ScheduleSlot[]` via `generateFromTimetable`.
- Month / week views, color-coded by subject; CBSE/JEE chip and T1/T2 chip rendered.
- Holidays appear as off-day overlays; locked slots survive regeneration.
- Drag-to-swap in week view (marks both slots `locked: true`).
- **Edge cases**: regeneration after Step 2/3 edits preserves user-locked cells, recomputes the rest; preview empty if Allocation = 0; off-days outnumber working days → empty preview with hint.

### 10. Calculations reference
- `totalPeriods = workingDays × periodsPerDay`
- `workingDays = buildWorkingDays(start, end, workingDays, holidaySet).length`
- `weeks = ceil(workingDays / workingDays.length)`
- Per-period times computed via `computePeriodTimes(dayStartTime, periodLengthMins, breaks, periodOverrides)`.
- Allocation %: `min(100, round(allocated/budget × 100))`; over = `allocated − budget`.

### 11. Free-navigation rules
- Stepper allows jumping to any step at any time; nothing is gated.
- Each step renders best-effort given current state (Allocation empty? Timetable shows palette but disables paint; Preview shows hint).

### 12. Cross-step side effects (matrix)
A table mapping: change in Step X → effect in Steps Y/Z + auto-recompute behavior.

### 13. Edge-case catalog (consolidated)
Single table: scenario → where it manifests → user-facing symptom → resolution / store behavior.

### 14. Glossary
Terms reused project-wide: Section, Program, Sub-program (CBSE/JEE), Track (T1/T2), Window, Cell, Slot, Allotted periods, Budget, Allocation, Faculty pool.

### 15. File map
Quick pointer table from concept → source file/line region for the dev team.

## Out of scope
- No code changes.
- No screenshots (text-only doc); ASCII diagrams where helpful (stepper, grid cell anatomy).
- Doc lives under `docs/` and is plain Markdown so it can be shared as-is or pasted into Notion/Confluence.
