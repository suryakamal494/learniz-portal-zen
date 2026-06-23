## Institute Panel — Programs & Calendar Automation
### Phase-wise Implementation Plan (UI + UX focus, B2 on hold)

### Inputs we have vs. need

Already available (from existing mock data / screenshots):
- Program metadata: name, class, subjects, sections, fee
- Curriculum tree: Program → Subject → Chapter → Topic
- Faculty list, batches, class URL pattern
- Pastel design tokens, sidebar shell, institute layout

Missing — must be captured in the new "Teaching Hours" page (Phase 4):
- Hours per **topic** (decimal, e.g. 1.0, 0.5)
- Period length in minutes (default **40**, editable per program)
- Working days of week, holidays list, program start date, periods/day, class duration

Conversion (single source of truth):
`periods_for_topic = ceil(hours_for_topic × 60 / period_length_minutes)`
Chapter hours and subject hours = sum of child topic hours (auto-rolled, not entered).

With those, the generator has everything it needs. No other blockers.

---

### Phase 1 — Sidebar, routing, shell
- Remove `/institute/timetable` route + page + sidebar entry.
- Add sidebar group "Programs" with route `/institute/programs`.
- Register 4 routes in `App.tsx`:
  - `/institute/programs` (list)
  - `/institute/programs/:id/hours` (teaching hours)
  - `/institute/programs/:id/preview` (curriculum preview)
  - `/institute/programs/:id/schedule` (calendar automation workspace)

### Phase 2 — Types, mock store, pure utilities
- New `src/types/instituteProgram.ts`: `InstituteProgram`, `Subject`, `Chapter`, `Topic { id, name, hours }`, `ScheduleConfig`, `FacultyAssignment`, `ScheduleSlot`, `Holiday`.
- New `src/data/mockInstitutePrograms.ts` seeded from existing 6 screenshot programs, topic hours left empty so the prerequisite gate is visible.
- New `src/utils/calendarAutomation.ts` (pure, unit-testable):
  - `hoursToPeriods(hours, periodMins)`
  - `rollupHours(curriculum)`
  - `expandCalendar(start, end, workingDays, holidays, periodsPerDay)`
  - `generateSchedule(program, config, facultyMap) → ScheduleSlot[]`
- In-memory store hook `useInstitutePrograms()` so edits persist within session.

### Phase 3 — Programs List page
- Modern table/card hybrid: program name, class, subjects (chips), sections, fee, status pills:
  - "Hours set" / "Hours pending"
  - "Schedule generated" / "Not scheduled"
- Row actions: **Set Teaching Hours**, **Preview Curriculum**, **Open Schedule Workspace**, kebab (Duplicate / Edit / Delete – stubs).
- Sticky header, search, class filter, empty/loading/error states.

### Phase 4 — Teaching Hours page (prerequisite)
Single screen, no wizard. Left = tree, right = sticky summary.
- Header: program name + editable **Period length (min)** input (default 40) + "Save".
- Tree: Subject (accordion) → Chapter (accordion) → Topic row with **hours input** (0.25 step) and auto-computed period chip (`= ceil(h×60/period)`).
- Chapter/Subject rows show **rolled-up hours + periods** (read-only, live).
- Bulk tools per chapter: "Set all topics to X hrs", "Copy from previous chapter".
- Inline creation: "+ Add topic" / "+ Add chapter" inline at the bottom of any branch — no modal, no other page.
- Right sticky panel: total hours, total periods, per-subject roll-up, validation ("3 topics missing hours").
- Autosave with toast; "Mark hours as final" button enables Phase 6.

### Phase 5 — Curriculum Preview page
- Read-only tree mirroring teacher Preview Course modal but with new **Hours** and **Periods** columns and status chips. Export to print/PDF (stub button).

### Phase 6 — Schedule Workspace — Setup step
Single-page workspace with a top **stepper** (Setup → Workload → Generate → Calendar) — all steps live on one route, switched via tabs so the user never loses context.

Setup form (clean 2-column card):
- Start date, End date (optional — auto-computed from workload if blank)
- Working days (Mon–Sun chips)
- Periods per day, Class duration (prefilled from Phase 4 period length)
- Holidays: inline mini-calendar to click dates + named holiday list, "+ Add holiday" inline
- Default faculty per subject with inline "+ Add faculty" combobox (creates faculty on the fly into mock store)
- Default class URL pattern (e.g. Zoom link template)
- Prerequisite gate: if hours not final → CTA "Set teaching hours first" linking to Phase 4.

### Phase 7 — Workload Review step
- Table: Subject | Topics | Total hours | Total periods | Available slots in window | Surplus/Deficit chip.
- Bottom strip: total demand vs. capacity, visual bar, suggestions ("Extend end date by 4 days" / "Add 1 period/day on Wed").
- One-click "Auto-fit end date" applies suggestion.

### Phase 8 — Generate step
- Big primary CTA "Generate Schedule". Algorithm:
  1. Build calendar slots from Setup.
  2. Walk curriculum in order; for each topic consume `periods_for_topic` consecutive slots of that subject.
  3. Round-robin subjects across day so no subject monopolises.
  4. Assign default faculty + class URL; mark `isExtra=false`.
- Progress animation + summary dialog (X slots created, Y free slots remain, Z conflicts = 0).
- "Regenerate" preserves manual overrides flagged as locked.

### Phase 9 — Calendar & Overrides step
- Tabs: **Month / Week / Day / List**. Modern calendar (no heavy lib needed — CSS grid month view, time-axis week view).
- Color per subject (palette generator from project guidelines).
- Click a slot → right-side **Slot Drawer**: topic, chapter, faculty (editable combobox with inline create), class URL, periods, date/time, "Lock slot", "Delete", "Mark holiday".
- FAB "+ Add extra class" → inline form on the selected day (no separate page).
- Sticky metrics bar: Allocated / Remaining / Free hours, % complete.
- Bulk actions: drag-select days to mark holiday, "Shift all from this date by N days".

### Phase 10 — Polish & QA
- Loading skeletons, empty states, error toasts, mobile-first audit (calendar collapses to List view ≤640px).
- Keyboard nav + WCAG AA contrast on pastel palette.
- Design pass: typography scale, motion (Framer subtle), shadow tokens, dark-mode safety check.
- Remove temporary stubs; verify gate logic (Hours → Setup → Generate → Calendar) end-to-end with seeded program.

---

### Out of scope (deferred until academic scheduling ships)
- B2 time-based LMS unlock for students
- Backend persistence (everything client-side mock for now)
- Real "New Program" creation wizard
- Teacher panel sync of generated slots

### Open question
1. **Period length default = 40 min** — confirm, or different default per board (CBSE/ICSE/State)?
2. For inline faculty creation in Setup/Slot drawer — capture just **name + subject**, or also email/phone? (Affects mock faculty schema.)
