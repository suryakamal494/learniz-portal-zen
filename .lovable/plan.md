
## What's wrong today

The Schedule Workspace's **Weekly Timetable** tab embeds `SectionTimetableStep` — a stripped-down section-scoped builder that lost most of the features from the original `WeeklyTimetableBuilder` shown in your screenshot. Specifically it is missing:

| Feature in screenshot | Current workspace |
|---|---|
| W1–W20 week chip bar with ✓ marks + progress bar (`36/36 cells filled`) | Missing — only plain "Week N" buttons |
| **Compact palette cards** (Physics · CBSE · T1) in a 4-up grid, "0 / 40 placed" | Vertical program groups with big rows, grouped under program header (bad per your feedback) |
| **Column tool** on each day header ("plan Monday") — dropdown to plan the whole day with an ordered subject list, overwrite/repeat toggles | Missing — only a single "Fill row" action |
| **Row tool** on each period ("fill this period across the week" with a subject/faculty picker) | Missing — only a plain "fill col" text link |
| **Copy this week to…** (next / next 4 / remaining / all) | Missing |
| **Clear this week** | Missing |
| **Undo toast** after bulk actions | Missing |
| Drag-to-swap cells | Missing on section builder |
| Faculty inline selector under each filled cell | Present as popover only |

Mock data problems:
- Only **6 periods/day** (you asked for 7).
- Only **2 sections** seeded (`Class 11 Morning`, `Class 11 Evening`) — you asked for 4–5.
- **No mock academic schedule** — the Academic Schedule tab has nothing to show a demoable dated schedule.
- Palette groups subjects by program which duplicates the program chip — you want the flat model: `Physics CBSE T1`, `Physics JEE T1`, no per-program accordion.

## Plan

### 1. Rebuild `SectionTimetableStep` to mirror the screenshot's UX

Rewrite the timetable step used by `TimetableWorkspaceTab` so it matches the original builder's affordances, but on the section data model (`SectionCell` / `CellAllocation`). Keep the "one cell = one allocation" invariant and the existing publish/change-log wiring.

New layout, top → bottom:

```text
┌ Weekly timetable ──────────────────────  Week 1 of 20 · starts 2026-07-01  ← → ┐
│                                                                                │
│ [W1✓][W2✓][W3✓]…[W20]     ← horizontal chip bar, ✓ when any cell filled       │
│ ▓▓▓▓▓▓▓▓░░░░░░  36 / 42 cells filled     [Copy this week to…] [Clear week] […]│
│                                                                                │
│ ┌ Subject / track palette ─────────────────────────────────────────────┐       │
│ │  Physics    CBSE  T1     Chemistry  CBSE  T1     Mathematics CBSE T1 │       │
│ │  0 / 40 placed           0 / 35 placed           0 / 40 placed        │       │
│ │  Physics    JEE   T1     Chemistry  JEE   T1     Mathematics JEE  T1 │       │
│ │  0 / 25 placed           0 / 20 placed           0 / 20 placed        │       │
│ └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                │
│ ┌ Grid ─────────────────────────────────────────────────────────────────┐     │
│ │ PERIOD | MON ⋮ | TUE ⋮ | WED ⋮ | THU ⋮ | FRI ⋮ | SAT ⋮ |               │     │
│ │ P1  ⋮  | cell  | cell  | cell  | cell  | cell  | cell  |               │     │
│ │ P2  ⋮  | …                                                             │     │
│ │ break                                                                  │     │
│ │ P3  ⋮  |                                                                │     │
│ │ …                                                                      │     │
│ └────────────────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────────┘
```

Specific pieces to build/restore:

