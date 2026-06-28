## You're right — Phase B (multi-window UI) hasn't been built yet

So far only Phases A, C, C+, D shipped (faculty pool, track/subject locks, chapter→track grouping, conditional cell display). The Academic Window section in Step 1 still holds only **one** window (start/end/working days/periods-per-day), and there is no window switcher anywhere on the page. That's why you don't see it.

Here is the concrete plan for **Phase B — Multiple Academic Windows (separate storage per window)**.

---

### 1. Data model (`src/types/instituteProgram.ts`)

Introduce `AcademicWindow` as a first-class entity on the schedule:

```text
ScheduleConfig
├── facultyPool: string[]          (already added)
├── windows: AcademicWindow[]      (NEW)
└── activeWindowId: string         (NEW)

AcademicWindow
├── id, label (e.g. "Term 1", "Term 2")
├── startDate, endDate
├── workingDays: Weekday[]
├── periodsPerDay
├── allocation: SubjectAllocation[]   ← per-window
├── weeklyTimetable: TimetableCell[]  ← per-window
└── holidays: HolidayOverride[]       ← per-window
```

Migration shim: on load, if an old program has the flat fields, wrap them into a single auto-created window called "Window 1" and set it active. No data loss.

### 2. Top-of-page Window Switcher (new component)

A pill bar pinned to the top of `ProgramSchedulePage.tsx`, visible on **all three steps** (Setup, Allocation, Timetable):

```text
┌──────────────────────────────────────────────────────────────┐
│ Academic Window:  [● Term 1  Jun 1 – Sep 30] [ Term 2 ] [ + Add ] │
│                   42 working days · 7 periods/day  · [Edit] [Delete] │
└──────────────────────────────────────────────────────────────┘
```

- Clicking a pill switches `activeWindowId`; all downstream UI (capacity totals, allocations, weekly grid, holidays) re-reads from that window.
- "+ Add" opens a small dialog: label, start, end, working days, periods/day → creates an empty window.
- "Edit" reopens the same dialog for the active window.
- "Delete" allowed only when ≥2 windows exist; confirms before removing window data.
- Active window shown with primary-color ring; inactive windows muted.

### 3. Step 1 (Setup) changes

- The existing "Academic Window" card becomes the **editor for the active window** (same fields, but it edits `windows[activeWindowId]` instead of the flat config).
- Faculty Pool stays at schedule-level (shared across windows).
- Add a small helper line: "Each window keeps its own allocation, weekly timetable, and holidays. Switch windows from the bar above."

### 4. Step 2 (Period Allocation) changes

- `PeriodAllocationWorkspace` reads `workingDays`, `periodsPerDay`, `allocation`, `subjectLocks` from the active window.
- Capacity header shows: `Term 1 · 42 days × 7 = 294 periods · Allotted 180 · Remaining 114`.
- All edits (targets, faculty, tracks, chapter→track, topic periods) write to the active window only.

### 5. Step 3 (Weekly Timetable) changes

- `WeeklyTimetableBuilder` reads `workingDays`, `periodsPerDay`, `weeklyTimetable` from the active window.
- Palette is built from that window's allocation.
- Switching the window swaps the grid in place.

### 6. Holidays page (`InstituteHolidaysPage.tsx`)

- Add the same window switcher at the top.
- Holiday overrides scope to the active window's date range.

### 7. Calendar generator (`src/utils/calendarAutomation.ts`)

- Update `generateCalendar` to iterate **all windows**, lay each window's weekly timetable onto its own date range, subtract that window's holidays, and concat the results into one final calendar feed.
- Detect overlapping window date ranges and surface a validation toast ("Term 1 and Term 2 overlap on Sep 28 – Sep 30").

### 8. Programs list page

Show window count on each program row: `2 windows · 86 working days total`.

---

### Out of scope (still pending after Phase B)

- **Phase E** — Section wraps multiple Programs with a shared period pool. Will tackle right after you sign off on B.

---

### One quick confirmation before I build

For a brand-new program (no windows yet), should the page:
- **(a)** Auto-create an empty "Window 1" so the user lands straight on Step 1 fields, or
- **(b)** Show an empty state with a single "Create your first academic window" button?

I'll proceed with **(a)** unless you say otherwise.
