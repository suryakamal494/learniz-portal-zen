
# Programs Scheduling — Round 2 Restructure

You're asking for a deep rework of the 3-step flow. I've grouped your asks into 6 themes and laid out a phase-wise plan that covers all the edge cases you raised.

---

## 1) Understanding of the requirements

**A. Scrap the current "Workload" step.**
The "periods needed vs slots available" framing is wrong. It's not a capacity dashboard — it's a *planning window*. Workload, in your sense, is: "for this batch, from date X to date Y, how much of the syllabus has already been mapped, and what's still pending." That belongs in **Setup** (as the window picker + a coverage summary), not as a standalone step.

**B. Planning happens window-by-window, not whole-year.**
A school plans, e.g., July 1–31 now, then in late July plans Aug–Sept. So the page must:
- Remember what was generated in previous windows (which subject/chapter/topic was last covered up to which date).
- Show a *"Previously covered up to"* brief per subject in Setup.
- Resume the new window from that point — never re-plan past windows.

**C. Step 2 is a Weekly Timetable Builder, not a workload check.**
A real timetable grid: rows = periods + breaks, columns = the working days of the *selected week*. Each cell = a subject. To make this usable they need power tools:
- "**Fill row** → set Period 1 = Physics across the whole week."
- "**Fill column** → set Monday all periods = Maths."
- "**Copy week → next week / next N weeks / until end of window.**"
- A repeating-pattern mode: "use this week's pattern for the entire window" (1-click).
- Per-cell override after replication.
- Navigation: ◀ Week 1 of 4 ▶, with a small overview strip of which weeks have been set up.

**D. Step 3 is the Syllabus Automation Preview.**
Once the timetable is locked, the system knows hours-per-subject-per-week. Combine that with topic hours from the Hours page **and** "last covered" markers to auto-fill chapter/topic into each cell. Display: date · period · subject · teacher · chapter · topic. Editable per cell (swap topic, swap teacher, lock).

**E. Per-period editable durations in School Day.**
Default 40 min, but any single period can be overridden (e.g. P2 = 90 min lab). The day timeline auto-rebalances downstream periods + breaks.

**F. Mandatory-field gating between steps.**
Before allowing "Next" from Setup: start date, working days, school-day config, default faculty per subject, and at least one selected week-window must be filled. Block + scroll to first missing field with a clear "This is required to continue" inline message and a top-of-page summary.

**G. Post-generation editing.**
After Step 3 generates, users must still be able to: edit a single class, swap teacher, swap topic, insert an extra class, mark a slot as completed/cancelled. Past dates locked, future dates editable.

---

## 2) Final step structure

```
Step 1 — Setup
    • Academic window (start → end of THIS planning window)
    • Working days
    • School Day (start time + per-period rows with editable duration + breaks)
    • Default faculty per subject (mandatory before Next)
    • Holiday inheritance (institute + per-program overrides)
    • Coverage brief: "Previously covered" per subject (from prior windows)

Step 2 — Weekly Timetable
    • Weekly grid (periods × working days) for the selected week
    • Fill-row / Fill-column / Clear-row tools
    • Copy-week → next / next N / all remaining weeks
    • "Apply this pattern to whole window" 1-click
    • Per-cell subject picker + per-cell override after copy
    • Week navigator with status (Set / Inherited / Empty)

Step 3 — Generate & Preview
    • Auto-fills chapter/topic into each cell using
        timetable cells × periods × topic hours × last-covered cursor
    • Calendar view (month/week/list) of: date · period · subject · teacher · chapter · topic
    • Inline edit per slot, insert extra class, lock, regenerate (unlocked only)
    • "Save window" persists slots + advances each subject's last-covered cursor
```

---

## 3) Phase-wise implementation

### Phase 1 — School Day: per-period durations
**File:** `src/types/instituteProgram.ts`, `src/utils/calendarAutomation.ts`, `src/pages/institute/programs/ProgramSchedulePage.tsx`

- Add `periodOverrides?: Record<number, number>` (1-based period index → minutes) to `ScheduleConfig`. `periodLengthMins` stays as the default.
- Rewrite `computePeriodTimes` / `computeDayLayout` to use `overrides[i] ?? periodLengthMins` per period.
- Setup UI: each period row in the "Your school day" table gets a small Duration input with a "Reset to default" affordance. Changing P2 from 40→90 automatically pushes P3+ later and recomputes break/end times.

### Phase 2 — Mandatory-field validation + step gating
**File:** `ProgramSchedulePage.tsx`

- Central `validateStep(step, config, program)` returning `{ field, message }[]`.
- Next button disabled when current step has blockers; clicking it scrolls to the first blocker and flashes a red ring + helper text.
- Top-of-step "Missing required: Start date, Default faculty for Chemistry" summary chip.