- **Week chip bar** — one chip per week in the window, ✓ when the week has any placed cells, active chip highlighted. Left/right arrows on the header switch weeks.
- **Progress bar** `filled / capacity` for the current week (capacity = workingDays × periodsPerDay − holidays that fall in this week).
- **Palette as flat card grid** (`grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Each card renders:
  - Subject name (large)
  - Program chip (indigo pill `CBSE` / `JEE`) — **only when the section has >1 programs** (per your rule: no program → hide chip)
  - Track chip (amber `T1`/`T2`/…) — **only when that subject has >1 tracks** (single track → hide chip)
  - `placed / target` counter
  - Click to arm; armed card gets ring + shadow
  - Cards are keyed by `programId + subjectId + trackId` (flat), not nested under a program group.
- **Column tool** (⋮ on each day header) → popover "Plan this day":
  - Ordered subject list (add / remove / reorder)
  - Checkbox: "Overwrite filled periods"
  - Checkbox: "Repeat list to fill remaining periods"
  - "Apply" writes cells top-down through the day's periods.
- **Row tool** (⋮ on each period row) → popover "Fill this period across the week":
  - Subject + track picker (or "clear")
  - Optional faculty override
  - Writes the same allocation across every working day for that period, skipping already-filled cells (with a count in the undo toast).
- **Copy this week to…** dropdown with 4 options (`next`, `next 4`, `remaining`, `all`). Confirm dialog shows target count.
- **Clear this week** with confirm.
- **Undo toast** (Gmail-style, snapshot-based) after every bulk action.
- **Drag-to-swap** between two cells in the current week (empty target = move). Reuse the swap approach from `WeeklyTimetableBuilder`.
- **Cell rendering rules** (confirming your requirement):
  - Always show subject name.
  - Program chip only if `section.programs.length > 1`.
  - Track chip only if the subject has >1 tracks.
  - Faculty name under the subject; inline `<Select>` on hover / when unarmed.

Read-only mode (compare pane) disables all popovers, buttons, drag handles.

### 2. Remove "group by program/course" from the palette

The current `ProgramPaletteGroup` accordion goes away. Palette becomes one flat list of cards derived from:

```ts
programs.flatMap(p => p.subjects.flatMap(s => s.tracks.map(t => ({p, s, t}))))
```

This matches your rule exactly: subject identity is Subject + optional program + optional track, never nested under a course header.

### 3. Expand mock data

Edit `src/data/mockSections.ts`:

- **7 periods/day** on every section (update `periodsPerDay: 7` and re-time breaks after P3 and P5).
- **5 sections** with distinct working days, break patterns, and program mix:
  1. `Class 11 Morning` — CBSE + JEE, 3 terms (already exists — expand to 7 periods).
  2. `Class 11 Evening` — CBSE only, 5 working days, 6 periods.
  3. `Class 12 PCM — Excellence` — CBSE + JEE (mirror your screenshot's naming), 3 terms, 7 periods, fully-seeded Term 1 timetable (36+ cells) so completeness = 100% and Academic Schedule generation is unlocked.
  4. `Class 12 PCB — NEET Track` — CBSE + NEET, 6 working days, 7 periods, Term 1 partial fill.
  5. `Class 10 Foundation` — CBSE only, single track per subject, 6 periods.
- Each section gets 2–3 academic windows (`Term 1 · Foundation`, `Term 2 · Board Prep`, `Term 3 · Revision Sprint`) with realistic dates.
- Faculty pool drawn from `MOCK_FACULTY`, varied per section.

### 4. Mock Academic Schedule data

For **`Class 12 PCM — Excellence` · Term 1**:
- Mark the window `status: 'published'` with a `publishedAt` timestamp.
- Add `lastGeneratedAt` so the Academic Schedule tab shows "Last generated …".
- Seed a `changeLog` with 2–3 post-publish entries (one `cell.paint`, one `cell.delete`) with `affectedDates` so the yellow "Timetable updated after last generation" notice renders with real content.

`AcademicScheduleTab` already reads these fields, so just seeding data makes the demo state light up. The existing `SectionPreviewStep` will render the dated schedule from the (now fully-seeded) weekly cells.

### 5. Wire the workspace default section

`useScheduleWorkspace` already defaults to `sections[0]`. Reorder `MOCK_SECTIONS` so `Class 12 PCM — Excellence` (the section with the richest seeded state) is first, which makes the workspace demoable on landing.

### Out of scope (per your instruction)

- No changes to cross-section conflict scope.
- No changes to Setup / Period Allocation steps.
- No changes to Compare mode's read-only rendering beyond honoring the rebuilt component's `readOnly` prop.

## Technical details

- Files touched:
  - `src/components/institute/sections/SectionTimetableStep.tsx` — full rewrite of palette, week bar, row/column tools, copy/clear week, drag-swap, undo toast. Keep `hideFooter` prop and existing conflict dialog.
  - `src/components/institute/workspace/TimetableWorkspaceTab.tsx` — no structural change; just benefits from richer child.
  - `src/hooks/useSection.ts` — add helpers if missing: `copyWeekTo(sectionId, srcWeek, dstWeeks[])`, `clearWeek(sectionId, weekStart)`, `swapCells(sectionId, slotA, slotB)`. Keep existing publish/changeLog hooks untouched.
  - `src/utils/sectionUtils.ts` — small helpers: `weekCapacity(section, week, holidays)`, `weekFilled(section, weekStart)`.
  - `src/data/mockSections.ts` — expand to 5 sections, 7 periods, seed cells + publish state.
- No data-model changes to `Section` / `SectionCell` / `AcademicWindow`. All new behavior is UI + mock.
- Change-log integrity: bulk actions on a **published** window append one summary entry per action (existing `appendChangeLog` helper) so the Academic Schedule notice keeps working.
- `DevNote` icons added on: week chip bar (explains ✓ semantics), column tool (plan-day rules), copy-week menu (which weeks get overwritten).

