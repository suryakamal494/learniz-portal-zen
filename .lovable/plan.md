# Programs Scheduling — Restructure Plan

Four asks, grouped into four phases. Frontend-only (mock data); no schema changes outside the local TypeScript types.

---

## Understanding of requirements

1. **Periods setup is too thin.** Today the Setup step only asks "how many periods" and "period length". It should compute the actual school day from `first period start + period length`, render the full period timetable (P1 8:30–9:10, P2 9:10–9:50, …) and let the school insert **breaks** (short break, lunch) at arbitrary positions between periods. Breaks consume minutes but are not teaching slots.

2. **Holidays should be global** (set once at the Programs level), auto-applied to every program/batch, with **per-program edit/override** allowed (e.g. topper batches that skip a holiday).

3. **The 4-step flow is bloated.** Step 3 ("Generate") is a single button. Merge it: after Workload is OK, clicking Next runs the generator and lands directly on **Preview**. Final flow = **Setup → Workload → Preview** (3 steps).

4. **Faculty visibility & editing** in Preview and in the read-only Curriculum Calendar view. Default faculty per subject is already captured; surface it everywhere (time / subject / chapter / faculty), and allow inline change of faculty per slot — but only for **future dates** in the read-only curriculum view (past dates locked). Preview (the editor) keeps full edit.

---

## Phase 1 — Period day builder (with breaks)

**Files:** `src/types/instituteProgram.ts`, `src/pages/institute/programs/ProgramSchedulePage.tsx`, `src/utils/calendarAutomation.ts`

Type changes:
```ts
export interface PeriodBreak {
  id: string;
  afterPeriod: number;     // insert after period N (1-based)
  name: string;            // "Short break", "Lunch"
  durationMins: number;
}
export interface ScheduleConfig {
  // existing…
  dayStartTime: string;    // "08:30" (new — replaces implicit start)
  breaks: PeriodBreak[];   // new
  // periodsPerDay, periodLengthMins stay
}
```

Setup UI redesign (replacing the current 2 number inputs):
- Inputs: **Day starts at** (time), **Period length**, **Number of periods**.
- Below: a live **"Your school day"** preview table — auto-computed rows:
  ```
  P1   08:30 – 09:10
  P2   09:10 – 09:50
  ─ Short break (15 min) ─    [edit] [remove]
  P3   10:05 – 10:45
  …
  Day ends 14:25
  ```
- "**+ Add break after period [select]**" with name + minutes. Breaks list is sortable/removable.
- All period rows are derived from `dayStartTime + periodLengthMins + breaks[]` — no manual time entry.

Generator update (`calendarAutomation.ts`):
- Add helper `computePeriodTimes(config) → [{ index, startTime, endTime }]` that honours `dayStartTime` and inserts break gaps.
- `generateSchedule` uses it to set each slot's `startTime`/`endTime` (replaces hard-coded math).

---

## Phase 2 — Global holiday setup at Programs level

**Files:** `src/pages/institute/programs/ProgramsListPage.tsx` (entry point), new `src/pages/institute/programs/InstituteHolidaysPage.tsx`, `src/hooks/useInstitutePrograms.ts`, `src/types/instituteProgram.ts`, `src/pages/institute/programs/ProgramSchedulePage.tsx`.

Data model:
- Add an **institute-level** holiday store in `useInstitutePrograms` (in-memory mock + helpers `useInstituteHolidays()`, `setInstituteHolidays(list)`).
- Per-program `ScheduleConfig` gains `overrides: { removed: string[]; added: Holiday[] }` (date strings) so a program can drop or add holidays without mutating the global list.
- Computed `effectiveHolidays(program) = (global ∪ overrides.added) − overrides.removed`. Used by the generator and previews.

UI:
- **Programs list page** → header gets a secondary button **"Holiday setup"** opening `/institute/programs/holidays`.
- New page: full multi-select calendar + list (re-use the multi-date Popover + Calendar already in Setup), description optional, inline edit, remove.
- **Program Schedule Setup step**: replace the existing per-program holiday card with a **read-only "Institute holidays"** card listing inherited dates. Each row has:
  - a "Skip for this program" toggle (adds to `overrides.removed`),
  - and a separate **"+ Add program-only holiday"** control for batch-specific extras.
- A small link "Manage shared holidays →" jumps to the global page.

---

## Phase 3 — Collapse 4 steps to 3 (auto-generate on Next)

**File:** `src/pages/institute/programs/ProgramSchedulePage.tsx`

- Remove the `generate` step from the stepper. New steps: `setup → workload → preview`.
- "Next: Generate" button in Workload becomes **"Generate & Preview"**: runs `generateSchedule(...)`, persists slots, jumps to Preview.
- Preview (current CalendarStep) gains a small **"Regenerate"** button in its header (so users can re-run without a separate step). Locked slots are preserved as today.
- Delete `GenerateStep` component.

---

## Phase 4 — Faculty everywhere + editable in Preview & Curriculum

**Files:** `src/pages/institute/programs/ProgramSchedulePage.tsx` (CalendarStep + MonthView/WeekView/ListView/SlotEditor), `src/components/institute/programs/CurriculumCalendarView.tsx`, `src/pages/institute/programs/ProgramPreviewPage.tsx`.

Preview (schedule editor):
- MonthView slot chips: add faculty initials (e.g. `08:30 Phy · A. Rao`).
- WeekView cells: append faculty short name under topic.
- ListView: add a **Faculty** column.
- `SlotEditor` (drawer) already supports edit — confirm a Faculty `<Select>` is present; if not, add it (with "+ Add faculty" matching the SetupStep combobox).

Curriculum Calendar View (read-only `CurriculumCalendarView.tsx`):
- Already shows faculty — make each faculty label a button that opens a small **Popover** with a faculty `<Select>` for that slot.
- **Disable** the popover trigger when `slot.date < today` (past dates locked; show a lock icon tooltip "Past class — faculty fixed").
- On change, call a new prop `onChangeFaculty(slotId, facultyId)` that the parent (`ProgramPreviewPage`) wires to `setGeneratedSlots(...)` so the change persists.

---

## Out of scope

- No backend/RLS work (mock store only).
- No removal/rename of existing types beyond the additive fields listed.
- Brochure / other modules untouched.