### Phase 3 — Replace "Workload" step with Weekly Timetable Builder
**Files:** new `src/components/institute/programs/WeeklyTimetableBuilder.tsx`, `WeeklyTimetableGrid.tsx`, `WeekNavigator.tsx`; types in `instituteProgram.ts`; `ProgramSchedulePage.tsx`.

- New type:
  ```ts
  interface WeeklyTimetableCell {
    weekStartDate: string;     // ISO Monday of the week
    weekday: WeekDay;
    periodIndex: number;       // 0-based
    subjectId: string | null;
  }
  interface WeeklyTimetable {
    cells: WeeklyTimetableCell[];   // sparse, only filled cells
  }
  ```
- Store on `ScheduleConfig.weeklyTimetable`.
- Grid component: rows = periods (with break rows visually injected, non-editable), columns = working weekdays. Each cell = a Subject `<Select>` (existing subject palette colors).
- Toolbar actions:
  - **Fill row** (apply this row's subject to every day in this week)
  - **Fill column** (apply Monday's pattern down — sets every period in that day)
  - **Clear row / Clear column / Clear week**
  - **Copy this week →** dropdown: Next week / Next 2 / Next 4 / All remaining weeks in window / Custom range
  - **Apply as repeating pattern** (single click — fills all weeks in window with this template; per-week overrides preserved if user opts in)
- Week navigator strip at top: chips "W1 ✓ · W2 ✓ · W3 (inherited) · W4 ○" with prev/next arrows.

### Phase 4 — Coverage tracking ("previously covered up to")
**Files:** `useInstitutePrograms.ts`, `instituteProgram.ts`, Setup card in `ProgramSchedulePage.tsx`.

- Add per-program `coverageCursor: Record<subjectId, { lastTopicId, lastDate }>` updated when a window is saved/published.
- Compute on the fly from `generatedSlots` for the prior windows (no schema migration needed): for each subject, the last slot's topic + date before the new window's start.
- Setup shows a card: "Previously covered — Physics: up to *Kinematics → Projectile Motion* (28 Jun) · Chemistry: not started · …" with a small "Adjust starting topic" link per subject for the edge case where they want to redo or skip ahead.

### Phase 5 — Step 3: Syllabus Automation engine + rich preview
**Files:** `src/utils/calendarAutomation.ts` (new `generateFromTimetable`), `ProgramSchedulePage.tsx` (CalendarStep), `CurriculumCalendarView.tsx`.

- New generator: walks each working date in the window × the saved weekly cells for that date's week × pulls the next topic from each subject's remaining queue (starting from `coverageCursor`).
- Honours: locked slots, breaks, holidays, per-period durations, default faculty (with per-slot override), `isExtra` insertions.
- Preview cells display: `08:30 P1 · Physics · Mr. Rao · Ch. Kinematics → Projectile motion`. ListView gets columns: Date · Period · Subject · Teacher · Chapter · Topic · Status.
- Header actions: **Regenerate (unlocked only)**, **Save window** (persists slots + advances coverage cursor), **Insert extra class**.

### Phase 6 — Post-generation editing
**Files:** `ProgramSchedulePage.tsx` (existing SlotEditor), `CurriculumCalendarView.tsx`.

- SlotEditor already supports edits — verify Topic/Chapter/Faculty selectors all present and wired.
- Past-date slots: read-only (Lock icon + tooltip "Past class — fixed").
- Add row-level actions in ListView: Edit · Lock · Insert extra · Mark cancelled.

---

## 4) Edge cases explicitly handled

- Period duration override pushing day past 24h → blocked at validation with a clear inline error.
- Copy-week into a week that already has cells → confirm dialog "Overwrite W3?".
- Replicate-to-window when some weeks are partially filled → choice: Overwrite / Keep existing / Only fill empties.
- Selected window starts mid-week → first week renders only that partial week's columns; coverage cursor still respected.
- New window overlaps an already-generated window → block with "Window overlaps the Jun planning window. Adjust start date."
- Subject removed from a week's row in the timetable → its topics still queue into the *next* week that has it.
- Default faculty missing for a subject used in the timetable → Setup blocks Next + Step 2 marks the column with a warning chip.
- Holiday added mid-window after generation → "Regenerate from this date forward" prompt; past slots untouched.

---

## 5) Out of scope (this round)

- Multi-batch shared timetable templates (mentioned only as future-proofing — not implemented now).
- Teacher availability / conflict detection across programs (next round; current per-program flow is the foundation).
- Real backend persistence — everything stays in the in-memory `useInstitutePrograms` store.

Approve and I'll start with Phase 1 (per-period durations + validation gating) and Phase 3 (Weekly Timetable Builder), since those unblock the rest.
